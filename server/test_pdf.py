import os
import sys
import django
from django.conf import settings
from django.template import Context, Template
from xhtml2pdf import pisa
from pathlib import Path

# Setup Django standalone
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

def fetch_resources(uri, rel):
    print(f"DEBUG: Processing URI: {uri}")
    path = ""
    try:
        if uri.startswith("/static/"):
            path = os.path.join(settings.BASE_DIR, 'static', uri.replace("/static/", ""))
        else:
            path = os.path.join(settings.BASE_DIR, 'static', uri)
        
        path = path.replace('/', os.sep)
        print(f"DEBUG: Resolved path: {path}")
        
        if not os.path.exists(path):
            print(f"DEBUG: Path does not exist: {path}")
            return None
        return path
    except Exception as e:
        print(f"DEBUG: Error: {e}")
        return None

def test_pdf():
    print("Testing PDF Generation...")
    
    # Simple HTML with Font
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @font-face {
                font-family: 'Arial';
                src: url('/static/fonts/arial.ttf');
            }
            body { font-family: 'Arial'; }
        </style>
    </head>
    <body>
        <p>Testing Vietnamese: Xin chào Việt Nam</p>
    </body>
    </html>
    """
    
    with open("test_output.pdf", "wb") as f:
        try:
            pisa_status = pisa.CreatePDF(html, dest=f, link_callback=fetch_resources)
        except Exception as e:
            print(f"CRITICAL ERROR: {e}")
            import traceback
            traceback.print_exc()
            return
    
    if pisa_status.err:
        print("PDF Generation FAILED")
    else:
        print("PDF Generation SUCCESS")

if __name__ == "__main__":
    test_pdf()
