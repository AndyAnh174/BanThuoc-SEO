"""
URL configuration for Vouchers app.
"""
from django.urls import path
from vouchers.views import (
    ApplyVoucherView,
    CheckVoucherView,
    AvailableVouchersView,
    VoucherDetailView,
    UserVouchersView,
    ClaimVoucherView,
    CalculateDiscountView,
)

app_name = 'vouchers'

# Admin Router — MUST come before <str:code>/ to avoid URL collision
from rest_framework.routers import DefaultRouter
from vouchers.views import AdminVoucherViewSet

router = DefaultRouter()
router.register(r'manage', AdminVoucherViewSet, basename='voucher-admin')

urlpatterns = [
    # Admin CRUD (router URLs first)
    *router.urls,

    # Core voucher actions
    path('apply/', ApplyVoucherView.as_view(), name='apply'),
    path('check/', CheckVoucherView.as_view(), name='check'),
    path('calculate/', CalculateDiscountView.as_view(), name='calculate'),

    # List vouchers
    path('available/', AvailableVouchersView.as_view(), name='available'),

    # User vouchers (requires auth)
    path('my/', UserVouchersView.as_view(), name='my-vouchers'),
    path('claim/', ClaimVoucherView.as_view(), name='claim'),

    # Detail by code — LAST to avoid catching other paths
    path('<str:code>/', VoucherDetailView.as_view(), name='detail'),
]
