from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from products.models import Product
from products.serializers.product import ProductAdminSerializer, ProductAdminListSerializer
from core.pagination import StandardResultsSetPagination

class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET: List all products (Admin)
    POST: Create new product (Admin)
    """
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all().order_by('-created_at')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['category', 'manufacturer', 'status', 'is_featured', 'requires_prescription']
    search_fields = ['name', 'sku']
    ordering_fields = ['created_at', 'price', 'stock_quantity', 'name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductAdminSerializer
        return ProductAdminListSerializer

    @swagger_auto_schema(
        operation_summary="List products (Admin)",
        tags=['Products (Admin)']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create product (Admin)",
        tags=['Products (Admin)']
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Product detail
    PUT/PATCH: Update product
    DELETE: Delete product
    """
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    lookup_field = 'id'  # Use UUID

    @swagger_auto_schema(
        operation_summary="Get product detail (Admin)",
        tags=['Products (Admin)']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update product (Admin)",
        tags=['Products (Admin)']
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Partial update product (Admin)",
        tags=['Products (Admin)']
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete product (Admin)",
        tags=['Products (Admin)']
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
