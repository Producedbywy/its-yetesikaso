from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from marketplace.models import SellerProfile
from marketplace.serializers import SellerProfileSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip()
    password = data.get("password", "")
    role = str(data.get("role", "")).strip().lower()

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

    if role not in {"buyer", "seller"}:
        return Response(
            {"error": "Role must be either buyer or seller"},
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
        role=role,
    )

    return Response(
        {
            "message": "User created",
            "user_id": user.id,
            "role": role,
        },
        status=201,
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile, _ = SellerProfile.objects.get_or_create(
        user=request.user,
        defaults={
            "display_name": request.user.username,
            "role": "seller",
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
            "role": "seller",
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