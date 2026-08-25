from django.contrib import admin

from .models import Listing, ListingReport, SellerProfile


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

@admin.register(ListingReport)
class ListingReportAdmin(admin.ModelAdmin):
    list_display = (
        "listing",
        "user",
        "reason",
        "created_at",
    )

    search_fields = (
        "listing__title",
        "user__username",
        "user__email",
        "details",
    )

    list_filter = (
        "reason",
        "created_at",
    )

    readonly_fields = (
        "listing",
        "user",
        "reason",
        "details",
        "created_at",
    )

    ordering = (
        "-created_at",
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