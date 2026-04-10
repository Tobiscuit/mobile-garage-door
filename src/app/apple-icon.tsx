import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Apple recommends 180x180
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function Icon() {
  const logoData = await fetch(
    new URL('../../public/images/logos/logo.jpg', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const logoBase64 = Buffer.from(logoData).toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          borderRadius: '40px', // Apple icons gracefully border-radius
        }}
      >
        <img 
          src={`data:image/jpeg;base64,${logoBase64}`}
          width="120"
          height="120"
          style={{ borderRadius: '24px' }}
        />
      </div>
    ),
    { ...size }
  );
}
