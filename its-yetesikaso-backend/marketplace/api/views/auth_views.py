from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import (
    validate_password,
)
from django.contrib.auth.tokens import (
    default_token_generator,
)
from django.core.exceptions import ValidationError
from django.utils.encoding import (
    force_bytes,
    force_str,
)
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

import resend

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response

from marketplace.models import Listing, Review, SellerProfile
from marketplace.serializers import (
    SellerProfileSerializer,
    PublicSellerProfileSerializer,
    ListingSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip()
    password = data.get("password", "")

    if not username:
        return Response(
            {"error": "Username is required"},
            status=400,
        )

    if not password:
        return Response(
            {"error": "Password is required"},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "username exists"},
            status=400,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    SellerProfile.objects.create(
        user=user,
        display_name=username,
        role="user",
    )

    return Response(
        {
            "message": "User created",
            "user_id": user.id,
            "role": "user",
        },
        status=201,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = str(
        request.data.get("email", "")
    ).strip()

    if email:
        users = User.objects.filter(
            email__iexact=email,
            is_active=True,
        )

        if users.exists():
            user = users.first()

            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = default_token_generator.make_token(
                user
            )

            reset_url = (
                f"{settings.FRONTEND_URL}"
                f"/reset-password"
                f"?uid={uid}"
                f"&token={token}"
            )

            if not settings.RESEND_API_KEY:
                return Response(
                    {
                        "error": (
                            "Password reset email service "
                            "is not configured"
                        )
                    },
                    status=500,
                )

            try:
                resend.api_key = settings.RESEND_API_KEY

                resend.Emails.send(
                    {
                        "from": settings.RESEND_FROM_EMAIL,
                        "to": [user.email],
                        "subject": "Reset your Yetesikaso password",
                        "html": f"""
                            <div style="
                                font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 32px;
                                color: #111827;
                            ">
                                <h1>
                                    Reset your password
                                </h1>

                                <p>
                                    We received a request to reset
                                    your Yetesikaso password.
                                </p>

                                <p>
                                    Click the button below to
                                    choose a new password.
                                </p>

                                <p style="margin: 32px 0;">
                                    <a
                                        href="{reset_url}"
                                        style="
                                            display: inline-block;
                                            padding: 14px 24px;
                                            background: #a3e635;
                                            color: #000000;
                                            text-decoration: none;
                                            border-radius: 12px;
                                            font-weight: 600;
                                        "
                                    >
                                        Reset password
                                    </a>
                                </p>

                                <p>
                                    If you did not request a
                                    password reset, you can safely
                                    ignore this email.
                                </p>

                                <p style="
                                    color: #6b7280;
                                    font-size: 14px;
                                ">
                                    This link will expire after
                                    a limited period.
                                </p>
                            </div>
                        """,
                    }
                )

            except Exception:
                return Response(
                    {
                        "error": (
                            "Unable to send password reset email"
                        )
                    },
                    status=500,
                )

    return Response(
        {
            "message": (
                "If an account exists for that email, "
                "a password reset link has been sent."
            )
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uid = str(
        request.data.get("uid", "")
    ).strip()

    token = str(
        request.data.get("token", "")
    ).strip()

    new_password = request.data.get(
        "password",
        "",
    )

    if not uid or not token or not new_password:
        return Response(
            {
                "error": (
                    "Reset link and new password are required"
                )
            },
            status=400,
        )

    try:
        user_id = force_str(
            urlsafe_base64_decode(uid)
        )

        user = User.objects.get(
            pk=user_id,
            is_active=True,
        )

    except (
        TypeError,
        ValueError,
        OverflowError,
        User.DoesNotExist,
    ):
        return Response(
            {"error": "Invalid or expired reset link"},
            status=400,
        )

    if not default_token_generator.check_token(
        user,
        token,
    ):
        return Response(
            {"error": "Invalid or expired reset link"},
            status=400,
        )

    try:
        validate_password(
            new_password,
            user=user,
        )
    except ValidationError as exc:
        return Response(
            {
                "error": " ".join(
                    str(message)
                    for message in exc.messages
                )
            },
            status=400,
        )

    user.set_password(new_password)
    user.save(
        update_fields=["password"]
    )

    return Response(
        {
            "message": (
                "Password reset successfully"
            )
        },
        status=200,
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile, _ = SellerProfile.objects.get_or_create(
        user=request.user,
        defaults={
            "display_name": request.user.username,
            "role": "user",
        },
    )

    if request.method == "PATCH":
        serializer = SellerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

    return Response(
        SellerProfileSerializer(profile).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile, _ = SellerProfile.objects.get_or_create(
        user=request.user,
        defaults={
            "display_name": request.user.username,
            "role": "user",
        },
    )

    serializer = SellerProfileSerializer(
        profile,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        SellerProfileSerializer(profile).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upgrade_profile(request):
    profile, _ = SellerProfile.objects.get_or_create(
        user=request.user,
        defaults={
            "display_name": request.user.username,
            "role": "user",
        },
    )

    requested_role = str(
        request.data.get("role", "")
    ).strip().lower()

    if requested_role not in {"seller", "employer"}:
        return Response(
            {
                "error": (
                    "Role must be either seller or employer"
                )
            },
            status=400,
        )

    if profile.role != "user":
        return Response(
            {
                "error": (
                    "Only user accounts can be upgraded"
                )
            },
            status=400,
        )

    profile.role = requested_role
    profile.save(
        update_fields=["role", "updated_at"]
    )

    return Response(
        {
            "message": "Profile upgraded successfully",
            "profile": SellerProfileSerializer(profile).data,
        },
        status=200,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def public_seller_profile(request, username):
    try:
        profile = (
            SellerProfile.objects
            .select_related("user")
            .get(
                user__username__iexact=username,
                role="seller",
            )
        )
    except SellerProfile.DoesNotExist:
        return Response(
            {"error": "Seller not found"},
            status=404,
        )

    listings = (
        Listing.objects
        .filter(
            owner=profile.user,
            available_quantity__gt=0,
        )
        .select_related("owner")
        .prefetch_related("images")
        .order_by("-created_at")
    )

    reviews = (
        Review.objects
        .filter(
            seller=profile.user,
            transaction__status="completed",
        )
        .select_related(
            "buyer",
            "listing",
        )
        .order_by("-created_at")
    )

    reviews_data = [
        {
            "id": review.id,
            "buyer_username": review.buyer.username,
            "listing": review.listing.id,
            "listing_title": review.listing.title,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "verified_purchase": True,
        }
        for review in reviews
    ]

    return Response(
        {
            "seller": PublicSellerProfileSerializer(profile).data,
            "listings": ListingSerializer(
                listings,
                many=True,
                context={"request": request},
            ).data,
            "reviews": reviews_data,
        }
    )
