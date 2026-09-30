from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import OrderItem


def serialize_seller_order_item(order_item):
    return {
        "id": order_item.id,
        "order_reference": order_item.order.order_reference,
        "buyer": order_item.order.buyer_id,
        "buyer_username": order_item.order.buyer.username,
        "listing": order_item.listing_id,
        "listing_title": order_item.listing.title,
        "listing_slug": order_item.listing.slug,
        "listing_image": order_item.listing.image,
        "quantity": order_item.quantity,
        "unit_price": str(order_item.unit_price),
        "total_amount": str(order_item.total_amount),
        "payment_status": order_item.order.payment_status,
        "fulfilment_status": order_item.fulfilment_status,
        "created_at": order_item.created_at,
        "paid_at": order_item.order.paid_at,
        "dispatched_at": order_item.dispatched_at,
        "completed_at": order_item.completed_at,
    }


def update_order_fulfilment_status(order):
    statuses = list(
        order.items.values_list(
            "fulfilment_status",
            flat=True,
        )
    )

    if not statuses:
        return

    if all(status == "completed" for status in statuses):
        order.fulfilment_status = "completed"
        order.completed_at = timezone.now()
        order.save(
            update_fields=[
                "fulfilment_status",
                "completed_at",
            ],
        )
        return

    if all(status in {"dispatched", "completed"} for status in statuses):
        order.fulfilment_status = "dispatched"
        order.save(update_fields=["fulfilment_status"])
        return

    if all(status in {"paid", "dispatched", "completed"} for status in statuses):
        order.fulfilment_status = "paid"
        order.save(update_fields=["fulfilment_status"])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seller_order_items(request):
    order_items = (
        OrderItem.objects
        .filter(
            seller=request.user,
            order__payment_status="paid",
        )
        .select_related(
            "order",
            "order__buyer",
            "listing",
        )
    )

    return Response({
        "order_items": [
            serialize_seller_order_item(item)
            for item in order_items
        ],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def dispatch_order_item(request, order_item_id):
    with transaction.atomic():
        order_item = get_object_or_404(
            OrderItem.objects
            .select_for_update()
            .select_related(
                "order",
                "order__buyer",
                "listing",
            ),
            id=order_item_id,
            seller=request.user,
        )

        if order_item.order.payment_status != "paid":
            return Response(
                {
                    "detail": (
                        "This order item cannot be dispatched "
                        "because payment has not been completed."
                    ),
                },
                status=400,
            )

        if order_item.fulfilment_status != "paid":
            return Response(
                {
                    "detail": (
                        "This order item cannot be dispatched "
                        f"because its current status is "
                        f"'{order_item.fulfilment_status}'."
                    ),
                },
                status=400,
            )

        now = timezone.now()

        order_item.fulfilment_status = "dispatched"
        order_item.dispatched_at = now
        order_item.save(
            update_fields=[
                "fulfilment_status",
                "dispatched_at",
            ],
        )

        update_order_fulfilment_status(order_item.order)

    return Response({
        "order_item": serialize_seller_order_item(order_item),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_delivery(request, order_item_id):
    with transaction.atomic():
        order_item = get_object_or_404(
            OrderItem.objects
            .select_for_update()
            .select_related(
                "order",
                "order__buyer",
                "listing",
            ),
            id=order_item_id,
            order__buyer=request.user,
        )

        if order_item.order.payment_status != "paid":
            return Response(
                {
                    "detail": (
                        "This order item cannot be completed "
                        "because payment has not been completed."
                    ),
                },
                status=400,
            )

        if order_item.fulfilment_status != "dispatched":
            return Response(
                {
                    "detail": (
                        "This order item cannot be completed "
                        f"because its current status is "
                        f"'{order_item.fulfilment_status}'."
                    ),
                },
                status=400,
            )

        order_item.fulfilment_status = "completed"
        order_item.completed_at = timezone.now()
        order_item.save(
            update_fields=[
                "fulfilment_status",
                "completed_at",
            ],
        )

        update_order_fulfilment_status(order_item.order)

    return Response({
        "order_item": serialize_seller_order_item(order_item),
    })
