from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from marketplace.models import Favourite, Listing
from marketplace.serializers import ListingSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_favourites(request):
    favourites = (
        Favourite.objects
        .filter(user=request.user)
        .select_related("listing", "listing__owner")
    )

    results = [
        ListingSerializer(
            favourite.listing,
            context={"request": request},
        ).data
        for favourite in favourites
    ]

    return Response({
        "results": results,
        "total": len(results),
    })


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def favourite_listing(request, listing_id):
    listing = get_object_or_404(
        Listing,
        id=listing_id,
    )

    if listing.owner == request.user:
        return Response(
            {"error": "You cannot favourite your own listing"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    favourite = Favourite.objects.filter(
        user=request.user,
        listing=listing,
    ).first()

    if request.method == "POST":
        if favourite:
            return Response({
                "message": "Listing already favourited",
                "favourited": True,
            })

        Favourite.objects.create(
            user=request.user,
            listing=listing,
        )

        return Response(
            {
                "message": "Listing added to favourites",
                "favourited": True,
            },
            status=status.HTTP_201_CREATED,
        )

    if not favourite:
        return Response({
            "message": "Listing was not favourited",
            "favourited": False,
        })

    favourite.delete()

    return Response({
        "message": "Listing removed from favourites",
        "favourited": False,
    })