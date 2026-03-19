/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key).
 * Used to convert customer addresses to lat/lng for tracking ETA.
 */

interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocode an address string to lat/lng coordinates.
 * Uses Nominatim with a Houston, TX bias for better local results.
 * Returns null if geocoding fails (non-blocking — tracking still works with defaults).
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    // Append Houston TX if not already present for better local matching
    const query = /houston|tx|texas/i.test(address)
      ? address
      : `${address}, Houston, TX`;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'us');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MobilGarageDoor/1.0 (mobilgaragedoor.com)',
      },
    });

    if (!res.ok) {
      console.warn('[Geocode] Nominatim returned', res.status);
      return null;
    }

    const results = await res.json() as Array<{ lat: string; lon: string }>;

    if (results.length === 0) {
      console.warn('[Geocode] No results for:', address);
      return null;
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng };
  } catch (err) {
    console.warn('[Geocode] Failed:', err);
    return null;
  }
}
