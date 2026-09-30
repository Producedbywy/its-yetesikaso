from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Order


def serialize_order_item(order_item):
    return {
        "id": order_item.id,
        "listing": order_item.listing_id,
        "listing_title": order_item.listing.title,
        "listing_slug": order_item.listing.slug,
        "listing_image": order_item.listing.image,
        "seller": order_item.seller_id,
        "seller_username": order_item.seller.username,
        "quantity": order_item.quantity,
        "unit_price": str(order_item.unit_price),
        "total_amount": str(order_item.total_amount),
        "created_at": order_item.created_at,
    }


def serialize_order(order):
    items = [
        serialize_order_item(item)
        for item in order.items.select_related(
            "listing",
            "seller",
        )
    ]

    return {
        "id": order.id,
        "order_reference": order.order_reference,
        "total_amount": str(order.total_amount),
        "payment_status": order.payment_status,
        "fulfilment_status": order.fulfilment_status,
        "created_at": order.created_at,
        "paid_at": order.paid_at,
        "completed_at": order.completed_at,
        "cancelled_at": order.cancelled_at,
        "expires_at": order.expires_at,
        "items": items,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = (
        Order.objects
        .filter(buyer=request.user)
        .prefetch_related(
            "items__listing",
            "items__seller",
        )
    )

    return Response({
        "orders": [
            serialize_order(order)
            for order in orders
        ],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_reference):
    order = get_object_or_404(
        Order.objects
        .filter(buyer=request.user)
        .prefetch_related(
            "items__listing",
            "items__seller",
        ),
        order_reference=order_reference,
    )

    return Response({
        "order": serialize_order(order),
    })