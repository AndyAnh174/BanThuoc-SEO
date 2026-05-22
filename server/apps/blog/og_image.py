"""
OG Image Generator for Blog Posts.
Generates a 1200x630 PNG image with blog title, excerpt, and site branding.
Uses Pillow for rendering — no external service dependency.
"""
import io
import os
from PIL import Image, ImageDraw, ImageFont
from django.conf import settings

# Consts
OG_WIDTH = 1200
OG_HEIGHT = 630
FONT_DIR = os.path.join(settings.BASE_DIR, 'fonts')
BOLD_FONT = os.path.join(FONT_DIR, 'Roboto-Bold.ttf')
REGULAR_FONT = os.path.join(FONT_DIR, 'Roboto-Regular.ttf')
BG_COLOR = (15, 23, 42)  # Slate 900
ACCENT_COLOR = (34, 197, 94)  # Green 500
TEXT_COLOR = (255, 255, 255)
MUTED_COLOR = (203, 213, 225)  # Slate 300


def _get_font(size: int, bold: bool = False):
    """Load font with fallback to default."""
    font_path = BOLD_FONT if bold else REGULAR_FONT
    try:
        return ImageFont.truetype(font_path, size)
    except (OSError, IOError):
        return ImageFont.load_default()


def _wrap_text(draw: ImageDraw.Draw, text: str, font: ImageFont.FreeTypeFont, max_width: int):
    """Wrap text to fit within max_width."""
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    return lines


def generate_og_image(title: str, excerpt: str = '', site_name: str = 'BanThuocSi') -> bytes:
    """
    Generate Open Graph image for a blog post.
    Returns PNG bytes.
    """
    img = Image.new('RGB', (OG_WIDTH, OG_HEIGHT), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Decorative top bar
    draw.rectangle([(0, 0), (OG_WIDTH, 8)], fill=ACCENT_COLOR)

    # Site branding
    try:
        brand_font = _get_font(28, bold=True)
    except Exception:
        brand_font = _get_font(24)
    draw.text((80, 60), site_name.upper(), fill=ACCENT_COLOR, font=brand_font)

    # Tagline
    try:
        tag_font = _get_font(18)
    except Exception:
        tag_font = _get_font(14)
    draw.text((80, 100), 'Kiến thức dược phẩm', fill=MUTED_COLOR, font=tag_font)

    # Title (max 3 lines, bold)
    title_font = _get_font(44, bold=True)
    title_lines = _wrap_text(draw, title, title_font, OG_WIDTH - 160)
    title_lines = title_lines[:3]  # Max 3 lines
    if len(title_lines) > 2 and len(title_lines) == 3:
        # Truncate last line with ellipsis if needed
        last_line = title_lines[2]
        while True:
            bbox = draw.textbbox((0, 0), last_line + '...', font=title_font)
            if bbox[2] - bbox[0] <= OG_WIDTH - 160:
                title_lines[2] = last_line + '...'
                break
            last_line = last_line[:-1]
            if not last_line:
                title_lines = title_lines[:2]
                break

    y = 220
    for line in title_lines:
        draw.text((80, y), line, fill=TEXT_COLOR, font=title_font)
        y += 56

    # Excerpt (max 2 lines)
    if excerpt:
        excerpt_font = _get_font(22)
        excerpt_lines = _wrap_text(draw, excerpt, excerpt_font, OG_WIDTH - 160)
        excerpt_lines = excerpt_lines[:2]
        y = max(y + 40, 430)
        for line in excerpt_lines:
            draw.text((80, y), line, fill=MUTED_COLOR, font=excerpt_font)
            y += 32

    # Bottom bar
    draw.rectangle([(0, OG_HEIGHT - 4), (OG_WIDTH, OG_HEIGHT)], fill=ACCENT_COLOR)

    # Footer URL
    try:
        footer_font = _get_font(16)
    except Exception:
        footer_font = _get_font(12)
    draw.text((80, OG_HEIGHT - 48), 'banthuocsi.vn', fill=MUTED_COLOR, font=footer_font)

    # Save to bytes
    output = io.BytesIO()
    img.save(output, format='PNG', optimize=True)
    output.seek(0)
    return output.getvalue()
