from django.db.models import Avg, Count
from rest_framework import serializers

from .models import (
    Application,
    Favourite,
    Job,
    Listing,
    ListingImage,
    ListingReport,
    Review,
    SellerProfile,
)


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
    job_count = serializers.SerializerMethodField()

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
            "job_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
            "listing_count",
            "job_count",
            "created_at",
            "updated_at",
        ]

    def get_listing_count(self, obj):
        return obj.user.listings.count()

    def get_job_count(self, obj):
        return obj.user.jobs.count()

class PublicSellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    listing_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "username",
            "display_name",
            "location",
            "bio",
            "listing_count",
            "average_rating",
            "review_count",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "display_name",
            "location",
            "bio",
            "listing_count",
            "average_rating",
            "review_count",
            "created_at",
        ]

    def get_listing_count(self, obj):
        return obj.user.listings.filter(
            available_quantity__gt=0
        ).count()

    def get_average_rating(self, obj):
        result = Review.objects.filter(
            seller=obj.user,
            transaction__status="completed",
        ).aggregate(
            average=Avg("rating"),
        )

        if result["average"] is None:
            return None

        return round(float(result["average"]), 1)

    def get_review_count(self, obj):
        return Review.objects.filter(
            seller=obj.user,
            transaction__status="completed",
        ).aggregate(
            count=Count("id"),
        )["count"]

class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()
    is_favourited = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

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
            "images",
            "quantity",
            "available_quantity",
            "slug",
            "created_at",
            "seller",
            "is_favourited",
        ]
        read_only_fields = [
            "owner",
            "created_at",
            "slug",
            "seller",
            "is_favourited",
            "images",
            "available_quantity",
        ]

    def get_seller(self, obj):
        try:
            profile = obj.owner.seller_profile
        except SellerProfile.DoesNotExist:
            return None

        return SellerProfileSerializer(profile).data

    def get_is_favourited(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return getattr(obj, "_is_favourited", False)

    def get_images(self, obj):
        return [
            image.image
            for image in obj.images.all()
        ]

class ListingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingReport
        fields = [
            "id",
            "listing",
            "reason",
            "details",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "listing",
            "created_at",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        listing = self.context["listing"]

        if ListingReport.objects.filter(
            user=request.user,
            listing=listing,
        ).exists():
            raise serializers.ValidationError(
                "You have already reported this listing."
            )

        if (
            attrs.get("reason") == "other"
            and not attrs.get("details", "").strip()
        ):
            raise serializers.ValidationError(
                {
                    "details": (
                        "Please provide details when selecting Other."
                    )
                }
            )

        return attrs

class JobSerializer(serializers.ModelSerializer):
    employer_username = serializers.CharField(
        source="employer.username",
        read_only=True,
    )

    employer_name = serializers.SerializerMethodField()

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    employment_type_display = serializers.CharField(
        source="get_employment_type_display",
        read_only=True,
    )

    workplace_type_display = serializers.CharField(
        source="get_workplace_type_display",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    salary_display = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "employer",
            "employer_username",
            "employer_name",
            "title",
            "description",
            "category",
            "category_display",
            "location",
            "employment_type",
            "employment_type_display",
            "workplace_type",
            "workplace_type_display",
            "salary_min",
            "salary_max",
            "salary_display",
            "requirements",
            "status",
            "status_display",
            "slug",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "employer",
            "employer_username",
            "employer_name",
            "category_display",
            "employment_type_display",
            "workplace_type_display",
            "status_display",
            "salary_display",
            "slug",
            "created_at",
            "updated_at",
        ]

    def get_employer_name(self, obj):
        try:
            profile = obj.employer.seller_profile
        except SellerProfile.DoesNotExist:
            return obj.employer.username

        return (
            profile.display_name
            or obj.employer.username
        )

    def get_salary_display(self, obj):
        if (
            obj.salary_min is not None
            and obj.salary_max is not None
        ):
            return (
                f"GH₵ {obj.salary_min:,.2f}"
                f" - "
                f"GH₵ {obj.salary_max:,.2f}"
            )

        if obj.salary_min is not None:
            return f"From GH₵ {obj.salary_min:,.2f}"

        if obj.salary_max is not None:
            return f"Up to GH₵ {obj.salary_max:,.2f}"

        return "Negotiable"


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(
        source="applicant.username",
        read_only=True,
    )

    applicant_name = serializers.SerializerMethodField()

    job_title = serializers.CharField(
        source="job.title",
        read_only=True,
    )

    employer_username = serializers.CharField(
        source="job.employer.username",
        read_only=True,
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "applicant",
            "applicant_username",
            "applicant_name",
            "employer_username",
            "cover_note",
            "cv",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "job",
            "job_title",
            "applicant",
            "applicant_username",
            "applicant_name",
            "employer_username",
            "created_at",
            "updated_at",
        ]

    def get_applicant_name(self, obj):
        try:
            profile = obj.applicant.seller_profile
        except SellerProfile.DoesNotExist:
            return obj.applicant.username

        return (
            profile.display_name
            or obj.applicant.username
        )