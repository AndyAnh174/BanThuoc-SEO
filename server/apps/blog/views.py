from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from django.db import models

from .models import BlogPost
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostAdminSerializer,
)


class BlogPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    Blog posts API.
    - Public: list published blogs, detail by slug
    - Admin: full CRUD
    """
    queryset = BlogPost.objects.select_related('author')
    pagination_class = BlogPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'tags']
    ordering_fields = ['published_at', 'created_at', 'view_count', 'reading_time_minutes']
    ordering = ['-published_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return BlogPostAdminSerializer
        return BlogPostDetailSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'record_view'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Admin can see all posts if authenticated as admin
        user = self.request.user
        if user.is_authenticated and user.role == 'ADMIN':
            return qs
        # Public endpoints: only published
        if self.action in ('list', 'retrieve'):
            return qs.filter(status=BlogPost.Status.PUBLISHED)
        return qs

    @action(detail=True, methods=['post'], url_path='view', permission_classes=[AllowAny])
    def record_view(self, request, slug=None):
        """Record a page view from a real browser visit (client-side POST only).
        Deduplicates by client IP within 30-minute window using Redis cache."""
        from django.core.cache import cache
        from audit.middleware import get_client_ip

        instance = self.get_object()
        client_ip = get_client_ip(request)

        if not client_ip:
            BlogPost.objects.filter(pk=instance.pk).update(
                view_count=models.F('view_count') + 1
            )
            instance.refresh_from_db()
            return Response({'view_count': instance.view_count, 'deduplicated': False})

        cache_key = f'blog_view:{client_ip}:{instance.pk}'
        if cache.get(cache_key):
            return Response({'view_count': instance.view_count, 'deduplicated': True})

        cache.set(cache_key, '1', timeout=1800)
        BlogPost.objects.filter(pk=instance.pk).update(
            view_count=models.F('view_count') + 1
        )
        instance.refresh_from_db()
        return Response({'view_count': instance.view_count, 'deduplicated': False})

    @action(detail=False, methods=['get'], url_path='tags')
    def tags(self, request):
        """Return all unique tags across published posts."""
        posts = BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED)
        all_tags = set()
        for post in posts:
            all_tags.update(post.tags)
        return Response(sorted(all_tags))

    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        """Get 5 latest published posts for sidebar/widget."""
        posts = self.get_queryset()[:5]
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)
