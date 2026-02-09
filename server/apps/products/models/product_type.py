import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

class ProductType(models.Model):
    """
    Dynamic Product Type model (e.g., Thuốc, Thực phẩm chức năng, Cosmetics)
    Replaces hardcoded Enum.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text=_("Display name (e.g. Thuốc)"))
    code = models.CharField(max_length=50, unique=True, help_text=_("Unique code (e.g. MEDICINE)"))
    description = models.TextField(blank=True, null=True, help_text=_("Description of this type"))
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Product Type")
        verbose_name_plural = _("Product Types")
        ordering = ['name']

    def __str__(self):
        return self.name
