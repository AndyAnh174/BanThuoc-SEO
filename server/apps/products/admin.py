from django.contrib import admin
from mptt.admin import MPTTModelAdmin, DraggableMPTTAdmin
from .models import Category, Manufacturer, Product, ProductImage, FlashSaleSession, FlashSaleItem


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


# =============================================================================
# Flash Sale Admin
# =============================================================================

class FlashSaleItemInline(admin.TabularInline):
    """Inline for FlashSaleItem in FlashSaleSession admin"""
    model = FlashSaleItem
    extra = 1
    fields = [
        'product', 'original_price', 'flash_sale_price', 
        'total_quantity', 'remaining_quantity', 'sold_quantity',
        'max_per_user', 'sort_order', 'is_active'
    ]
    readonly_fields = ['sold_quantity']
    autocomplete_fields = ['product']


@admin.register(FlashSaleSession)
class FlashSaleSessionAdmin(admin.ModelAdmin):
    """Admin for FlashSaleSession"""
    list_display = [
        'name', 'status', 'start_time', 'end_time', 
        'is_currently_active', 'total_items', 'is_active'
    ]
    list_filter = ['status', 'is_active', 'start_time']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [FlashSaleItemInline]
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'banner_image')
        }),
        ('Time Range', {
            'fields': ('start_time', 'end_time')
        }),
        ('Settings', {
            'fields': ('status', 'max_items_per_user', 'is_active')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    def is_currently_active(self, obj):
        return obj.is_currently_active
    is_currently_active.boolean = True
    is_currently_active.short_description = 'Active Now?'
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Items'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(FlashSaleItem)
class FlashSaleItemAdmin(admin.ModelAdmin):
    """Admin for FlashSaleItem"""
    list_display = [
        'product', 'session', 'flash_sale_price', 'original_price',
        'discount_percentage', 'remaining_quantity', 'sold_quantity', 'is_active'
    ]
    list_filter = ['is_active', 'session', 'created_at']
    search_fields = ['product__name', 'session__name']
    autocomplete_fields = ['product', 'session']
    
    readonly_fields = ['sold_quantity', 'discount_percentage']
    
    def discount_percentage(self, obj):
        return f"{obj.discount_percentage}%"
    discount_percentage.short_description = 'Discount'

