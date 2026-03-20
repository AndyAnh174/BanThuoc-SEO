from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderInvoiceView
from .views_dashboard import AdminDashboardStatsView, AdminRevenueChartView
from .views_return import (
    CreateReturnRequestView, MyReturnRequestsView,
    AdminReturnRequestListView, AdminReturnRequestActionView,
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('orders/<int:pk>/invoice/', OrderInvoiceView.as_view(), name='order-invoice'),
    path('orders/<int:order_id>/return/', CreateReturnRequestView.as_view(), name='create-return'),
    path('returns/my/', MyReturnRequestsView.as_view(), name='my-returns'),
    path('admin/returns/', AdminReturnRequestListView.as_view(), name='admin-returns'),
    path('admin/returns/<uuid:return_id>/action/', AdminReturnRequestActionView.as_view(), name='admin-return-action'),
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/dashboard/revenue-chart/', AdminRevenueChartView.as_view(), name='admin-revenue-chart'),
] + router.urls
