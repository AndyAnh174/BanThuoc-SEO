from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinLengthValidator

class BlogPost(models.Model):
    """Blog post for content marketing and SEO."""

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        ARCHIVED = 'ARCHIVED', 'Archived'

    title = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    excerpt = models.TextField(
        max_length=500, blank=True,
        help_text="Short summary for cards and SEO meta description."
    )
    content = models.TextField(
        help_text="HTML content from Editor.js"
    )
    cover_image = models.URLField(
        max_length=500, blank=True,
        help_text="Main cover image URL (MinIO). Used for cards and OG image."
    )
    og_image = models.URLField(
        max_length=500, blank=True,
        help_text="Auto-generated OG image URL. If blank, cover_image is used."
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='blog_posts',
        limit_choices_to={'role': 'ADMIN'}
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    tags = models.JSONField(default=list, blank=True, help_text="List of tag strings for filtering")
    reading_time_minutes = models.PositiveIntegerField(
        default=1, help_text="Estimated reading time"
    )
    view_count = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=100, blank=True, help_text="Custom SEO title (max 60 chars)")
    seo_description = models.CharField(max_length=200, blank=True, help_text="Custom meta description (max 160 chars)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['slug']),
        ]
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-generate slug from title
        if not self.slug:
            self.slug = slugify(self.title)
        # Auto-set published_at when status changes to PUBLISHED
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        # Auto-estimate reading time (200 words per minute for Vietnamese)
        text_stripped = self.content.replace('<br>', ' ').replace('<p>', ' ').replace('</p>', ' ')
        word_count = len(text_stripped.split())
        self.reading_time_minutes = max(1, word_count // 200)
        super().save(*args, **kwargs)

    @property
    def og_image_url(self):
        """Return OG image URL, fallback to cover_image."""
        return self.og_image or self.cover_image

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('blog:detail', kwargs={'slug': self.slug})
