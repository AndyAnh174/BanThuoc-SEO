from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.dispatch import receiver
from django.db.models.signals import post_save
from products.models import Product

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        PROCESSING = 'PROCESSING', _('Processing')
        SHIPPING = 'SHIPPING', _('Shipping')
        DELIVERED = 'DELIVERED', _('Delivered')
        CANCELLED = 'CANCELLED', _('Cancelled')
        RETURNED = 'RETURNED', _('Returned')

    class PaymentMethod(models.TextChoices):
        COD = 'COD', _('Cash on Delivery')
        BANKING = 'BANKING', _('Banking Transfer')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='orders',
        null=True, blank=True # Allow guest checkout if needed, but for points we need user
    )
    
    # Contact Info (Snapshot)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    # Address
    address = models.TextField()
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    
    # Order Info
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.BooleanField(default=False)
    
    note = models.TextField(blank=True, null=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    final_amount = models.DecimalField(max_digits=12, decimal_places=0)
    
    expected_delivery_date = models.DateField(null=True, blank=True)
    tracking_number = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    points_awarded = models.BooleanField(default=False, help_text="True if loyalty points have been given")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"

    def calculate_loyalty_points(self):
        return int(self.final_amount / 1000)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255) # Snapshot in case product deleted
    
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=0) # Unit price at time of purchase
    total_price = models.DecimalField(max_digits=12, decimal_places=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"

# Signals
@receiver(post_save, sender=Order)
def update_user_loyalty_points(sender, instance, created, **kwargs):
    if instance.status == Order.Status.DELIVERED and instance.user and not instance.points_awarded:
        points = instance.calculate_loyalty_points()
        
        # Create Log entry (which triggers user point update via signal)
        from users.models import RewardPointLog
        RewardPointLog.objects.create(
            user=instance.user,
            points=points,
            reason=RewardPointLog.Reason.ORDER_EARN,
            related_order=instance,
            description=f"Points earned from Order #{instance.id}"
        )
        
        # Mark as awarded
        Order.objects.filter(pk=instance.pk).update(points_awarded=True)

