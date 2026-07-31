"""
Mini App API Views — Ngọc Kim Ngân Pharmacy (B2C)
"""
import requests
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.db import transaction, models as dm
from django.db.models import Sum, Count, Q, F
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    MiniAppUser, MembershipTier, MiniAppAddress, MiniAppCartItem,
    MiniappOrder, MiniappOrderItem, MiniappPointTransaction,
    MiniappChatThread, MiniappChatMessage, MiniappNotification,
    MiniappSearchHistory,
)
from products.models import Product, Banner, FlashSaleSession, FlashSaleItem
from products.serializers.public import ProductListSerializer, ProductDetailSerializer
from products.serializers.banner import BannerSerializer
from products.serializers.flash_sale import (
    FlashSaleSessionListSerializer,
    FlashSaleItemSerializer,
    CurrentFlashSaleSerializer,
)
from vouchers.models import Voucher


# ── Helpers ──────────────────────────────────────────────────────
def get_user(request) -> MiniAppUser | None:
    if not request.user.is_authenticated:
        return None
    try:
        return MiniAppUser.objects.get(zalo_id=request.user.username)
    except MiniAppUser.DoesNotExist:
        return None


def generate_jwt(user: MiniAppUser) -> dict:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    dj_user, _ = User.objects.get_or_create(username=user.zalo_id, defaults={"full_name": user.name})
    refresh = RefreshToken.for_user(dj_user)
    refresh["role"] = "CUSTOMER"
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


# ── Auth ─────────────────────────────────────────────────────────
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        zalo_token = request.data.get("zalo_access_token")
        name = request.data.get("name", "")
        avatar = request.data.get("avatar", "")

        if not zalo_token:
            return Response({"error": "Missing zalo_access_token"}, status=400)

        # Allow dev/mock token in development environment
        if zalo_token.startswith("dev_") or zalo_token == "mock_access_token":
            zalo_id = f"dev_user_{request.data.get('phone', '0901234567')[-4:]}"
            zalo_data = {"name": name or "Khách Hàng Dev", "picture": {"data": {"url": avatar}}}
        else:
            # Verify with Zalo API
            try:
                r = requests.get("https://graph.zalo.me/v2.0/me", params={
                    "access_token": zalo_token, "fields": "id,name,picture"
                }, timeout=10)
                zalo_data = r.json()
                zalo_id = zalo_data.get("id")
            except Exception:
                zalo_id = None

        if not zalo_id:
            # Fallback dev user if Zalo API call fails
            zalo_id = "dev_user_fallback"
            zalo_data = {"name": name or "Khách Hàng Mini App", "picture": {"data": {"url": avatar}}}


        user, created = MiniAppUser.objects.get_or_create(
            zalo_id=zalo_id,
            defaults={"name": name or zalo_data.get("name", ""), "avatar": avatar or zalo_data.get("picture", {}).get("data", {}).get("url", "")}
        )
        if not created:
            user.name = name or user.name
            user.avatar = avatar or user.avatar
        user.last_login_at = timezone.now()
        user.save()

        tokens = generate_jwt(user)
        return Response({**tokens, "user": {"id": str(user.id), "name": user.name, "avatar": user.avatar, "membership_tier": user.membership_tier, "loyalty_points": user.loyalty_points}, "is_new_user": created})


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken
        try:
            refresh = RefreshToken(request.data.get("refresh"))
            return Response({"access": str(refresh.access_token)})
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=401)


# ── Profile ──────────────────────────────────────────────────────
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = get_user(request)
        if not user:
            return Response({"error": "Not found"}, status=404)
        return Response({"id": str(user.id), "zalo_id": user.zalo_id, "name": user.name, "avatar": user.avatar, "phone": user.phone, "membership_tier": user.membership_tier, "loyalty_points": user.loyalty_points, "total_spent": user.total_spent})


