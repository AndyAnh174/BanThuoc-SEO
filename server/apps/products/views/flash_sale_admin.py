from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsSetPagination
from products.models import FlashSaleSession, FlashSaleItem
from products.serializers.flash_sale_admin import (
    FlashSaleSessionAdminSerializer,
    FlashSaleItemAdminSerializer
)

class FlashSaleSessionAdminViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing Flash Sale Sessions.
    """
    queryset = FlashSaleSession.objects.all().order_by('-start_time')
    serializer_class = FlashSaleSessionAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['status', 'is_active']

    @action(detail=True, methods=['post'])
    def add_products(self, request, pk=None):
        """Add multiple products to session"""
        session = self.get_object()
        products_data = request.data.get('products', []) # List of {product_id, price, quantity}
        
        created_items = []
        errors = []

        for item in products_data:
            try:
                serializer = FlashSaleItemAdminSerializer(data={
                    'session': session.id,
                    **item
                })
                if serializer.is_valid():
                    serializer.save()
                    created_items.append(serializer.data)
                else:
                    errors.append({'item': item, 'errors': serializer.errors})
            except Exception as e:
                errors.append({'item': item, 'errors': str(e)})

        return Response({
            'created': created_items,
            'errors': errors
        }, status=status.HTTP_200_OK)


class FlashSaleItemAdminViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing Flash Sale Items within a session.
    """
    queryset = FlashSaleItem.objects.all()
    serializer_class = FlashSaleItemAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['session']

