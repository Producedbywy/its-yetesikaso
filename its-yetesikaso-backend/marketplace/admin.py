from django.contrib import admin

from .models import Listing, SellerProfile


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "price",
        "category",
        "location",
        "owner",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "owner__username",
    )

    list_filter = (
        "category",
        "location",
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "user",
        "location",
        "onboarding_completed",
        "updated_at",
    )

    search_fields = (
        "display_name",
        "user__username",
        "user__email",
        "phone",
        "location",
    )

    list_filter = (
        "onboarding_completed",
        "location",
    )