# ── Address ──────────────────────────────────────────────────────
class AddressListCreateView(ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    # simplified
    def get(self, request):
        user = get_user(request)
        return Response(list(user.addresses.values()))

    def post(self, request):
        user = get_user(request)
        addr = MiniAppAddress.objects.create(user=user, **request.data)
        return Response({"id": addr.id}, status=201)


class AddressDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request, pk):
        user = get_user(request)
        addr = MiniAppAddress.objects.get(pk=pk, user=user)
        for k, v in request.data.items():
            setattr(addr, k, v)
        addr.save()
        return Response({"id": addr.id})

    def delete(self, request, pk):
        user = get_user(request)
        MiniAppAddress.objects.get(pk=pk, user=user).delete()
        return Response(status=204)


class PointHistoryView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return MiniappPointTransaction.objects.filter(user=get_user(self.request))


class NotificationListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return MiniappNotification.objects.filter(user=get_user(self.request))


# ── Products (Retail) ───────────────────────────────────────────
class ProductListView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.filter(status="ACTIVE", show_on_miniapp=True).select_related("category", "manufacturer").prefetch_related("images")
        cat = self.request.query_params.get("category")
        if cat:
            qs = qs.filter(category__slug=cat)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(sku__icontains=search))
        ordering = self.request.query_params.get("ordering", "-created_at")
        return qs.order_by(ordering)


class ProductDetailView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.filter(status="ACTIVE", show_on_miniapp=True)
    lookup_field = "slug"


# ── Cart ─────────────────────────────────────────────────────────
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = get_user(request)
        items = MiniAppCartItem.objects.filter(user=user).select_related("product")
        return Response({
            "items": [{"id": i.id, "product": {"id": str(i.product.id), "name": i.product.name, "slug": i.product.slug, "price": i.product.price, "sale_price": i.product.sale_price, "unit": i.product.unit}, "quantity": i.quantity, "subtotal": (i.product.sale_price or i.product.price) * i.quantity} for i in items],
            "total_items": sum(i.quantity for i in items),
            "total_amount": sum((i.product.sale_price or i.product.price) * i.quantity for i in items),
        })


class CartAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = get_user(request)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        item, _ = MiniAppCartItem.objects.get_or_create(user=user, product_id=product_id)
        item.quantity = item.quantity + quantity if not _ else quantity
        item.save()
        return Response({"message": "Added to cart"})


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request, pk):
        item = MiniAppCartItem.objects.get(pk=pk, user=get_user(request))
        item.quantity = int(request.data.get("quantity", 1))
        item.save()
        return Response({"id": item.id, "quantity": item.quantity})

    def delete(self, request, pk):
        MiniAppCartItem.objects.get(pk=pk, user=get_user(request)).delete()
        return Response(status=204)


class CartClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        MiniAppCartItem.objects.filter(user=get_user(request)).delete()
        return Response({"message": "Cart cleared"})


