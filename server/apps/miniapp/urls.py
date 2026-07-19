"""Mini App API Routes — /api/miniapp/"""
from django.urls import path
from . import views

app_name = "miniapp"

urlpatterns = [
    # ── Auth ────────────────────────────────────────
    path("auth/login/", views.LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", views.RefreshTokenView.as_view(), name="auth-refresh"),

    # ── Profile ─────────────────────────────────────
    path("me/", views.ProfileView.as_view(), name="me"),
    path("me/addresses/", views.AddressListCreateView.as_view(), name="address-list"),
    path("me/addresses/<int:pk>/", views.AddressDetailView.as_view(), name="address-detail"),
    path("me/points/", views.PointHistoryView.as_view(), name="point-history"),
    path("me/notifications/", views.NotificationListView.as_view(), name="notification-list"),

    # ── Products ────────────────────────────────────
    path("products/", views.ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", views.ProductDetailView.as_view(), name="product-detail"),

    # ── Cart ────────────────────────────────────────
    path("cart/", views.CartView.as_view(), name="cart"),
    path("cart/add/", views.CartAddView.as_view(), name="cart-add"),
    path("cart/items/<int:pk>/", views.CartItemView.as_view(), name="cart-item"),
    path("cart/clear/", views.CartClearView.as_view(), name="cart-clear"),

    # ── Orders ──────────────────────────────────────
    path("orders/", views.OrderListCreateView.as_view(), name="order-list"),
    path("orders/<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/cancel/", views.OrderCancelView.as_view(), name="order-cancel"),

    # ── Membership ──────────────────────────────────
    path("membership/tiers/", views.MembershipTierListView.as_view(), name="tier-list"),
    path("membership/my/", views.MembershipMyView.as_view(), name="tier-my"),

    # ── Vouchers ────────────────────────────────────
    path("vouchers/available/", views.VoucherListView.as_view(), name="voucher-list"),
    path("vouchers/check/", views.VoucherCheckView.as_view(), name="voucher-check"),
    path("vouchers/apply/", views.VoucherApplyView.as_view(), name="voucher-apply"),

    # ── Chat ────────────────────────────────────────
    path("chat/threads/", views.ChatThreadListView.as_view(), name="chat-thread-list"),
    path("chat/threads/<int:pk>/messages/", views.ChatMessageListView.as_view(), name="chat-message-list"),

    # ── Search ──────────────────────────────────────
    path("search/", views.SearchView.as_view(), name="search"),
    path("search/suggest/", views.SearchSuggestView.as_view(), name="search-suggest"),
    path("search/hotkey/", views.SearchHotkeyView.as_view(), name="search-hotkey"),
]
