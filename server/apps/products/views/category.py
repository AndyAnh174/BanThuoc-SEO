"""
Category views for CRUD API.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from products.models import Category
from products.serializers.category import (
    CategoryListSerializer,
    CategoryDetailSerializer,
    CategoryCreateSerializer,
    CategoryUpdateSerializer,
    CategoryTreeSerializer,
)
from core.pagination import StandardResultsSetPagination


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET: List all categories with filtering and pagination
    POST: Create a new category (Admin only)
    """
    queryset = Category.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['parent', 'is_active', 'level']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'level']
    ordering = ['tree_id', 'lft']  # MPTT ordering
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateSerializer
        return CategoryListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Category.objects.all()
        
        # Check is_active param
        is_active_param = self.request.query_params.get('is_active', None)
        
        # If explicit is_active param provided, use it
        if is_active_param is not None:
            if is_active_param.lower() in ['true', '1']:
                qs = qs.filter(is_active=True)
            elif is_active_param.lower() in ['false', '0']:
                qs = qs.filter(is_active=False)
        # Otherwise, for non-staff users filter to active only
        elif not self.request.user.is_authenticated or not self.request.user.is_staff:
            qs = qs.filter(is_active=True)
        
        # Filter root only
        root_only = self.request.query_params.get('root_only', None)
        if root_only in ['true', '1', 'True']:
            qs = qs.filter(parent__isnull=True)
        
        return qs.select_related('parent')

    @swagger_auto_schema(
        operation_summary="List categories",
        operation_description="Get paginated list of categories with filtering",
        manual_parameters=[
            openapi.Parameter(
                'root_only', openapi.IN_QUERY,
                description="Only return root categories",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'is_active', openapi.IN_QUERY,
                description="Filter by active status",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'parent', openapi.IN_QUERY,
                description="Filter by parent ID",
                type=openapi.TYPE_STRING,
                format='uuid'
            ),
        ],
        tags=['Categories']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create category",
        operation_description="Create a new category (Admin only)",
        tags=['Categories']
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get category detail
    PUT/PATCH: Update category (Admin only)
    DELETE: Delete category (Admin only)
    """
    queryset = Category.objects.all()
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CategoryUpdateSerializer
        return CategoryDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Category.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(is_active=True)
        return qs.select_related('parent').prefetch_related('children')

    @swagger_auto_schema(
        operation_summary="Get category detail",
        operation_description="Get detailed information about a category",
        tags=['Categories']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update category",
        operation_description="Update category information (Admin only)",
        tags=['Categories']
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Partial update category",
        operation_description="Partially update category (Admin only)",
        tags=['Categories']
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete category",
        operation_description="Delete a category. Cannot delete if has products. (Admin only)",
        tags=['Categories']
    )
    def delete(self, request, *args, **kwargs):
        category = self.get_object()
        
        # Check if category has products
        from products.models import Product
        product_count = Product.objects.filter(category=category).count()
        if product_count > 0:
            return Response(
                {"error": f"Cannot delete category with {product_count} products. Move or delete products first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if category has children
        if category.get_children().exists():
            return Response(
                {"error": "Cannot delete category with subcategories. Delete subcategories first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().delete(request, *args, **kwargs)


class CategoryTreeView(APIView):
    """
    GET: Get full category tree structure
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get category tree",
        operation_description="Get full hierarchical category tree",
        manual_parameters=[
            openapi.Parameter(
                'active_only', openapi.IN_QUERY,
                description="Only include active categories",
                type=openapi.TYPE_BOOLEAN,
                default=True
            ),
        ],
        tags=['Categories']
    )
    def get(self, request):
        active_only = request.query_params.get('active_only', 'true').lower() in ['true', '1']
        
        # Get root categories
        root_categories = Category.objects.filter(parent__isnull=True)
        if active_only:
            root_categories = root_categories.filter(is_active=True)
        
        root_categories = root_categories.order_by('tree_id', 'lft')
        
        serializer = CategoryTreeSerializer(
            root_categories, 
            many=True,
            context={'active_only': active_only}
        )
        
        return Response({
            'count': root_categories.count(),
            'results': serializer.data
        })


class CategoryByIdView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE by UUID instead of slug
    """
    queryset = Category.objects.all()
    lookup_field = 'pk'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CategoryUpdateSerializer
        return CategoryDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Category.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(is_active=True)
        return qs.select_related('parent')

    def delete(self, request, *args, **kwargs):
        category = self.get_object()
        
        from products.models import Product
        product_count = Product.objects.filter(category=category).count()
        if product_count > 0:
            return Response(
                {"error": f"Cannot delete category with {product_count} products."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if category.get_children().exists():
            return Response(
                {"error": "Cannot delete category with subcategories."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().delete(request, *args, **kwargs)


class CategoryMoveView(APIView):
    """
    POST: Move category to a new parent
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Move category",
        operation_description="Move a category to a new parent (Admin only)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'new_parent_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format='uuid',
                    description='New parent category ID (null for root)'
                )
            }
        ),
        tags=['Categories']
    )
    def post(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_parent_id = request.data.get('new_parent_id')
        
        if new_parent_id:
            try:
                new_parent = Category.objects.get(pk=new_parent_id)
                
                # Validate not moving to self or descendant
                if new_parent.pk == category.pk:
                    return Response(
                        {"error": "Cannot move category to itself"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if new_parent in category.get_descendants():
                    return Response(
                        {"error": "Cannot move category to its own descendant"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                category.parent = new_parent
            except Category.DoesNotExist:
                return Response(
                    {"error": "New parent category not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            category.parent = None
        
        category.save()
        
        return Response({
            "message": "Category moved successfully",
            "category": CategoryDetailSerializer(category).data
        })
