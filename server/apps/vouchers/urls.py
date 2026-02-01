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

urlpatterns = [
    # Core voucher actions
    path('apply/', ApplyVoucherView.as_view(), name='apply'),
    path('check/', CheckVoucherView.as_view(), name='check'),
    path('calculate/', CalculateDiscountView.as_view(), name='calculate'),
    
    # List vouchers
    path('available/', AvailableVouchersView.as_view(), name='available'),
    path('<str:code>/', VoucherDetailView.as_view(), name='detail'),
    
    # User vouchers (requires auth)
    path('my/', UserVouchersView.as_view(), name='my-vouchers'),
    path('claim/', ClaimVoucherView.as_view(), name='claim'),
]

# Admin Router
from rest_framework.routers import DefaultRouter
from vouchers.views import AdminVoucherViewSet

router = DefaultRouter()
router.register(r'manage', AdminVoucherViewSet, basename='voucher-admin')

urlpatterns += router.urls
