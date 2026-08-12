from rest_framework import serializers

from .models import Listing, SellerProfile


class SellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    listing_count = serializers.SerializerMethodField()

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "username",
            "email",
            "role",
            "display_name",
            "phone",
            "location",
            "bio",
            "onboarding_completed",
            "listing_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "listing_count",
            "created_at",
            "updated_at",
        ]

    def get_listing_count(self, obj):
        return obj.user.listings.count()


class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "price",
            "category",
            "location",
            "image",
            "slug",
            "created_at",
            "seller",
        ]
        read_only_fields = [
            "owner",
            "created_at",
            "slug",
            "seller",
        ]

    def get_seller(self, obj):
        try:
            profile = obj.owner.seller_profile
        except SellerProfile.DoesNotExist:
            return None

        return SellerProfileSerializer(profile).data