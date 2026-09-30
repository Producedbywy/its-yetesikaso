from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class SellerProfile(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("seller", "Seller"),
        ("employer", "Employer"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="seller_profile",
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="user",
    )

    display_name = models.CharField(
        max_length=150,
        blank=True,
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    location = models.CharField(
        max_length=150,
        blank=True,
    )

    bio = models.TextField(
        blank=True,
        max_length=1000,
    )

    onboarding_completed = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.display_name or self.user.username

class UserBlock(models.Model):
    blocker = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blocks_created",
    )

    blocked_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blocks_received",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["blocker", "blocked_user"],
                name="unique_user_block",
            ),
        ]

    def __str__(self):
        return (
            f"{self.blocker.username} blocked "
            f"{self.blocked_user.username}"
        )

class Listing(models.Model):
    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("vehicles", "Vehicles"),
        ("property", "Property"),
        ("fashion", "Fashion"),
        ("services", "Services"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="listings",
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
    )

    location = models.CharField(
        max_length=100,
    )

    image = models.URLField(
        blank=True,
        null=True,
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    available_quantity = models.PositiveIntegerField(
        default=1,
    )

    slug = models.SlugField(
        unique=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

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

class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.URLField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.listing.title} image"

class Favourite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="favourites",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="favourited_by",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "listing"],
                name="unique_user_listing_favourite",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} → "
            f"{self.listing.title}"
        )

class ListingReport(models.Model):
    REASON_CHOICES = [
        ("scam_fraud", "Scam / Fraud"),
        ("prohibited_item", "Prohibited Item"),
        ("spam", "Spam"),
        ("wrong_category", "Wrong Category"),
        ("duplicate", "Duplicate"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="listing_reports",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="reports",
    )

    reason = models.CharField(
        max_length=30,
        choices=REASON_CHOICES,
    )

    details = models.TextField(
        blank=True,
        max_length=1000,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "listing"],
                name="unique_user_listing_report",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} → "
            f"{self.listing.title} "
            f"({self.get_reason_display()})"
        )

class Cart(models.Model):
    buyer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Cart for {self.buyer.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )

    quantity = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "listing"],
                name="unique_cart_listing",
            ),
        ]

    def __str__(self):
        return (
            f"{self.cart.buyer.username} → "
            f"{self.listing.title} x{self.quantity}"
        )


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    FULFILMENT_STATUS_CHOICES = [
        ("awaiting_payment", "Awaiting Payment"),
        ("paid", "Paid"),
        ("dispatched", "Dispatched"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
    ]

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    order_reference = models.CharField(
        max_length=100,
        unique=True,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid",
    )

    fulfilment_status = models.CharField(
        max_length=30,
        choices=FULFILMENT_STATUS_CHOICES,
        default="awaiting_payment",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    cancelled_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    expires_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["buyer", "-created_at"],
                name="order_buyer_created_idx",
            ),
            models.Index(
                fields=["payment_status"],
                name="order_payment_status_idx",
            ),
            models.Index(
                fields=["fulfilment_status"],
                name="order_fulfilment_status_idx",
            ),
            models.Index(
                fields=["expires_at"],
                name="order_expires_at_idx",
            ),
        ]

    def __str__(self):
        return self.order_reference


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    seller = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["order", "listing"],
                name="unique_order_listing",
            ),
        ]
        indexes = [
            models.Index(
                fields=["seller", "-created_at"],
                name="orderitem_seller_created_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.order.order_reference} → "
            f"{self.listing.title} x{self.quantity}"
        )


class InventoryReservation(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("committed", "Committed"),
        ("released", "Released"),
        ("expired", "Expired"),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reservations",
    )

    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="reservations",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.PROTECT,
        related_name="inventory_reservations",
    )

    quantity = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    expires_at = models.DateTimeField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    released_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["order_item"],
                condition=models.Q(status="active"),
                name="unique_active_order_item_reservation",
            ),
        ]
        indexes = [
            models.Index(
                fields=["status", "expires_at"],
                name="reservation_status_expiry_idx",
            ),
            models.Index(
                fields=["listing", "status"],
                name="reservation_listing_status_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.listing.title} x{self.quantity} "
            f"({self.status})"
        )


class Payment(models.Model):
    PROVIDER_CHOICES = [
        ("paystack", "Paystack"),
    ]

    STATUS_CHOICES = [
        ("initiated", "Initiated"),
        ("pending", "Pending"),
        ("successful", "Successful"),
        ("failed", "Failed"),
        ("abandoned", "Abandoned"),
        ("refunded", "Refunded"),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name="payments",
    )

    provider = models.CharField(
        max_length=30,
        choices=PROVIDER_CHOICES,
        default="paystack",
    )

    reference = models.CharField(
        max_length=150,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    currency = models.CharField(
        max_length=10,
        default="GHS",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="initiated",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    verified_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["order", "-created_at"],
                name="payment_order_created_idx",
            ),
            models.Index(
                fields=["status"],
                name="payment_status_idx",
            ),
        ]

    def __str__(self):
        return self.reference

class Transaction(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="purchases",
    )

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sales",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.buyer.username} → "
            f"{self.seller.username} "
            f"({self.listing.title})"
        )

class Review(models.Model):
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name="review",
    )

    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.buyer.username} → "
            f"{self.seller.username} "
            f"({self.rating}/5)"
        )

class Job(models.Model):
    CATEGORY_CHOICES = [
        ("technology", "Technology"),
        ("sales", "Sales"),
        ("marketing", "Marketing"),
        ("finance", "Finance"),
        ("construction", "Construction"),
        ("hospitality", "Hospitality"),
        ("healthcare", "Healthcare"),
        ("education", "Education"),
        ("transport", "Transport"),
        ("other", "Other"),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ("full_time", "Full-time"),
        ("part_time", "Part-time"),
        ("contract", "Contract"),
        ("temporary", "Temporary"),
        ("internship", "Internship"),
        ("casual", "Casual"),
    ]

    WORKPLACE_TYPE_CHOICES = [
        ("on_site", "On-site"),
        ("hybrid", "Hybrid"),
        ("remote", "Remote"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("closed", "Closed"),
    ]

    employer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jobs",
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField()

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
    )

    location = models.CharField(
        max_length=150,
    )

    employment_type = models.CharField(
        max_length=30,
        choices=EMPLOYMENT_TYPE_CHOICES,
    )

    workplace_type = models.CharField(
        max_length=20,
        choices=WORKPLACE_TYPE_CHOICES,
    )

    salary_min = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    salary_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    requirements = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
    )

    slug = models.SlugField(
        unique=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while Job.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Application(models.Model):
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("reviewing", "Reviewing"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
        ("accepted", "Accepted"),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )

    cover_note = models.TextField(
        blank=True,
        max_length=3000,
    )

    cv = models.FileField(
        upload_to="applications/cvs/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="submitted",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["job", "applicant"],
                name="unique_job_applicant",
            )
        ]

    def __str__(self):
        return (
            f"{self.applicant.username} → "
            f"{self.job.title}"
        )

class Conversation(models.Model):
    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="buyer_conversations",
    )

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="seller_conversations",
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["buyer", "seller", "listing"],
                name="unique_buyer_seller_listing_conversation",
            )
        ]

    def __str__(self):
        return (
            f"{self.buyer.username} → "
            f"{self.seller.username} "
            f"({self.listing.title})"
        )


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    body = models.TextField()

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.username}: {self.body[:50]}"