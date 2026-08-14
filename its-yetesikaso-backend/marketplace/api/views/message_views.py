from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from marketplace.models import Conversation, Message, Listing


# =========================
# CONVERSATIONS
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    listing_id = request.data.get("listing_id")

    if not listing_id:
        return Response(
            {"error": "listing_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    listing = get_object_or_404(Listing, id=listing_id)

    if listing.owner == request.user:
        return Response(
            {"error": "You cannot message yourself about your own listing"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    conversation, created = Conversation.objects.get_or_create(
        buyer=request.user,
        seller=listing.owner,
        listing=listing,
    )

    return Response(
        {
            "id": conversation.id,
            "buyer": conversation.buyer.id,
            "seller": conversation.seller.id,
            "listing": listing.id,
            "listing_title": listing.title,
            "created": created,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def conversations(request):
    qs = (
        Conversation.objects
        .filter(
            buyer=request.user
        )
        .select_related(
            "buyer",
            "seller",
            "listing",
        )
    ) | (
        Conversation.objects
        .filter(
            seller=request.user
        )
        .select_related(
            "buyer",
            "seller",
            "listing",
        )
    )

    qs = qs.order_by("-updated_at").distinct()

    results = []

    for conversation in qs:
        last_message = conversation.messages.order_by(
            "-created_at"
        ).first()

        unread_count = conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).count()

        results.append(
            {
                "id": conversation.id,
                "buyer": conversation.buyer.id,
                "buyer_username": conversation.buyer.username,
                "seller": conversation.seller.id,
                "seller_username": conversation.seller.username,
                "listing": conversation.listing.id,
                "listing_title": conversation.listing.title,
                "updated_at": conversation.updated_at,
                "last_message": (
                    last_message.body
                    if last_message
                    else None
                ),
                "last_message_at": (
                    last_message.created_at
                    if last_message
                    else None
                ),
                "unread_count": unread_count,
            }
        )

    total_unread = sum(
        conversation["unread_count"]
        for conversation in results
    )

    return Response(
        {
            "results": results,
            "total": len(results),
            "unread_count": total_unread,
        }
    )


# =========================
# MESSAGES
# =========================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversation_messages(request, conversation_id):
    conversation = get_object_or_404(
        Conversation,
        id=conversation_id,
    )

    if (
        conversation.buyer != request.user
        and conversation.seller != request.user
    ):
        return Response(
            {"error": "You do not have access to this conversation"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).update(
            is_read=True
        )

        messages = conversation.messages.select_related(
            "sender"
        ).all()

        return Response(
            {
                "conversation": conversation.id,
                "listing": conversation.listing.id,
                "listing_title": conversation.listing.title,
                "buyer": conversation.buyer.id,
                "buyer_username": conversation.buyer.username,
                "seller": conversation.seller.id,
                "seller_username": conversation.seller.username,
                "results": [
                    {
                        "id": message.id,
                        "sender": message.sender.id,
                        "sender_username": message.sender.username,
                        "body": message.body,
                        "is_read": message.is_read,
                        "created_at": message.created_at,
                    }
                    for message in messages
                ],
            }
        )

    body = str(request.data.get("body", "")).strip()

    if not body:
        return Response(
            {"error": "Message body is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        body=body,
        is_read=False,
    )

    conversation.save(
        update_fields=["updated_at"]
    )

    return Response(
        {
            "id": message.id,
            "conversation": conversation.id,
            "sender": message.sender.id,
            "sender_username": message.sender.username,
            "body": message.body,
            "is_read": message.is_read,
            "created_at": message.created_at,
        },
        status=status.HTTP_201_CREATED,
    )