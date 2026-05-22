# Generated migration for BlogPost model
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=300, unique=True)),
                ('excerpt', models.TextField(blank=True, max_length=500, help_text='Short summary for cards and SEO meta description.')),
                ('content', models.TextField(help_text='HTML content from Editor.js')),
                ('cover_image', models.URLField(blank=True, max_length=500, help_text='Main cover image URL (MinIO). Used for cards and OG image.')),
                ('og_image', models.URLField(blank=True, max_length=500, help_text='Auto-generated OG image URL. If blank, cover_image is used.')),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('PUBLISHED', 'Published'), ('ARCHIVED', 'Archived')], db_index=True, default='DRAFT', max_length=20)),
                ('tags', models.JSONField(blank=True, default=list, help_text='List of tag strings for filtering')),
                ('reading_time_minutes', models.PositiveIntegerField(default=1, help_text='Estimated reading time')),
                ('view_count', models.PositiveIntegerField(default=0)),
                ('seo_title', models.CharField(blank=True, max_length=100, help_text='Custom SEO title (max 60 chars)')),
                ('seo_description', models.CharField(blank=True, max_length=200, help_text='Custom meta description (max 160 chars)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('author', models.ForeignKey(limit_choices_to={'role': 'ADMIN'}, on_delete=django.db.models.deletion.PROTECT, related_name='blog_posts', to='users.user')),
            ],
            options={
                'verbose_name': 'Blog Post',
                'verbose_name_plural': 'Blog Posts',
                'ordering': ['-published_at', '-created_at'],
                'indexes': [
                    models.Index(fields=['status', '-published_at'], name='blog_blogpo_status_5d6d72_idx'),
                    models.Index(fields=['slug'], name='blog_blogpo_slug_d1e7c1_idx'),
                ],
            },
        ),
    ]
