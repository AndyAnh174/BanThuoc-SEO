from rest_framework import viewsets, permissions, filters
from products.models import Manufacturer
from products.serializers.manufacturer import ManufacturerAdminSerializer
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsSetPagination

class ManufacturerAdminViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing Manufacturers.
    Supports CRUD operations (GET, POST, PUT, DELETE).
    """
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country']
    ordering_fields = ['name', 'created_at']
