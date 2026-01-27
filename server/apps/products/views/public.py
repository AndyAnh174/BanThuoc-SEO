"""
Public API views for Products app.
All views in this module are publicly accessible (no auth required).
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from products.models import Category, Manufacturer, Product
from products.serializers.public import (
    CategoryTreeSerializer,
    CategorySimpleSerializer,
    ManufacturerSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for product listings"""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


# =============================================================================
# Category Views
# =============================================================================

class CategoryListView(generics.ListAPIView):
    """
    List all active root categories with their children (tree structure).
    
    Returns hierarchical category tree for navigation menus.
    """
    permission_classes = [AllowAny]
    serializer_class = CategoryTreeSerializer

    def get_queryset(self):
        """Get only root categories that are active"""
        return Category.objects.filter(
            parent__isnull=True,
            is_active=True
        ).order_by('name')


class CategoryDetailView(generics.RetrieveAPIView):
    """
    Get category details by slug.
    
    Includes children categories and product count.
    """
    permission_classes = [AllowAny]
    serializer_class = CategoryTreeSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


# =============================================================================
# Manufacturer Views
# =============================================================================

class ManufacturerListView(generics.ListAPIView):
    """
    List all active manufacturers.
    """
    permission_classes = [AllowAny]
    serializer_class = ManufacturerSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Manufacturer.objects.filter(is_active=True).order_by('name')


class ManufacturerDetailView(generics.RetrieveAPIView):
    """
    Get manufacturer details by slug.
    """
    permission_classes = [AllowAny]
    serializer_class = ManufacturerSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Manufacturer.objects.filter(is_active=True)


# =============================================================================
# Product Views
# =============================================================================

