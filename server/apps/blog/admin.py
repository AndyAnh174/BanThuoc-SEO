from django.contrib import admin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'author', 'published_at', 'view_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'excerpt', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    date_hierarchy = 'published_at'
    ordering = ['-published_at', '-created_at']

    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'cover_image')
        }),
        ('SEO', {
            'fields': ('seo_title', 'seo_description', 'tags', 'og_image'),
            'classes': ('collapse',),
        }),
        ('Publishing', {
            'fields': ('author', 'status', 'published_at'),
        }),
        ('Stats', {
            'fields': ('view_count', 'reading_time_minutes', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
