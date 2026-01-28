from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from products.models import Product, Favorite
from products.serializers.public import ProductListSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class FavoriteListView(generics.ListAPIView):
    """
    List all products favorited by the current user.
    """
    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return products that are in the user's favorites
        # We start from Product model and filter by reverse relation or subquery
        # Efficient way: Product.objects.filter(favorited_by__user=self.request.user)
        # Or based on Favorite model:
        # favorites = Favorite.objects.filter(user=self.request.user).select_related('product')
        # But our serializer expects Product instances.
        
        return Product.objects.filter(favorited_by__user=self.request.user, status='ACTIVE').order_by('-favorited_by__created_at')

class FavoriteToggleView(APIView):
    """
    Toggle favorite status for a product.
    If product is already liked, removes it.
    If product is not liked, adds it.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Toggle product favorite status",
        responses={
            200: openapi.Response("Unliked successfully (removed from favorites)", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'is_liked': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Current status (false)"),
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )),
            201: openapi.Response("Liked successfully (added to favorites)", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'is_liked': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Current status (true)"),
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )),
            404: "Product not found"
        }
    )
    def post(self, request, id):
        product = get_object_or_404(Product, id=id)
        
        favorite = Favorite.objects.filter(user=request.user, product=product).first()
        
        if favorite:
            favorite.delete()
            return Response({'is_liked': False, 'message': 'Removed from favorites'}, status=status.HTTP_200_OK)
        else:
            Favorite.objects.create(user=request.user, product=product)
            return Response({'is_liked': True, 'message': 'Added to favorites'}, status=status.HTTP_201_CREATED)
