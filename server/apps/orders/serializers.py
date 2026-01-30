from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers.public import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_detail', 'quantity', 'price', 'total_price']
        read_only_fields = ['total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_input = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'full_name', 'phone_number', 'email',
            'address', 'province', 'district', 'ward',
            'status', 'payment_method', 'payment_status', 'note',
            'total_amount', 'shipping_fee', 'discount_amount', 'final_amount',
            'expected_delivery_date', 'tracking_number', 
            'created_at', 'updated_at', 'items', 'items_input'
        ]
        read_only_fields = ['user', 'status', 'payment_status', 'tracking_number', 'created_at', 'update_at', 'final_amount', 'total_amount']

    def create(self, validated_data):
        items_data = validated_data.pop('items_input')
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        # Calculate totals server-side
        total_amount = 0
        from products.models import Product
        
        # Validate items and calculate total
        validated_items = []
        for item in items_data:
            try:
                product = Product.objects.get(pk=item['product'])
            except Product.DoesNotExist:
                raise serializers.ValidationError({"items_input": f"Product {item['product']} not found"})
            
            # Use current price from DB, ignore client price for security
            price = product.sale_price if product.sale_price else product.price
            quantity = item['quantity']
            item_total = price * quantity
            total_amount += item_total
            
            validated_items.append({
                'product': product,
                'product_name': product.name,
                'quantity': quantity,
                'price': price,
                'total_price': item_total
            })

        validated_data['total_amount'] = total_amount
        validated_data['final_amount'] = total_amount # Add shipping/discount logic here if needed
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Create items
        for item in validated_items:
            OrderItem.objects.create(order=order, **item)
        
        # Calculate Loyalty Points (if not handled by model save/signal logic, but we have signal)
        return order
