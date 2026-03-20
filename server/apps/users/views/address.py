"""
User Address Views
"""
from rest_framework import serializers, permissions, status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from ..models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone', 'address', 'province', 'district', 'ward', 'is_default', 'created_at']
        read_only_fields = ['created_at']


class AddressListCreateView(ListCreateAPIView):
    """
    GET  /api/me/addresses/ - List user's addresses
    POST /api/me/addresses/ - Create new address
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is the first address, make it default
        if not Address.objects.filter(user=self.request.user).exists():
            serializer.save(user=self.request.user, is_default=True)
        else:
            serializer.save(user=self.request.user)


class AddressDetailView(APIView):
    """
    PATCH  /api/me/addresses/<int:pk>/ - Update address
    DELETE /api/me/addresses/<int:pk>/ - Delete address
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Address.objects.get(pk=pk, user=user)
        except Address.DoesNotExist:
            return None

    def patch(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({"error": "Dia chi khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({"error": "Dia chi khong ton tai."}, status=status.HTTP_404_NOT_FOUND)

        was_default = address.is_default
        address.delete()

        # If deleted address was default, set another as default
        if was_default:
            next_address = Address.objects.filter(user=request.user).first()
            if next_address:
                next_address.is_default = True
                next_address.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
