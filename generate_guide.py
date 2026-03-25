#!/usr/bin/env python3
"""
Xuất hướng dẫn sử dụng hệ thống BanThuocSi thành PDF — phiên bản chuyên nghiệp
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import os

# ── Font ─────────────────────────────────────────────────────────────────────
FONT_DIR = '/usr/share/fonts/truetype/dejavu'
pdfmetrics.registerFont(TTFont('DV',   os.path.join(FONT_DIR, 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DV-B', os.path.join(FONT_DIR, 'DejaVuSans-Bold.ttf')))

# ── Bảng màu ─────────────────────────────────────────────────────────────────
C = {
    'green':        HexColor('#16a34a'),
    'green_d':      HexColor('#14532d'),
    'green_l':      HexColor('#dcfce7'),
    'green_ll':     HexColor('#f0fdf4'),
    'gray_900':     HexColor('#111827'),
    'gray_700':     HexColor('#374151'),
    'gray_500':     HexColor('#6b7280'),
    'gray_200':     HexColor('#e5e7eb'),
    'gray_50':      HexColor('#f9fafb'),
    'red':          HexColor('#dc2626'),
    'red_l':        HexColor('#fef2f2'),
    'amber':        HexColor('#d97706'),
    'amber_l':      HexColor('#fffbeb'),
    'blue':         HexColor('#1d4ed8'),
    'blue_l':       HexColor('#eff6ff'),
    'white':        white,
    'accent':       HexColor('#059669'),   # emerald
    'cover_bg':     HexColor('#0f4c27'),
    'cover_stripe': HexColor('#166534'),
}

OUTPUT = '/root/BanThuoc-SEO/HUONG_DAN_SU_DUNG_BANTHUOCSI.pdf'
W_PAGE = 17 * cm   # chiều rộng nội dung

# ── Styles ────────────────────────────────────────────────────────────────────
def s(name, font='DV', size=10, color=None, align=TA_LEFT,
      before=0, after=4, leading=None, indent=0, bold=False):
    fn = 'DV-B' if bold else font
    kw = dict(fontName=fn, fontSize=size, textColor=color or C['gray_700'],
               alignment=align, spaceBefore=before, spaceAfter=after,
               leftIndent=indent)
    if leading:
        kw['leading'] = leading
    return ParagraphStyle(name, **kw)

ST = {
    # Cover
    'cov_brand':  s('cb',  'DV-B', 38, C['white'],      TA_CENTER, after=6),
    'cov_tag':    s('ct',  'DV',   14, HexColor('#86efac'), TA_CENTER, after=3),
    'cov_sub':    s('cs',  'DV',   11, HexColor('#bbf7d0'), TA_CENTER, after=2),
    'cov_ver':    s('cv',  'DV',    9, HexColor('#4ade80'), TA_CENTER, after=0),

    # Chapter header
    'ch_num':     s('cn',  'DV-B', 11, C['green'],       TA_LEFT,  before=0, after=2),
    'ch_title':   s('chT', 'DV-B', 18, C['white'],       TA_LEFT,  before=0, after=0),

    # Section
    'h2':         s('h2',  'DV-B', 12, C['green_d'],     TA_LEFT,  before=16, after=5),
    'h3':         s('h3',  'DV-B', 10, C['gray_900'],    TA_LEFT,  before=10, after=4),
    'h3_green':   s('h3g', 'DV-B', 10, C['green'],       TA_LEFT,  before=10, after=4),

    # Body
    'body':       s('bd',  'DV',   9.5, C['gray_700'],   TA_LEFT,  after=5,   leading=16),
    'body_j':     s('bdj', 'DV',   9.5, C['gray_700'],   TA_JUSTIFY, after=5, leading=16),
    'small':      s('sm',  'DV',   8.5, C['gray_500'],   TA_LEFT,  after=3,   leading=13),

    # Note boxes
    'note_t':     s('nt',  'DV',   9,   HexColor('#92400e'), after=4, leading=14),
    'tip_t':      s('tt',  'DV',   9,   C['green_d'],        after=4, leading=14),
    'warn_t':     s('wt',  'DV',   9,   HexColor('#991b1b'),  after=4, leading=14),
    'info_t':     s('it',  'DV',   9,   C['blue'],            after=4, leading=14),

    # Step
    'step_n':     s('sn',  'DV-B', 9,   C['white'],      TA_CENTER),
    'step_title': s('stT', 'DV-B', 10,  C['gray_900'],   after=2),
    'step_body':  s('stB', 'DV',   9.5, C['gray_700'],   after=3, leading=15),

    # Table
    'th':         s('th',  'DV-B', 9,   C['white'],      after=0),
    'th_c':       s('thc', 'DV-B', 9,   C['white'],      TA_CENTER, after=0),
    'td':         s('td',  'DV',   9,   C['gray_700'],   after=0, leading=14),
    'td_b':       s('tdb', 'DV-B', 9,   C['gray_900'],   after=0),
    'td_c':       s('tdc', 'DV',   9,   C['gray_700'],   TA_CENTER, after=0),
    'td_red':     s('tdr', 'DV-B', 9,   C['red'],        TA_CENTER, after=0),
    'td_gray':    s('tdg', 'DV',   9,   C['gray_500'],   TA_CENTER, after=0),
    'td_green':   s('tdGr','DV-B', 9,   C['green'],      TA_CENTER, after=0),

    # TOC
    'toc_ch':     s('tcH', 'DV-B', 10.5, C['green_d'],  before=8,  after=2),
    'toc_sub':    s('tcS', 'DV',    9.5, C['gray_700'],  after=2,   indent=16),
    'toc_pg':     s('tcP', 'DV',    9.5, C['gray_500'],  TA_RIGHT,  after=2),

    # Footer
    'footer':     s('ft',  'DV',   7.5, C['gray_500'],   TA_CENTER),
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def sp(h=6):
    return Spacer(1, h)

def hr(color=None, thickness=0.5):
    return HRFlowable(width=W_PAGE, thickness=thickness,
                      color=color or C['gray_200'], spaceAfter=6, spaceBefore=0)

def chapter_header(number, title):
    """Banner đầu chương với số và tiêu đề"""
    inner = [
        [Paragraph(f'CHƯƠNG {number}', ST['ch_num']),
         Paragraph(title, ST['ch_title'])],
    ]
    tbl = Table(inner, colWidths=[2.5*cm, 14.5*cm])
    tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), C['green']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
        ('LINEBELOW',     (0,0), (-1,-1), 3, C['accent']),
    ]))
    return [sp(14), tbl, sp(10)]

def section_title(text, icon=''):
    label = f'{icon}  {text}' if icon else text
    return [Paragraph(label, ST['h2']), hr()]

def note_box(text, kind='note'):
    labels = {'note': 'LƯU Ý', 'tip': 'MẸO', 'warn': 'CẢNH BÁO', 'info': 'THÔNG TIN'}
    bg     = {'note': C['amber_l'], 'tip': C['green_ll'], 'warn': C['red_l'], 'info': C['blue_l']}
    border = {'note': C['amber'],   'tip': C['green'],    'warn': C['red'],   'info': C['blue']}
    st_map = {'note': ST['note_t'], 'tip': ST['tip_t'],   'warn': ST['warn_t'], 'info': ST['info_t']}
    label_color = {'note': C['amber'], 'tip': C['green'], 'warn': C['red'], 'info': C['blue']}

    inner = Table([
        [Paragraph(labels[kind], ParagraphStyle(f'nl_{kind}', fontName='DV-B', fontSize=8,
                    textColor=label_color[kind]))],
        [Paragraph(text, st_map[kind])],
    ], colWidths=[W_PAGE - 0.6*cm])
    inner.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), bg[kind]),
        ('LINEBEFORE',    (0,0), (0,-1),  4, border[kind]),
        ('TOPPADDING',    (0,0), (-1,0),  8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ('RIGHTPADDING',  (0,0), (-1,-1), 10),
        ('TOPPADDING',    (0,1), (-1,-1), 3),
    ]))
    return [inner, sp(7)]

def step_block(steps):
    """steps: list of (title, description)"""
    rows = []
    for i, (title, desc) in enumerate(steps):
        num_cell = Table([[Paragraph(str(i+1), ST['step_n'])]],
                         colWidths=[0.7*cm], rowHeights=[0.7*cm])
        num_cell.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C['green']),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (-1,-1), 0),
        ]))
        content = [Paragraph(f'<b>{title}</b>', ST['step_title'])]
        if desc:
            content.append(Paragraph(desc, ST['step_body']))
        content_tbl = Table([[p] for p in content], colWidths=[15.5*cm])
        content_tbl.setStyle(TableStyle([
            ('TOPPADDING',    (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (-1,-1), 0),
        ]))

        row_data = [[num_cell, content_tbl]]
        row_tbl = Table(row_data, colWidths=[1.0*cm, 15.5*cm])
        row_tbl.setStyle(TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING',   (0,0), (-1,-1), 0),
            ('RIGHTPADDING',  (0,0), (-1,-1), 0),
        ]))
        rows.append(row_tbl)

        if i < len(steps) - 1:
            connector = Table([['']], colWidths=[0.7*cm], rowHeights=[0.4*cm])
            connector.setStyle(TableStyle([
                ('LINEBEFORE', (0,0), (0,-1), 2, C['green_l']),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
            ]))
            rows.append(connector)

    wrapper = Table([[r] for r in rows], colWidths=[W_PAGE])
    wrapper.setStyle(TableStyle([
        ('TOPPADDING',    (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING',   (0,0), (-1,-1), 0),
        ('RIGHTPADDING',  (0,0), (-1,-1), 0),
    ]))
    return [wrapper, sp(6)]

def field_table(fields, col_widths=None):
    """fields: list of (tên, bắt_buộc: bool, mô_tả)"""
    cw = col_widths or [4.5*cm, 2.2*cm, 10.3*cm]
    header = [
        Paragraph('Trường thông tin', ST['th']),
        Paragraph('Bắt buộc', ST['th_c']),
        Paragraph('Mô tả & Ví dụ', ST['th']),
    ]
    rows = [header]
    for i, (name, req, desc) in enumerate(fields):
        req_p = (Paragraph('BẮT BUỘC', ST['td_red']) if req
                 else Paragraph('Tùy chọn', ST['td_gray']))
        rows.append([
            Paragraph(name, ST['td_b']),
            req_p,
            Paragraph(desc, ST['td']),
        ])
    tbl = Table(rows, colWidths=cw)
    row_bgs = [C['white'] if i % 2 == 0 else C['gray_50'] for i in range(len(rows) - 1)]
    tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    return [tbl, sp(10)]

def status_badge(text, color):
    """Ô màu hiển thị trạng thái"""
    p = Paragraph(text, ParagraphStyle('sb', fontName='DV-B', fontSize=8,
                  textColor=white, alignment=TA_CENTER))
    t = Table([[p]], colWidths=[3*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), color),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 6),
        ('RIGHTPADDING',  (0,0), (-1,-1), 6),
    ]))
    return t

def two_col(left_items, right_items, ratio=(8.5, 8.5)):
    """Bố cục 2 cột"""
    rows = [[left_items, right_items]]
    tbl = Table(rows, colWidths=[ratio[0]*cm, ratio[1]*cm])
    tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return [tbl]

# ═══════════════════════════════════════════════════════════════════════════════
# TRANG BÌA
# ═══════════════════════════════════════════════════════════════════════════════

def cover_page():
    """Trang bìa — dùng canvas thay vì flowable để tránh lỗi kích thước"""
    # Trả về PageBreak trống; nội dung bìa vẽ qua onFirstPage callback riêng
    return [PageBreak()]


def draw_cover(canvas, doc):
    """Vẽ trang bìa bằng canvas trực tiếp"""
    canvas.saveState()
    w, h = A4

    # Nền xanh đậm
    canvas.setFillColor(C['cover_bg'])
    canvas.rect(0, 0, w, h, fill=1, stroke=0)

    # Stripe dưới cùng
    canvas.setFillColor(C['accent'])
    canvas.rect(0, 0, w, 0.8*cm, fill=1, stroke=0)

    # Stripe trên cùng
    canvas.rect(0, h - 0.8*cm, w, 0.8*cm, fill=1, stroke=0)

    # Đường kẻ trang trí giữa trang
    canvas.setFillColor(HexColor('#1a6b38'))
    canvas.rect(1.5*cm, h*0.38, w - 3*cm, 0.06*cm, fill=1, stroke=0)
    canvas.rect(1.5*cm, h*0.62, w - 3*cm, 0.06*cm, fill=1, stroke=0)

    # Logo text lớn
    canvas.setFillColor(white)
    canvas.setFont('DV-B', 46)
    canvas.drawCentredString(w/2, h*0.60, 'BÁN THUỐC SỈ')

    # Tagline
    canvas.setFillColor(HexColor('#86efac'))
    canvas.setFont('DV', 14)
    canvas.drawCentredString(w/2, h*0.545, 'banthuocsi.vn')

    # Divider
    canvas.setFillColor(HexColor('#4ade80'))
    canvas.rect(w/2 - 3*cm, h*0.51, 6*cm, 0.15*cm, fill=1, stroke=0)

    # Subtitle
    canvas.setFillColor(HexColor('#bbf7d0'))
    canvas.setFont('DV-B', 14)
    canvas.drawCentredString(w/2, h*0.475, 'HƯỚNG DẪN SỬ DỤNG HỆ THỐNG')
    canvas.setFont('DV', 11)
    canvas.drawCentredString(w/2, h*0.445, 'Dành cho Quản trị viên & Nhân viên vận hành')

    # Version info
    canvas.setFillColor(HexColor('#4ade80'))
    canvas.setFont('DV', 9)
    canvas.drawCentredString(w/2, 1.3*cm,
        'Phiên bản 1.0   ·   Năm 2026   ·   Thuốc tốt · Giá tốt · Dịch vụ tốt')

    canvas.restoreState()

# ═══════════════════════════════════════════════════════════════════════════════
# TRANG MỤC LỤC
# ═══════════════════════════════════════════════════════════════════════════════

def toc_page():
    items = []
    items += chapter_header('', 'MỤC LỤC')

    chapters = [
        (1,  'Giới thiệu hệ thống',
         ['Các thành phần chính', 'Yêu cầu sử dụng']),
        (2,  'Đăng nhập & Tổng quan',
         ['Đăng nhập quản trị', 'Tổng quan Dashboard', 'Các mục trong menu']),
        (3,  'Quản lý Danh mục sản phẩm',
         ['Cấu trúc danh mục', 'Thêm danh mục gốc', 'Thêm danh mục con', 'Sửa & Xóa danh mục']),
        (4,  'Quản lý Nhà sản xuất',
         ['Thêm nhà sản xuất', 'Cập nhật thông tin']),
        (5,  'Quản lý Loại sản phẩm',
         ['Các loại mặc định', 'Thêm loại mới']),
        (6,  'Quản lý Sản phẩm',
         ['Tab Thông tin chung', 'Tab Giá & Kho', 'Tab Chi tiết & SEO',
          'Tab Hình ảnh — Hướng dẫn Upload', 'Trạng thái sản phẩm', 'Sửa & Xóa sản phẩm']),
        (7,  'Quản lý Đơn hàng',
         ['Luồng trạng thái', 'Xử lý đơn hàng', 'Hủy đơn hàng']),
        (8,  'Quản lý Đánh giá',
         ['Quy trình duyệt', 'Lưu ý lĩnh vực dược']),
        (9,  'Quản lý Trả hàng',
         ['Điều kiện trả hàng', 'Xử lý yêu cầu']),
        (10, 'Flash Sale',
         ['Tạo phiên Flash Sale', 'Quản lý sản phẩm Flash Sale']),
        (11, 'Câu hỏi thường gặp (FAQ)', []),
        (12, 'Liên hệ hỗ trợ', []),
    ]

    for num, title, subs in chapters:
        tbl = Table(
            [[Paragraph(f'Chương {num}. {title}', ST['toc_ch'])]],
            colWidths=[W_PAGE]
        )
        tbl.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
        ]))
        items.append(tbl)
        for sub in subs:
            items.append(Paragraph(f'         {sub}', ST['toc_sub']))

    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 1 — GIỚI THIỆU
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_1():
    items = []
    items += chapter_header(1, 'GIỚI THIỆU HỆ THỐNG')

    items.append(Paragraph(
        'Hệ thống <b>BanThuocSi</b> là nền tảng thương mại điện tử dược phẩm B2B/B2C '
        'giúp quản lý toàn bộ hoạt động kinh doanh của nhà thuốc: từ danh mục sản phẩm, '
        'đơn hàng, khuyến mãi đến đánh giá khách hàng — tất cả trên một giao diện web '
        'hiện đại, dễ sử dụng.', ST['body_j']))
    items.append(sp(8))

    items += section_title('Các thành phần chính của hệ thống')

    comp_data = [
        [Paragraph('Thành phần', ST['th']),
         Paragraph('Địa chỉ truy cập', ST['th']),
         Paragraph('Mô tả', ST['th'])],
        [Paragraph('Cửa hàng (Khách)', ST['td_b']),
         Paragraph('banthuocsi.vn', ST['td']),
         Paragraph('Giao diện mua sắm dành cho khách hàng cuối', ST['td'])],
        [Paragraph('Trang quản trị', ST['td_b']),
         Paragraph('banthuocsi.vn/admin', ST['td']),
         Paragraph('Bảng điều khiển cho quản trị viên & nhân viên', ST['td'])],
        [Paragraph('Django Admin', ST['td_b']),
         Paragraph('banthuocsi.vn/system-admin', ST['td']),
         Paragraph('Quản trị cơ sở dữ liệu (chỉ dành cho IT)', ST['td'])],
        [Paragraph('API Docs', ST['td_b']),
         Paragraph('banthuocsi.vn/swagger', ST['td']),
         Paragraph('Tài liệu kỹ thuật API (chỉ dành cho lập trình viên)', ST['td'])],
        [Paragraph('Kho lưu trữ ảnh', ST['td_b']),
         Paragraph('minio.banthuocsi.vn', ST['td']),
         Paragraph('Lưu trữ hình ảnh sản phẩm (tự động, không cần truy cập trực tiếp)', ST['td'])],
    ]
    comp_tbl = Table(comp_data, colWidths=[3.8*cm, 4.5*cm, 8.7*cm])
    comp_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(comp_tbl)
    items.append(sp(10))

    items += section_title('Yêu cầu sử dụng')
    req_items = [
        ('Trình duyệt web', 'Google Chrome, Firefox, Edge phiên bản mới nhất. Khuyến nghị dùng Chrome.'),
        ('Kết nối Internet', 'Đường truyền ổn định. Tốc độ tối thiểu 5 Mbps để upload ảnh nhanh.'),
        ('Tài khoản', 'Tài khoản Admin được cung cấp bởi đội ngũ kỹ thuật BanThuocSi.'),
        ('Màn hình', 'Độ phân giải tối thiểu 1280×768. Hỗ trợ cả máy tính bảng.'),
    ]
    for req, desc in req_items:
        tbl = Table([[
            Paragraph(req,  ParagraphStyle('rq', fontName='DV-B', fontSize=9.5,
                             textColor=C['green'], spaceAfter=0)),
            Paragraph(desc, ST['body']),
        ]], colWidths=[3.5*cm, 13.5*cm])
        tbl.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
        ]))
        items.append(tbl)

    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 2 — ĐĂNG NHẬP & TỔNG QUAN
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_2():
    items = []
    items += chapter_header(2, 'ĐĂNG NHẬP & TỔNG QUAN')

    items += section_title('Đăng nhập trang quản trị')
    items += step_block([
        ('Mở trình duyệt',
         'Nhập địa chỉ <b>banthuocsi.vn/admin</b> vào thanh địa chỉ và nhấn Enter.'),
        ('Nhập thông tin đăng nhập',
         'Điền tên đăng nhập và mật khẩu được cấp. Mật khẩu phân biệt chữ hoa/thường.'),
        ('Nhấn nút "Đăng nhập"',
         'Hệ thống xác thực và chuyển đến trang Dashboard chính.'),
    ])
    items += note_box('Không chia sẻ thông tin đăng nhập với người khác. '
                      'Mỗi nhân viên nên có tài khoản riêng để đảm bảo bảo mật.', 'warn')
    items += note_box('Nếu quên mật khẩu, liên hệ ngay với đội ngũ hỗ trợ kỹ thuật '
                      'để được đặt lại. Xem thông tin liên hệ ở Chương 12.', 'note')

    items += section_title('Tổng quan Dashboard')
    items.append(Paragraph(
        'Sau khi đăng nhập, bạn sẽ thấy trang <b>Dashboard</b> với các thông tin tổng quan:', ST['body']))
    items.append(sp(4))

    dash_items = [
        ('Doanh thu tháng này',    'Tổng doanh thu từ đầu tháng đến hiện tại (VNĐ).'),
        ('Đơn hàng hôm nay',       'Số đơn hàng mới được đặt trong ngày.'),
        ('Tổng người dùng',        'Số tài khoản khách hàng đã đăng ký.'),
        ('Sản phẩm sắp hết hàng',  'Số sản phẩm có tồn kho ≤ ngưỡng cảnh báo.'),
        ('Đơn hàng gần đây',       'Danh sách 10 đơn hàng mới nhất, cần xử lý nhanh.'),
        ('Sản phẩm bán chạy',      'Top sản phẩm có doanh số cao nhất tháng.'),
    ]
    for title, desc in dash_items:
        items.append(Table([[
            Paragraph(f'• {title}', ParagraphStyle('di', fontName='DV-B', fontSize=9.5,
                              textColor=C['green_d'], spaceAfter=0)),
            Paragraph(desc, ST['body']),
        ]], colWidths=[5*cm, 12*cm]))

    items.append(sp(10))
    items += section_title('Các mục trong menu quản trị')

    menu_data = [
        [Paragraph('Menu', ST['th']), Paragraph('Chức năng chính', ST['th']),
         Paragraph('Ai cần dùng', ST['th'])],
        [Paragraph('Dashboard',      ST['td_b']),
         Paragraph('Xem thống kê, doanh thu, cảnh báo tồn kho', ST['td']),
         Paragraph('Quản lý, Giám đốc', ST['td'])],
        [Paragraph('Sản phẩm',       ST['td_b']),
         Paragraph('Thêm, sửa, xóa sản phẩm; quản lý danh mục', ST['td']),
         Paragraph('Nhân viên kho, Marketing', ST['td'])],
        [Paragraph('Đơn hàng',       ST['td_b']),
         Paragraph('Xem & xử lý đơn hàng, cập nhật trạng thái', ST['td']),
         Paragraph('Nhân viên bán hàng', ST['td'])],
        [Paragraph('Đánh giá',       ST['td_b']),
         Paragraph('Duyệt hoặc từ chối đánh giá sản phẩm', ST['td']),
         Paragraph('Nhân viên CSKH', ST['td'])],
        [Paragraph('Trả hàng',       ST['td_b']),
         Paragraph('Xử lý yêu cầu trả hàng / hoàn tiền', ST['td']),
         Paragraph('Nhân viên CSKH', ST['td'])],
        [Paragraph('Flash Sale',     ST['td_b']),
         Paragraph('Tạo & quản lý chương trình giảm giá thời hạn', ST['td']),
         Paragraph('Marketing', ST['td'])],
        [Paragraph('Danh mục',       ST['td_b']),
         Paragraph('Quản lý cây danh mục sản phẩm', ST['td']),
         Paragraph('Quản lý', ST['td'])],
        [Paragraph('Nhà sản xuất',   ST['td_b']),
         Paragraph('Thêm, sửa thông tin nhà sản xuất/nhập khẩu', ST['td']),
         Paragraph('Quản lý', ST['td'])],
        [Paragraph('Người dùng',     ST['td_b']),
         Paragraph('Quản lý tài khoản khách hàng', ST['td']),
         Paragraph('Quản lý, CSKH', ST['td'])],
    ]
    menu_tbl = Table(menu_data, colWidths=[3.2*cm, 9*cm, 4.8*cm])
    menu_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 9),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(menu_tbl)
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 3 — DANH MỤC
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_3():
    items = []
    items += chapter_header(3, 'QUẢN LÝ DANH MỤC SẢN PHẨM')

    items += section_title('Cấu trúc danh mục')
    items.append(Paragraph(
        'Danh mục được tổ chức theo <b>cấu trúc 2 cấp</b>: Danh mục gốc → Danh mục con. '
        'Trang chủ tự động hiển thị toàn bộ danh mục gốc có sản phẩm.', ST['body']))
    items.append(sp(6))

    example_data = [
        [Paragraph('Ví dụ cấu trúc danh mục', ST['th'])],
        [Paragraph('THUỐC  (Danh mục gốc)\n'
                   '    ├─  Giảm đau Hạ sốt\n'
                   '    ├─  Thuốc tiêu hóa\n'
                   '    └─  Kháng sinh\n\n'
                   'THỰC PHẨM CHỨC NĂNG  (Danh mục gốc)\n'
                   '    ├─  Vitamin tổng hợp\n'
                   '    └─  Canxi & Xương khớp',
                   ParagraphStyle('ex', fontName='DV', fontSize=9, textColor=C['gray_700'],
                                  leading=16))],
    ]
    ex_tbl = Table(example_data, colWidths=[W_PAGE])
    ex_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green']),
        ('BACKGROUND',    (0,1), (-1,-1), HexColor('#f0fdf4')),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('TOPPADDING',    (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
    ]))
    items.append(ex_tbl)
    items.append(sp(10))

    items += section_title('Thêm danh mục gốc (Root Category)')
    items += note_box('Mỗi danh mục gốc mới sẽ tự động xuất hiện thành 1 section riêng '
                      'trên trang chủ ngay khi có sản phẩm thuộc danh mục đó.', 'tip')
    items += step_block([
        ('Nhấn "Thêm danh mục"',
         'Nút nằm ở góc trên bên phải của trang Danh mục.'),
        ('Điền thông tin',
         '<b>Tên danh mục</b> (bắt buộc): tên hiển thị trên website, ví dụ "Thuốc nhỏ mắt".<br/>'
         '<b>Slug URL</b> (bắt buộc): viết thường, không dấu, dùng gạch ngang, ví dụ "thuoc-nho-mat".<br/>'
         '<b>Mô tả</b> (tùy chọn): hiển thị ở trang danh mục, hỗ trợ SEO.'),
        ('Để trống "Danh mục cha"',
         'Không chọn cha → hệ thống tạo danh mục gốc.'),
        ('Nhấn "Lưu"',
         'Danh mục mới xuất hiện ngay trong cây danh mục.'),
    ])
    items += note_box('Slug chỉ được chứa chữ thường a–z, số 0–9 và dấu gạch ngang (-). '
                      'KHÔNG dùng khoảng trắng hay ký tự đặc biệt.', 'note')

    items += section_title('Thêm danh mục con')
    items += step_block([
        ('Nhấn "Thêm danh mục"', 'Tương tự danh mục gốc.'),
        ('Điền tên và slug', 'Quy tắc tương tự danh mục gốc.'),
        ('Chọn "Danh mục cha"',
         'Chọn danh mục gốc phù hợp từ dropdown. Ví dụ: chọn "Thuốc" làm cha '
         'khi thêm "Giảm đau Hạ sốt".'),
        ('Nhấn "Lưu"',
         'Danh mục con xuất hiện thụt vào dưới danh mục cha trong cây.'),
    ])

    items += section_title('Sửa & Xóa danh mục')
    items += step_block([
        ('Tìm danh mục', 'Cuộn xuống cây danh mục hoặc dùng thanh tìm kiếm.'),
        ('Nhấn icon bút chì', 'Mở form chỉnh sửa. Sửa tên, slug hoặc mô tả theo nhu cầu.'),
        ('Xóa danh mục',
         'Nhấn icon thùng rác → Xác nhận. '
         'Chỉ xóa được khi danh mục KHÔNG có sản phẩm nào.'),
    ])
    items += note_box('CẢNH BÁO: Xóa danh mục gốc sẽ đồng thời xóa TẤT CẢ danh mục con bên dưới. '
                      'Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.', 'warn')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 4 — NHÀ SẢN XUẤT
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_4():
    items = []
    items += chapter_header(4, 'QUẢN LÝ NHÀ SẢN XUẤT')
    items.append(Paragraph(
        'Nhà sản xuất là đơn vị sản xuất hoặc nhập khẩu sản phẩm (DHG, Sanofi, Traphaco, '
        'Abbott...). Mỗi sản phẩm bắt buộc phải được gắn với một nhà sản xuất.', ST['body']))
    items.append(sp(6))

    items += section_title('Thêm nhà sản xuất mới')
    items += step_block([
        ('Vào menu "Nhà sản xuất"', 'Trong sidebar quản trị bên trái.'),
        ('Nhấn "Thêm mới"', 'Mở form nhập thông tin nhà sản xuất.'),
        ('Điền thông tin (xem bảng bên dưới)', ''),
        ('Nhấn "Lưu"',
         'Nhà sản xuất xuất hiện ngay trong dropdown khi thêm/sửa sản phẩm.'),
    ])
    items += field_table([
        ('Tên nhà sản xuất',  True,
         'Tên đầy đủ và chính thức. Ví dụ: "Công ty Dược Hậu Giang (DHG Pharma)"'),
        ('Slug',              True,
         'Định danh URL. Ví dụ: "duoc-hau-giang". Viết thường, không dấu, gạch ngang.'),
        ('Quốc gia',          False,
         'Nước xuất xứ/sản xuất. Ví dụ: "Việt Nam", "Pháp", "Hàn Quốc"'),
        ('Website',           False,
         'Trang web chính thức. Ví dụ: "https://dhgpharma.com.vn"'),
        ('Mô tả',             False,
         'Thông tin ngắn gọn về nhà sản xuất. Hỗ trợ SEO.'),
        ('Logo',              False,
         'Upload logo công ty (JPG/PNG, kích thước khuyến nghị: 300×150px)'),
    ])
    items += note_box('Mẹo nhanh: Khi đang thêm sản phẩm mà chưa có nhà sản xuất, '
                      'nhấn nút "+" bên cạnh dropdown để thêm nhà sản xuất ngay mà không cần rời form.', 'tip')

    items += section_title('Cập nhật thông tin nhà sản xuất')
    items += step_block([
        ('Tìm nhà sản xuất', 'Trong danh sách, dùng thanh tìm kiếm nếu danh sách dài.'),
        ('Nhấn icon bút chì', 'Mở form chỉnh sửa.'),
        ('Cập nhật thông tin', 'Chỉnh sửa các trường cần thay đổi.'),
        ('Nhấn "Lưu"',
         'Thay đổi áp dụng ngay lập tức cho tất cả sản phẩm liên quan đến nhà sản xuất này.'),
    ])
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 5 — LOẠI SẢN PHẨM
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_5():
    items = []
    items += chapter_header(5, 'QUẢN LÝ LOẠI SẢN PHẨM')
    items.append(Paragraph(
        'Loại sản phẩm phân loại theo tính chất của sản phẩm. Hệ thống dùng thông tin này '
        'để tạo <b>dữ liệu có cấu trúc (Schema.org)</b> giúp Google hiển thị thông tin '
        'phong phú hơn trong kết quả tìm kiếm.', ST['body']))
    items.append(sp(6))

    items += section_title('Các loại sản phẩm mặc định')

    type_data = [
        [Paragraph('Tên loại', ST['th']),
         Paragraph('Schema SEO', ST['th']),
         Paragraph('Ví dụ sản phẩm', ST['th'])],
        [Paragraph('Thuốc',                   ST['td_b']),
         Paragraph('Drug (đặc biệt cho dược)', ST['td']),
         Paragraph('Panadol, Amoxicillin, Voltaren...', ST['td'])],
        [Paragraph('Thiết bị y tế',            ST['td_b']),
         Paragraph('Product',                  ST['td']),
         Paragraph('Máy đo huyết áp, nhiệt kế điện tử...', ST['td'])],
        [Paragraph('Thực phẩm chức năng',      ST['td_b']),
         Paragraph('Product',                  ST['td']),
         Paragraph('Vitamin C, Omega-3, Canxi...', ST['td'])],
        [Paragraph('Mỹ phẩm',                  ST['td_b']),
         Paragraph('Product',                  ST['td']),
         Paragraph('Kem dưỡng da, son dưỡng môi dược liệu...', ST['td'])],
        [Paragraph('Khác',                     ST['td_b']),
         Paragraph('Product',                  ST['td']),
         Paragraph('Các sản phẩm không thuộc nhóm trên', ST['td'])],
    ]
    type_tbl = Table(type_data, colWidths=[4.5*cm, 4*cm, 8.5*cm])
    type_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(type_tbl)
    items.append(sp(10))

    items += section_title('Thêm loại sản phẩm mới')
    items += step_block([
        ('Vào "Loại sản phẩm"', 'Trong menu quản trị.'),
        ('Nhấn "Thêm mới"', 'Điền tên loại và mô tả ngắn.'),
        ('Nhấn "Lưu"',
         'Loại mới xuất hiện trong dropdown khi tạo hoặc sửa sản phẩm.'),
    ])
    items += note_box('Thông thường không cần thêm loại mới vì các loại mặc định đã đủ cho dược phẩm. '
                      'Chỉ thêm khi có nhu cầu đặc biệt.', 'info')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 6 — SẢN PHẨM
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_6():
    items = []
    items += chapter_header(6, 'QUẢN LÝ SẢN PHẨM')
    items.append(Paragraph(
        'Đây là chức năng trung tâm của hệ thống. Form thêm/sửa sản phẩm được chia thành '
        '<b>4 tab</b> để dễ điền thông tin: Thông tin chung, Giá &amp; Kho, Chi tiết &amp; SEO, '
        'và Hình ảnh.', ST['body']))
    items += note_box('Phải điền đầy đủ tất cả trường bắt buộc (*) trước khi nhấn Lưu. '
                      'Nếu thiếu trường bắt buộc, hệ thống sẽ hiển thị thông báo lỗi màu đỏ '
                      'bên dưới trường đó.', 'warn')
    items.append(sp(4))

    # ── Tab 1
    items += section_title('Tab 1 — Thông tin chung')
    items += field_table([
        ('Tên sản phẩm',   True,
         'Tên đầy đủ, chính xác. Ví dụ: <b>"Panadol Extra 500mg/65mg hộp 12 vỉ x 10 viên"</b>'),
        ('Mã SKU',         True,
         'Mã nội bộ duy nhất cho từng sản phẩm. Ví dụ: "PAN-EXTRA-001". '
         'Dùng để tra cứu và quản lý kho.'),
        ('Slug URL',       True,
         'Đường dẫn trang sản phẩm. Ví dụ: "panadol-extra-500mg". '
         'Viết thường, không dấu, gạch ngang. Không được trùng với sản phẩm khác.'),
        ('Loại sản phẩm',  True,
         'Chọn từ dropdown (xem Chương 5). Ảnh hưởng đến Schema SEO hiển thị trên Google.'),
        ('Trạng thái',     True,
         'Xem chi tiết ở mục "Trạng thái sản phẩm" bên dưới.'),
        ('Danh mục',       True,
         'Chọn <b>danh mục con</b> phù hợp. Ví dụ: "Giảm đau Hạ sốt" (không chọn "Thuốc").'),
        ('Nhà sản xuất',   True,
         'Chọn từ dropdown. Nhấn "+" để thêm nhà sản xuất mới nếu chưa có trong danh sách.'),
        ('Mô tả ngắn',     False,
         'Tóm tắt 1–2 câu về công dụng chính. Hiển thị ở trang danh sách và dùng cho SEO.'),
    ])

    # ── Tab 2
    items += section_title('Tab 2 — Giá & Kho')
    items += field_table([
        ('Giá bán lẻ (VNĐ)',     True,
         'Giá niêm yết gốc. Nhập số nguyên, KHÔNG có dấu chấm/phẩy. '
         'Ví dụ: nhập "45000" cho sản phẩm giá 45.000đ.'),
        ('Giá khuyến mãi (VNĐ)', False,
         'Giá sau khi giảm (phải nhỏ hơn giá gốc). Để trống nếu không có khuyến mãi. '
         'Khi có giá này, hệ thống tự động tính % giảm và hiển thị badge "SALE".'),
        ('Số lượng tồn kho',     False,
         'Số lượng hiện có trong kho. Nhập 0 nếu chưa có hàng.'),
        ('Ngưỡng cảnh báo hết hàng', False,
         'Khi tồn kho ≤ ngưỡng này, Dashboard hiển thị cảnh báo. '
         'Mặc định: 10. Nên đặt bằng lượng hàng cần đặt lại tối thiểu.'),
        ('Đơn vị tính',          True,
         'Đơn vị bán của sản phẩm. Ví dụ: "Hộp", "Chai", "Vỉ", "Tuýp". Mặc định: "Hộp".'),
        ('Quy cách đóng gói',    False,
         'Mô tả chi tiết đóng gói. Ví dụ: "10 vỉ × 10 viên", "1 chai 100ml", "30 viên/lọ".'),
    ])

    # ── Tab 3
    items.append(PageBreak())
    items += section_title('Tab 3 — Chi tiết & SEO')
    items.append(Paragraph('<b>Thuộc tính đặc biệt:</b>', ST['h3']))
    items += field_table([
        ('Yêu cầu đơn thuốc',  False,
         'Bật ON nếu sản phẩm cần toa bác sĩ. Hệ thống hiển thị biểu hiệu "Rx" màu đỏ trên web '
         'và thông báo khách hàng liên hệ dược sĩ.'),
        ('Sản phẩm nổi bật',   False,
         'Bật ON để hiển thị sản phẩm trong section "Sản phẩm nổi bật" trên trang chủ. '
         'Khuyến nghị: chọn 8–12 sản phẩm bán chạy nhất.'),
    ])

    items.append(Paragraph('<b>Thông tin dược phẩm — Quan trọng cho SEO:</b>', ST['h3']))
    items += note_box(
        'Điền càng đầy đủ thông tin dược phẩm, Google càng dễ hiển thị kết quả tìm kiếm '
        'phong phú (rich snippet) với đánh sao, giá, tình trạng hàng. '
        'Điều này giúp tăng lượng khách hàng tìm thấy sản phẩm.', 'tip')
    items += field_table([
        ('Thành phần',      False,
         'Liệt kê hoạt chất và hàm lượng. '
         'Ví dụ: <b>"Paracetamol 500mg, Caffeine 65mg"</b>'),
        ('Cách dùng',       False,
         'Hướng dẫn sử dụng cụ thể. '
         'Ví dụ: <b>"Uống 1-2 viên mỗi 4-6 giờ, không quá 8 viên/ngày"</b>'),
        ('Liều dùng',       False,
         'Liều theo từng đối tượng. '
         'Ví dụ: <b>"Người lớn: 1-2 viên/lần. Trẻ 7-12 tuổi: 1 viên/lần. Trẻ dưới 7 tuổi: không dùng"</b>'),
        ('Tác dụng phụ',    False,
         'Các phản ứng không mong muốn. '
         'Ví dụ: <b>"Buồn nôn, đau dạ dày (hiếm gặp). Dị ứng da (rất hiếm)"</b>'),
        ('Bảo quản',        False,
         'Điều kiện bảo quản. '
         'Ví dụ: <b>"Dưới 30°C, tránh ánh sáng trực tiếp và độ ẩm cao"</b>'),
        ('Chống chỉ định',  False,
         'Các trường hợp không được sử dụng. '
         'Ví dụ: <b>"Người dị ứng Paracetamol, suy gan nặng, uống rượu thường xuyên"</b>'),
        ('Mô tả chi tiết',  False,
         'Bài viết đầy đủ về sản phẩm: công dụng, đặc điểm nổi bật, so sánh... '
         'Nội dung dài, chi tiết sẽ giúp SEO tốt hơn rất nhiều.'),
    ])

    # ── Tab 4 - Hình ảnh
    items.append(PageBreak())
    items += section_title('Tab 4 — Hình ảnh: Hướng dẫn Upload')
    items += note_box(
        'Hình ảnh sản phẩm là yếu tố quyết định đến tỷ lệ mua hàng. '
        'Ảnh đầu tiên trong danh sách là <b>ảnh chính</b> hiển thị trên trang danh sách và Google Shopping.',
        'info')
    items.append(sp(4))

    items.append(Paragraph('<b>Tiêu chuẩn ảnh sản phẩm:</b>', ST['h3']))
    std_data = [
        [Paragraph('Tiêu chí', ST['th']), Paragraph('Yêu cầu', ST['th']),
         Paragraph('Lý do', ST['th'])],
        [Paragraph('Định dạng', ST['td_b']),
         Paragraph('JPG, PNG, WebP', ST['td']),
         Paragraph('Được hỗ trợ tốt trên tất cả trình duyệt', ST['td'])],
        [Paragraph('Kích thước', ST['td_b']),
         Paragraph('Tối thiểu 800 × 800px', ST['td']),
         Paragraph('Ảnh rõ nét khi zoom, đạt chuẩn Google Shopping', ST['td'])],
        [Paragraph('Tỷ lệ', ST['td_b']),
         Paragraph('1:1 (hình vuông) lý tưởng', ST['td']),
         Paragraph('Hiển thị đẹp đồng đều trong lưới sản phẩm', ST['td'])],
        [Paragraph('Dung lượng', ST['td_b']),
         Paragraph('Tối đa 10MB/ảnh', ST['td']),
         Paragraph('Giới hạn upload của hệ thống', ST['td'])],
        [Paragraph('Nền ảnh', ST['td_b']),
         Paragraph('Nền trắng hoặc nền sáng', ST['td']),
         Paragraph('Chuyên nghiệp, nổi bật sản phẩm', ST['td'])],
        [Paragraph('Số lượng', ST['td_b']),
         Paragraph('Tối đa 10 ảnh/sản phẩm', ST['td']),
         Paragraph('Nhiều góc chụp giúp khách hàng yên tâm hơn', ST['td'])],
    ]
    std_tbl = Table(std_data, colWidths=[3.5*cm, 4.5*cm, 9*cm])
    std_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 9),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(std_tbl)
    items.append(sp(10))

    items.append(Paragraph('<b>Các bước upload hình ảnh:</b>', ST['h3']))
    items += step_block([
        ('Chuyển sang tab "Hình ảnh"',
         'Trong form thêm/sửa sản phẩm, nhấn tab "Hình ảnh" ở hàng tab bên trên.'),
        ('Nhấn vào ô dấu cộng (+)',
         'Ô vuông viền nét đứt ở cuối lưới hình ảnh. Click vào để mở cửa sổ chọn file.'),
        ('Chọn file ảnh từ máy tính',
         'Có thể chọn nhiều ảnh cùng lúc (giữ Ctrl và click). Hệ thống upload song song.'),
        ('Chờ upload hoàn tất',
         'Thanh tiến trình hiển thị % upload. Ảnh xuất hiện trong lưới khi hoàn tất. '
         'Ảnh đầu tiên upload sẽ có badge "<b>Ảnh chính</b>" màu xanh.'),
        ('Sắp xếp ảnh (nếu cần)',
         'Ảnh đầu tiên là ảnh chính. Nếu muốn thay đổi ảnh chính, '
         'hãy xóa ảnh cũ và upload ảnh mới trước.'),
        ('Xóa ảnh không cần thiết',
         'Hover chuột vào ảnh → Nhấn nút "×" màu đỏ xuất hiện ở góc trên phải ảnh.'),
    ])

    items.append(Paragraph('<b>Xử lý sự cố upload ảnh:</b>', ST['h3']))
    trouble_data = [
        [Paragraph('Sự cố', ST['th']), Paragraph('Nguyên nhân & Cách xử lý', ST['th'])],
        [Paragraph('Upload thất bại', ST['td_b']),
         Paragraph('Kiểm tra kết nối Internet. Kiểm tra dung lượng file (phải < 10MB). '
                   'Thử lại sau 30 giây. Nếu vẫn lỗi, liên hệ bộ phận kỹ thuật.', ST['td'])],
        [Paragraph('Ảnh bị mờ/vỡ', ST['td_b']),
         Paragraph('Sử dụng ảnh gốc có độ phân giải cao (≥800px). '
                   'Không dùng ảnh chụp màn hình hoặc ảnh đã zoom lớn.', ST['td'])],
        [Paragraph('Ảnh không hiển thị', ST['td_b']),
         Paragraph('Nhấn F5 để tải lại trang. Xóa cache trình duyệt (Ctrl+Shift+Delete). '
                   'Kiểm tra minio.banthuocsi.vn có hoạt động không.', ST['td'])],
        [Paragraph('Định dạng không hỗ trợ', ST['td_b']),
         Paragraph('Chỉ hỗ trợ JPG, PNG, WebP. Dùng phần mềm chuyển đổi ảnh như '
                   'Paint (Windows) hoặc Preview (Mac) để lưu sang JPG.', ST['td'])],
    ]
    trouble_tbl = Table(trouble_data, colWidths=[3.8*cm, 13.2*cm])
    trouble_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['amber']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['amber_l']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 9),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['amber']),
    ]))
    items.append(trouble_tbl)
    items.append(sp(10))

    # ── Trạng thái
    items.append(PageBreak())
    items += section_title('Trạng thái sản phẩm')
    items.append(Paragraph(
        'Trạng thái sản phẩm quyết định sản phẩm có hiển thị trên website hay không:', ST['body']))
    items.append(sp(6))

    status_data = [
        [Paragraph('Trạng thái', ST['th']),
         Paragraph('Hiển thị trên web', ST['th_c']),
         Paragraph('Ý nghĩa & Khi nào dùng', ST['th'])],
        [Paragraph('ACTIVE', ParagraphStyle('sa', fontName='DV-B', fontSize=9,
                              textColor=C['green'])),
         Paragraph('CÓ', ParagraphStyle('sac', fontName='DV-B', fontSize=9,
                          textColor=C['green'], alignment=TA_CENTER)),
         Paragraph('<b>Đang bán.</b> Khách hàng thấy và có thể mua. '
                   'Dùng khi sản phẩm sẵn sàng bán.', ST['td'])],
        [Paragraph('DRAFT', ParagraphStyle('sd', fontName='DV-B', fontSize=9,
                             textColor=C['gray_500'])),
         Paragraph('KHÔNG', ParagraphStyle('sdc', fontName='DV-B', fontSize=9,
                             textColor=C['gray_500'], alignment=TA_CENTER)),
         Paragraph('<b>Bản nháp.</b> Mặc định khi tạo mới. '
                   'Dùng khi chưa hoàn thiện thông tin sản phẩm.', ST['td'])],
        [Paragraph('INACTIVE', ParagraphStyle('si', fontName='DV-B', fontSize=9,
                                textColor=C['amber'])),
         Paragraph('KHÔNG', ParagraphStyle('sic', fontName='DV-B', fontSize=9,
                             textColor=C['amber'], alignment=TA_CENTER)),
         Paragraph('<b>Ngừng kinh doanh.</b> Ẩn khỏi web nhưng giữ lại dữ liệu. '
                   'Dùng khi ngừng nhập hàng nhưng không muốn xóa lịch sử.', ST['td'])],
        [Paragraph('OUT_OF_STOCK', ParagraphStyle('sos', fontName='DV-B', fontSize=9,
                                   textColor=C['red'])),
         Paragraph('CÓ', ParagraphStyle('sosc', fontName='DV-B', fontSize=9,
                          textColor=C['red'], alignment=TA_CENTER)),
         Paragraph('<b>Hết hàng.</b> Hiển thị nhưng nút "Mua ngay" bị khóa. '
                   'Hệ thống tự động chuyển khi số lượng kho = 0.', ST['td'])],
    ]
    status_tbl = Table(status_data, colWidths=[3.5*cm, 2.5*cm, 11*cm])
    status_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(status_tbl)
    items.append(sp(8))
    items += note_box('Sản phẩm mới tạo luôn ở trạng thái DRAFT. '
                      'Sau khi điền đầy đủ thông tin, nhớ chuyển sang ACTIVE để hiển thị trên web.', 'warn')

    items += section_title('Sửa & Xóa sản phẩm')
    items += step_block([
        ('Vào trang "Sản phẩm"',
         'Click menu "Sản phẩm" trong sidebar.'),
        ('Tìm sản phẩm cần sửa',
         'Dùng thanh tìm kiếm hoặc bộ lọc theo danh mục / trạng thái.'),
        ('Nhấn icon bút chì',
         'Ở cột cuối bên phải của mỗi dòng sản phẩm.'),
        ('Chỉnh sửa thông tin',
         'Hệ thống tải toàn bộ thông tin vào form 4 tab. Chuyển đúng tab cần sửa.'),
        ('Nhấn "Lưu thay đổi"',
         'Thay đổi hiển thị ngay lập tức trên website.'),
    ])
    items += note_box('XÓA SẢN PHẨM: Không thể hoàn tác sau khi xóa. '
                      'Khuyến nghị: chuyển trạng thái sang INACTIVE thay vì xóa '
                      'để giữ lại lịch sử đơn hàng.', 'warn')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 7 — ĐƠN HÀNG
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_7():
    items = []
    items += chapter_header(7, 'QUẢN LÝ ĐƠN HÀNG')
    items.append(Paragraph(
        'Quản lý toàn bộ vòng đời đơn hàng từ khi khách đặt đến khi giao thành công '
        'hoặc xử lý trả hàng.', ST['body']))
    items.append(sp(6))

    items += section_title('Luồng trạng thái đơn hàng')

    flow_data = [
        [Paragraph('Trạng thái', ST['th']),
         Paragraph('Tên hiển thị', ST['th']),
         Paragraph('Ý nghĩa', ST['th']),
         Paragraph('Ai thực hiện', ST['th'])],
        [Paragraph('PENDING',    ST['td_b']), Paragraph('Chờ xử lý',       ST['td']),
         Paragraph('Đơn hàng mới, chờ admin xác nhận',    ST['td']),
         Paragraph('Tự động (khách đặt)', ST['td'])],
        [Paragraph('CONFIRMED',  ST['td_b']), Paragraph('Đã xác nhận',     ST['td']),
         Paragraph('Admin đã xác nhận, đang chuẩn bị hàng', ST['td']),
         Paragraph('Admin', ST['td'])],
        [Paragraph('PROCESSING', ST['td_b']), Paragraph('Đang xử lý',      ST['td']),
         Paragraph('Đang đóng gói và chuẩn bị giao',     ST['td']),
         Paragraph('Admin', ST['td'])],
        [Paragraph('SHIPPED',    ST['td_b']), Paragraph('Đã giao hàng',     ST['td']),
         Paragraph('Hàng đã bàn giao cho đơn vị vận chuyển', ST['td']),
         Paragraph('Admin', ST['td'])],
        [Paragraph('DELIVERED',  ST['td_b']), Paragraph('Giao thành công',  ST['td']),
         Paragraph('Khách hàng đã nhận được hàng',       ST['td']),
         Paragraph('Admin / Tự động', ST['td'])],
        [Paragraph('CANCELLED',  ST['td_b']), Paragraph('Đã hủy',           ST['td']),
         Paragraph('Đơn hàng bị hủy, tồn kho được hoàn lại', ST['td']),
         Paragraph('Admin / Khách', ST['td'])],
        [Paragraph('RETURNED',   ST['td_b']), Paragraph('Đã trả hàng',      ST['td']),
         Paragraph('Khách trả hàng, admin đã xử lý',    ST['td']),
         Paragraph('Admin', ST['td'])],
    ]
    flow_tbl = Table(flow_data, colWidths=[3*cm, 3*cm, 7*cm, 4*cm])
    flow_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['gray_900']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(flow_tbl)
    items.append(sp(8))
    items += note_box('Mỗi lần thay đổi trạng thái, hệ thống tự động gửi email thông báo '
                      'đến địa chỉ email của khách hàng.', 'tip')

    items += section_title('Xử lý đơn hàng')
    items += step_block([
        ('Vào menu "Đơn hàng"',
         'Xem danh sách tất cả đơn hàng. Dùng bộ lọc trạng thái để tìm nhanh.'),
        ('Xem chi tiết đơn hàng',
         'Nhấn vào mã đơn hàng để xem đầy đủ: danh sách sản phẩm, số lượng, '
         'địa chỉ giao hàng, phương thức thanh toán, ghi chú khách hàng.'),
        ('Cập nhật trạng thái',
         'Chọn trạng thái mới từ dropdown "Trạng thái" → Nhấn "Cập nhật". '
         'Email tự động gửi cho khách.'),
        ('Thêm ghi chú nội bộ',
         'Nhập ghi chú vào ô "Ghi chú nội bộ" (khách hàng không thấy được phần này).'),
    ])

    items += section_title('Hủy đơn hàng')
    items += step_block([
        ('Mở chi tiết đơn hàng', 'Nhấn vào mã đơn hàng cần hủy.'),
        ('Nhấn nút "Hủy đơn hàng"',
         'Chỉ khả dụng với đơn hàng có trạng thái PENDING hoặc CONFIRMED. '
         'Không thể hủy đơn đã SHIPPED hoặc DELIVERED.'),
        ('Nhập lý do hủy', 'Điền lý do để lưu lịch sử và thông báo cho khách hàng.'),
        ('Xác nhận',
         'Hệ thống đổi trạng thái sang CANCELLED và tự động hoàn lại tồn kho.'),
    ])
    items += note_box('Khi hủy đơn hàng, tồn kho của tất cả sản phẩm trong đơn sẽ được hoàn lại tự động. '
                      'Khách hàng nhận email thông báo hủy đơn kèm lý do.', 'info')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 8 — ĐÁNH GIÁ
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_8():
    items = []
    items += chapter_header(8, 'QUẢN LÝ ĐÁNH GIÁ SẢN PHẨM')
    items.append(Paragraph(
        'Khách hàng có thể viết đánh giá (1–5 sao, tiêu đề, nội dung) sau khi mua hàng. '
        'Tất cả đánh giá cần được admin duyệt trước khi hiển thị công khai trên trang sản phẩm.', ST['body']))
    items.append(sp(6))

    items += section_title('Quy trình duyệt đánh giá')
    items += step_block([
        ('Vào menu "Đánh giá"',
         'Danh sách hiển thị tất cả đánh giá, ưu tiên đánh giá chưa duyệt lên đầu.'),
        ('Lọc đánh giá chờ duyệt',
         'Chọn bộ lọc "Chưa duyệt" để chỉ xem các đánh giá cần xử lý.'),
        ('Đọc nội dung đánh giá',
         'Kiểm tra nội dung: có phù hợp với sản phẩm không, có spam không, '
         'có thông tin sai lệch hay tư vấn điều trị không.'),
        ('Duyệt đánh giá',
         'Nhấn "Duyệt" → Đánh giá hiển thị trên trang sản phẩm ngay lập tức. '
         'Điểm rating trung bình tự động cập nhật.'),
        ('Từ chối đánh giá',
         'Nhấn "Từ chối" → Đánh giá bị ẩn, không hiển thị công khai. '
         'Nên thêm ghi chú lý do từ chối để tham khảo sau.'),
    ])

    items += section_title('Lưu ý quan trọng trong lĩnh vực dược')
    items += note_box(
        'Trong lĩnh vực dược phẩm, một số đánh giá có thể vi phạm quy định pháp luật y tế. '
        'Cần TỪ CHỐI các đánh giá có nội dung: tư vấn liều dùng cụ thể, '
        'khuyên ngưng thuốc bác sĩ kê, quảng cáo chữa khỏi bệnh hiểm nghèo, '
        'hoặc thông tin sai lệch về công dụng thuốc.', 'warn')
    items += note_box(
        'Đánh giá được duyệt sẽ tự động cập nhật điểm rating tổng hợp (1–5 sao) '
        'trên trang sản phẩm, kết quả tìm kiếm Google và Google Shopping.', 'tip')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 9 — TRẢ HÀNG
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_9():
    items = []
    items += chapter_header(9, 'QUẢN LÝ YÊU CẦU TRẢ HÀNG')
    items.append(Paragraph(
        'Khách hàng có quyền gửi yêu cầu trả hàng trong vòng <b>7 ngày</b> kể từ ngày nhận hàng '
        '(đơn hàng ở trạng thái DELIVERED). Admin xem xét và xử lý từng yêu cầu.', ST['body']))
    items.append(sp(6))

    items += section_title('Điều kiện trả hàng')
    cond_data = [
        [Paragraph('Điều kiện', ST['th']), Paragraph('Chi tiết', ST['th'])],
        [Paragraph('Thời hạn', ST['td_b']),
         Paragraph('Trong vòng 7 ngày kể từ ngày nhận hàng (ngày giao DELIVERED)', ST['td'])],
        [Paragraph('Trạng thái đơn', ST['td_b']),
         Paragraph('Chỉ áp dụng với đơn hàng ở trạng thái DELIVERED', ST['td'])],
        [Paragraph('Mỗi đơn', ST['td_b']),
         Paragraph('Chỉ gửi được 1 yêu cầu trả hàng cho mỗi đơn', ST['td'])],
        [Paragraph('Lý do', ST['td_b']),
         Paragraph('Khách phải ghi rõ lý do: hàng lỗi, hàng sai mô tả, không đúng yêu cầu...', ST['td'])],
    ]
    cond_tbl = Table(cond_data, colWidths=[3.5*cm, 13.5*cm])
    cond_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(cond_tbl)
    items.append(sp(10))

    items += section_title('Xử lý yêu cầu trả hàng')
    items += step_block([
        ('Vào menu "Trả hàng"',
         'Danh sách hiển thị các yêu cầu theo thứ tự mới nhất lên đầu.'),
        ('Xem chi tiết yêu cầu',
         'Nhấn vào yêu cầu để xem: thông tin đơn hàng, lý do trả, ngày giao hàng.'),
        ('Kiểm tra và xác minh',
         'Liên hệ khách hàng nếu cần thêm thông tin hoặc hình ảnh minh chứng.'),
        ('Chấp thuận',
         'Nhấn "Chấp thuận" → Điền ghi chú admin → Xác nhận. '
         'Hệ thống tự động: chuyển đơn sang RETURNED và hoàn lại tồn kho.'),
        ('Từ chối',
         'Nhấn "Từ chối" → Bắt buộc điền lý do từ chối → Xác nhận. '
         'Khách hàng nhận email thông báo kèm lý do.'),
    ])
    items += note_box('Thời hạn xử lý: 3–5 ngày làm việc kể từ khi nhận yêu cầu. '
                      'Xử lý nhanh giúp tăng sự hài lòng của khách hàng.', 'note')
    items += note_box('Khi chấp thuận trả hàng, tồn kho tự động được hoàn lại. '
                      'Hãy cập nhật tình trạng hàng trả về thực tế trong kho vật lý.', 'info')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 10 — FLASH SALE
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_10():
    items = []
    items += chapter_header(10, 'FLASH SALE')
    items.append(Paragraph(
        'Flash Sale là chương trình giảm giá có thời hạn với đồng hồ đếm ngược. '
        'Sản phẩm flash sale hiển thị ở trang <b>/flash-sale</b> và section "Flash Sale" '
        'trên trang chủ với giá đặc biệt và số lượng giới hạn.', ST['body']))
    items.append(sp(6))

    items += section_title('Tạo phiên Flash Sale mới')
    items += step_block([
        ('Vào menu "Flash Sale"', 'Trong sidebar quản trị.'),
        ('Nhấn "Tạo phiên Flash Sale"', 'Mở form tạo mới.'),
        ('Điền thông tin phiên',
         '<b>Tên phiên</b>: Ví dụ "Flash Sale cuối tuần — Giảm tới 50%".<br/>'
         '<b>Thời gian bắt đầu</b>: Chọn ngày và giờ chính xác.<br/>'
         '<b>Thời gian kết thúc</b>: Phải sau thời gian bắt đầu.'),
        ('Thêm sản phẩm vào phiên',
         'Nhấn "Thêm sản phẩm" → Tìm kiếm sản phẩm → Chọn → '
         'Nhập giá flash sale (bắt buộc thấp hơn giá gốc) → '
         'Nhập số lượng giới hạn (bao nhiêu sản phẩm được bán với giá flash sale).'),
        ('Lưu và kích hoạt',
         'Nhấn "Lưu". Hệ thống tự động kích hoạt phiên khi đến giờ bắt đầu. '
         'Bạn cũng có thể kích hoạt thủ công bằng cách đổi trạng thái sang ACTIVE.'),
    ])

    items += section_title('Quản lý sản phẩm Flash Sale')
    fsale_data = [
        [Paragraph('Thao tác', ST['th']), Paragraph('Hướng dẫn', ST['th'])],
        [Paragraph('Xem danh sách', ST['td_b']),
         Paragraph('Trang Flash Sale hiển thị tất cả phiên: UPCOMING, ACTIVE, ENDED', ST['td'])],
        [Paragraph('Thêm sản phẩm', ST['td_b']),
         Paragraph('Mở phiên flash sale → Nhấn "Thêm sản phẩm" → Chọn và điền giá', ST['td'])],
        [Paragraph('Xóa sản phẩm', ST['td_b']),
         Paragraph('Trong phiên flash sale → Tìm sản phẩm → Nhấn icon xóa', ST['td'])],
        [Paragraph('Kết thúc sớm', ST['td_b']),
         Paragraph('Đổi trạng thái sang ENDED. Sản phẩm trở về giá bình thường ngay lập tức', ST['td'])],
        [Paragraph('Xem hiệu quả', ST['td_b']),
         Paragraph('Dashboard hiển thị doanh số từng phiên flash sale', ST['td'])],
    ]
    fsale_tbl = Table(fsale_data, colWidths=[3.5*cm, 13.5*cm])
    fsale_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(fsale_tbl)
    items.append(sp(8))
    items += note_box('Flash sale chỉ hiển thị khi trạng thái = ACTIVE và chưa hết thời gian. '
                      'Khi hết giờ, hệ thống tự động chuyển sang ENDED.', 'note')
    items += note_box('Nên lên lịch flash sale vào buổi tối (19:00–23:00) hoặc cuối tuần '
                      'khi lưu lượng khách hàng cao nhất.', 'tip')
    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 11 — FAQ
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_11():
    items = []
    items += chapter_header(11, 'CÂU HỎI THƯỜNG GẶP (FAQ)')

    faqs = [
        ('Tại sao sản phẩm tôi vừa thêm không hiển thị trên website?',
         'Sản phẩm mới tạo luôn ở trạng thái DRAFT. Bạn cần vào sửa sản phẩm, '
         'đổi trạng thái sang ACTIVE và nhấn Lưu thay đổi.'),
        ('Làm thế nào để sản phẩm xuất hiện trên trang chủ?',
         'Có 2 cách: (1) Bật "Sản phẩm nổi bật" trong tab Chi tiết — sản phẩm xuất hiện '
         'trong section "Sản phẩm nổi bật". (2) Sản phẩm thuộc danh mục nào thì tự động '
         'xuất hiện trong section danh mục đó trên trang chủ.'),
        ('Khách hàng phản ánh không thêm được vào giỏ hàng?',
         'Kiểm tra: (1) Tồn kho > 0. (2) Trạng thái = ACTIVE. '
         '(3) Sản phẩm không bật "Yêu cầu đơn thuốc" (nếu bật, khách không thể mua online).'),
        ('Tôi upload ảnh nhưng ảnh không hiện trong trang sản phẩm?',
         'Kiểm tra: (1) Nhấn F5 tải lại trang. (2) Đảm bảo đã nhấn "Lưu thay đổi" sau khi upload. '
         '(3) Nếu vẫn không thấy, liên hệ kỹ thuật — có thể dịch vụ lưu trữ ảnh đang gặp sự cố.'),
        ('Làm sao biết có đơn hàng mới?',
         'Dashboard hiển thị số đơn hàng PENDING cần xử lý. '
         'Bạn cũng có thể nhờ đội kỹ thuật cấu hình thêm thông báo email khi có đơn mới.'),
        ('Có thể đổi mật khẩu tài khoản quản trị không?',
         'Liên hệ đội ngũ hỗ trợ kỹ thuật BanThuocSi để đổi mật khẩu. '
         'Không tự ý thay đổi qua Django Admin để tránh lỗi hệ thống.'),
        ('Số lượng tồn kho không đúng thực tế, cách sửa?',
         'Vào sửa sản phẩm → Tab Giá & Kho → Sửa trường "Số lượng tồn kho" → Lưu. '
         'Hệ thống tự động trừ kho khi có đơn hàng và cộng lại khi hủy/trả hàng.'),
        ('Tại sao đánh giá của khách không hiển thị trên web?',
         'Đánh giá mới luôn ở trạng thái "Chưa duyệt". Cần vào menu Đánh giá → Duyệt → '
         'đánh giá mới hiển thị. Đây là cơ chế kiểm duyệt bắt buộc trong lĩnh vực dược.'),
        ('Có thể xem doanh thu theo từng sản phẩm không?',
         'Hiện tại Dashboard hiển thị sản phẩm bán chạy theo số lượng. '
         'Để xem báo cáo chi tiết hơn, liên hệ đội kỹ thuật để xuất dữ liệu.'),
        ('Hệ thống có hỗ trợ nhiều người dùng Admin cùng lúc không?',
         'Có. Mỗi nhân viên nên có tài khoản riêng. Liên hệ đội ngũ kỹ thuật '
         'để tạo thêm tài khoản với phân quyền phù hợp.'),
    ]

    for i, (q, a) in enumerate(faqs):
        q_tbl = Table([[
            Paragraph(f'Q{i+1}', ParagraphStyle('qn', fontName='DV-B', fontSize=10,
                              textColor=white, alignment=TA_CENTER)),
            Paragraph(q, ParagraphStyle('qt', fontName='DV-B', fontSize=10,
                              textColor=C['green_d'])),
        ]], colWidths=[0.8*cm, 16.2*cm])
        q_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (0,-1),  C['green']),
            ('BACKGROUND',    (1,0), (1,-1),  C['green_ll']),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING',   (0,0), (-1,-1), 8),
            ('LINEBELOW',     (0,0), (-1,-1), 0.5, C['green']),
        ]))
        a_tbl = Table([[
            Paragraph('', ST['body']),
            Paragraph(a, ST['body']),
        ]], colWidths=[0.8*cm, 16.2*cm])
        a_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C['white']),
            ('LINEBELOW',     (0,0), (-1,-1), 0.5, C['gray_200']),
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING',   (1,0), (1,-1),  8),
        ]))
        items.append(KeepTogether([q_tbl, a_tbl, sp(4)]))

    items.append(PageBreak())
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# CHƯƠNG 12 — LIÊN HỆ HỖ TRỢ
# ═══════════════════════════════════════════════════════════════════════════════

def chapter_12():
    items = []
    items += chapter_header(12, 'LIÊN HỆ HỖ TRỢ')
    items.append(Paragraph(
        'Đội ngũ hỗ trợ kỹ thuật BanThuocSi luôn sẵn sàng giúp đỡ khi bạn gặp khó khăn '
        'trong quá trình sử dụng hệ thống.', ST['body']))
    items.append(sp(10))

    contact_data = [
        [Paragraph('Kênh liên hệ', ST['th']),
         Paragraph('Thông tin', ST['th']),
         Paragraph('Thời gian hỗ trợ', ST['th'])],
        [Paragraph('Website', ST['td_b']),
         Paragraph('banthuocsi.vn', ST['td']),
         Paragraph('24/7', ST['td'])],
        [Paragraph('Email hỗ trợ', ST['td_b']),
         Paragraph('support@banthuocsi.vn', ST['td']),
         Paragraph('Phản hồi trong 4 giờ làm việc', ST['td'])],
        [Paragraph('Hotline', ST['td_b']),
         Paragraph('1800 xxxx (miễn phí)', ST['td']),
         Paragraph('8:00 – 18:00, Thứ 2 – Thứ 7', ST['td'])],
        [Paragraph('Zalo/Messenger', ST['td_b']),
         Paragraph('BanThuocSi Official', ST['td']),
         Paragraph('8:00 – 22:00, mỗi ngày', ST['td'])],
    ]
    contact_tbl = Table(contact_data, colWidths=[3.5*cm, 7*cm, 6.5*cm])
    contact_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  C['green_d']),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C['white'], C['gray_50']]),
        ('GRID',          (0,0), (-1,-1), 0.4, C['gray_200']),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ('LINEBELOW',     (0,0), (-1,0),  1.5, C['accent']),
    ]))
    items.append(contact_tbl)
    items.append(sp(14))

    items += note_box(
        'Khi liên hệ hỗ trợ, hãy cung cấp: tên tài khoản, mô tả vấn đề gặp phải, '
        'và nếu có lỗi thì chụp màn hình (screenshot) để được hỗ trợ nhanh nhất.', 'tip')

    items.append(sp(12))

    # Footer trang cuối
    footer_tbl = Table([[
        Paragraph(
            'Tài liệu này được soạn thảo bởi đội ngũ BanThuocSi. '
            'Phiên bản 1.0 — Năm 2026. Mọi thắc mắc về tài liệu, '
            'vui lòng liên hệ support@banthuocsi.vn.',
            ParagraphStyle('ft_txt', fontName='DV', fontSize=8.5,
                           textColor=C['gray_500'], alignment=TA_CENTER, leading=14)),
    ]], colWidths=[W_PAGE])
    footer_tbl.setStyle(TableStyle([
        ('TOPPADDING',    (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LINEABOVE',     (0,0), (-1,0),  0.5, C['gray_200']),
    ]))
    items.append(footer_tbl)
    return items

# ═══════════════════════════════════════════════════════════════════════════════
# HEADER / FOOTER MỖI TRANG
# ═══════════════════════════════════════════════════════════════════════════════

def add_page_elements(canvas, doc):
    canvas.saveState()
    w, h = A4

    # Header bar
    canvas.setFillColor(C['green'])
    canvas.rect(0, h - 1.3*cm, w, 1.3*cm, fill=1, stroke=0)

    # Header: accent stripe
    canvas.setFillColor(C['accent'])
    canvas.rect(0, h - 1.3*cm, 0.4*cm, 1.3*cm, fill=1, stroke=0)

    canvas.setFillColor(C['white'])
    canvas.setFont('DV-B', 9)
    canvas.drawString(1.0*cm, h - 0.82*cm, 'BanThuocSi')
    canvas.setFont('DV', 9)
    canvas.drawString(3.2*cm, h - 0.82*cm, '·  banthuocsi.vn')
    canvas.drawRightString(w - 1.2*cm, h - 0.82*cm, 'Hướng dẫn sử dụng hệ thống  ·  2026')

    # Footer bar
    canvas.setFillColor(C['gray_900'])
    canvas.rect(0, 0, w, 0.95*cm, fill=1, stroke=0)
    canvas.setFillColor(C['accent'])
    canvas.rect(0, 0.85*cm, w, 0.1*cm, fill=1, stroke=0)

    canvas.setFillColor(C['white'])
    canvas.setFont('DV', 8)
    canvas.drawCentredString(w/2, 0.32*cm, f'Trang {doc.page}')
    canvas.setFillColor(C['gray_500'])
    canvas.setFont('DV', 7.5)
    canvas.drawString(1.2*cm, 0.32*cm, 'BanThuocSi  ©  2026')
    canvas.drawRightString(w - 1.2*cm, 0.32*cm, 'Thuốc tốt  ·  Giá tốt  ·  Dịch vụ tốt')

    canvas.restoreState()

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2.2*cm,
        bottomMargin=1.6*cm,
    )

    story = []
    story += cover_page()
    story += toc_page()
    story += chapter_1()
    story += chapter_2()
    story += chapter_3()
    story += chapter_4()
    story += chapter_5()
    story += chapter_6()
    story += chapter_7()
    story += chapter_8()
    story += chapter_9()
    story += chapter_10()
    story += chapter_11()
    story += chapter_12()

    def first_page(canvas, doc):
        draw_cover(canvas, doc)

    doc.build(story, onFirstPage=first_page, onLaterPages=add_page_elements)
    size = os.path.getsize(OUTPUT) / 1024
    print(f'✅ Đã xuất PDF: {OUTPUT}')
    print(f'   Dung lượng: {size:.1f} KB')

if __name__ == '__main__':
    main()
