from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from mptt.models import MPTTModel, TreeForeignKey
import uuid


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


class Product(models.Model):
    """
    Product model for medicines, supplements, and other pharmacy products.
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        OUT_OF_STOCK = 'OUT_OF_STOCK', _('Out of Stock')

    class ProductType(models.TextChoices):
        MEDICINE = 'MEDICINE', _('Medicine')  # Thuốc
        SUPPLEMENT = 'SUPPLEMENT', _('Supplement')  # Thực phẩm chức năng
        MEDICAL_DEVICE = 'MEDICAL_DEVICE', _('Medical Device')  # Thiết bị y tế
        COSMETIC = 'COSMETIC', _('Cosmetic')  # Mỹ phẩm
        OTHER = 'OTHER', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=50, unique=True, help_text=_("Stock Keeping Unit"))
    name = models.CharField(max_length=300, help_text=_("Product name"))
    slug = models.SlugField(max_length=300, unique=True, help_text=_("URL-friendly name"))
    description = models.TextField(blank=True, help_text=_("Product description"))
    short_description = models.CharField(max_length=500, blank=True, help_text=_("Short product description"))
    
    # Pricing
    price = models.DecimalField(max_digits=12, decimal_places=0, help_text=_("Regular price in VND"))
    sale_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, help_text=_("Sale price in VND"))
    
    # Relationships
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        help_text=_("Product category")
    )
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.PROTECT,
        related_name='products',
        help_text=_("Product manufacturer")
    )
    
    # Product details
    product_type = models.CharField(
        max_length=20,
        choices=ProductType.choices,
        default=ProductType.MEDICINE,
        help_text=_("Type of product")
    )
    ingredients = models.TextField(blank=True, help_text=_("Product ingredients/composition"))
    dosage = models.TextField(blank=True, help_text=_("Dosage instructions"))
    usage = models.TextField(blank=True, help_text=_("Usage instructions"))
    contraindications = models.TextField(blank=True, help_text=_("Contraindications and warnings"))
    side_effects = models.TextField(blank=True, help_text=_("Possible side effects"))
    storage = models.TextField(blank=True, help_text=_("Storage instructions"))
    
    # Packaging info
    unit = models.CharField(max_length=50, default="Hộp", help_text=_("Unit of measurement (Hộp, Vỉ, Chai, etc.)"))
    quantity_per_unit = models.CharField(max_length=100, blank=True, help_text=_("Quantity per unit (e.g., '10 viên/vỉ, 3 vỉ/hộp')"))
    
    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0, help_text=_("Current stock quantity"))
    low_stock_threshold = models.PositiveIntegerField(default=10, help_text=_("Low stock warning threshold"))
    
    # Status & metadata
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        help_text=_("Product status")
    )
    requires_prescription = models.BooleanField(default=False, help_text=_("Requires prescription to purchase"))
    is_featured = models.BooleanField(default=False, help_text=_("Featured product"))
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, help_text=_("SEO title"))
    meta_description = models.CharField(max_length=500, blank=True, help_text=_("SEO description"))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_products'
    )

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        db_table = "products_product"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['manufacturer']),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def is_on_sale(self):
        """Check if product is on sale"""
        return self.sale_price is not None and self.sale_price < self.price

    @property
    def current_price(self):
        """Get current effective price"""
        if self.is_on_sale:
            return self.sale_price
        return self.price

    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.is_on_sale:
            return int((1 - self.sale_price / self.price) * 100)
        return 0

    @property
    def is_low_stock(self):
        """Check if product is low on stock"""
        return self.stock_quantity <= self.low_stock_threshold

    @property
    def primary_image(self):
        """Get the primary product image"""
        return self.images.filter(is_primary=True).first() or self.images.first()


class ProductImage(models.Model):
    """
    Product image model. One product can have multiple images (One-to-Many).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        help_text=_("Associated product")
    )
    image_url = models.CharField(max_length=500, help_text=_("URL to image in storage"))
    alt_text = models.CharField(max_length=200, blank=True, help_text=_("Alt text for accessibility"))
    is_primary = models.BooleanField(default=False, help_text=_("Is this the primary/featured image?"))
    sort_order = models.PositiveIntegerField(default=0, help_text=_("Display order"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Product Image")
        verbose_name_plural = _("Product Images")
        db_table = "products_product_image"
        ordering = ['sort_order', '-is_primary']

    def __str__(self):
        return f"Image for {self.product.name} - {'Primary' if self.is_primary else 'Secondary'}"

    def save(self, *args, **kwargs):
        # If this is set as primary, remove primary from other images
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, 
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
