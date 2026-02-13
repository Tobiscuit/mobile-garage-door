import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3001/contact?type=repair")
            page.goto("http://localhost:3001/contact?type=repair")

            # Wait for key elements
            print("Waiting for 'Open Support Ticket'...")
            page.wait_for_selector("text=Open Support Ticket", timeout=10000)

            print("Waiting for 'Emergency (24/7)' button...")
            page.wait_for_selector("text=Emergency (24/7)", timeout=10000)

            # Wait a bit for layout to settle
            time.sleep(2)

            print("Taking screenshot...")
            page.screenshot(path="verification/contact_page.png")
            print("Screenshot saved to verification/contact_page.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
