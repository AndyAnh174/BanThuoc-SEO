"""
Manufacturer model for product brands/manufacturers.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

from products.utils.slug import generate_unique_slug


class Manufacturer(models.Model):
    """
    Manufacturer/Brand model for products.
    E.g., Dược Hậu Giang, Sanofi, Pfizer, etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text=_("Manufacturer name"))
    slug = models.SlugField(max_length=200, unique=True, help_text=_("URL-friendly name"))
    description = models.TextField(blank=True, help_text=_("Manufacturer description"))
    logo = models.CharField(max_length=500, blank=True, null=True, help_text=_("URL to manufacturer logo"))
    website = models.URLField(blank=True, null=True, help_text=_("Manufacturer website"))
    country = models.CharField(max_length=100, blank=True, help_text=_("Country of origin"))
    is_active = models.BooleanField(default=True, help_text=_("Is this manufacturer active?"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Manufacturer")
        verbose_name_plural = _("Manufacturers")
        db_table = "products_manufacturer"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            self.slug = generate_unique_slug(Manufacturer, self.name, self)
        super().save(*args, **kwargs)