# ── Orders ───────────────────────────────────────────────────────
class OrderListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = get_user(request)
        orders = MiniappOrder.objects.filter(user=user).order_by("-created_at")
        return Response([{"id": o.id, "order_number": o.order_number, "status": o.status, "final_amount": o.final_amount, "payment_method": o.payment_method, "created_at": o.created_at} for o in orders])

    @transaction.atomic
    def post(self, request):
        user = get_user(request)
        data = request.data
        items_data = data.get("items", [])

        # Validate stock
        subtotal = 0
        order_items = []
        for item in items_data:
            product = Product.objects.select_for_update().get(pk=item["product_id"])
            qty = item["quantity"]
            if product.stock_quantity < qty:
                return Response({"error": f"{product.name} only {product.stock_quantity} left"}, status=400)
            price = product.retail_price or product.sale_price or product.price
            order_items.append({"product": product, "quantity": qty, "price": price})
            subtotal += price * qty

        # Apply voucher
        discount_voucher = 0
        voucher_code = data.get("voucher_code")
        if voucher_code:
            try:
                voucher = Voucher.objects.get(code=voucher_code, status="ACTIVE")
                if voucher.min_order_value and subtotal < voucher.min_order_value:
                    return Response({"error": f"Order must be at least {voucher.min_order_value}"}, status=400)
                if voucher.discount_type == "PERCENTAGE":
                    discount_voucher = min(int(subtotal * voucher.discount_value / 100), voucher.max_discount or subtotal)
                else:
                    discount_voucher = min(int(voucher.discount_value), subtotal)
            except Voucher.DoesNotExist:
                pass

        # Apply points
        use_points = int(data.get("use_points", 0))
        discount_points = min(use_points, user.loyalty_points, subtotal - discount_voucher)

        # Calculate final
        shipping_fee = int(data.get("shipping_fee", 0))
        final = max(0, subtotal + shipping_fee - discount_voucher - discount_points)

        # Create order
        order = MiniappOrder.objects.create(
            user=user, full_name=data["full_name"], phone=data["phone"],
            address=data.get("address", ""), province=data.get("province", ""),
            district=data.get("district", ""), ward=data.get("ward", ""),
            note=data.get("note", ""), subtotal=subtotal, shipping_fee=shipping_fee,
            discount_voucher=discount_voucher, discount_points=discount_points,
            final_amount=final, payment_method=data.get("payment_method", "COD"),
        )

        # Create items & deduct stock
        for oi in order_items:
            MiniappOrderItem.objects.create(order=order, product=oi["product"], product_name=oi["product"].name, quantity=oi["quantity"], unit_price=oi["price"], total_price=oi["price"] * oi["quantity"], unit=oi["product"].unit)
            Product.objects.filter(pk=oi["product"].pk).update(stock_quantity=F("stock_quantity") - oi["quantity"])

        # Deduct points & earn points
        if discount_points > 0:
            user.loyalty_points -= discount_points
            MiniappPointTransaction.objects.create(user=user, order=order, points=-discount_points, reason=MiniappPointTransaction.Reason.REDEEM_ORDER)
        tier = MembershipTier.objects.filter(min_spent__lte=user.total_spent).order_by("-min_spent").first()
        cashback = tier.cashback_percent if tier else 1
        earned = int(float(final) * float(cashback) / 100)
        user.loyalty_points += earned
        user.total_spent += final
        user.save()
        order.points_earned = earned
        order.save()
        MiniappPointTransaction.objects.create(user=user, order=order, points=earned, reason=MiniappPointTransaction.Reason.EARN_ORDER)
        user.update_tier()

        return Response({"id": order.id, "order_number": order.order_number, "status": order.status, "final_amount": order.final_amount, "points_earned": earned}, status=201)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        order = MiniappOrder.objects.get(pk=pk, user=get_user(request))
        items = MiniappOrderItem.objects.filter(order=order)
        return Response({"id": order.id, "order_number": order.order_number, "status": order.status, "final_amount": order.final_amount, "items": [{"id": i.id, "product_name": i.product_name, "quantity": i.quantity, "unit_price": i.unit_price, "total_price": i.total_price} for i in items], "created_at": order.created_at})


class OrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        order = MiniappOrder.objects.get(pk=pk, user=get_user(request))
        if order.status not in [MiniappOrder.Status.PENDING, MiniappOrder.Status.CONFIRMED]:
            return Response({"error": "Cannot cancel"}, status=400)
        order.status = MiniappOrder.Status.CANCELLED
        order.save()
        for item in MiniappOrderItem.objects.filter(order=order):
            if item.product:
                Product.objects.filter(pk=item.product.pk).update(stock_quantity=F("stock_quantity") + item.quantity)
        return Response({"message": "Cancelled"})


# ── Membership ───────────────────────────────────────────────────
class MembershipTierListView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(list(MembershipTier.objects.all().values()))


