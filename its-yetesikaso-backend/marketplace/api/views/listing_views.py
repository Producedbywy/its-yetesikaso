import math
from django.db.models import Exists, OuterRef, Q
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from django.db import transaction
from rest_framework import status


from marketplace.serializers import ListingSerializer
from marketplace.services.supabase_storage import upload_listing_image
from marketplace.services.geocoding import geocode_location
from marketplace.models import (
    Favourite,
    Listing,
    ListingImage,
    SellerProfile,
    Review,
    OrderItem,
)

class LocationGeocodeThrottle(SimpleRateThrottle):
    scope = "location_geocode"

    def get_rate(self):
        return "10/hour"

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)

        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }

def annotate_favourite_status(queryset, request):
    if not request.user.is_authenticated:
        return queryset

    favourite_exists = Favourite.objects.filter(
        user=request.user,
        listing=OuterRef("pk"),
    )

    return queryset.annotate(
        _is_favourited=Exists(favourite_exists)
    )


# =========================
# PUBLIC LISTINGS
# =========================
@api_view(["GET"])
@permission_classes([AllowAny])
def listings(request):
    qs = Listing.objects.filter(
        status="published",
        available_quantity__gt=0,
    )
    qs = annotate_favourite_status(qs, request)

    # SEARCH
    search = request.GET.get("search", "").strip()

    if search:
        search_terms = search.split()

        for term in search_terms:
            qs = qs.filter(
                Q(title__icontains=term)
                | Q(description__icontains=term)
                | Q(category__icontains=term)
                | Q(location__icontains=term)
            )

    # SLUG
    slug = request.GET.get("slug")

    if slug:
        qs = qs.filter(slug=slug)

    # CATEGORY
    category = request.GET.get("category")

    if category and category != "all":
        qs = qs.filter(category__iexact=category)

    # LOCATION
    location = request.GET.get("location", "").strip()

    if location and location != "all":
        qs = qs.filter(location__icontains=location)

    # PRICE RANGE
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")

    if min_price:
        try:
            qs = qs.filter(price__gte=min_price)
        except (ValueError, TypeError):
            pass

    if max_price:
        try:
            qs = qs.filter(price__lte=max_price)
        except (ValueError, TypeError):
            pass

    # SORTING
    sort = request.GET.get("sort")

    if sort == "low":
        qs = qs.order_by("price", "-created_at")

    elif sort == "high":
        qs = qs.order_by("-price", "-created_at")

    else:
        qs = qs.order_by("-created_at")

    # PAGINATION
    try:
        page = max(int(request.GET.get("page", 1)), 1)
    except (ValueError, TypeError):
        page = 1

    try:
        page_size = min(
            max(int(request.GET.get("page_size", 12)), 1),
            50,
        )
    except (ValueError, TypeError):
        page_size = 12

    start = (page - 1) * page_size
    end = start + page_size

    total = qs.count()
    results = qs[start:end]

    serializer = ListingSerializer(
        results,
        many=True,
        context={"request": request},
    )

    return Response({
        "results": serializer.data,
        "total": total,
        "page": page,
        "has_next": end < total,
        "has_prev": page > 1,
    })

