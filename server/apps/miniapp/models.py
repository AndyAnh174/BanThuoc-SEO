"""
Mini App Models — Ngọc Kim Ngân Pharmacy (B2C)
Chung PostgreSQL với banthuocsi.vn, prefix miniapp_
"""
import uuid
from django.db import models
from django.conf import settings


class MiniAppUser(models.Model):
    """Người dùng Mini App — auth bằng Zalo OAuth, ko cần email/password"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    zalo_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    avatar = models.URLField(max_length=500, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    loyalty_points = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    membership_tier = models.CharField(max_length=20, default="SILVER")

    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "miniapp_user"

    def update_tier(self):
        """Tự động nâng hạng dựa trên total_spent"""
        from .models import MembershipTier
        tiers = MembershipTier.objects.filter(min_spent__lte=self.total_spent).order_by("-min_spent")
        if tiers.exists():
            self.membership_tier = tiers.first().tier_name
            self.save(update_fields=["membership_tier"])


class MembershipTier(models.Model):
    """Cấu hình hạng thành viên"""
    tier_name = models.CharField(max_length=20, unique=True)  # SILVER, GOLD, PLATINUM, DIAMOND
    tier_label = models.CharField(max_length=100)
    min_spent = models.DecimalField(max_digits=14, decimal_places=0)
    cashback_percent = models.DecimalField(max_digits=3, decimal_places=1)

    class Meta:
        db_table = "miniapp_membership_tier"


class MiniAppAddress(models.Model):
    """Địa chỉ giao hàng"""
    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="addresses")
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "miniapp_address"


class MiniAppCartItem(models.Model):
    """Giỏ hàng — mỗi user 1 dòng/sp"""
    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "miniapp_cart_item"
        unique_together = [("user", "product")]


class MiniappOrder(models.Model):
    """Đơn hàng retail"""
    class Status(models.TextChoices):
        PENDING = "PENDING", "Chờ xác nhận"
        CONFIRMED = "CONFIRMED", "Đã xác nhận"
        PROCESSING = "PROCESSING", "Đang chuẩn bị"
        SHIPPING = "SHIPPING", "Đang giao"
        DELIVERED = "DELIVERED", "Hoàn thành"
        CANCELLED = "CANCELLED", "Đã hủy"
        RETURNED = "RETURNED", "Trả hàng"

    class PaymentMethod(models.TextChoices):
        COD = "COD", "Tiền mặt"
        BANKING = "BANKING", "Chuyển khoản"
        ZALOPAY = "ZALOPAY", "ZaloPay"
        VNPAY = "VNPAY", "VNPay"

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="orders")
    order_number = models.CharField(max_length=20, unique=True)

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    ward = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=14, decimal_places=0)
    shipping_fee = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    discount_voucher = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    discount_points = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    final_amount = models.DecimalField(max_digits=14, decimal_places=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=20, default="UNPAID")
    payment_txn_ref = models.CharField(max_length=255, blank=True)

    points_earned = models.IntegerField(default=0)

    shipping_carrier = models.CharField(max_length=20, default="GHN")
    tracking_number = models.CharField(max_length=100, blank=True)
    ghn_order_code = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "miniapp_order"

    def save(self, *args, **kwargs):
        if not self.order_number:
            from datetime import datetime
            today = datetime.now().strftime("%Y%m%d")
            last = MiniappOrder.objects.filter(order_number__startswith=f"MSP{today}").order_by("-order_number").first()
            seq = 1 if not last else int(last.order_number[-4:]) + 1
            self.order_number = f"MSP{today}-{seq:04d}"
        super().save(*args, **kwargs)


class MiniappOrderItem(models.Model):
    """Chi tiết đơn hàng"""
    order = models.ForeignKey(MiniappOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=300)
    product_image = models.URLField(max_length=500, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=14, decimal_places=0)
    total_price = models.DecimalField(max_digits=14, decimal_places=0)
    unit = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "miniapp_order_item"


class MiniappPointTransaction(models.Model):
    """Lịch sử điểm"""
    class Reason(models.TextChoices):
        EARN_ORDER = "EARN_ORDER", "Tích từ đơn hàng"
        REDEEM_ORDER = "REDEEM_ORDER", "Dùng thanh toán"
        EARN_BONUS = "EARN_BONUS", "Thưởng thêm"
        EXPIRE = "EXPIRE", "Hết hạn"

    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="point_transactions")
    order = models.ForeignKey(MiniappOrder, on_delete=models.SET_NULL, null=True, blank=True)
    points = models.IntegerField()
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "miniapp_point_transaction"


class MiniappChatThread(models.Model):
    """Chat với dược sĩ"""
    class Category(models.TextChoices):
        PRODUCT_ADVICE = "PRODUCT_ADVICE", "Tư vấn sản phẩm"
        PRESCRIPTION_ADVICE = "PRESCRIPTION_ADVICE", "Tư vấn đơn thuốc"
        COMPLAINT = "COMPLAINT", "Khiếu nại"
        ORDER_SUPPORT = "ORDER_SUPPORT", "Hỗ trợ đơn hàng"

    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="chat_threads")
    category = models.CharField(max_length=30, choices=Category.choices)
    subject = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default="OPEN")
    order = models.ForeignKey(MiniappOrder, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "miniapp_chat_thread"


class MiniappChatMessage(models.Model):
    """Tin nhắn chat"""
    class Sender(models.TextChoices):
        USER = "USER", "Khách hàng"
        PHARMACIST = "PHARMACIST", "Dược sĩ"

    thread = models.ForeignKey(MiniappChatThread, on_delete=models.CASCADE, related_name="messages")
    sender_type = models.CharField(max_length=15, choices=Sender.choices)
    message = models.TextField(blank=True)
    attachment_url = models.URLField(max_length=500, blank=True)
    attachment_type = models.CharField(max_length=50, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "miniapp_chat_message"


class MiniappNotification(models.Model):
    """Thông báo"""
    class Type(models.TextChoices):
        ORDER_STATUS = "ORDER_STATUS", "Trạng thái đơn hàng"
        PROMO = "PROMO", "Khuyến mãi"
        CHAT = "CHAT", "Chat"
        SYSTEM = "SYSTEM", "Hệ thống"

    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "miniapp_notification"


class MiniappSearchHistory(models.Model):
    """Lịch sử tìm kiếm"""
    user = models.ForeignKey(MiniAppUser, on_delete=models.CASCADE, null=True, blank=True, related_name="search_history")
    keyword = models.CharField(max_length=300)
    result_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "miniapp_search_history"
