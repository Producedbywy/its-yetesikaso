from django.db import models


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("vehicles", "Vehicles"),
        ("property", "Property"),
        ("fashion", "Fashion"),
        ("services", "Services"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()

    price = models.DecimalField(max_digits=12, decimal_places=2)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    location = models.CharField(max_length=100)

    # store images as simple URLs for now (we’ll upgrade later to cloud storage)
    images = models.JSONField(default=list)

    slug = models.SlugField(unique=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title