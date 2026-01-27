from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product

class CartDetailView(APIView):
    """
    GET /api/cart/
    Get current user's shopping cart.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    """
    POST /api/cart/add/
    Add product to cart.
    Body: { "product_id": 1, "quantity": 1 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Check if item exists
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 0} # Will add quantity below
        )

        # Update quantity
        if created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity += quantity
        
        cart_item.save()

        # Return updated cart
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class UpdateCartItemView(APIView):
    """
    PATCH /api/cart/items/<id>/ - Update quantity ({ "quantity": 5 })
    DELETE /api/cart/items/<id>/ - Remove item
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, request, id):
        return get_object_or_404(CartItem, id=id, cart__user=request.user)

    def patch(self, request, id):
        cart_item = self.get_object(request, id)
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        # Return updated cart
        cart = cart_item.cart
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request, id):
        cart_item = self.get_object(request, id)
        cart = cart_item.cart
        cart_item.delete()

        # Return updated cart
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class ClearCartView(APIView):
    """
    POST /api/cart/clear/
    Remove all items from cart.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
