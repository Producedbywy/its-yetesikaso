from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "location",
            "images",
            "slug",
            "is_active",
            "created_at",
        ]