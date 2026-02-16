import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const signOutUrl = new URL('/api/auth/sign-out', request.url);

  const signOutResponse = await fetch(signOutUrl, {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  });

  const response = NextResponse.redirect(new URL('/login', request.url));

  const getSetCookie = (signOutResponse.headers as Headers & {
    getSetCookie?: () => string[];
  }).getSetCookie;

  if (typeof getSetCookie === 'function') {
    for (const setCookie of getSetCookie.call(signOutResponse.headers)) {
      response.headers.append('set-cookie', setCookie);
    }
  } else {
    const setCookie = signOutResponse.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
  }

  return response;
}
