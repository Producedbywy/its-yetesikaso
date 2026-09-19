from django.db.models import Exists, OuterRef, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from rest_framework import status

from marketplace.serializers import ListingSerializer
from marketplace.services.supabase_storage import upload_listing_image
from marketplace.models import (
    Favourite,
    Listing,
    ListingImage,
    SellerProfile,
    Transaction,
    Review,
)
from django.utils import timezone

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
        available_quantity__gt=0
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

    data = request.data

    quantity = max(int(data.get("quantity", 1)), 1)

    listing = Listing.objects.create(
        owner=request.user,
        title=data["title"],
        description=data["description"],
        price=data["price"],
        category=data["category"],
        location=data["location"],
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

    if "title" in data:
        listing.title = data["title"]

    if "description" in data:
        listing.description = data["description"]

    if "price" in data:
        listing.price = data["price"]

    if "category" in data:
        listing.category = data["category"]

    if "location" in data:
        listing.location = data["location"]

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
# CREATE TRANSACTION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    try:
        listing_id = int(request.data.get("listing_id"))
        quantity = int(request.data.get("quantity", 1))
    except (TypeError, ValueError):
        return Response(
            {"error": "Listing and quantity must be valid numbers"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity < 1:
        return Response(
            {"error": "Quantity must be at least 1"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        try:
            listing = (
                Listing.objects
                .select_for_update()
                .get(id=listing_id)
            )
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if listing.owner == request.user:
            return Response(
                {"error": "You cannot purchase your own listing"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if listing.available_quantity <= 0:
            return Response(
                {"error": "This listing is sold out"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > listing.available_quantity:
            return Response(
                {
                    "error": (
                        f"Only {listing.available_quantity} "
                        f"unit(s) remain available"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        unit_price = listing.price
        total_amount = unit_price * quantity

        transaction_record = Transaction.objects.create(
            buyer=request.user,
            seller=listing.owner,
            listing=listing,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            status="pending",
        )

        listing.available_quantity -= quantity
        listing.save(
            update_fields=["available_quantity"]
        )

    return Response(
        {
            "message": "Transaction created successfully",
            "transaction": {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "seller": transaction_record.seller.id,
                "listing": transaction_record.listing.id,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            },
        },
        status=status.HTTP_201_CREATED,
    )

# =========================
# CONFIRM TRANSACTION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_transaction(request, transaction_id):
    with transaction.atomic():
        try:
            transaction_record = (
                Transaction.objects
                .select_for_update()
                .select_related("listing", "buyer", "seller")
                .get(id=transaction_id)
            )
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user != transaction_record.seller:
            return Response(
                {"error": "Only the seller can confirm this transaction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if transaction_record.status != "pending":
            return Response(
                {
                    "error": (
                        "Only pending transactions "
                        "can be confirmed"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_record.status = "confirmed"
        transaction_record.save(
            update_fields=["status"]
        )

    return Response(
        {
            "message": "Transaction confirmed successfully",
            "transaction": {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "seller": transaction_record.seller.id,
                "listing": transaction_record.listing.id,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            },
        },
        status=status.HTTP_200_OK,
    )

# =========================
# COMPLETE TRANSACTION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_transaction(request, transaction_id):
    with transaction.atomic():
        try:
            transaction_record = (
                Transaction.objects
                .select_for_update()
                .select_related("listing", "buyer", "seller")
                .get(id=transaction_id)
            )
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user != transaction_record.buyer:
            return Response(
                {"error": "Only the buyer can complete this transaction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if transaction_record.status != "confirmed":
            return Response(
                {
                    "error": (
                        "Only confirmed transactions "
                        "can be completed"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_record.status = "completed"
        transaction_record.completed_at = timezone.now()
        transaction_record.save(
            update_fields=[
                "status",
                "completed_at",
            ]
        )

    return Response(
        {
            "message": "Transaction completed successfully",
            "transaction": {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "seller": transaction_record.seller.id,
                "listing": transaction_record.listing.id,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            },
        },
        status=status.HTTP_200_OK,
    )

# =========================
# CANCEL TRANSACTION
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_transaction(request, transaction_id):
    with transaction.atomic():
        try:
            transaction_record = (
                Transaction.objects
                .select_for_update()
                .select_related("listing", "buyer", "seller")
                .get(id=transaction_id)
            )
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in (
            transaction_record.buyer,
            transaction_record.seller,
        ):
            return Response(
                {
                    "error": (
                        "Only the buyer or seller can "
                        "cancel this transaction"
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if transaction_record.status != "pending":
            return Response(
                {
                    "error": (
                        "Only pending transactions "
                        "can be cancelled"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing = (
            Listing.objects
            .select_for_update()
            .get(id=transaction_record.listing_id)
        )

        listing.available_quantity += transaction_record.quantity
        listing.save(
            update_fields=["available_quantity"]
        )

        transaction_record.status = "cancelled"
        transaction_record.save(
            update_fields=["status"]
        )

    return Response(
        {
            "message": "Transaction cancelled successfully",
            "transaction": {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "seller": transaction_record.seller.id,
                "listing": transaction_record.listing.id,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            },
            "available_quantity": listing.available_quantity,
        },
        status=status.HTTP_200_OK,
    )

# =========================
# LIST MY TRANSACTIONS
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    transaction_records = (
        Transaction.objects
        .filter(
            Q(buyer=request.user) | Q(seller=request.user)
        )
        .select_related(
            "buyer",
            "seller",
            "listing",
        )
        .order_by("-created_at")
    )

    transactions_data = []

    for transaction_record in transaction_records:
        transactions_data.append(
            {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "buyer_username": transaction_record.buyer.username,
                "seller": transaction_record.seller.id,
                "seller_username": transaction_record.seller.username,
                "listing": transaction_record.listing.id,
                "listing_title": transaction_record.listing.title,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            }
        )

    return Response(
        {
            "transactions": transactions_data,
        },
        status=status.HTTP_200_OK,
    )

# =========================
# TRANSACTION DETAIL
# =========================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transaction_detail(request, transaction_id):
    try:
        transaction_record = (
            Transaction.objects
            .select_related(
                "buyer",
                "seller",
                "listing",
            )
            .get(id=transaction_id)
        )
    except Transaction.DoesNotExist:
        return Response(
            {"error": "Transaction not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.user not in (
        transaction_record.buyer,
        transaction_record.seller,
    ):
        return Response(
            {
                "error": (
                    "You do not have access to this transaction"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        {
            "transaction": {
                "id": transaction_record.id,
                "buyer": transaction_record.buyer.id,
                "buyer_username": transaction_record.buyer.username,
                "seller": transaction_record.seller.id,
                "seller_username": transaction_record.seller.username,
                "listing": transaction_record.listing.id,
                "listing_title": transaction_record.listing.title,
                "quantity": transaction_record.quantity,
                "unit_price": str(
                    transaction_record.unit_price
                ),
                "total_amount": str(
                    transaction_record.total_amount
                ),
                "status": transaction_record.status,
                "created_at": transaction_record.created_at,
                "completed_at": transaction_record.completed_at,
            }
        },
        status=status.HTTP_200_OK,
    )

# =========================
# CREATE REVIEW
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_review(request, transaction_id):
    try:
        transaction_record = (
            Transaction.objects
            .select_related(
                "buyer",
                "seller",
                "listing",
            )
            .get(id=transaction_id)
        )
    except Transaction.DoesNotExist:
        return Response(
            {"error": "Transaction not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.user != transaction_record.buyer:
        return Response(
            {
                "error": (
                    "Only the buyer can review "
                    "this transaction"
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if transaction_record.status != "completed":
        return Response(
            {
                "error": (
                    "Only completed transactions "
                    "can be reviewed"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if hasattr(transaction_record, "review"):
        return Response(
            {
                "error": (
                    "This transaction has already "
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
        transaction=transaction_record,
        buyer=transaction_record.buyer,
        seller=transaction_record.seller,
        listing=transaction_record.listing,
        rating=rating,
        comment=comment,
    )

    return Response(
        {
            "message": "Review created successfully",
            "review": {
                "id": review.id,
                "transaction": review.transaction_id,
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
