from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Listing
from .serializers import ListingSerializer


# =========================
# PUBLIC LISTINGS
# =========================
@api_view(["GET"])
@permission_classes([AllowAny])
def listings(request):
    qs = Listing.objects.all()

    search = request.GET.get("search")
    if search:
        qs = qs.filter(title__icontains=search)

    category = request.GET.get("category")
    if category and category != "all":
        qs = qs.filter(category__iexact=category)

    location = request.GET.get("location")
    if location and location != "all":
        qs = qs.filter(location__iexact=location)

    sort = request.GET.get("sort")
    if sort == "low":
        qs = qs.order_by("price")
    elif sort == "high":
        qs = qs.order_by("-price")
    else:
        qs = qs.order_by("-id")

    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 12))

    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)

    start = (page - 1) * page_size
    end = start + page_size

    total = qs.count()

    serializer = ListingSerializer(qs[start:end], many=True)

    return Response({
        "results": serializer.data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": end < total,
        "has_prev": page > 1
    })


# =========================
# CREATE LISTING (SELLER)
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_listing(request):
    data = request.data

    listing = Listing.objects.create(
        owner=request.user,
        title=data["title"],
        description=data["description"],
        price=data["price"],
        category=data["category"],
        location=data["location"],
        image=request.FILES.get("image")
    )

    return Response({
        "message": "Listing created successfully",
        "listing": ListingSerializer(listing).data
    })


# =========================
# MY LISTINGS (DASHBOARD)
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_listings(request):
    qs = Listing.objects.filter(owner=request.user).order_by("-id")

    return Response({
        "total": qs.count(),
        "results": ListingSerializer(qs, many=True).data
    })