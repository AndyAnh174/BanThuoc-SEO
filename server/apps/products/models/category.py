"""
Category model for product categorization.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
import uuid

from products.utils.slug import generate_unique_slug


class Category(MPTTModel):
    """
    Category model using MPTT for tree structure.
    Supports hierarchical categories like:
    - Thuốc -> Thuốc kháng sinh -> Kháng sinh nhóm Beta-lactam
    - Thực phẩm chức năng -> Vitamin -> Vitamin C
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text=_("Category name"))
    slug = models.SlugField(max_length=200, unique=True, help_text=_("URL-friendly name"))
    description = models.TextField(blank=True, help_text=_("Category description"))
    image = models.CharField(max_length=500, blank=True, null=True, help_text=_("URL to category image"))
    parent = TreeForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        help_text=_("Parent category")
    )
    is_active = models.BooleanField(default=True, help_text=_("Is this category active?"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        db_table = "products_category"

    def __str__(self):
        return self.name

    def get_full_path(self):
        """Returns full category path like 'Thuốc > Kháng sinh > Beta-lactam'"""
        ancestors = self.get_ancestors(include_self=True)
        return ' > '.join([cat.name for cat in ancestors])

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            self.slug = generate_unique_slug(Category, self.name, self)
        super().save(*args, **kwargs)
