from decimal import Decimal
from datetime import timedelta
from uuid import uuid4

from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import (
    Cart,
    CartItem,
    InventoryReservation,
    Listing,
    Order,
    OrderItem,
)


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(
        buyer=user,
    )
    return cart


def serialize_cart_item(cart_item):
    listing = cart_item.listing

    return {
        "id": cart_item.id,
        "listing": listing.id,
        "listing_title": listing.title,
        "listing_slug": listing.slug,
        "listing_image": listing.image,
        "price": str(listing.price),
        "quantity": cart_item.quantity,
        "available_quantity": listing.available_quantity,
        "total_amount": str(
            Decimal(listing.price) * cart_item.quantity
        ),
        "seller": listing.owner.id,
        "seller_username": listing.owner.username,
        "created_at": cart_item.created_at,
        "updated_at": cart_item.updated_at,
    }


def serialize_cart(cart):
    items = [
        serialize_cart_item(item)
        for item in cart.items.select_related(
            "listing",
            "listing__owner",
        )
    ]

    total_amount = sum(
        Decimal(item["total_amount"])
        for item in items
    )

    total_quantity = sum(
        item["quantity"]
        for item in items
    )

    return {
        "id": cart.id,
        "items": items,
        "total_quantity": total_quantity,
        "total_amount": str(total_amount),
        "created_at": cart.created_at,
        "updated_at": cart.updated_at,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_cart(request):
    cart = get_or_create_cart(request.user)

    return Response({
        "cart": serialize_cart(cart),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    listing_id = request.data.get("listing_id")

    if not listing_id:
        return Response(
            {"error": "listing_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quantity = int(request.data.get("quantity", 1))
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a whole number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity < 1:
        return Response(
            {"error": "Quantity must be at least 1"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    listing = get_object_or_404(
        Listing.objects.select_related("owner"),
        id=listing_id,
    )

    if listing.owner == request.user:
        return Response(
            {"error": "You cannot add your own listing to your cart"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if listing.available_quantity < 1:
        return Response(
            {"error": "This listing is currently unavailable"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart = get_or_create_cart(request.user)

    with transaction.atomic():
        cart_item = (
            CartItem.objects
            .select_for_update()
            .filter(
                cart=cart,
                listing=listing,
            )
            .first()
        )

        if cart_item:
            new_quantity = cart_item.quantity + quantity

            if new_quantity > listing.available_quantity:
                return Response(
                    {
                        "error": (
                            "Requested quantity exceeds the "
                            "available quantity"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_item.quantity = new_quantity
            cart_item.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ],
            )
        else:
            if quantity > listing.available_quantity:
                return Response(
                    {
                        "error": (
                            "Requested quantity exceeds the "
                            "available quantity"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_item = CartItem.objects.create(
                cart=cart,
                listing=listing,
                quantity=quantity,
            )

    return Response(
        {
            "message": "Listing added to cart",
            "cart": serialize_cart(cart),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request, cart_item_id):
    cart = get_or_create_cart(request.user)

    try:
        quantity = int(request.data.get("quantity"))
    except (TypeError, ValueError):
        return Response(
            {"error": "Quantity must be a whole number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity < 1:
        return Response(
            {"error": "Quantity must be at least 1"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item = get_object_or_404(
        CartItem.objects.select_related("listing"),
        id=cart_item_id,
        cart=cart,
    )

    if cart_item.listing.available_quantity < quantity:
        return Response(
            {
                "error": (
                    "Requested quantity exceeds the "
                    "available quantity"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_item.quantity = quantity
    cart_item.save(
        update_fields=[
            "quantity",
            "updated_at",
        ],
    )

    return Response({
        "message": "Cart item updated",
        "cart": serialize_cart(cart),
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, cart_item_id):
    cart = get_or_create_cart(request.user)

    cart_item = get_object_or_404(
        CartItem,
        id=cart_item_id,
        cart=cart,
    )

    cart_item.delete()

    return Response({
        "message": "Item removed from cart",
        "cart": serialize_cart(cart),
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_or_create_cart(request.user)

    cart.items.all().delete()

    return Response({
        "message": "Cart cleared",
        "cart": serialize_cart(cart),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_cart(request):
    cart = get_or_create_cart(request.user)

    with transaction.atomic():
        cart_items = list(
            CartItem.objects
            .select_for_update()
            .select_related("listing", "listing__owner")
            .filter(cart=cart)
        )

        if not cart_items:
            return Response(
                {"error": "Your cart is empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing_ids = [item.listing_id for item in cart_items]

        listings = {
            listing.id: listing
            for listing in (
                Listing.objects
                .select_for_update()
                .select_related("owner")
                .filter(id__in=listing_ids)
            )
        }

        if len(listings) != len(listing_ids):
            return Response(
                {
                    "error": (
                        "One or more items in your cart are no "
                        "longer available"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        expires_at = now + timedelta(minutes=20)

        expired_reservations = (
            InventoryReservation.objects
            .select_for_update()
            .filter(
                listing_id__in=listing_ids,
                status="active",
                expires_at__lte=now,
            )
        )

        expired_reservations.update(
            status="expired",
            released_at=now,
        )

        active_reservations = (
            InventoryReservation.objects
            .filter(
                listing_id__in=listing_ids,
                status="active",
                expires_at__gt=now,
            )
            .values("listing_id")
            .annotate(
                reserved_quantity=Sum("quantity"),
            )
        )

        reserved_quantities = {
            reservation["listing_id"]: reservation["reserved_quantity"]
            for reservation in active_reservations
        }

        for cart_item in cart_items:
            listing = listings[cart_item.listing_id]

            if listing.owner_id == request.user.id:
                return Response(
                    {
                        "error": (
                            "You cannot purchase your own listing"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reserved_quantity = reserved_quantities.get(
                listing.id,
                0,
            )

            available_for_checkout = (
                listing.available_quantity - reserved_quantity
            )

            if cart_item.quantity > available_for_checkout:
                return Response(
                    {
                        "error": (
                            f"Insufficient available quantity for "
                            f"'{listing.title}'"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order_reference = (
            f"YT-{timezone.now().strftime('%Y%m%d%H%M%S')}-"
            f"{uuid4().hex[:8].upper()}"
        )

        order = Order.objects.create(
            buyer=request.user,
            order_reference=order_reference,
            total_amount=Decimal("0.00"),
            payment_status="unpaid",
            fulfilment_status="awaiting_payment",
            expires_at=expires_at,
        )

        total_amount = Decimal("0.00")

        for cart_item in cart_items:
            listing = listings[cart_item.listing_id]
            unit_price = listing.price
            item_total = unit_price * cart_item.quantity

            order_item = OrderItem.objects.create(
                order=order,
                listing=listing,
                seller=listing.owner,
                quantity=cart_item.quantity,
                unit_price=unit_price,
                total_amount=item_total,
            )

            InventoryReservation.objects.create(
                order=order,
                order_item=order_item,
                listing=listing,
                quantity=cart_item.quantity,
                status="active",
                expires_at=expires_at,
            )

            total_amount += item_total

        order.total_amount = total_amount
        order.save(
            update_fields=["total_amount"],
        )

        cart.items.all().delete()

    return Response(
        {
            "message": "Order created successfully",
            "order": {
                "id": order.id,
                "order_reference": order.order_reference,
                "total_amount": str(order.total_amount),
                "payment_status": order.payment_status,
                "fulfilment_status": order.fulfilment_status,
                "expires_at": order.expires_at,
                "items": [
                    {
                        "id": item.id,
                        "listing": item.listing_id,
                        "listing_title": item.listing.title,
                        "seller": item.seller_id,
                        "quantity": item.quantity,
                        "unit_price": str(item.unit_price),
                        "total_amount": str(item.total_amount),
                    }
                    for item in order.items.select_related(
                        "listing",
                        "seller",
                    )
                ],
            },
        },
        status=status.HTTP_201_CREATED,
    )