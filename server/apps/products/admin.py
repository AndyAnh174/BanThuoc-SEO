from django.contrib import admin
from mptt.admin import MPTTModelAdmin, DraggableMPTTAdmin
from .models import Category, Manufacturer, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    """Inline for ProductImage in Product admin"""
    model = ProductImage
    extra = 1
    fields = ['image_url', 'alt_text', 'is_primary', 'sort_order']


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    """Admin for Category with drag-and-drop tree management"""
    list_display = ['tree_actions', 'indented_title', 'is_active', 'created_at']
    list_display_links = ['indented_title']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    mptt_level_indent = 20


@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    """Admin for Manufacturer"""
    list_display = ['name', 'country', 'is_active', 'created_at']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for Product"""
    list_display = [
        'name', 'sku', 'category', 'manufacturer', 
        'price', 'sale_price', 'stock_quantity', 'status'
    ]
    list_filter = ['status', 'product_type', 'category', 'manufacturer', 'requires_prescription', 'is_featured']
    search_fields = ['name', 'sku', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('sku', 'name', 'slug', 'short_description', 'description')
        }),
        ('Categorization', {
            'fields': ('category', 'manufacturer', 'product_type')
        }),
        ('Pricing', {
            'fields': ('price', 'sale_price')
        }),
        ('Product Details', {
            'fields': ('ingredients', 'dosage', 'usage', 'contraindications', 'side_effects', 'storage'),
            'classes': ('collapse',)
        }),
        ('Packaging', {
            'fields': ('unit', 'quantity_per_unit')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'low_stock_threshold')
        }),
        ('Status & Settings', {
            'fields': ('status', 'requires_prescription', 'is_featured')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin for ProductImage"""
    list_display = ['product', 'is_primary', 'sort_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name', 'alt_text']
    ordering = ['product', 'sort_order']
