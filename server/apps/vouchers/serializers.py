"""
Serializers for Voucher system.
"""
from rest_framework import serializers
from django.utils import timezone

from vouchers.models import Voucher, UserVoucher


class VoucherSerializer(serializers.ModelSerializer):
    """Serializer for voucher listing"""
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    remaining_uses = serializers.IntegerField(read_only=True)
    discount_display = serializers.SerializerMethodField()

    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'name', 'description',
            'discount_type', 'discount_value', 'max_discount',
            'min_spend', 'start_date', 'end_date',
            'usage_limit', 'usage_limit_per_user', 'usage_count',
            'is_valid', 'is_expired', 'remaining_uses',
            'discount_display', 'first_order_only'
        ]

    def get_discount_display(self, obj):
        """Get human-readable discount display"""
        if obj.discount_type == Voucher.DiscountType.PERCENTAGE:
            text = f"Giảm {int(obj.discount_value)}%"
            if obj.max_discount:
                text += f" (tối đa {int(obj.max_discount):,}đ)"
            return text
        else:
            return f"Giảm {int(obj.discount_value):,}đ"


class VoucherDetailSerializer(VoucherSerializer):
    """Detailed voucher serializer"""
    applicable_categories = serializers.SerializerMethodField()
    applicable_products = serializers.SerializerMethodField()

    class Meta(VoucherSerializer.Meta):
        fields = VoucherSerializer.Meta.fields + [
            'applicable_categories', 'applicable_products'
        ]

    def get_applicable_categories(self, obj):
        return list(obj.applicable_categories.values('id', 'name', 'slug'))

    def get_applicable_products(self, obj):
        return list(obj.applicable_products.values('id', 'name', 'slug'))


class UserVoucherSerializer(serializers.ModelSerializer):
    """Serializer for user's claimed vouchers"""
    voucher = VoucherSerializer(read_only=True)
    can_use = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserVoucher
        fields = [
            'id', 'voucher', 'status', 'times_used',
            'can_use', 'claimed_at', 'used_at'
        ]


class ApplyVoucherRequestSerializer(serializers.Serializer):
    """Request serializer for applying voucher"""
    code = serializers.CharField(
        max_length=50,
        help_text="Voucher code"
    )
    order_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=0,
        help_text="Total order value in VND"
    )
    category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="List of category UUIDs in the order"
    )
    product_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="List of product UUIDs in the order"
    )
    is_first_order = serializers.BooleanField(
        default=False,
        required=False,
        help_text="Is this user's first order"
    )


class ApplyVoucherResponseSerializer(serializers.Serializer):
    """Response serializer for apply voucher API"""
    valid = serializers.BooleanField(help_text="Whether voucher is valid")
    error_code = serializers.CharField(allow_null=True, help_text="Error code if invalid")
    error_message = serializers.CharField(allow_null=True, help_text="Human-readable error message")
    discount_amount = serializers.FloatField(allow_null=True, help_text="Discount amount in VND")
    voucher_info = serializers.DictField(allow_null=True, help_text="Voucher details")
    order_total = serializers.FloatField(allow_null=True, help_text="Original order total")
    final_total = serializers.FloatField(allow_null=True, help_text="Final total after discount")


class ClaimVoucherRequestSerializer(serializers.Serializer):
    """Request serializer for claiming a voucher"""
    code = serializers.CharField(max_length=50, help_text="Voucher code to claim")
