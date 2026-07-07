import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const sarabunRegular = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/sarabun@latest/latin-400-normal.woff',
).then((res) => res.arrayBuffer());

const sarabunBold = fetch(
  'https://cdn.jsdelivr.net/fontsource/fonts/sarabun@latest/latin-600-normal.woff',
).then((res) => res.arrayBuffer());

export default async function handler() {
  const [regular, bold] = await Promise.all([sarabunRegular, sarabunBold]);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          height: '100%',
          padding: '80px',
          background: '#fafafa',
          fontFamily: 'Sarabun, sans-serif',
        }}
      >
        {/* Mesh gradient blob */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '80%',
            borderRadius: '9999px',
            background:
              'radial-gradient(ellipse, rgba(121,40,202,0.08) 0%, transparent 70%), radial-gradient(ellipse, rgba(0,124,240,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '64px',
            border: '1px solid #ebebeb',
            background: '#ffffff',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#8f8f8f',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Financial Risk Management
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 600,
            color: '#171717',
            lineHeight: '56px',
            letterSpacing: '-2px',
            maxWidth: '900px',
            marginBottom: '16px',
          }}
        >
          ทั่วไปหรือ Deductible
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#4d4d4d',
            lineHeight: '32px',
            maxWidth: '700px',
            marginBottom: '40px',
          }}
        >
          เปรียบเทียบเบี้ยประกัน · วิเคราะห์ค่าเสียโอกาส · คำนวณผลตอบแทนทบต้น
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid #ebebeb',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              background: '#171717',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            H
          </div>
          <span style={{ fontSize: '18px', color: '#8f8f8f' }}>
            ssupawat/health-insurance-compare
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Sarabun',
          data: regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Sarabun',
          data: bold,
          weight: 600,
          style: 'normal',
        },
      ],
    },
  );
}
