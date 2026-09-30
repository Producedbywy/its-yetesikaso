from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from marketplace.api.views.fulfilment_views import update_order_fulfilment_status
from marketplace.models import OrderItem


class Command(BaseCommand):
    help = (
        "Automatically complete order items that have been dispatched "
        "for at least 5 days."
    )

    COMPLETION_DAYS = 5

    def handle(self, *args, **options):
        now = timezone.now()
        cutoff = now - timedelta(days=self.COMPLETION_DAYS)

        due_order_items = (
            OrderItem.objects
            .filter(
                fulfilment_status="dispatched",
                dispatched_at__isnull=False,
                dispatched_at__lte=cutoff,
            )
            .select_related("order")
            .order_by("dispatched_at")
        )

        completed_count = 0

        for order_item in due_order_items:
            with transaction.atomic():
                locked_item = (
                    OrderItem.objects
                    .select_for_update()
                    .select_related("order")
                    .get(id=order_item.id)
                )

                if (
                    locked_item.fulfilment_status != "dispatched"
                    or locked_item.dispatched_at is None
                    or locked_item.dispatched_at > cutoff
                ):
                    continue

                locked_item.fulfilment_status = "completed"
                locked_item.completed_at = now
                locked_item.save(
                    update_fields=[
                        "fulfilment_status",
                        "completed_at",
                    ],
                )

                update_order_fulfilment_status(locked_item.order)

                completed_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Automatically completed {completed_count} "
                f"order item(s)."
            )
        )