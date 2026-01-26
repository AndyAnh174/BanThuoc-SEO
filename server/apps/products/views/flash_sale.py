"""
API views for Flash Sale system.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import F, Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from products.models import FlashSaleSession, FlashSaleItem
from products.serializers.flash_sale import (
    FlashSaleSessionListSerializer,
    FlashSaleSessionDetailSerializer,
    FlashSaleItemSerializer,
    CurrentFlashSaleSerializer,
)


class GetCurrentFlashSaleView(APIView):
    """
    Get the current active or upcoming flash sale.
    
    Returns:
    - current_session: Currently active flash sale (if any)
    - upcoming_session: Next scheduled flash sale (if no current)
    - featured_items: Top items from the current/upcoming session
    - server_time: Current server time for countdown sync
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Get current flash sale",
        operation_description="Returns current or upcoming flash sale with featured items",
        responses={200: CurrentFlashSaleSerializer()}
    )
    def get(self, request):
        now = timezone.now()
        
        # Get current active session
        current_session = FlashSaleSession.objects.filter(
            status=FlashSaleSession.Status.ACTIVE,
            is_active=True,
            start_time__lte=now,
            end_time__gte=now,
        ).prefetch_related(
            'items',
            'items__product',
            'items__product__category',
            'items__product__manufacturer',
            'items__product__images',
        ).first()
        
        upcoming_session = None
        
        # If no current session, get upcoming
        if not current_session:
            upcoming_session = FlashSaleSession.objects.filter(
                status=FlashSaleSession.Status.SCHEDULED,
                is_active=True,
                start_time__gt=now,
            ).prefetch_related(
                'items',
                'items__product',
                'items__product__category',
                'items__product__manufacturer',
                'items__product__images',
            ).order_by('start_time').first()
        
        # Get featured items from current or upcoming session
        featured_items = []
        active_session = current_session or upcoming_session
        
        if active_session:
            featured_items = active_session.items.filter(
                is_active=True
            ).select_related(
                'product',
                'product__category',
                'product__manufacturer',
            ).prefetch_related(
                'product__images',
            ).order_by('sort_order', '-sold_quantity')[:8]
        
        # Build response
        response_data = {
            'current_session': current_session,
            'upcoming_session': upcoming_session,
            'featured_items': featured_items,
            'server_time': now,
        }
        
        serializer = CurrentFlashSaleSerializer(response_data)
        return Response(serializer.data)


class FlashSaleSessionListView(generics.ListAPIView):
    """
    List all flash sale sessions (current, upcoming, and recent ended).
    """
    permission_classes = [AllowAny]
    serializer_class = FlashSaleSessionListSerializer

    def get_queryset(self):
        now = timezone.now()
        status_filter = self.request.query_params.get('status', None)
        
        queryset = FlashSaleSession.objects.filter(
            is_active=True
        ).annotate(total_items_count=Count('items', distinct=True)).prefetch_related('items')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        else:
            # Default: show active and upcoming, plus recently ended (last 7 days)
            from datetime import timedelta
            week_ago = now - timedelta(days=7)
            queryset = queryset.filter(
                end_time__gte=week_ago
            )
        
        return queryset.order_by('-start_time')


class FlashSaleSessionDetailView(generics.RetrieveAPIView):
    """
    Get flash sale session details by slug.
    Includes all items in the session.
    """
    permission_classes = [AllowAny]
    serializer_class = FlashSaleSessionDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return FlashSaleSession.objects.filter(
            is_active=True
        ).prefetch_related(
            'items',
            'items__product',
            'items__product__category',
            'items__product__manufacturer',
            'items__product__images',
        )


class FlashSaleItemListView(generics.ListAPIView):
    """
    List all items in a specific flash sale session.
    Supports filtering by availability.
    """
    permission_classes = [AllowAny]
    serializer_class = FlashSaleItemSerializer

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('session', openapi.IN_QUERY, description="Session slug", type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('available_only', openapi.IN_QUERY, description="Show only available items", type=openapi.TYPE_BOOLEAN),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        session_slug = self.request.query_params.get('session')
        available_only = self.request.query_params.get('available_only', '').lower() in ('true', '1')
        
        if not session_slug:
            return FlashSaleItem.objects.none()
        
        queryset = FlashSaleItem.objects.filter(
            session__slug=session_slug,
            session__is_active=True,
            is_active=True,
        ).select_related(
            'product',
            'product__category',
            'product__manufacturer',
            'session',
        ).prefetch_related(
            'product__images',
        ).order_by('sort_order', '-sold_quantity')
        
        if available_only:
            queryset = queryset.filter(remaining_quantity__gt=0)
        
        return queryset


class FlashSaleItemDetailView(generics.RetrieveAPIView):
    """
    Get a specific flash sale item by ID.
    """
    permission_classes = [AllowAny]
    serializer_class = FlashSaleItemSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return FlashSaleItem.objects.filter(
            is_active=True,
            session__is_active=True,
        ).select_related(
            'product',
            'product__category',
            'product__manufacturer',
            'session',
        ).prefetch_related(
            'product__images',
        )


class CheckFlashSaleForProductView(APIView):
    """
    Check if a product has an active flash sale.
    Used by product detail page to show flash sale price.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('product_id', openapi.IN_QUERY, description="Product ID (UUID)", type=openapi.TYPE_STRING, required=True),
        ],
        responses={
            200: openapi.Response(
                description="Flash sale info if available",
                examples={
                    "application/json": {
                        "has_flash_sale": True,
                        "flash_sale_item": {
                            "id": "...",
                            "flash_sale_price": 50000,
                            "original_price": 100000,
                            "discount_percentage": 50,
                            "remaining_quantity": 10,
                            "session_end_time": "2024-01-15T23:59:59Z"
                        }
                    }
                }
            )
        }
    )
    def get(self, request):
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        now = timezone.now()
        
        # Find active flash sale item for this product
        flash_sale_item = FlashSaleItem.objects.filter(
            product_id=product_id,
            is_active=True,
            remaining_quantity__gt=0,
            session__status=FlashSaleSession.Status.ACTIVE,
            session__is_active=True,
            session__start_time__lte=now,
            session__end_time__gte=now,
        ).select_related('session').first()
        
        if flash_sale_item:
            return Response({
                'has_flash_sale': True,
                'flash_sale_item': {
                    'id': str(flash_sale_item.id),
                    'flash_sale_price': float(flash_sale_item.flash_sale_price),
                    'original_price': float(flash_sale_item.original_price),
                    'discount_percentage': flash_sale_item.discount_percentage,
                    'remaining_quantity': flash_sale_item.remaining_quantity,
                    'max_per_user': flash_sale_item.max_per_user,
                    'sold_percentage': flash_sale_item.sold_percentage,
                    'session_name': flash_sale_item.session.name,
                    'session_end_time': flash_sale_item.session.end_time.isoformat(),
                    'time_remaining': flash_sale_item.session.time_remaining,
                }
            })
        
        return Response({
            'has_flash_sale': False,
            'flash_sale_item': None
        })
