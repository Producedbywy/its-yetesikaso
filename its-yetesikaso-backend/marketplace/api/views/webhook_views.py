import hashlib
import hmac
import json

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from marketplace.api.views.payment_views import (
    PaymentCompletionError,
    _complete_successful_payment,
)
from marketplace.models import Payment


@csrf_exempt
@api_view(["POST"])
def paystack_webhook(request):
    if not settings.PAYSTACK_SECRET_KEY:
        return Response(
            {"error": "Payment service is not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    signature = request.headers.get("x-paystack-signature")

    if not signature:
        return Response(
            {"error": "Missing Paystack signature"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
        request.body,
        hashlib.sha512,
    ).hexdigest()

    if not hmac.compare_digest(
        signature,
        expected_signature,
    ):
        return Response(
            {"error": "Invalid Paystack signature"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return Response(
            {"error": "Invalid JSON payload"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    event = payload.get("event")

    if event != "charge.success":
        return Response(
            {
                "message": "Event received",
                "event": event,
            },
            status=status.HTTP_200_OK,
        )

    data = payload.get("data") or {}

    if data.get("status") != "success":
        return Response(
            {"message": "Charge event ignored"},
            status=status.HTTP_200_OK,
        )

    reference = data.get("reference")

    if not reference:
        return Response(
            {"error": "Payment reference is missing"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payment = (
        Payment.objects
        .select_related("order")
        .filter(
            reference=reference,
            provider="paystack",
        )
        .first()
    )

    if not payment:
        return Response(
            {
                "message": "Payment reference not found",
                "reference": reference,
            },
            status=status.HTTP_200_OK,
        )

    expected_amount = int(
        payment.amount * 100
    )

    if data.get("currency") != payment.currency:
        return Response(
            {"error": "Payment currency mismatch"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if data.get("amount") != expected_amount:
        return Response(
            {"error": "Payment amount mismatch"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if payment.status == "successful":
        return Response(
            {
                "message": "Payment already processed",
                "reference": payment.reference,
            },
            status=status.HTTP_200_OK,
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

    return Response(
        {
            "message": (
                "Payment processed successfully"
                if completed
                else "Payment already processed"
            ),
            "reference": payment.reference,
            "order_reference": order.order_reference,
            "payment_status": order.payment_status,
            "fulfilment_status": order.fulfilment_status,
        },
        status=status.HTTP_200_OK,
    )
