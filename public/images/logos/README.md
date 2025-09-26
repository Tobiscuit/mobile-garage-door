# Logo Assets

Place your logo files in this directory with the following naming convention:

## Recommended Logo Files:

### Desktop Logo:
- **File**: `logo-desktop.png` or `logo-desktop.svg`
- **Recommended size**: 200x60px (or similar aspect ratio)
- **Format**: PNG (with transparency) or SVG (preferred)

### Mobile Logo:
- **File**: `logo-mobile.png` or `logo-mobile.svg`  
- **Recommended size**: 120x40px (or similar aspect ratio)
- **Format**: PNG (with transparency) or SVG (preferred)

## Alternative Naming:
You can also use:
- `logo.png` / `logo-mobile.png`
- `brand-logo.png` / `brand-logo-mobile.png`
- `company-logo.png` / `company-logo-mobile.png`

## Usage in Code:
The Header component will automatically detect and use these logos based on screen size:
- Desktop: Uses the desktop logo
- Mobile: Uses the mobile logo (smaller, optimized for mobile)

## File Formats:
- **SVG** (recommended): Scalable, crisp at any size, smaller file size
- **PNG**: Good for complex logos, supports transparency
- **JPG**: Not recommended for logos (no transparency support)
