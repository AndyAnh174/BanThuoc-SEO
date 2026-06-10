"""
Banner views and viewsets.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from products.models import Banner
from products.serializers.banner import BannerSerializer, BannerAdminSerializer


class BannerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Banner CRUD operations.
    - Public: GET visible banners only
    - Admin: Full CRUD
    """
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'visible', 'row', 'promo']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.request and self.request.user.is_authenticated:
            return BannerAdminSerializer
        return BannerSerializer
    
    def get_queryset(self):
        """
        Filter banners based on user type.
        - Public: Only visible banners
        - Admin: All banners
        """
        if self.request.user.is_staff:
            return Banner.objects.all()
        return Banner.get_visible_banners()
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def visible(self, request):
        """Get all currently visible HERO banners for public display"""
        banners = Banner.get_visible_banners(position=Banner.Position.HERO)
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def row(self, request):
        """Get all currently visible ROW banners for banner row display"""
        banners = Banner.get_visible_banners(position=Banner.Position.ROW)
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def promo(self, request):
        """Get all currently visible PROMO banners for inline promo grid"""
        banners = Banner.get_visible_banners(position=Banner.Position.PROMO)
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def popup(self, request):
        """Get the single active POPUP banner (returns first visible, or empty)"""
        popup = Banner.get_visible_banners(position=Banner.Position.POPUP).first()
        if popup:
            serializer = BannerSerializer(popup)
            return Response(serializer.data)
        return Response(None)

    def perform_create(self, serializer):
        """Auto-deactivate other POPUPs when creating a new active POPUP"""
        instance = serializer.save()
        if instance.display_position == Banner.Position.POPUP and instance.is_active:
            Banner.objects.filter(
                display_position=Banner.Position.POPUP,
                is_active=True,
            ).exclude(id=instance.id).update(is_active=False)

    def perform_update(self, serializer):
        """Auto-deactivate other POPUPs when activating a POPUP"""
        instance = serializer.save()
        if instance.display_position == Banner.Position.POPUP and instance.is_active:
            Banner.objects.filter(
                display_position=Banner.Position.POPUP,
                is_active=True,
            ).exclude(id=instance.id).update(is_active=False)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Reorder banners by providing list of IDs in order"""
        banner_ids = request.data.get('banner_ids', [])
        
        if not banner_ids:
            return Response(
                {'error': 'banner_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for index, banner_id in enumerate(banner_ids):
            Banner.objects.filter(id=banner_id).update(sort_order=index)
        
        return Response({'message': 'Banners reordered successfully'})
