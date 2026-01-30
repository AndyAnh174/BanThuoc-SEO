from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', _('Customer')
        ADMIN = 'ADMIN', _('Admin')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACTIVE = 'ACTIVE', _('Active')
        REJECTED = 'REJECTED', _('Rejected')
        LOCKED = 'LOCKED', _('Locked')

    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.CUSTOMER,
        help_text=_("User role in the system")
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING,
        help_text=_("Account status")
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True)
    avatar = models.CharField(max_length=500, blank=True, null=True, help_text=_("URL to avatar image"))
    is_verified = models.BooleanField(default=False)
    loyalty_points = models.IntegerField(default=0, help_text=_("Accumulated loyalty points"))

    def __str__(self):
        return self.username

class BusinessProfile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='business_profile'
    )
    business_name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    license_file_url = models.CharField(max_length=500, help_text=_("Path/URL to license file in storage"))
    address = models.TextField()
    tax_id = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.business_name} ({self.user.username})"


class EmailVerificationToken(models.Model):
    """Token for email verification after admin approval."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='verification_tokens'
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Token for {self.user.email}"


class RewardPointLog(models.Model):
    class Reason(models.TextChoices):
        ORDER_EARN = 'ORDER_EARN', _('Earned from Order')
        ORDER_REFUND = 'ORDER_REFUND', _('Deducted from Refund')
        ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT', _('Admin Adjustment')
        REDEEM = 'REDEEM', _('Redeemed for Discount')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='point_logs'
    )
    points = models.IntegerField(help_text=_("Points change (positive or negative)"))
    reason = models.CharField(
        max_length=50,
        choices=Reason.choices,
        default=Reason.ORDER_EARN
    )
    related_order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reward_logs',
        help_text=_("Related order if applicable")
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.points} pts ({self.reason})"


# Signals
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=RewardPointLog)
def update_user_total_points(sender, instance, created, **kwargs):
    """
    Update User.loyalty_points whenever a log is created.
    """
    if created:
        user = instance.user
        user.loyalty_points += instance.points
        user.save(update_fields=['loyalty_points'])
