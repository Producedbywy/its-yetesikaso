from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.contrib.auth.models import User



@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    if User.objects.filter(username=data["username"]).exists():
        return Response({"error": "username exists"}, status=400)

    user = User.objects.create(
        username=data["username"],
        email=data.get("email", ""),
        password=data["password"]
    )

    return Response({
        "message": "User created",
        "user_id": user.id
    })