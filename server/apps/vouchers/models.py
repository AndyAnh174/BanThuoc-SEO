"""
Voucher models for discount code system.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid
import random
import string


class Voucher(models.Model):
    """
    Voucher/Coupon model for discount codes.
    
    Supports:
    - Percentage discount (e.g., 10% off)
    - Fixed amount discount (e.g., 50,000 VND off)
    - Minimum spend requirement
    - Maximum discount cap
    - Usage limits (total and per user)
    - Date-based validity
    """
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', _('Percentage')  # Giảm theo %
        FIXED_AMOUNT = 'FIXED_AMOUNT', _('Fixed Amount')  # Giảm số tiền cố định

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        EXPIRED = 'EXPIRED', _('Expired')
        USED_UP = 'USED_UP', _('Used Up')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Voucher code (unique, case-insensitive)
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text=_("Unique voucher code (case-insensitive)")
    )
    
    # Description
    name = models.CharField(max_length=200, help_text=_("Voucher name for display"))
    description = models.TextField(blank=True, help_text=_("Voucher description/terms"))
    
    # Discount settings
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
        help_text=_("Type of discount")
    )
    discount_value = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        help_text=_("Discount value (percentage or fixed amount in VND)")
    )
    max_discount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
        help_text=_("Maximum discount amount (for percentage discounts)")
    )
    
    # Requirements
    min_spend = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        help_text=_("Minimum order value to apply voucher")
    )
    
    # Usage limits
    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("Total number of times this voucher can be used (null = unlimited)")
    )
    usage_limit_per_user = models.PositiveIntegerField(
        default=1,
        help_text=_("Maximum times a single user can use this voucher")
    )
    usage_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of times this voucher has been used")
    )
    
    # Validity period
    start_date = models.DateTimeField(
        help_text=_("Voucher start date/time")
    )
    end_date = models.DateTimeField(
        help_text=_("Voucher end date/time")
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text=_("Voucher status")
    )
    
    # Restrictions (optional)
    applicable_categories = models.ManyToManyField(
        'products.Category',
        blank=True,
        related_name='vouchers',
        help_text=_("Categories this voucher applies to (empty = all categories)")
    )
    applicable_products = models.ManyToManyField(
        'products.Product',
        blank=True,
        related_name='vouchers',
        help_text=_("Specific products this voucher applies to (empty = all products)")
    )
    
    # For first-time buyers only
    first_order_only = models.BooleanField(
        default=False,
        help_text=_("Only applicable for first-time orders")
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_vouchers'
    )

    class Meta:
        verbose_name = _("Voucher")
        verbose_name_plural = _("Vouchers")
        db_table = "vouchers_voucher"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        # Normalize code to uppercase
        self.code = self.code.upper().strip()
        super().save(*args, **kwargs)

    def clean(self):
        """Validate voucher"""
        errors = {}
        
        # End date must be after start date
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                errors['end_date'] = _("End date must be after start date")
        
        # Percentage discount must be between 0 and 100
        if self.discount_type == self.DiscountType.PERCENTAGE:
            if self.discount_value and self.discount_value > 100:
                errors['discount_value'] = _("Percentage discount cannot exceed 100%")
        
        if errors:
            raise ValidationError(errors)

    @property
    def is_valid(self):
        """Check if voucher is currently valid"""
        now = timezone.now()
        
        if self.status != self.Status.ACTIVE:
            return False
        
        if now < self.start_date or now > self.end_date:
            return False
        
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        
        return True

    @property
    def is_expired(self):
        """Check if voucher is expired"""
        return timezone.now() > self.end_date

    @property
    def remaining_uses(self):
        """Get remaining uses (None if unlimited)"""
        if self.usage_limit is None:
            return None
        return max(0, self.usage_limit - self.usage_count)

    def calculate_discount(self, order_total):
        """
        Calculate discount amount for given order total.
        
        Args:
            order_total: Total order value in VND
            
        Returns:
            Discount amount in VND
        """
        if order_total < self.min_spend:
            return 0
        
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (order_total * self.discount_value) / 100
            # Apply max discount cap if set
            if self.max_discount and discount > self.max_discount:
                discount = self.max_discount
        else:
            # Fixed amount discount
            discount = self.discount_value
        
        # Discount cannot exceed order total
        return min(discount, order_total)

    def increment_usage(self):
        """Increment usage count"""
        self.usage_count += 1
        self.save(update_fields=['usage_count', 'updated_at'])
        
        # Auto-update status if used up
        if self.usage_limit and self.usage_count >= self.usage_limit:
            self.status = self.Status.USED_UP
            self.save(update_fields=['status', 'updated_at'])

    @classmethod
    def generate_code(cls, length=8, prefix=''):
        """Generate a random unique voucher code"""
        chars = string.ascii_uppercase + string.digits
        while True:
            code = prefix + ''.join(random.choices(chars, k=length))
            if not cls.objects.filter(code=code).exists():
                return code


class UserVoucher(models.Model):
    """
    Track user's voucher usage and claimed vouchers.
    
    Used for:
    - Limiting voucher usage per user
    - Storing claimed/saved vouchers
    - Tracking voucher usage history
    """
    class Status(models.TextChoices):
        CLAIMED = 'CLAIMED', _('Claimed')  # Đã lưu voucher
        USED = 'USED', _('Used')  # Đã sử dụng
        EXPIRED = 'EXPIRED', _('Expired')  # Hết hạn chưa dùng

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_vouchers'
    )
    voucher = models.ForeignKey(
        Voucher,
        on_delete=models.CASCADE,
        related_name='user_vouchers'
    )
    
    # Usage tracking
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CLAIMED
    )
    times_used = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of times user has used this voucher")
    )
    
    # When voucher was used (last usage)
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Last usage timestamp")
    )
    
    # Discount amount from last usage
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
        help_text=_("Discount amount applied")
    )
    
    # Order reference (if applicable)
    order_id = models.UUIDField(
        null=True,
        blank=True,
        help_text=_("Order ID where voucher was used")
    )
    
    # Timestamps
    claimed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("User Voucher")
        verbose_name_plural = _("User Vouchers")
        db_table = "vouchers_user_voucher"
        unique_together = [['user', 'voucher']]  # User can only claim a voucher once
        ordering = ['-claimed_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['voucher', 'status']),
        ]

    def __str__(self):
        return f"{self.user} - {self.voucher.code}"

    @property
    def can_use(self):
        """Check if user can still use this voucher"""
        if self.status == self.Status.USED:
            return False
        
        if self.status == self.Status.EXPIRED:
            return False
        
        # Check usage limit per user
        if self.times_used >= self.voucher.usage_limit_per_user:
            return False
        
        # Check if voucher itself is still valid
        if not self.voucher.is_valid:
            return False
        
        return True

    def use(self, discount_amount, order_id=None):
        """
        Mark voucher as used.
        
        Args:
            discount_amount: Amount discounted
            order_id: Optional order ID
        """
        self.times_used += 1
        self.used_at = timezone.now()
        self.discount_amount = discount_amount
        self.order_id = order_id
        
        # Update status if max usage reached
        if self.times_used >= self.voucher.usage_limit_per_user:
            self.status = self.Status.USED
        
        self.save()
        
        # Increment global voucher usage
        self.voucher.increment_usage()
