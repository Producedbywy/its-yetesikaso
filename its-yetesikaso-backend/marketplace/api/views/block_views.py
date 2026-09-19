from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from marketplace.models import UserBlock


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def user_block(request, user_id):
    blocked_user = get_object_or_404(
        User,
        id=user_id,
    )

    if blocked_user == request.user:
        return Response(
            {"error": "You cannot block yourself"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    block = UserBlock.objects.filter(
        blocker=request.user,
        blocked_user=blocked_user,
    ).first()

    if request.method == "GET":
        return Response(
            {
                "blocked": block is not None,
            }
        )

    if request.method == "POST":
        if block:
            return Response(
                {
                    "blocked": True,
                    "message": "User is already blocked",
                }
            )

        UserBlock.objects.create(
            blocker=request.user,
            blocked_user=blocked_user,
        )

        return Response(
            {
                "blocked": True,
                "message": "User blocked successfully",
            },
            status=status.HTTP_201_CREATED,
        )

    if not block:
        return Response(
            {
                "blocked": False,
                "message": "User is not blocked",
            }
        )

    block.delete()

    return Response(
        {
            "blocked": False,
            "message": "User unblocked successfully",
        }
    )