# =========================
# MANUAL LOCATION GEOCODING
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LocationGeocodeThrottle])
def geocode_manual_location(request):
    location = request.data.get("location", "")

    if not isinstance(location, str):
        return Response(
            {"error": "Please enter a valid location."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    location = location.strip()

    if not location or len(location) > 120:
        return Response(
            {"error": "Enter a location between 1 and 120 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    coordinates = geocode_location(location)

    if coordinates is None:
        return Response(
            {"error": "We couldn't find that location in Ghana. Try a town or city name."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    latitude, longitude = coordinates

    return Response({
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
    })

# =========================
# NEARBY LISTINGS
# =========================
@api_view(["GET"])
@permission_classes([AllowAny])
def nearby_listings(request):
    try:
        latitude = float(request.GET.get("latitude"))
        longitude = float(request.GET.get("longitude"))
        radius = float(request.GET.get("radius", 20))
    except (TypeError, ValueError):
        return Response(
            {"error": "Valid latitude and longitude are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not (-90 <= latitude <= 90):
        return Response(
            {"error": "Invalid latitude."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not (-180 <= longitude <= 180):
        return Response(
            {"error": "Invalid longitude."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not (1 <= radius <= 100):
        return Response(
            {"error": "Radius must be between 1 and 100 km."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Approximate bounding box to limit database results.
    latitude_delta = radius / 111.0
    longitude_delta = radius / (
        111.0 * max(abs(math.cos(math.radians(latitude))), 0.01)
    )

    qs = Listing.objects.filter(
        status="published",
        available_quantity__gt=0,
        latitude__isnull=False,
        longitude__isnull=False,
        latitude__gte=latitude - latitude_delta,
        latitude__lte=latitude + latitude_delta,
        longitude__gte=longitude - longitude_delta,
        longitude__lte=longitude + longitude_delta,
    )

    nearby = []

    for listing in qs:
        lat1 = math.radians(latitude)
        lon1 = math.radians(longitude)
        lat2 = math.radians(listing.latitude)
        lon2 = math.radians(listing.longitude)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1)
            * math.cos(lat2)
            * math.sin(dlon / 2) ** 2
        )

        distance = 6371 * 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a),
        )

        if distance <= radius:
            nearby.append((distance, listing))

    nearby.sort(key=lambda item: item[0])

    results = []

    for distance, listing in nearby[:30]:
        serialized = ListingSerializer(
            listing,
            context={"request": request},
        ).data

        serialized["distance_km"] = round(distance, 1)
        results.append(serialized)

    return Response({
        "results": results,
        "total": len(nearby),
        "radius_km": radius,
    })

# =========================
# CREATE LISTING
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_listing(request):
    try:
        profile = request.user.seller_profile
    except SellerProfile.DoesNotExist:
        return Response(
            {"error": "Seller profile not found"},
            status=403,
        )

    if profile.role != "seller":
        return Response(
            {"error": "Only sellers can create listings"},
            status=403,
        )

    if profile.verification_status not in ("verified", "pending"):
        return Response(
            {
                "error": (
                    "Your seller account must have a pending "
                    "or approved verification application "
                    "before creating listings."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    listing_status = (
        "published"
        if profile.verification_status == "verified"
        else "draft"
    )

    data = request.data

    quantity = max(int(data.get("quantity", 1)), 1)

    location = data["location"]
    coordinates = geocode_location(location)

    listing = Listing.objects.create(
        owner=request.user,
        status=listing_status,
        title=data["title"],
        description=data["description"],
        price=data["price"],
        pricing_type=data.get("pricing_type", "one_time"),
        category=data["category"],
        location=location,
        latitude=coordinates[0] if coordinates else None,
        longitude=coordinates[1] if coordinates else None,
        quantity=quantity,
        available_quantity=quantity,
    )

    # Support multiple images.
    uploaded_images = request.FILES.getlist("images")

    # Backwards compatibility with the old single-image field.
    if not uploaded_images:
        uploaded_image = request.FILES.get("image")

        if uploaded_image:
            uploaded_images = [uploaded_image]

    if len(uploaded_images) > 5:
        listing.delete()

        return Response(
            {"error": "You can upload a maximum of 5 images"},
            status=400,
        )

    image_urls = []

    for uploaded_image in uploaded_images:
        image_url = upload_listing_image(uploaded_image)

        ListingImage.objects.create(
            listing=listing,
            image=image_url,
        )

        image_urls.append(image_url)

    # Keep the legacy image field populated with the first image.
    if image_urls:
        listing.image = image_urls[0]
        listing.save(update_fields=["image"])

    return Response({
        "message": "Listing created successfully",
        "listing": ListingSerializer(
            listing,
            context={"request": request},
        ).data,
    })


# =========================
# GET / UPDATE LISTING
# =========================
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def listing_detail(request, listing_id):

    listing = annotate_favourite_status(
        Listing.objects.filter(
            id=listing_id,
            owner=request.user,
        ),
        request,
    ).first()

    if not listing:
        return Response(
            {"error": "Listing not found"},
            status=404,
        )

    if request.method == "DELETE":
        listing.delete()

        return Response(
            {"message": "Listing deleted successfully"},
            status=200,
        )

    if request.method == "GET":
        return Response(
            ListingSerializer(
                listing,
                context={"request": request},
            ).data
        )

    data = request.data

    if "status" in data:
        requested_status = data.get("status")

        if requested_status not in ("draft", "published"):
            return Response(
                {"error": "Invalid listing status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if requested_status == "published":
            try:
                profile = request.user.seller_profile
            except SellerProfile.DoesNotExist:
                return Response(
                    {"error": "Seller profile not found"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if (
                profile.role != "seller"
                or profile.verification_status != "verified"
            ):
                return Response(
                    {
                        "error": (
                            "Your seller account must be verified "
                            "before publishing listings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        listing.status = requested_status

    if "title" in data:
        listing.title = data["title"]

    if "description" in data:
        listing.description = data["description"]

    if "price" in data:
        listing.price = data["price"]

    if "pricing_type" in data:
        listing.pricing_type = data["pricing_type"]

    if "category" in data:
        listing.category = data["category"]

    if "location" in data:
        new_location = str(data["location"]).strip()

        if new_location != listing.location:
            coordinates = geocode_location(new_location)

            listing.location = new_location
            listing.latitude = (
                coordinates[0] if coordinates else None
            )
            listing.longitude = (
                coordinates[1] if coordinates else None
            )

    uploaded_images = request.FILES.getlist("images")

    # Backwards compatibility with the old single-image field.
    if not uploaded_images:
        uploaded_image = request.FILES.get("image")

        if uploaded_image:
            uploaded_images = [uploaded_image]

    if len(uploaded_images) > 5:
        return Response(
            {"error": "You can upload a maximum of 5 images"},
            status=400,
        )

    if uploaded_images:
        # Replace the existing gallery with the newly uploaded images.
        listing.images.all().delete()

        image_urls = []

        for uploaded_image in uploaded_images:
            image_url = upload_listing_image(uploaded_image)

            ListingImage.objects.create(
                listing=listing,
                image=image_url,
            )

            image_urls.append(image_url)

        # Keep the legacy image field synchronized
        # with the first gallery image.
        listing.image = image_urls[0]

    listing.save()

    return Response({
        "message": "Listing updated successfully",
        "listing": ListingSerializer(
            listing,
            context={"request": request},
        ).data,
    })


# =========================
# MARK LISTING UNITS AS SOLD
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_listing_sold(request, listing_id):
    try:
        sold_quantity = int(
            request.data.get("quantity", 1)
        )
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a valid number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if sold_quantity < 1:
        return Response(
            {"error": "Quantity must be at least 1"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        try:
            listing = (
                Listing.objects
                .select_for_update()
                .get(
                    id=listing_id,
                    owner=request.user,
                )
            )
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if listing.available_quantity == 0:
            return Response(
                {"error": "This listing is already sold out"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if sold_quantity > listing.available_quantity:
            return Response(
                {
                    "error": (
                        f"Only {listing.available_quantity} "
                        f"unit(s) remain available"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing.available_quantity -= sold_quantity
        listing.save(
            update_fields=["available_quantity"]
        )

    return Response({
        "message": "Listing inventory updated",
        "sold_quantity": sold_quantity,
        "available_quantity": listing.available_quantity,
        "sold_out": listing.available_quantity == 0,
        "listing": ListingSerializer(
            listing,
            context={"request": request},
        ).data,
    })


# =========================
# CREATE ORDER ITEM REVIEW
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order_item_review(request, order_item_id):
    try:
        order_item = (
            OrderItem.objects
            .select_related(
                "order",
                "order__buyer",
                "seller",
                "listing",
            )
            .get(id=order_item_id)
        )
    except OrderItem.DoesNotExist:
        return Response(
            {"error": "Order item not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.user != order_item.order.buyer:
        return Response(
            {
                "error": (
                    "Only the buyer can review "
                    "this order item"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order_item.order.payment_status != "paid":
        return Response(
            {
                "error": (
                    "Only paid orders can be reviewed"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order_item.fulfilment_status != "completed":
        return Response(
            {
                "error": (
                    "Only completed purchases "
                    "can be reviewed"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if hasattr(order_item, "review"):
        return Response(
            {
                "error": (
                    "This purchase has already "
                    "been reviewed"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        rating = int(request.data.get("rating"))
    except (TypeError, ValueError):
        return Response(
            {"error": "Rating must be a number from 1 to 5"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if rating < 1 or rating > 5:
        return Response(
            {"error": "Rating must be between 1 and 5"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    comment = str(
        request.data.get("comment", "")
    ).strip()

    review = Review.objects.create(
        order_item=order_item,
        buyer=order_item.order.buyer,
        seller=order_item.seller,
        listing=order_item.listing,
        rating=rating,
        comment=comment,
    )

    return Response(
        {
            "message": "Review created successfully",
            "review": {
                "id": review.id,
                "order_item": review.order_item_id,
                "buyer": review.buyer.id,
                "buyer_username": review.buyer.username,
                "seller": review.seller.id,
                "seller_username": review.seller.username,
                "listing": review.listing.id,
                "listing_title": review.listing.title,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at,
            },
        },
        status=status.HTTP_201_CREATED,
    )
