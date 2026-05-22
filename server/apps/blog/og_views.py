"""
OG Image view — generates and serves OG image for blog posts.
"""
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import BlogPost
from .og_image import generate_og_image


def og_image_view(request, slug):
    """Serve auto-generated OG image for a blog post."""
    post = get_object_or_404(BlogPost, slug=slug, status=BlogPost.Status.PUBLISHED)
    image_bytes = generate_og_image(
        title=post.title,
        excerpt=post.excerpt or '',
        site_name='BanThuocSi'
    )
    response = HttpResponse(image_bytes, content_type='image/png')
    response['Cache-Control'] = 'public, max-age=86400'  # Cache 1 day
    response['Content-Disposition'] = f'inline; filename="og-{post.slug}.png"'
    return response
