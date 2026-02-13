import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: Request, context: { params: Promise<{ placeId: string }> }) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  const { placeId } = await context.params;
  const { searchParams } = new URL(request.url);
  const sessionToken = searchParams.get('sessionToken');

  if (!placeId) {
    return NextResponse.json({ error: 'Missing Place ID' }, { status: 400 });
  }

  try {
    // https://places.googleapis.com/v1/places/{placeId}
    // FieldMask is MANDATORY for New Places API to optimize costs and speed
    const fieldMask = 'id,formattedAddress,location,addressComponents,displayName';
    
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fieldMask}${sessionToken ? `&sessionToken=${sessionToken}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Places Details Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
