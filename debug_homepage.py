import requests
import re
import sys

try:
    print("Checking http://localhost:3000...")
    response = requests.get("http://localhost:3000", timeout=5)

    print(f"Status Code: {response.status_code}")
    print(f"Content Type: {response.headers.get('Content-Type')}")

    html = response.text
    print(f"\nLength of HTML: {len(html)} chars")

    # Check for new strings
    checks = [
        "The Universal Garage Door Index",
        "Try Instant-View",
        "bg-charcoal-deep",
        "font-outfit"
    ]

    found_all = True
    for check in checks:
        if check in html:
            print(f"✅ Found: '{check}'")
        else:
            print(f"❌ MISSING: '{check}'")
            found_all = False

    # Check for legacy strings that should be GONE
    legacy_checks = [
        "Mobile Garage Solutions",
        "Sophia Bennett"
    ]

    for check in legacy_checks:
        if check in html:
            print(f"❌ FOUND LEGACY ARTIFACT: '{check}'")
            found_all = False
        else:
            print(f"✅ Clean (Legacy '{check}' not found)")

    if not found_all:
        print("\n--- HTML DUMP (First 1000 chars) ---")
        print(html[:1000])
        sys.exit(1)

    print("\nSUCCESS: All new checks found and legacy content gone.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
