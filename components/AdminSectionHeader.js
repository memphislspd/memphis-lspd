import { useRouter } from 'next/router';

export default function AdminSectionHeader({ title, description, actions, showBack = true }) {
  const router = useRouter();

  return (
    <header style={{ marginBottom: '36px' }}>
      {showBack && (
        <button
          type="button"
          onClick={() => router.push('/admin')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            padding: '4px 0',
            background: 'transparent',
            color: '#91a0b5',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.06em',
            touchAction: 'manipulation',
          }}
        >
          ← НАЗАД В АДМИНКУ
        </button>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          minWidth: 0,
          margin: 0,
          color: '#f5f7fb',
          fontSize: 'clamp(28px, 5vw, 36px)',
          lineHeight: 1.12,
          fontWeight: '800',
          letterSpacing: '-1px',
          fontFamily: "'Space Grotesk', sans-serif",
          overflowWrap: 'anywhere',
        }}>
          {title}
        </h1>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>}
      </div>

      {description && (
        <p style={{
          margin: '10px 0 0',
          maxWidth: '760px',
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: 1.65,
        }}>
          {description}
        </p>
      )}
    </header>
  );
}
