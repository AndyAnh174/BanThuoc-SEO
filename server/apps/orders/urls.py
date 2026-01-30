from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderInvoiceView

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('orders/<int:pk>/invoice/', OrderInvoiceView.as_view(), name='order-invoice'),
] + router.urls
