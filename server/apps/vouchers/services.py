"""
Voucher validation and calculation services.
"""
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from typing import Optional, Tuple, Dict, Any
from decimal import Decimal

from vouchers.models import Voucher, UserVoucher


class VoucherError:
    """Error codes for voucher validation"""
    INVALID_CODE = 'INVALID_CODE'
    VOUCHER_EXPIRED = 'VOUCHER_EXPIRED'
    VOUCHER_NOT_STARTED = 'VOUCHER_NOT_STARTED'
    VOUCHER_INACTIVE = 'VOUCHER_INACTIVE'
    VOUCHER_USED_UP = 'VOUCHER_USED_UP'
    MIN_SPEND_NOT_MET = 'MIN_SPEND_NOT_MET'
    USER_LIMIT_REACHED = 'USER_LIMIT_REACHED'
    FIRST_ORDER_ONLY = 'FIRST_ORDER_ONLY'
    CATEGORY_NOT_APPLICABLE = 'CATEGORY_NOT_APPLICABLE'
    PRODUCT_NOT_APPLICABLE = 'PRODUCT_NOT_APPLICABLE'


class VoucherValidator:
    """
    Service class for validating and calculating voucher discounts.
    
    Usage:
        validator = VoucherValidator(code='SALE10', user=request.user)
        result = validator.validate(order_total=500000)
        
        if result['valid']:
            discount = result['discount_amount']
        else:
            error = result['error_code']
    """
    
    ERROR_MESSAGES = {
        VoucherError.INVALID_CODE: _("Mã voucher không hợp lệ"),
        VoucherError.VOUCHER_EXPIRED: _("Mã voucher đã hết hạn"),
        VoucherError.VOUCHER_NOT_STARTED: _("Mã voucher chưa có hiệu lực"),
        VoucherError.VOUCHER_INACTIVE: _("Mã voucher không còn hiệu lực"),
        VoucherError.VOUCHER_USED_UP: _("Mã voucher đã hết lượt sử dụng"),
        VoucherError.MIN_SPEND_NOT_MET: _("Đơn hàng chưa đạt giá trị tối thiểu"),
        VoucherError.USER_LIMIT_REACHED: _("Bạn đã sử dụng hết lượt cho mã voucher này"),
        VoucherError.FIRST_ORDER_ONLY: _("Mã voucher chỉ áp dụng cho đơn hàng đầu tiên"),
        VoucherError.CATEGORY_NOT_APPLICABLE: _("Mã voucher không áp dụng cho danh mục này"),
        VoucherError.PRODUCT_NOT_APPLICABLE: _("Mã voucher không áp dụng cho sản phẩm này"),
    }

    def __init__(self, code: str, user=None):
        """
        Initialize validator with voucher code and optional user.
        
        Args:
            code: Voucher code string
            user: Optional user instance for per-user validation
        """
        self.code = code.upper().strip() if code else ''
        self.user = user
        self.voucher = None
        self.user_voucher = None
        self._load_voucher()

    def _load_voucher(self):
        """Load voucher from database"""
        try:
            self.voucher = Voucher.objects.get(code=self.code)
            
            # Load user voucher if user is provided
            if self.user and self.user.is_authenticated:
                self.user_voucher = UserVoucher.objects.filter(
                    user=self.user,
                    voucher=self.voucher
                ).first()
        except Voucher.DoesNotExist:
            self.voucher = None

    def validate(
        self, 
        order_total: Decimal,
        category_ids: list = None,
        product_ids: list = None,
        is_first_order: bool = False
    ) -> Dict[str, Any]:
        """
        Validate voucher against order.
        
        Args:
            order_total: Total order value in VND
            category_ids: List of category UUIDs in the order
            product_ids: List of product UUIDs in the order
            is_first_order: Whether this is user's first order
            
        Returns:
            Dict with validation result:
            {
                'valid': bool,
                'error_code': str or None,
                'error_message': str or None,
                'discount_amount': Decimal or None,
                'voucher': Voucher or None,
                'voucher_info': dict or None
            }
        """
        # Check if voucher exists
        if not self.voucher:
            return self._error_result(VoucherError.INVALID_CODE)
        
        now = timezone.now()
        
        # Check voucher status
        if self.voucher.status != Voucher.Status.ACTIVE:
            if self.voucher.status == Voucher.Status.EXPIRED:
                return self._error_result(VoucherError.VOUCHER_EXPIRED)
            elif self.voucher.status == Voucher.Status.USED_UP:
                return self._error_result(VoucherError.VOUCHER_USED_UP)
            else:
                return self._error_result(VoucherError.VOUCHER_INACTIVE)
        
        # Check date validity
        if now < self.voucher.start_date:
            return self._error_result(VoucherError.VOUCHER_NOT_STARTED)
        
        if now > self.voucher.end_date:
            return self._error_result(VoucherError.VOUCHER_EXPIRED)
        
        # Check global usage limit
        if self.voucher.usage_limit and self.voucher.usage_count >= self.voucher.usage_limit:
            return self._error_result(VoucherError.VOUCHER_USED_UP)
        
        # Check minimum spend
        if order_total < self.voucher.min_spend:
            return self._error_result(
                VoucherError.MIN_SPEND_NOT_MET,
                extra_data={'min_spend': float(self.voucher.min_spend)}
            )
        
        # Check per-user usage limit
        if self.user and self.user.is_authenticated:
            user_usage = 0
            if self.user_voucher:
                user_usage = self.user_voucher.times_used
            
            if user_usage >= self.voucher.usage_limit_per_user:
                return self._error_result(VoucherError.USER_LIMIT_REACHED)
        
        # Check first order only
        if self.voucher.first_order_only and not is_first_order:
            return self._error_result(VoucherError.FIRST_ORDER_ONLY)
        
        # Check category restrictions
        if category_ids and self.voucher.applicable_categories.exists():
            applicable_cat_ids = set(
                str(cat_id) for cat_id in 
                self.voucher.applicable_categories.values_list('id', flat=True)
            )
            order_cat_ids = set(str(cat_id) for cat_id in category_ids)
            
            if not applicable_cat_ids.intersection(order_cat_ids):
                return self._error_result(VoucherError.CATEGORY_NOT_APPLICABLE)
        
        # Check product restrictions
        if product_ids and self.voucher.applicable_products.exists():
            applicable_prod_ids = set(
                str(prod_id) for prod_id in 
                self.voucher.applicable_products.values_list('id', flat=True)
            )
            order_prod_ids = set(str(prod_id) for prod_id in product_ids)
            
            if not applicable_prod_ids.intersection(order_prod_ids):
                return self._error_result(VoucherError.PRODUCT_NOT_APPLICABLE)
        
        # Calculate discount
        discount_amount = self.voucher.calculate_discount(order_total)
        
        return self._success_result(discount_amount, order_total)

    def _error_result(self, error_code: str, extra_data: dict = None) -> Dict[str, Any]:
        """Build error result"""
        result = {
            'valid': False,
            'error_code': error_code,
            'error_message': str(self.ERROR_MESSAGES.get(error_code, _("Lỗi không xác định"))),
            'discount_amount': None,
            'voucher': None,
            'voucher_info': None,
        }
        if extra_data:
            result.update(extra_data)
        return result

    def _success_result(self, discount_amount: Decimal, order_total: Decimal) -> Dict[str, Any]:
        """Build success result"""
        return {
            'valid': True,
            'error_code': None,
            'error_message': None,
            'discount_amount': float(discount_amount),
            'voucher': self.voucher,
            'voucher_info': {
                'code': self.voucher.code,
                'name': self.voucher.name,
                'discount_type': self.voucher.discount_type,
                'discount_value': float(self.voucher.discount_value),
                'max_discount': float(self.voucher.max_discount) if self.voucher.max_discount else None,
                'min_spend': float(self.voucher.min_spend),
                'expires_at': self.voucher.end_date.isoformat(),
            },
            'order_total': float(order_total),
            'final_total': float(order_total - discount_amount),
        }

    def apply(self, order_total: Decimal, order_id=None, **kwargs) -> Dict[str, Any]:
        """
        Validate and apply voucher to order.
        This will increment usage counts.
        
        Args:
            order_total: Total order value
            order_id: Order ID for tracking
            **kwargs: Additional validation args
            
        Returns:
            Validation result dict
        """
        result = self.validate(order_total, **kwargs)
        
        if not result['valid']:
            return result
        
        discount_amount = Decimal(str(result['discount_amount']))
        
        # Create or update user voucher record
        if self.user and self.user.is_authenticated:
            if self.user_voucher:
                self.user_voucher.use(discount_amount, order_id)
            else:
                UserVoucher.objects.create(
                    user=self.user,
                    voucher=self.voucher,
                    times_used=1,
                    used_at=timezone.now(),
                    discount_amount=discount_amount,
                    order_id=order_id,
                    status=UserVoucher.Status.USED if self.voucher.usage_limit_per_user == 1 else UserVoucher.Status.CLAIMED
                )
                self.voucher.increment_usage()
        else:
            # Anonymous user - just increment global usage
            self.voucher.increment_usage()
        
        result['applied'] = True
        return result


def calculate_discount(code: str, order_total: Decimal, user=None, **kwargs) -> Dict[str, Any]:
    """
    Convenience function to validate and calculate discount.
    
    Args:
        code: Voucher code
        order_total: Order total in VND
        user: Optional user instance
        **kwargs: Additional validation args
        
    Returns:
        Validation result dict
    """
    validator = VoucherValidator(code=code, user=user)
    return validator.validate(order_total=order_total, **kwargs)


def apply_voucher(code: str, order_total: Decimal, user=None, order_id=None, **kwargs) -> Dict[str, Any]:
    """
    Convenience function to apply voucher.
    
    Args:
        code: Voucher code
        order_total: Order total in VND
        user: Optional user instance
        order_id: Order ID for tracking
        **kwargs: Additional validation args
        
    Returns:
        Validation result dict with 'applied' flag
    """
    validator = VoucherValidator(code=code, user=user)
    return validator.apply(order_total=order_total, order_id=order_id, **kwargs)