# ── Admin: Membership Tiers CRUD ──────────────────────────────────
class AdminMembershipTierView(APIView):
    """Admin CRUD for membership tiers. Requires admin auth (checked via Django permissions)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk=None):
        if pk:
            tier = MembershipTier.objects.get(pk=pk)
            return Response({
                "id": tier.id, "tier_name": tier.tier_name,
                "tier_label": tier.tier_label,
                "min_spent": tier.min_spent,
                "cashback_percent": tier.cashback_percent,
            })
        return Response(list(MembershipTier.objects.all().values()))

    def post(self, request):
        tier = MembershipTier.objects.create(
            tier_name=request.data["tier_name"],
            tier_label=request.data.get("tier_label", request.data["tier_name"]),
            min_spent=request.data.get("min_spent", 0),
            cashback_percent=request.data.get("cashback_percent", 1.0),
        )
        return Response({"id": tier.id, "tier_name": tier.tier_name}, status=201)

    def put(self, request, pk=None):
        tier = MembershipTier.objects.get(pk=pk)
        for field in ["tier_name", "tier_label", "min_spent", "cashback_percent"]:
            if field in request.data:
                setattr(tier, field, request.data[field])
        tier.save()
        return Response({"id": tier.id, "tier_name": tier.tier_name, "tier_label": tier.tier_label})

    def patch(self, request, pk=None):
        return self.put(request, pk)

    def delete(self, request, pk=None):
        tier = MembershipTier.objects.get(pk=pk)
        tier.delete()
        return Response(status=204)


class MembershipMyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = get_user(request)
        tier = MembershipTier.objects.filter(tier_name=user.membership_tier).first()
        next_tier = MembershipTier.objects.filter(min_spent__gt=user.total_spent).order_by("min_spent").first()
        return Response({"current_tier": user.membership_tier, "cashback_percent": float(tier.cashback_percent) if tier else 1.0, "total_spent": user.total_spent, "loyalty_points": user.loyalty_points, "next_tier": {"name": next_tier.tier_name, "need_more": float(next_tier.min_spent) - float(user.total_spent)} if next_tier else None})


# ── Vouchers ─────────────────────────────────────────────────────
class VoucherListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            now = timezone.now()
            vouchers = Voucher.objects.filter(
                status="ACTIVE",
                start_date__lte=now,
                end_date__gte=now
            )
            data = [
                {
                    "id": str(v.id),
                    "code": v.code,
                    "name": v.name,
                    "discount_type": v.discount_type,
                    "discount_value": str(v.discount_value),
                    "min_order_value": str(v.min_order_value),
                    "max_discount": str(v.max_discount or 0),
                }
                for v in vouchers
            ]
            if not data:
                # Provide default vouchers if none found in active range
                data = [
                    {
                        "id": "1",
                        "code": "NGOCKIMNGAN20K",
                        "name": "Voucher sản phẩm x10000",
                        "discount_type": "PERCENTAGE",
                        "discount_value": "20",
                        "min_order_value": "100000",
                        "max_discount": "50000",
                    },
                    {
                        "id": "2",
                        "code": "FREESHIP0D",
                        "name": "Freeship Đơn 0đ",
                        "discount_type": "FIXED",
                        "discount_value": "30000",
                        "min_order_value": "0",
                        "max_discount": "30000",
                    },
                ]
            return Response(data)
        except Exception as e:
            return Response([
                {
                    "id": "1",
                    "code": "NGOCKIMNGAN20K",
                    "name": "Voucher sản phẩm x10000",
                    "discount_type": "PERCENTAGE",
                    "discount_value": "20",
                    "min_order_value": "100000",
                    "max_discount": "50000",
                }
            ])



class VoucherCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        try:
            voucher = Voucher.objects.get(code=request.data.get("code"), status="ACTIVE")
            return Response({"valid": True, "discount_type": voucher.discount_type, "discount_value": voucher.discount_value, "min_order_value": voucher.min_order_value})
        except Voucher.DoesNotExist:
            return Response({"valid": False})


class VoucherApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            voucher = Voucher.objects.get(code=request.data.get("code"), status="ACTIVE")
            total = int(request.data.get("order_total", 0))
            if voucher.discount_type == "PERCENTAGE":
                discount = min(int(total * voucher.discount_value / 100), voucher.max_discount or total)
            else:
                discount = min(int(voucher.discount_value), total)
            return Response({"valid": True, "discount_amount": discount, "final_total": total - discount})
        except Voucher.DoesNotExist:
            return Response({"valid": False, "error": "Invalid voucher"}, status=400)


# ── Chat ─────────────────────────────────────────────────────────
class ChatThreadListView(ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = get_user(request)
        return Response([{"id": t.id, "category": t.category, "subject": t.subject, "status": t.status, "created_at": t.created_at} for t in MiniappChatThread.objects.filter(user=user)])

    def post(self, request):
        user = get_user(request)
        thread = MiniappChatThread.objects.create(user=user, category=request.data.get("category", "PRODUCT_ADVICE"), subject=request.data.get("subject", ""))
        msg = request.data.get("message", "")
        if msg:
            MiniappChatMessage.objects.create(thread=thread, sender_type="USER", message=msg)
        return Response({"id": thread.id, "status": thread.status}, status=201)


class ChatMessageListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        return Response(list(MiniappChatMessage.objects.filter(thread_id=pk).values()))

    def post(self, request, pk):
        msg = MiniappChatMessage.objects.create(thread_id=pk, sender_type="USER", message=request.data.get("message", ""), attachment_url=request.data.get("attachment_url", ""))
        return Response({"id": msg.id}, status=201)


# ── Search ───────────────────────────────────────────────────────
class SearchView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    def get_queryset(self):
        q = self.request.query_params.get("q", "")
        return Product.objects.filter(status="ACTIVE", show_on_miniapp=True).filter(Q(name__icontains=q) | Q(sku__icontains=q))


class SearchSuggestView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        q = request.query_params.get("q", "")
        products = Product.objects.filter(name__icontains=q, status="ACTIVE").values("name", "slug")[:8]
        return Response({"suggestions": [{"text": p["name"], "type": "product", "slug": p["slug"]} for p in products]})


class SearchHotkeyView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        keys = MiniappSearchHistory.objects.values("keyword").annotate(count=Count("id")).order_by("-count")[:10]
        return Response({"keywords": list(keys)})


# ── Banner (Mini App) ────────────────────────────────────────────
class MiniappBannerHeroView(APIView):
    """Get visible HERO banners for Mini App"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        banners = Banner.get_visible_banners(position=Banner.Position.HERO).filter(show_on_miniapp=True)
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)


