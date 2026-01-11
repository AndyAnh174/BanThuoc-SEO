"""
URL configuration for Products app.
"""
from django.urls import path
from products.views.public import (
    # Category views (public - read only)
    CategoryListView,
    CategoryDetailView as PublicCategoryDetailView,
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
from products.views.category import (
    CategoryListCreateView,
    CategoryDetailView,
    CategoryTreeView,
    CategoryTreeView,
    CategoryMoveView,
)
from products.views.product import (
    ProductListCreateView as AdminProductListCreateView,
    ProductDetailView as AdminProductDetailView,
)
from products.views.search import (
    ElasticsearchProductSearchView,
    ElasticsearchSuggestView,
)
from products.views.flash_sale import (
    GetCurrentFlashSaleView,
    FlashSaleSessionListView,
    FlashSaleSessionDetailView,
    FlashSaleItemListView,
    FlashSaleItemDetailView,
    CheckFlashSaleForProductView,
)

app_name = 'products'

urlpatterns = [
    # ========================================
    # Categories CRUD API
    # ========================================
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/tree/', CategoryTreeView.as_view(), name='category-tree'),
    path('categories/<uuid:pk>/move/', CategoryMoveView.as_view(), name='category-move'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # ========================================
    # Manufacturers
    # ========================================
    path('manufacturers/', ManufacturerListView.as_view(), name='manufacturer-list'),
    path('manufacturers/<slug:slug>/', ManufacturerDetailView.as_view(), name='manufacturer-detail'),
    
    # ========================================
    # Products (Public)
    # ========================================
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('products/on-sale/', OnSaleProductsView.as_view(), name='product-on-sale'),
    path('products/search/', ProductSearchView.as_view(), name='product-search'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),

    # ========================================
    # Products (Admin)
    # ========================================
    path('admin/products/', AdminProductListCreateView.as_view(), name='admin-product-list-create'),
    path('admin/products/<uuid:id>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    
    # ========================================
    # Elasticsearch Search (Fuzzy)
    # ========================================
    path('search/', ElasticsearchProductSearchView.as_view(), name='es-search'),
    path('search/suggest/', ElasticsearchSuggestView.as_view(), name='es-suggest'),
    
    # ========================================
    # Flash Sale
    # ========================================
    path('flash-sale/', GetCurrentFlashSaleView.as_view(), name='flash-sale-current'),
    path('flash-sale/sessions/', FlashSaleSessionListView.as_view(), name='flash-sale-sessions'),
    path('flash-sale/sessions/<slug:slug>/', FlashSaleSessionDetailView.as_view(), name='flash-sale-session-detail'),
    path('flash-sale/items/', FlashSaleItemListView.as_view(), name='flash-sale-items'),
    path('flash-sale/items/<uuid:pk>/', FlashSaleItemDetailView.as_view(), name='flash-sale-item-detail'),
    path('flash-sale/check/', CheckFlashSaleForProductView.as_view(), name='flash-sale-check'),
]

# --- Admin ViewSets (Router) ---
from rest_framework.routers import DefaultRouter
from products.views.manufacturer import ManufacturerAdminViewSet
from products.views.flash_sale_admin import FlashSaleSessionAdminViewSet, FlashSaleItemAdminViewSet

router = DefaultRouter()
router.register(r'admin/manufacturers', ManufacturerAdminViewSet, basename='admin-manufacturers')
router.register(r'admin/flash-sales', FlashSaleSessionAdminViewSet, basename='admin-flash-sales')
router.register(r'admin/flash-sale-items', FlashSaleItemAdminViewSet, basename='admin-flash-sale-items')

urlpatterns += router.urls



