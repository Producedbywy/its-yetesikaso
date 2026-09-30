from decimal import Decimal

import httpx

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Order, Payment


PAYSTACK_INITIALIZE_URL = (
    "https://api.paystack.co/transaction/initialize"
)


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