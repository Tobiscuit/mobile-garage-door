import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Mobil Garage Door Settings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Use absolute URL using headers x-forwarded-host if needed, or fallback.
  // Actually, wait, fetching local URLs in ImageResponse usually requires
  // the full canonical base URL or fetching via import.meta.url
  
  const bgData = await fetch(
    new URL('../../public/images/social/og-bg.png', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const logoData = await fetch(
    new URL('../../public/images/logos/logo.jpg', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const bgBase64 = Buffer.from(bgData).toString('base64');
  const logoBase64 = Buffer.from(logoData).toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '64px',
          backgroundImage: `url("data:image/png;base64,${bgBase64}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Dark overlay to ensure text contrast */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.6), rgba(15,23,42,0.1))',
          }}
        />

        <div style={{ display: 'flex', position: 'relative', zIndex: 10, width: '100%', height: '100%', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'auto' }}>
            <img 
              src={`data:image/jpeg;base64,${logoBase64}`}
              width="100" 
              height="100"
              style={{ borderRadius: '16px', marginRight: '24px' }}
            />
            <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              MobilGarageDoor.com
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: '32px', width: '70%' }}>
            <h1 style={{ fontSize: '72px', color: 'white', fontWeight: '900', lineHeight: 1.1, margin: 0, letterSpacing: '-0.03em' }}>
              Your Trusted Partner for Garage Doors
            </h1>
            <p style={{ fontSize: '32px', color: '#cbd5e1', marginTop: '24px', lineHeight: 1.4 }}>
              Premium mobile service, dispatch ready. Experience seamless repairs and installations across the metro area.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#38bdf8', fontSize: '28px', fontWeight: '700' }}>
            Get Started Now <span style={{ marginLeft: '12px', fontSize: '36px' }}>&rarr;</span>
          </div>

        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
