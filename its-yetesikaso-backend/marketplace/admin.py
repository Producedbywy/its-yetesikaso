from django import forms
from django.contrib import admin
from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone

from .models import (
    GhanaCardVerification,
    Listing,
    ListingReport,
    SellerProfile,
)
from .services.ghana_card_encryption import decrypt_ghana_card_value


class FafamesoListingAdminForm(forms.ModelForm):
    class Meta:
        model = Listing
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()

        if not cleaned_data.get("fafameso_plus_approved"):
            return cleaned_data

        requested = (
            cleaned_data["fafameso_plus_requested"]
            if "fafameso_plus_requested" in cleaned_data
            else self.instance.fafameso_plus_requested
        )

        if not requested:
            self.add_error(
                "fafameso_plus_approved",
                "A seller request is required before approval.",
            )

        if cleaned_data.get("status") != "published":
            self.add_error(
                "fafameso_plus_approved",
                "Only published listings can be approved.",
            )

        owner = cleaned_data.get("owner")

        if owner:
            profile = getattr(owner, "seller_profile", None)

            if (
                profile is None
                or profile.role != "seller"
                or profile.verification_status != "verified"
            ):
                self.add_error(
                    "fafameso_plus_approved",
                    "The seller must be verified before approval.",
                )

        return cleaned_data

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    form = FafamesoListingAdminForm

    def get_readonly_fields(self, request, obj=None):
        readonly = super().get_readonly_fields(request, obj)

        # Seller requests cannot be changed in Django Admin.
        readonly = (*readonly, "fafameso_plus_requested")

        # Only superusers can approve Fafameso Plus.
        if not request.user.is_superuser:
            readonly = (*readonly, "fafameso_plus_approved")

        return readonly

    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser:
            previously_approved = False

            if change:
                previously_approved = (
                    Listing.objects.filter(pk=obj.pk)
                    .values_list(
                        "fafameso_plus_approved",
                        flat=True,
                    )
                    .first()
                ) or False

            if obj.fafameso_plus_approved != previously_approved:
                raise PermissionDenied(
                    "Only superusers can change Fafameso Plus approval."
                )

        super().save_model(request, obj, form, change)

    list_display = (
        "title",
        "price",
        "category",
        "location",
        "owner",
        "fafameso_plus_requested",
        "fafameso_plus_approved",
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
        "fafameso_plus_requested",
        "fafameso_plus_approved",
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
        "verification_status",
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
        "verification_status",
        "onboarding_completed",
        "location",
    )


@admin.register(GhanaCardVerification)
class GhanaCardVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "seller_profile",
        "status",
        "submitted_at",
        "reviewed_by",
        "reviewed_at",
    )

    list_filter = (
        "status",
        "submitted_at",
    )

    ordering = (
        "-submitted_at",
    )

    fields = (
        "seller_profile",
        "display_card_number",
        "display_card_name",
        "status",
        "rejection_reason",
        "submitted_at",
        "reviewed_by",
        "reviewed_at",
    )

    readonly_fields = (
        "seller_profile",
        "display_card_number",
        "display_card_name",
        "submitted_at",
        "reviewed_by",
        "reviewed_at",
    )

    def has_module_permission(self, request):
        return request.user.is_active and request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_superuser

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return request.user.is_active and request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Ghana Card number")
    def display_card_number(self, obj):
        return decrypt_ghana_card_value(obj.encrypted_card_number)

    @admin.display(description="Name on Ghana Card")
    def display_card_name(self, obj):
        return decrypt_ghana_card_value(obj.encrypted_card_name)

    def save_model(self, request, obj, form, change):
        if not request.user.is_active or not request.user.is_superuser:
            raise PermissionDenied

        if obj.status == "rejected" and not obj.rejection_reason.strip():
            raise ValidationError(
                "A rejection reason is required."
            )

        if obj.status == "pending":
            obj.reviewed_by = None
            obj.reviewed_at = None
        else:
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()

        super().save_model(request, obj, form, change)

        latest_submission = (
            GhanaCardVerification.objects
            .filter(seller_profile=obj.seller_profile)
            .order_by("-submitted_at", "-pk")
            .first()
        )

        if latest_submission and latest_submission.pk == obj.pk:
            obj.seller_profile.verification_status = obj.status
            obj.seller_profile.save(
                update_fields=["verification_status", "updated_at"]
            )