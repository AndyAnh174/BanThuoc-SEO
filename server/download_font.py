import os
import urllib.request
import ssl

def download_font():
    url = "https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf"
    dest_dir = os.path.join(os.path.dirname(__file__), "static", "fonts")
    dest_file = os.path.join(dest_dir, "Roboto-Regular.ttf")

    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        print(f"Created directory: {dest_dir}")

    print(f"Downloading {url} to {dest_file}...")
    
    # Bypass SSL verification if needed (common in some dev envs)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    )

    try:
        with urllib.request.urlopen(req, context=ctx) as response, open(dest_file, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Download complete! File size: {len(data)} bytes")
    except Exception as e:
        print(f"Error downloading font: {e}")

if __name__ == "__main__":
    download_font()
