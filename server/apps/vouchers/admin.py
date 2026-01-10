"""
Admin configuration for Voucher system.
"""
from django.contrib import admin
from django.utils.html import format_html
from vouchers.models import Voucher, UserVoucher


class UserVoucherInline(admin.TabularInline):
    """Inline for UserVoucher in Voucher admin"""
    model = UserVoucher
    extra = 0
    readonly_fields = ['user', 'status', 'times_used', 'used_at', 'discount_amount', 'claimed_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    """Admin for Voucher"""
    list_display = [
        'code', 'name', 'discount_display', 'min_spend_display',
        'usage_display', 'status', 'validity_display', 'is_valid'
    ]
    list_filter = ['status', 'discount_type', 'first_order_only', 'start_date']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['usage_count', 'created_at', 'updated_at', 'created_by']
    inlines = [UserVoucherInline]
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description')
        }),
        ('Discount Settings', {
            'fields': ('discount_type', 'discount_value', 'max_discount', 'min_spend')
        }),
        ('Usage Limits', {
            'fields': ('usage_limit', 'usage_limit_per_user', 'usage_count')
        }),
        ('Validity Period', {
            'fields': ('start_date', 'end_date', 'status')
        }),
        ('Restrictions', {
            'fields': ('applicable_categories', 'applicable_products', 'first_order_only'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ['applicable_categories', 'applicable_products']
    
    def discount_display(self, obj):
        if obj.discount_type == Voucher.DiscountType.PERCENTAGE:
            text = f"{int(obj.discount_value)}%"
            if obj.max_discount:
                text += f" (max {int(obj.max_discount):,}đ)"
            return text
        return f"{int(obj.discount_value):,}đ"
    discount_display.short_description = 'Discount'
    
    def min_spend_display(self, obj):
        if obj.min_spend > 0:
            return f"{int(obj.min_spend):,}đ"
        return "-"
    min_spend_display.short_description = 'Min Spend'
    
    def usage_display(self, obj):
        if obj.usage_limit:
            return f"{obj.usage_count}/{obj.usage_limit}"
        return f"{obj.usage_count}/∞"
    usage_display.short_description = 'Usage'
    
    def validity_display(self, obj):
        return format_html(
            "{} → {}",
            obj.start_date.strftime('%d/%m/%Y'),
            obj.end_date.strftime('%d/%m/%Y')
        )
    validity_display.short_description = 'Valid Period'
    
    def is_valid(self, obj):
        return obj.is_valid
    is_valid.boolean = True
    is_valid.short_description = 'Valid?'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['activate_vouchers', 'deactivate_vouchers']
    
    @admin.action(description="Activate selected vouchers")
    def activate_vouchers(self, request, queryset):
        queryset.update(status=Voucher.Status.ACTIVE)
    
    @admin.action(description="Deactivate selected vouchers")
    def deactivate_vouchers(self, request, queryset):
        queryset.update(status=Voucher.Status.INACTIVE)


@admin.register(UserVoucher)
class UserVoucherAdmin(admin.ModelAdmin):
    """Admin for UserVoucher"""
    list_display = ['user', 'voucher', 'status', 'times_used', 'discount_amount', 'claimed_at', 'used_at']
    list_filter = ['status', 'claimed_at', 'used_at']
    search_fields = ['user__email', 'voucher__code', 'voucher__name']
    readonly_fields = ['claimed_at', 'updated_at']
    
    autocomplete_fields = ['voucher']
