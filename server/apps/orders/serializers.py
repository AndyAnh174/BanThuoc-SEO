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
    voucher_code = serializers.CharField(required=False, write_only=True, allow_blank=True)

    receiver_name = serializers.CharField(source='full_name', read_only=True)
    receiver_phone = serializers.CharField(source='phone_number', read_only=True)
    shipping_address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'full_name', 'phone_number', 'email',
            'address', 'province', 'district', 'ward',
            'receiver_name', 'receiver_phone', 'shipping_address',
            'status', 'payment_method', 'payment_status', 'note',
            'total_amount', 'shipping_fee', 'discount_amount', 'final_amount',
            'expected_delivery_date', 'tracking_number', 
            'created_at', 'updated_at', 'items', 'items_input', 'voucher_code'
        ]
        read_only_fields = ['user', 'status', 'payment_status', 'tracking_number', 'created_at', 'update_at', 'final_amount', 'total_amount']

    def get_shipping_address(self, obj):
        parts = [obj.address, obj.ward, obj.district, obj.province]
        return ", ".join([p for p in parts if p])

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
        
        # Voucher Logic
        voucher_code = validated_data.pop('voucher_code', None)
        discount_amount = 0
        voucher = None
        
        if voucher_code:
            from vouchers.services import VoucherValidator
            
            # Extract category/product IDs for validation
            category_ids = []
            product_ids = []
            for item in validated_items:
                product_ids.append(item['product'].id)
                if item['product'].category:
                    category_ids.append(item['product'].category.id)
            
            # Check if first order
            is_first_order = False
            if request and request.user.is_authenticated:
                is_first_order = not Order.objects.filter(user=request.user).exists()
                
            validator = VoucherValidator(code=voucher_code, user=request.user if request and request.user.is_authenticated else None)
            result = validator.validate(
                order_total=total_amount,
                category_ids=category_ids,
                product_ids=product_ids,
                is_first_order=is_first_order
            )
            
            if result['valid']:
                discount_amount = result['discount_amount']
                voucher = result.get('voucher') # Not serializable if passed directly, validator returns dict or obj? 
                # Validator returns dict, we need object for relationship
                from vouchers.models import Voucher
                try:
                    voucher = Voucher.objects.get(code=voucher_code)
                except Voucher.DoesNotExist:
                    pass
            else:
                # Decide if we raise error or just ignore invalid voucher
                # For better UX, raising error is preferred if user explicitly sent a code
                raise serializers.ValidationError({"voucher_code": result.get('error_message', "Invalid voucher")})

        validated_data['discount_amount'] = discount_amount
        validated_data['final_amount'] = max(0, total_amount + validated_data.get('shipping_fee', 0) - discount_amount)
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Create items
        for item in validated_items:
            OrderItem.objects.create(order=order, **item)
            
        # Record Voucher Usage
        if voucher and discount_amount > 0 and request and request.user.is_authenticated:
            from vouchers.models import UserVoucher
            
            # Check if user already claimed/saved, otherwise create new
            user_voucher = UserVoucher.objects.filter(user=request.user, voucher=voucher).first()
            if not user_voucher:
                user_voucher = UserVoucher.objects.create(
                    user=request.user,
                    voucher=voucher,
                    status=UserVoucher.Status.CLAIMED
                )
            
            # Mark as used
            user_voucher.use(discount_amount=discount_amount, order_id=order.id)
        
        # Calculate Loyalty Points (if not handled by model save/signal logic, but we have signal)
        return order
