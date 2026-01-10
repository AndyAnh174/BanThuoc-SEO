"""
Flash Sale models for time-limited sales.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid

from products.utils.slug import generate_unique_slug


class FlashSaleSession(models.Model):
    """
    Flash Sale Session - A time-limited sale event.
    
    Example:
    - "Flash Sale Cuối Tuần" - 20:00 Fri to 23:59 Sun
    - "Flash Sale 12.12" - 00:00 to 23:59 on Dec 12
    """
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')  # Chưa bắt đầu
        ACTIVE = 'ACTIVE', _('Active')  # Đang diễn ra
        ENDED = 'ENDED', _('Ended')  # Đã kết thúc
        CANCELLED = 'CANCELLED', _('Cancelled')  # Đã hủy

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text=_("Flash sale session name"))
    slug = models.SlugField(max_length=200, unique=True, blank=True, help_text=_("URL-friendly name"))
    description = models.TextField(blank=True, help_text=_("Session description"))
    banner_image = models.CharField(max_length=500, blank=True, null=True, help_text=_("Banner image URL"))
    
    # Time range
    start_time = models.DateTimeField(help_text=_("Flash sale start time"))
    end_time = models.DateTimeField(help_text=_("Flash sale end time"))
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        help_text=_("Session status")
    )
    
    # Limits
    max_items_per_user = models.PositiveIntegerField(
        default=1,
        help_text=_("Maximum items a user can buy per product in this session")
    )
    
    # Metadata
    is_active = models.BooleanField(default=True, help_text=_("Is this session active?"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_flash_sales'
    )

    class Meta:
        verbose_name = _("Flash Sale Session")
        verbose_name_plural = _("Flash Sale Sessions")
        db_table = "products_flash_sale_session"
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%d/%m/%Y %H:%M')} - {self.end_time.strftime('%d/%m/%Y %H:%M')})"

    def save(self, *args, **kwargs):
        # Auto-generate slug
        if not self.slug:
            self.slug = generate_unique_slug(FlashSaleSession, self.name, self)
        super().save(*args, **kwargs)

    def clean(self):
        """Validate the flash sale session"""
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        
        errors = {}
        
        # Validate time range
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                errors['end_time'] = _("End time must be after start time")
        
        # Check for overlapping sessions (only for SCHEDULED or ACTIVE sessions)
        if self.start_time and self.end_time and self.status in ['SCHEDULED', 'ACTIVE']:
            overlapping = FlashSaleSession.objects.filter(
                status__in=['SCHEDULED', 'ACTIVE'],
                is_active=True,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            )
            if self.pk:
                overlapping = overlapping.exclude(pk=self.pk)
            
            if overlapping.exists():
                overlap = overlapping.first()
                errors['start_time'] = _(
                    f"Time range overlaps with existing session: {overlap.name} "
                    f"({overlap.start_time.strftime('%d/%m %H:%M')} - {overlap.end_time.strftime('%d/%m %H:%M')})"
                )
        
        if errors:
            raise ValidationError(errors)

    @property
    def is_currently_active(self):
        """Check if the flash sale is currently running"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.status == self.Status.ACTIVE and
            self.is_active and
            self.start_time <= now <= self.end_time
        )

    @property
    def is_upcoming(self):
        """Check if the flash sale is upcoming"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.status == self.Status.SCHEDULED and
            self.is_active and
            self.start_time > now
        )

    @property
    def is_ended(self):
        """Check if the flash sale has ended"""
        from django.utils import timezone
        now = timezone.now()
        return self.end_time < now or self.status in [self.Status.ENDED, self.Status.CANCELLED]

    @property
    def time_remaining(self):
        """Get remaining time in seconds (None if not active)"""
        from django.utils import timezone
        if not self.is_currently_active:
            return None
        return (self.end_time - timezone.now()).total_seconds()

    @property
    def total_items(self):
        """Get total number of items in this session"""
        return self.items.count()

    @property
    def available_items(self):
        """Get items that still have stock"""
        return self.items.filter(
            remaining_quantity__gt=0,
            is_active=True
        )


class FlashSaleItem(models.Model):
    """
    Flash Sale Item - A product in a flash sale session with special pricing.
    
    Each item has:
    - Limited quantity
    - Special flash sale price
    - Maximum purchase per user
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    session = models.ForeignKey(
        FlashSaleSession,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_("Flash sale session")
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='flash_sale_items',
        help_text=_("Product in flash sale")
    )
    
    # Pricing
    original_price = models.DecimalField(
        max_digits=12, 
        decimal_places=0,
        help_text=_("Original price (snapshot at creation)")
    )
    flash_sale_price = models.DecimalField(
        max_digits=12, 
        decimal_places=0,
        help_text=_("Flash sale price")
    )
    
    # Quantity
    total_quantity = models.PositiveIntegerField(
        help_text=_("Total quantity available for flash sale")
    )
    remaining_quantity = models.PositiveIntegerField(
        help_text=_("Remaining quantity")
    )
    sold_quantity = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of items sold")
    )
    
    # Limits
    max_per_user = models.PositiveIntegerField(
        default=1,
        help_text=_("Maximum quantity per user (overrides session setting)")
    )
    
    # Display order
    sort_order = models.PositiveIntegerField(default=0, help_text=_("Display order"))
    
    # Status
    is_active = models.BooleanField(default=True, help_text=_("Is this item active?"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Flash Sale Item")
        verbose_name_plural = _("Flash Sale Items")
        db_table = "products_flash_sale_item"
        ordering = ['sort_order', '-created_at']
        unique_together = [['session', 'product']]
        indexes = [
            models.Index(fields=['session', 'is_active']),
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"{self.product.name} in {self.session.name}"

    def clean(self):
        """Validate the flash sale item"""
        from django.core.exceptions import ValidationError
        
        errors = {}
        
        # Flash sale price must be less than original price
        if self.flash_sale_price and self.original_price:
            if self.flash_sale_price >= self.original_price:
                errors['flash_sale_price'] = _("Flash sale price must be less than original price")
        
        # Remaining quantity cannot exceed total quantity
        if self.remaining_quantity and self.total_quantity:
            if self.remaining_quantity > self.total_quantity:
                errors['remaining_quantity'] = _("Remaining quantity cannot exceed total quantity")
        
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        # Set original price from product if not set
        if not self.original_price and self.product:
            self.original_price = self.product.price
        
        # Set remaining quantity to total if new
        if not self.pk and not self.remaining_quantity:
            self.remaining_quantity = self.total_quantity
        
        super().save(*args, **kwargs)

    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.original_price and self.original_price > 0:
            return int((1 - self.flash_sale_price / self.original_price) * 100)
        return 0

    @property
    def is_sold_out(self):
        """Check if item is sold out"""
        return self.remaining_quantity <= 0

    @property
    def sold_percentage(self):
        """Calculate sold percentage for progress bar"""
        if self.total_quantity > 0:
            return int((self.sold_quantity / self.total_quantity) * 100)
        return 0

    def purchase(self, quantity=1):
        """
        Record a purchase of this flash sale item.
        Returns True if successful, False if not enough stock.
        """
        if self.remaining_quantity >= quantity:
            self.remaining_quantity -= quantity
            self.sold_quantity += quantity
            self.save(update_fields=['remaining_quantity', 'sold_quantity', 'updated_at'])
            return True
        return False
