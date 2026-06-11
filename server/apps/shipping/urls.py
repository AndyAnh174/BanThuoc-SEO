"""
Shipping app URLs
"""
from django.urls import path
from . import views

app_name = 'shipping'

urlpatterns = [
    # Address APIs (public)
    path('provinces/', views.GHNProvinceListView.as_view(), name='ghn-provinces'),
    path('districts/', views.GHNDistrictListView.as_view(), name='ghn-districts'),
    path('wards/', views.GHNWardListView.as_view(), name='ghn-wards'),

    # Fee calculation (public)
    path('calculate-fee/', views.GHNCalculateFeeView.as_view(), name='ghn-calc-fee'),

    # Admin actions
    path('orders/<int:order_id>/create-shipment/', views.GHNCreateShipmentView.as_view(), name='ghn-create-shipment'),
    path('orders/<int:order_id>/print-token/', views.GHNPrintTokenView.as_view(), name='ghn-print-token'),

    # Webhook (public — called by GHN)
    path('webhook/', views.GHNWebhookView.as_view(), name='ghn-webhook'),

    # ---- ViettelPost ----
    path('vtp/provinces/', views.VTPProvinceListView.as_view(), name='vtp-provinces'),
    path('vtp/wards/', views.VTPWardListView.as_view(), name='vtp-wards'),
    path('vtp/calculate-fee/', views.VTPCalculateFeeView.as_view(), name='vtp-calc-fee'),
    path('vtp/orders/<int:order_id>/create/', views.VTPCreateShipmentView.as_view(), name='vtp-create'),
]
