"""
URL configuration for Products app.
"""
from django.urls import path
from products.views.public import (
    # Category views
    CategoryListView,
    CategoryDetailView,
    # Manufacturer views
    ManufacturerListView,
    ManufacturerDetailView,
    # Product views
    ProductListView,
    ProductDetailView,
    FeaturedProductsView,
    OnSaleProductsView,
    ProductSearchView,
)

app_name = 'products'

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Manufacturers
    path('manufacturers/', ManufacturerListView.as_view(), name='manufacturer-list'),
    path('manufacturers/<slug:slug>/', ManufacturerDetailView.as_view(), name='manufacturer-detail'),
    
    # Products
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('products/on-sale/', OnSaleProductsView.as_view(), name='product-on-sale'),
    path('products/search/', ProductSearchView.as_view(), name='product-search'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