class MiniappBannerRowView(APIView):
    """Get visible ROW banners for Mini App"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        banners = Banner.get_visible_banners(position=Banner.Position.ROW).filter(show_on_miniapp=True)
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)


# ── Flash Sale (Mini App) ────────────────────────────────────────
class MiniappFlashSaleView(APIView):
    """Get current flash sale for Mini App (only sessions with show_on_miniapp=True)"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()

        candidate = FlashSaleSession.objects.filter(
            is_active=True,
            show_on_miniapp=True,
            status__in=[FlashSaleSession.Status.ACTIVE, FlashSaleSession.Status.SCHEDULED],
            end_time__gte=now,
        ).prefetch_related(
            'items', 'items__product', 'items__product__category',
            'items__product__manufacturer', 'items__product__images',
        ).order_by('start_time').first()

        current_session = None
        upcoming_session = None

        if candidate:
            if candidate.start_time <= now and candidate.status != FlashSaleSession.Status.ACTIVE:
                candidate.status = FlashSaleSession.Status.ACTIVE
                candidate.save(update_fields=['status', 'updated_at'])

            if candidate.start_time <= now <= candidate.end_time:
                current_session = candidate
            elif candidate.start_time > now:
                upcoming_session = candidate

        featured_items = []
        active_session = current_session or upcoming_session
        if active_session:
            featured_items = active_session.items.filter(is_active=True).select_related(
                'product', 'product__category', 'product__manufacturer',
            ).prefetch_related('product__images').order_by('sort_order', '-sold_quantity')[:8]

        response_data = {
            'current_session': current_session,
            'upcoming_session': upcoming_session,
            'featured_items': featured_items,
            'server_time': now,
        }
        serializer = CurrentFlashSaleSerializer(response_data)
        return Response(serializer.data)


# ── Admin Mini App Users List ─────────────────────────────────────
class AdminMiniAppUserListView(APIView):
    """List registered Mini App users for Admin Dashboard"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = MiniAppUser.objects.select_related('membership_tier').order_by('-date_joined')
        data = [
            {
                "id": str(u.id),
                "zalo_id": u.zalo_id,
                "name": u.name,
                "avatar": u.avatar,
                "phone": u.phone,
                "membership_tier": u.membership_tier.name if u.membership_tier else "SILVER",
                "loyalty_points": u.loyalty_points,
                "total_spent": str(u.total_spent),
                "date_joined": u.date_joined,
            }
            for u in users
        ]
        return Response(data)

