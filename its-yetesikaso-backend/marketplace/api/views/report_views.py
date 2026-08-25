from django.db import IntegrityError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Listing, ListingReport
from marketplace.serializers import ListingReportSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_listing(request, listing_id):
    try:
        listing = Listing.objects.get(
            id=listing_id,
        )
    except Listing.DoesNotExist:
        return Response(
            {"error": "Listing not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ListingReportSerializer(
        data=request.data,
        context={
            "request": request,
            "listing": listing,
        },
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        report = ListingReport.objects.create(
            user=request.user,
            listing=listing,
            reason=serializer.validated_data["reason"],
            details=serializer.validated_data.get(
                "details",
                "",
            ).strip(),
        )
    except IntegrityError:
        return Response(
            {
                "error": (
                    "You have already reported this listing."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Listing reported successfully",
            "report": ListingReportSerializer(report).data,
        },
        status=status.HTTP_201_CREATED,
    )