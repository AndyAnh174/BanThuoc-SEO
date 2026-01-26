from rest_framework import viewsets, permissions, filters
from products.models import Manufacturer
from products.serializers.manufacturer import ManufacturerAdminSerializer
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import StandardResultsSetPagination

from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema

@method_decorator(name='list', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
@method_decorator(name='create', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
@method_decorator(name='retrieve', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
@method_decorator(name='update', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
@method_decorator(name='partial_update', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
@method_decorator(name='destroy', decorator=swagger_auto_schema(tags=['Manufacturers (Admin)']))
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
