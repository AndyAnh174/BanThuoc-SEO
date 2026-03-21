from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing orders.
    Users can see only their own orders.
    Admins can see all.
    """
    serializer_class = OrderSerializer
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN': # Assuming User model has role
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        Cancel an order. Only allowed when status is PENDING or CONFIRMED.
        POST /api/orders/{id}/cancel/
        """
        order = self.get_object()

        if order.status not in [Order.Status.PENDING, Order.Status.CONFIRMED]:
            return Response(
                {"error": "Chi co the huy don hang o trang thai 'Cho xu ly' hoac 'Da xac nhan'."},
                status=400
            )

        # Restore stock
        for item in order.items.all():
            if item.product:
                from products.models import Product
                from django.db.models import F
                Product.objects.filter(pk=item.product.pk).update(
                    stock_quantity=F('stock_quantity') + item.quantity
                )

        # Restore voucher usage if applicable
        if order.discount_amount > 0 and order.user:
            try:
                from vouchers.models import UserVoucher, Voucher
                user_vouchers = UserVoucher.objects.filter(
                    user=order.user,
                    order_id=order.id,
                    status=UserVoucher.Status.USED
                )
                for uv in user_vouchers:
                    uv.status = UserVoucher.Status.CLAIMED
                    uv.times_used = max(0, uv.times_used - 1)
                    uv.save()
                    # Decrement global usage count
                    Voucher.objects.filter(pk=uv.voucher.pk).update(
                        usage_count=F('usage_count') - 1
                    )
            except Exception:
                pass  # Voucher restoration is best-effort

        order.status = Order.Status.CANCELLED
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Admin-only: Update order status.
        POST /api/orders/{id}/update-status/
        Body: {"status": "CONFIRMED"}
        """
        if request.user.role != 'ADMIN':
            return Response({"error": "Permission denied."}, status=403)

        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s.value for s in Order.Status]
        if not new_status or new_status not in valid_statuses:
            return Response({"error": f"Invalid status. Valid: {valid_statuses}"}, status=400)

        order.status = new_status
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-orders')
    def my_orders(self, request):
        """
        Return orders for the current user.
        """
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

from django.http import HttpResponse
from django.template.loader import get_template
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

class OrderInvoiceView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        import traceback
        import os
        from django.conf import settings
        from playwright.sync_api import sync_playwright

        try:
            order = get_object_or_404(Order, pk=pk)
            
            if request.user.is_authenticated:
                if request.user.role != 'ADMIN' and order.user != request.user:
                    return Response({"detail": "Not found."}, status=404)
            else:
                if order.user is not None:
                    return Response({"detail": "Authentication required."}, status=401)

            # Prepare Context
            try:
                from apps.core.utils.number_reader import currency_to_vietnamese
            except ImportError:
                 # Fallback if specific path structure differs
                 from core.utils.number_reader import currency_to_vietnamese
                 
            amount_in_words = currency_to_vietnamese(order.final_amount)
            
            # Prepare Logo (Base64 Embed)
            import base64
            logo_path = os.path.join(settings.BASE_DIR, 'static', 'images', '2.png')
            logo_url = ''
            
            if os.path.exists(logo_path):
                try:
                    with open(logo_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                        logo_url = f"data:image/png;base64,{encoded_string}"
                except Exception as e:
                    print(f"Error encoding logo: {e}")
            else:
                # Fallback to placeholder if exists, or remains empty
                pass

            # Formatting helper
            def fmt(val):
                 return "{:,.0f}".format(val).replace(",", ".")

            # Prepare formatted order items to avoid messing with model/template filters
            formatted_items = []
            for item in order.items.all():
                formatted_items.append({
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'price': fmt(item.price),
                    'total_price': fmt(item.total_price)
                })

            template_path = 'invoice.html'
            context = {
                'order': order,
                'items': formatted_items, 
                'formatted_total': fmt(order.total_amount),
                'formatted_shipping': fmt(order.shipping_fee),
                'formatted_discount': fmt(order.discount_amount),
                'formatted_final': fmt(order.final_amount),
                'amount_in_words': amount_in_words,
                'logo_url': logo_url, 
            }
            
            template = get_template(template_path)
            html = template.render(context)
            
            # Preprocess HTML to use absolute file paths for static assets
            # This allows Playwright to load fonts/images from disk without a web server
            base_dir = str(settings.BASE_DIR).replace('\\', '/')
            static_root = os.path.join(base_dir, 'static').replace('\\', '/')
            
            # Replace /static/ with file:///path/to/static/
            # This handles src="/static/..."
            html = html.replace('/static/', f'file:///{static_root}/')
            
            with sync_playwright() as p:
                # Launch browser
                # Note: On some servers you might need to specify executable_path or args=['--no-sandbox']
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                # Set content and wait for network idle to ensure fonts/images load
                page.set_content(html, wait_until='networkidle')
                
                # Generate PDF
                pdf_bytes = page.pdf(
                    format="A4",
                    margin={"top": "1cm", "right": "1cm", "bottom": "1cm", "left": "1cm"},
                    print_background=True
                )
                browser.close()

            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{order.id}.pdf"'
            return response

        except Exception as e:
            traceback.print_exc()
            return HttpResponse(f"Error generating PDF: {str(e)}", status=500)
