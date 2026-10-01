from django.db import migrations, models


def correct_unpaid_order_items(apps, schema_editor):
    OrderItem = apps.get_model("marketplace", "OrderItem")

    OrderItem.objects.filter(
        order__payment_status="unpaid",
        fulfilment_status="paid",
    ).update(
        fulfilment_status="awaiting_payment"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("marketplace", "0021_review_order_item_alter_review_transaction"),
    ]

    operations = [
        migrations.AlterField(
            model_name="orderitem",
            name="fulfilment_status",
            field=models.CharField(
                choices=[
                    ("awaiting_payment", "Awaiting Payment"),
                    ("paid", "Paid"),
                    ("dispatched", "Dispatched"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ],
                default="awaiting_payment",
                max_length=30,
            ),
        ),
        migrations.RunPython(
            correct_unpaid_order_items,
            migrations.RunPython.noop,
        ),
    ]