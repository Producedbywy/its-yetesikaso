from rest_framework import generics
from .models import Listing
from .serializers import ListingSerializer


class ListingListAPIView(generics.ListAPIView):
    queryset = Listing.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = ListingSerializer