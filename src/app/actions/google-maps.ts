'use server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  addressComponents: any[];
}

/**
 * Fetches place predictions using the Google Places API (New)
 * Endpoint: https://places.googleapis.com/v1/places:autocomplete
 */
export async function getPlacePredictions(input: string): Promise<PlacePrediction[]> {
  if (!API_KEY) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
    return [];
  }

  if (!input || input.length < 3) return [];

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ['US'],
        // Optional: Add session token handling here if needed
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Places API Error:", errorText);
        return [];
    }

    const data = await response.json();
    
    if (!data.suggestions) return [];

    return data.suggestions.map((item: any) => {
        const prediction = item.placePrediction;
        return {
            placeId: prediction.placeId,
            mainText: prediction.structuredFormat?.mainText?.text || '',
            secondaryText: prediction.structuredFormat?.secondaryText?.text || '',
            description: prediction.text.text,
        };
    });

  } catch (error) {
    console.error("Failed to fetch place predictions:", error);
    return [];
  }
}

/**
 * Fetches place details using the Google Places API (New)
 * Endpoint: https://places.googleapis.com/v1/places/{placeId}
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!API_KEY) return null;

    try {
        // FieldMask is required for the new API
        const fields = 'id,formattedAddress,location,addressComponents';
        
        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
            },
        });

        if (!response.ok) {
            console.error("Places Details API Error:", await response.text());
            return null;
        }

        const data = await response.json();

        return {
            placeId: data.id,
            formattedAddress: data.formattedAddress,
            location: {
                lat: data.location.latitude,
                lng: data.location.longitude
            },
            addressComponents: data.addressComponents
        };

    } catch (error) {
        console.error("Failed to fetch place details:", error);
        return null;
    }
}
