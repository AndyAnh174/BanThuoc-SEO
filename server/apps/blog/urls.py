from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet
from . import og_views

router = DefaultRouter()
router.register(r'', BlogPostViewSet, basename='blogpost')

urlpatterns = [
    path('', include(router.urls)),
    path('og-image/<slug:slug>/', og_views.og_image_view, name='og-image'),
]
