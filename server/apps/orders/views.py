from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
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
            
            # Check permission
            if request.user.is_authenticated:
                if request.user.role != 'ADMIN' and order.user != request.user:
                    return Response({"detail": "Not found."}, status=404)
            else:
                if order.user is not None:
                    return Response({"detail": "Authentication required."}, status=401)

            template_path = 'invoice.html'
            context = {'order': order}
            
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
