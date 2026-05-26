from rest_framework import serializers
from django.utils.text import slugify
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog listing."""
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'cover_image', 'og_image_url',
            'author_name', 'status', 'tags', 'reading_time_minutes',
            'view_count', 'published_at', 'created_at',
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for blog detail page."""
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'content_json', 'cover_image',
            'og_image', 'og_image_url', 'author_name', 'status', 'tags',
            'reading_time_minutes', 'view_count',
            'seo_title', 'seo_description',
            'published_at', 'created_at', 'updated_at',
        ]


class BlogPostAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin CRUD operations."""

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'content_json', 'cover_image',
            'og_image', 'author', 'status', 'tags',
            'seo_title', 'seo_description',
            'published_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)
