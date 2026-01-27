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
