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
        if self.action in ('list', 'retrieve'):
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

    def retrieve(self, request, *args, **kwargs):
        """Increment view count on detail view."""
        instance = self.get_object()
        # Manual increment to avoid write lock on every page load
        BlogPost.objects.filter(pk=instance.pk).update(
            view_count=models.F('view_count') + 1
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

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
