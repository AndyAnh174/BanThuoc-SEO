from playwright.sync_api import sync_playwright
import os

def test_pdf():
    print("Starting PDF generation test...")
    try:
        with sync_playwright() as p:
            print("Launching browser...")
            # Try with and without sandbox if needed, but start standard
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page()
            print("Setting content...")
            page.set_content("<html><body><h1>Hello World</h1></body></html>")
            print("Generating PDF...")
            output_path = "/app/media/test_output.pdf"
            page.pdf(path=output_path)
            print(f"PDF generated successfully at {output_path}")
            browser.close()
            
            if os.path.exists(output_path):
                print("Confirmed file exists.")
                os.remove(output_path)
            else:
                print("File not found after generation.")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pdf()