class ProductListView(generics.ListAPIView):
    """
    List products with filtering, search, and sorting.
    
    **Filtering Options:**
    - `category`: Filter by category slug (includes all descendants)
    - `manufacturer`: Filter by manufacturer slug
    - `min_price`: Minimum price filter
    - `max_price`: Maximum price filter
    - `product_type`: Filter by product type (MEDICINE, SUPPLEMENT, etc.)
    - `requires_prescription`: Filter by prescription requirement (true/false)
    - `is_featured`: Filter featured products only (true/false)
    - `on_sale`: Filter products on sale only (true/false)
    - `search`: Search in name, SKU, and description
    
    **Sorting Options:**
    - `ordering`: Sort by field (price, -price, name, -name, created_at, -created_at)
    """
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination

    # Swagger documentation for query parameters
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_QUERY, description="Category slug", type=openapi.TYPE_STRING),
            openapi.Parameter('manufacturer', openapi.IN_QUERY, description="Manufacturer slug", type=openapi.TYPE_STRING),
            openapi.Parameter('min_price', openapi.IN_QUERY, description="Minimum price", type=openapi.TYPE_INTEGER),
            openapi.Parameter('max_price', openapi.IN_QUERY, description="Maximum price", type=openapi.TYPE_INTEGER),
            openapi.Parameter('product_type', openapi.IN_QUERY, description="Product type (MEDICINE, SUPPLEMENT, MEDICAL_DEVICE, COSMETIC, OTHER)", type=openapi.TYPE_STRING),
            openapi.Parameter('requires_prescription', openapi.IN_QUERY, description="Requires prescription", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('is_featured', openapi.IN_QUERY, description="Featured products only", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('on_sale', openapi.IN_QUERY, description="On sale products only", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('search', openapi.IN_QUERY, description="Search term", type=openapi.TYPE_STRING),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="Sort by: price, -price, name, -name, created_at, -created_at", type=openapi.TYPE_STRING),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        """
        Build queryset with filters and optimized queries.
        Uses select_related for ForeignKey and prefetch_related for reverse relations.
        """
        # Base queryset with optimized joins
        queryset = Product.objects.filter(
            status='ACTIVE'
        ).select_related(
            'category',      # ForeignKey - single JOIN
            'manufacturer',  # ForeignKey - single JOIN
        ).prefetch_related(
            'images',        # Reverse FK - separate query, cached
        )

        # Get query parameters
        params = self.request.query_params

        # Filter by category (includes descendants)
        category_slug = params.get('category')
        if category_slug:
            try:
                category = Category.objects.get(slug=category_slug, is_active=True)
                # Get all descendant categories including self
                category_ids = category.get_descendants(include_self=True).values_list('id', flat=True)
                queryset = queryset.filter(category_id__in=category_ids)
            except Category.DoesNotExist:
                pass

        # Filter by manufacturer
        manufacturer_slug = params.get('manufacturer')
        if manufacturer_slug:
            queryset = queryset.filter(manufacturer__slug=manufacturer_slug)

        # Filter by price range
        min_price = params.get('min_price')
        if min_price:
            queryset = queryset.filter(
                Q(sale_price__gte=min_price) | 
                Q(sale_price__isnull=True, price__gte=min_price)
            )

        max_price = params.get('max_price')
        if max_price:
            queryset = queryset.filter(
                Q(sale_price__lte=max_price) | 
                Q(sale_price__isnull=True, price__lte=max_price)
            )

        # Filter by product type
        product_type = params.get('product_type')
        if product_type:
            queryset = queryset.filter(product_type=product_type)

        # Filter by prescription requirement
        requires_prescription = params.get('requires_prescription')
        if requires_prescription is not None:
            is_prescription = requires_prescription.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(requires_prescription=is_prescription)

        # Filter featured products
        is_featured = params.get('is_featured')
        if is_featured is not None:
            is_feat = is_featured.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_featured=is_feat)

        # Filter products on sale
        on_sale = params.get('on_sale')
        if on_sale is not None and on_sale.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(
                sale_price__isnull=False,
                sale_price__lt=F('price')
            )

        # Search by name, SKU, description
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search)
            )

        # Ordering
        ordering = params.get('ordering', '-created_at')
        valid_orderings = ['price', '-price', 'name', '-name', 'created_at', '-created_at']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """
    Get product details by slug.
    
    Returns full product information including:
    - All images
    - Complete product details (ingredients, dosage, usage, etc.)
    - Related products from the same category
    - Manufacturer information
    """
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Optimized query with select_related and prefetch_related.
        """
        return Product.objects.filter(
            status='ACTIVE'
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        )


class FeaturedProductsView(generics.ListAPIView):
    """
    List featured products for homepage display.
    Limited to 8 products.
    """
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        return Product.objects.filter(
            status='ACTIVE',
            is_featured=True
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        ).order_by('-created_at')[:8]


class NewProductsView(generics.ListAPIView):
    """
    List newly added products (created within the last 30 days).
    Limited to 8 products for homepage display.
    """
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        from datetime import timedelta
        from django.utils import timezone
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        return Product.objects.filter(
            status='ACTIVE',
            created_at__gte=thirty_days_ago
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        ).order_by('-created_at')[:8]


class OnSaleProductsView(generics.ListAPIView):
    """
    List products currently on sale.
    """
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        from django.db.models import F
        return Product.objects.filter(
            status='ACTIVE',
            sale_price__isnull=False,
            sale_price__lt=F('price')
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        ).order_by('-created_at')


class ProductSearchView(APIView):
    """
    Quick search endpoint for autocomplete/suggestions.
    Returns max 10 results with minimal data.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('q', openapi.IN_QUERY, description="Search query (min 2 chars)", type=openapi.TYPE_STRING, required=True),
        ],
        responses={200: ProductListSerializer(many=True)}
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'results': []})

        products = Product.objects.filter(
            status='ACTIVE'
        ).filter(
            Q(name__icontains=query) |
            Q(sku__icontains=query)
        ).select_related(
            'category',
            'manufacturer',
        ).prefetch_related(
            'images',
        )[:10]

        serializer = ProductListSerializer(products, many=True)
        return Response({'results': serializer.data})
