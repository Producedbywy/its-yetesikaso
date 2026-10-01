from decimal import Decimal

import httpx

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import (
    InventoryReservation,
    Listing,
    Order,
    Payment,
)


PAYSTACK_INITIALIZE_URL = (
    "https://api.paystack.co/transaction/initialize"
)

PAYSTACK_VERIFY_URL = (
    "https://api.paystack.co/transaction/verify"
)


class PaymentCompletionError(Exception):
    pass


def _complete_successful_payment(payment_id):
    with transaction.atomic():
        payment = (
            Payment.objects
            .select_for_update()
            .select_related("order")
            .get(pk=payment_id)
        )

        order = (
            Order.objects
            .select_for_update()
            .get(pk=payment.order_id)
        )

        if (
            payment.status == "successful"
            and order.payment_status == "paid"
        ):
            return payment, order, False

        if order.payment_status == "paid":
            raise PaymentCompletionError(
                "This order has already been paid"
            )

        if order.fulfilment_status != "awaiting_payment":
            raise PaymentCompletionError(
                "This order is not awaiting payment"
            )

        now = timezone.now()

        if order.expires_at and order.expires_at <= now:
            active_reservations = (
                InventoryReservation.objects
                .select_for_update()
                .filter(
                    order=order,
                    status="active",
                )
            )

            active_reservations.update(
                status="expired",
                released_at=now,
            )

            raise PaymentCompletionError(
                "This order has expired"
            )

        reservations = list(
            InventoryReservation.objects
            .select_for_update()
            .filter(
                order=order,
                status="active",
            )
            .order_by("listing_id")
        )

        if not reservations:
            raise PaymentCompletionError(
                "No active inventory reservation exists "
                "for this order"
            )

        for reservation in reservations:
            if reservation.expires_at <= now:
                raise PaymentCompletionError(
                    "One or more inventory reservations have expired"
                )

        listings = {}

        for reservation in reservations:
            listing = (
                Listing.objects
                .select_for_update()
                .get(pk=reservation.listing_id)
            )

            listings[listing.id] = listing

        for reservation in reservations:
            listing = listings[reservation.listing_id]

            if reservation.quantity > listing.available_quantity:
                raise PaymentCompletionError(
                    f"Insufficient inventory for "
                    f"'{listing.title}'"
                )

        for reservation in reservations:
            listing = listings[reservation.listing_id]

            listing.available_quantity -= reservation.quantity
            listing.save(
                update_fields=["available_quantity"]
            )

            reservation.status = "committed"
            reservation.released_at = now
            reservation.save(
                update_fields=[
                    "status",
                    "released_at",
                ]
            )

        payment.status = "successful"
        payment.paid_at = now
        payment.verified_at = now
        payment.save(
            update_fields=[
                "status",
                "paid_at",
                "verified_at",
            ]
        )

        order.payment_status = "paid"
        order.fulfilment_status = "paid"
        order.paid_at = now
        order.save(
            update_fields=[
                "payment_status",
                "fulfilment_status",
                "paid_at",
            ]
        )

        order.items.filter(
            fulfilment_status="awaiting_payment"
        ).update(
            fulfilment_status="paid"
        )

    return payment, order, True


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initialize_payment(request):
    order_reference = request.data.get("order_reference")

    if not order_reference:
        return Response(
            {"error": "order_reference is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not settings.PAYSTACK_SECRET_KEY:
        return Response(
            {"error": "Payment service is not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    order = get_object_or_404(
        Order.objects.prefetch_related("items"),
        order_reference=order_reference,
        buyer=request.user,
    )

    if order.payment_status == "paid":
        return Response(
            {"error": "This order has already been paid"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.fulfilment_status != "awaiting_payment":
        return Response(
            {"error": "This order is not available for payment"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.expires_at and order.expires_at <= timezone.now():
        return Response(
            {"error": "This order has expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.total_amount <= Decimal("0.00"):
        return Response(
            {"error": "This order has an invalid total amount"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    amount_in_pesewas = int(
        order.total_amount * Decimal("100")
    )

    payment = (
        Payment.objects
        .filter(
            order=order,
            status__in=["initiated", "pending"],
        )
        .order_by("-created_at")
        .first()
    )

    if payment:
        return Response(
            {
                "message": "Payment already initialized",
                "payment": {
                    "reference": payment.reference,
                    "amount": str(payment.amount),
                    "currency": payment.currency,
                    "status": payment.status,
                },
            },
            status=status.HTTP_200_OK,
        )

    callback_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}"
        "/checkout/payment-callback"
    )

    headers = {
        "Authorization": (
            f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        ),
        "Content-Type": "application/json",
    }

    payload = {
        "email": request.user.email,
        "amount": amount_in_pesewas,
        "currency": "GHS",
        "reference": (
            f"{order.order_reference}-"
            f"{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
        ),
        "callback_url": callback_url,
        "metadata": {
            "order_reference": order.order_reference,
            "order_id": order.id,
            "buyer_id": request.user.id,
        },
    }

    try:
        response = httpx.post(
            PAYSTACK_INITIALIZE_URL,
            headers=headers,
            json=payload,
            timeout=15.0,
        )
        response_data = response.json()
    except (httpx.HTTPError, ValueError):
        return Response(
            {"error": "Unable to connect to the payment service"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if response.status_code >= 400 or not response_data.get("status"):
        return Response(
            {
                "error": (
                    response_data.get("message")
                    or "Payment initialization failed"
                )
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    paystack_data = response_data.get("data") or {}

    authorization_url = paystack_data.get("authorization_url")
    access_code = paystack_data.get("access_code")
    reference = paystack_data.get("reference")

    if not authorization_url or not access_code or not reference:
        return Response(
            {"error": "Payment service returned an invalid response"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    payment = Payment.objects.create(
        order=order,
        provider="paystack",
        reference=reference,
        amount=order.total_amount,
        currency="GHS",
        status="initiated",
    )

    return Response(
        {
            "message": "Payment initialized successfully",
            "payment": {
                "reference": payment.reference,
                "amount": str(payment.amount),
                "currency": payment.currency,
                "status": payment.status,
                "authorization_url": authorization_url,
                "access_code": access_code,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    reference = request.data.get("reference")

    if not reference:
        return Response(
            {"error": "reference is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not settings.PAYSTACK_SECRET_KEY:
        return Response(
            {"error": "Payment service is not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    payment = get_object_or_404(
        Payment.objects.select_related("order"),
        reference=reference,
        order__buyer=request.user,
        provider="paystack",
    )

    order = payment.order

    if payment.status == "successful" and order.payment_status == "paid":
        return Response(
            {
                "message": "Payment has already been verified",
                "payment": {
                    "reference": payment.reference,
                    "status": payment.status,
                },
                "order": {
                    "order_reference": order.order_reference,
                    "payment_status": order.payment_status,
                    "fulfilment_status": order.fulfilment_status,
                },
            },
            status=status.HTTP_200_OK,
        )

    headers = {
        "Authorization": (
            f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        ),
        "Content-Type": "application/json",
    }

    verify_url = (
        f"{PAYSTACK_VERIFY_URL}/"
        f"{reference}"
    )

    try:
        response = httpx.get(
            verify_url,
            headers=headers,
            timeout=15.0,
        )
        response_data = response.json()
    except (httpx.HTTPError, ValueError):
        return Response(
            {"error": "Unable to connect to the payment service"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if response.status_code >= 400 or not response_data.get("status"):
        return Response(
            {
                "error": (
                    response_data.get("message")
                    or "Payment verification failed"
                )
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    paystack_data = response_data.get("data") or {}

    paystack_status = paystack_data.get("status")
    paystack_reference = paystack_data.get("reference")
    paystack_currency = paystack_data.get("currency")
    paystack_amount = paystack_data.get("amount")

    expected_amount = int(
        payment.amount * Decimal("100")
    )

    if paystack_reference != payment.reference:
        return Response(
            {"error": "Payment reference mismatch"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if paystack_currency != payment.currency:
        return Response(
            {"error": "Payment currency mismatch"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if paystack_amount != expected_amount:
        return Response(
            {"error": "Payment amount mismatch"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if paystack_status != "success":
        payment_status_map = {
            "failed": "failed",
            "abandoned": "abandoned",
        }

        new_payment_status = payment_status_map.get(
            paystack_status,
            "failed",
        )

        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .get(pk=payment.pk)
            )

            if payment.status != "successful":
                payment.status = new_payment_status
                payment.verified_at = timezone.now()
                payment.save(
                    update_fields=[
                        "status",
                        "verified_at",
                    ]
                )

            active_reservations = (
                InventoryReservation.objects
                .select_for_update()
                .filter(
                    order=order,
                    status="active",
                )
            )

            active_reservations.update(
                status="released",
                released_at=timezone.now(),
            )

        return Response(
            {
                "message": "Payment was not successful",
                "payment": {
                    "reference": payment.reference,
                    "status": new_payment_status,
                },
                "order": {
                    "order_reference": order.order_reference,
                    "payment_status": order.payment_status,
                    "fulfilment_status": order.fulfilment_status,
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payment, order, completed = _complete_successful_payment(
            payment.id
        )
    except PaymentCompletionError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not completed:
        return Response(
            {
                "message": "Payment has already been verified",
                "payment": {
                    "reference": payment.reference,
                    "status": payment.status,
                },
                "order": {
                    "order_reference": order.order_reference,
                    "payment_status": order.payment_status,
                    "fulfilment_status": order.fulfilment_status,
                },
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {
            "message": "Payment verified successfully",
            "payment": {
                "reference": payment.reference,
                "status": payment.status,
                "paid_at": payment.paid_at,
            },
            "order": {
                "order_reference": order.order_reference,
                "total_amount": str(order.total_amount),
                "payment_status": order.payment_status,
                "fulfilment_status": order.fulfilment_status,
                "paid_at": order.paid_at,
            },
        },
        status=status.HTTP_200_OK,
    )
