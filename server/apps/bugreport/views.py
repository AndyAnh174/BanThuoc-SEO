import json
import threading
from django.core.mail import EmailMessage
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from users.views.admin import IsAdminUser
from files.services import MinioService


def _editorjs_to_html(data):
    """Convert EditorJS JSON to basic HTML for email."""
    blocks = data.get('blocks', [])
    if not blocks:
        return ''

    html_parts = []
    for block in blocks:
        t = block.get('type', '')
        d = block.get('data', {})

        if t == 'header':
            level = d.get('level', 2)
            text = d.get('text', '')
            html_parts.append(f'<h{level}>{text}</h{level}>')

        elif t == 'paragraph':
            text = d.get('text', '')
            html_parts.append(f'<p>{text}</p>')

        elif t == 'list':
            style = d.get('style', 'unordered')
            items = d.get('items', [])
            tag = 'ul' if style == 'unordered' else 'ol'
            items_html = ''.join(f'<li>{item}</li>' for item in items)
            html_parts.append(f'<{tag}>{items_html}</{tag}>')

        elif t == 'image':
            url = d.get('url', '') or d.get('file', {}).get('url', '')
            caption = d.get('caption', '')
            if url:
                img = f'<img src="{url}" alt="{caption}" style="max-width:600px;width:100%"/>'
                if caption:
                    img += f'<p style="font-size:12px;color:#666">{caption}</p>'
                html_parts.append(img)

        elif t == 'quote':
            text = d.get('text', '')
            caption = d.get('caption', '')
            html_parts.append(f'<blockquote style="border-left:3px solid #ccc;padding-left:12px;margin:8px 0;color:#555">{text}<br/><em>— {caption}</em></blockquote>')

        elif t == 'code':
            code = d.get('code', '')
            html_parts.append(f'<pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto"><code>{code}</code></pre>')

        elif t == 'delimiter':
            html_parts.append('<hr/>')

        elif t == 'table':
            content = d.get('content', [])
            if content:
                rows = ''.join(
                    '<tr>' + ''.join(f'<td style="border:1px solid #ddd;padding:4px 8px">{cell}</td>' for cell in row) + '</tr>'
                    for row in content
                )
                html_parts.append(f'<table style="border-collapse:collapse;width:100%">{rows}</table>')

    return ''.join(html_parts)


class UploadBugImageView(APIView):
    """Upload an image for the bug report editor (EditorJS Image Tool)."""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'success': 0, 'error': 'No file'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            minio_service = MinioService()
            url = minio_service.upload_file(file_obj, folder='bug-reports')
            return Response({
                'success': 1,
                'file': {'url': url, 'name': file_obj.name}
            })
        except Exception as e:
            return Response({'success': 0, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubmitBugReportView(APIView):
    """Submit a bug report — sends email to admin via SMTP."""
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        title = request.data.get('title', '').strip()
        description = request.data.get('description')
        page_url = request.data.get('page_url', '')

        if not title:
            return Response({'error': 'Tiêu đề không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        if not description:
            return Response({'error': 'Mô tả không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse description if it's a JSON string
        if isinstance(description, str):
            try:
                description = json.loads(description)
            except json.JSONDecodeError:
                pass

        # Build HTML email
        reporter_name = request.user.full_name or request.user.email
        body_html = _editorjs_to_html(description) if isinstance(description, dict) else f'<p>{description}</p>'

        html_message = f'''
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
            <h2 style="color:#dc2626">🐛 Báo Cáo Lỗi</h2>
            <table style="width:100%;border-collapse:collapse;margin:12px 0">
                <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;width:120px">Tiêu đề</td><td style="padding:6px 8px;border:1px solid #e5e7eb">{title}</td></tr>
                <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold">Người báo cáo</td><td style="padding:6px 8px;border:1px solid #e5e7eb">{reporter_name}</td></tr>
                <tr><td style="padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold">Trang</td><td style="padding:6px 8px;border:1px solid #e5e7eb">{page_url or 'Không rõ'}</td></tr>
            </table>
            <h3 style="margin-bottom:8px">📝 Chi tiết</h3>
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fafafa">
                {body_html}
            </div>
            <hr style="margin-top:16px;border:none;border-top:1px solid #e5e7eb"/>
            <p style="font-size:12px;color:#9ca3af">Gửi từ hệ thống BanThuoc.vn — Bug Report System</p>
        </div>
        '''

        def _send():
            try:
                email = EmailMessage(
                    subject=f'[Bug Report] {title}',
                    body=html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=['banthuocsi.vn@gmail.com'],
                )
                email.content_subtype = 'html'
                email.send(fail_silently=False)
            except Exception as e:
                print(f'❌ Bug report email failed: {e}')

        threading.Thread(target=_send).start()

        return Response({'message': 'Báo cáo lỗi đã được gửi thành công!'}, status=status.HTTP_200_OK)
