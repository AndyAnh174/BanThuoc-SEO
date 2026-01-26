"""
Banner models for homepage dynamic banners.
"""
import uuid
from django.db import models
from django.utils import timezone


class Banner(models.Model):
    """Banner model for homepage carousel/slider"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    subtitle = models.CharField(max_length=500, blank=True, verbose_name="Phụ đề")
    
    # Image
    image_url = models.URLField(max_length=500, blank=True, verbose_name="URL hình ảnh")
    
    # Link
    link_url = models.CharField(max_length=500, blank=True, verbose_name="Link đích")
    link_text = models.CharField(max_length=100, blank=True, default="Xem ngay", verbose_name="Text nút")
    
    # Display settings
    background_color = models.CharField(max_length=50, default="#16a34a", verbose_name="Màu nền")
    text_color = models.CharField(max_length=50, default="#ffffff", verbose_name="Màu chữ")
    
    # Ordering and status
    sort_order = models.PositiveIntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Đang hiển thị")
    
    # Schedule
    start_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày bắt đầu")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày kết thúc")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sort_order', '-created_at']
        verbose_name = 'Banner'
        verbose_name_plural = 'Banners'
    
    def __str__(self):
        return self.title
    
    @property
    def is_visible(self):
        """Check if banner should be displayed based on dates and active status"""
        if not self.is_active:
            return False
        
        now = timezone.now()
        
        if self.start_date and now < self.start_date:
            return False
        
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    @classmethod
    def get_visible_banners(cls):
        """Get all currently visible banners"""
        now = timezone.now()
        return cls.objects.filter(
            is_active=True
        ).filter(
            models.Q(start_date__isnull=True) | models.Q(start_date__lte=now)
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=now)
        ).order_by('sort_order', '-created_at')
