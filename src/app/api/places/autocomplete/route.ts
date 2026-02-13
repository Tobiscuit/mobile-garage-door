import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  try {
    const { input, sessionToken } = await request.json();

    if (!input) {
      return NextResponse.json({ suggestions: [] });
    }

    // https://places.googleapis.com/v1/places:autocomplete
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ['US'], // Restrict to US
        sessionToken: sessionToken // Pass through session token for billing optimization
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Places Autocomplete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
