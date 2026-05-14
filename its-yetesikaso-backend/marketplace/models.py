from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("vehicles", "Vehicles"),
        ("property", "Property"),
        ("fashion", "Fashion"),
        ("services", "Services"),
    ]

    # 🔐 SELLER LINK
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=100)

    image = models.ImageField(upload_to="listings/", blank=True, null=True)

    slug = models.SlugField(unique=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while Listing.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title