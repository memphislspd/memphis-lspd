import { useRouter } from 'next/router';

/**
 * Универсальная обёртка для всех форм
 * 
 * @param {string} title - заголовок (например, "Запрос на повышение")
 * @param {string} icon - эмодзи (например, "📈")
 * @param {string} accent - цвет полоски и кнопок (например, "#4CAF50")
 * @param {ReactNode} children - содержимое формы
 * @param {string} backTo - куда вернуться (по умолчанию "/dashboard")
 */
export default function FormShell({ 
  title, 
  icon, 
  accent = '#5865F2', 
  children, 
  backTo = '/dashboard' 
}) {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', 
      color: 'white' 
    }}>

      {/* Sticky шапка */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '700px',
          margin: '0 auto',
          padding: '16px 20px',
          gap: '16px'
        }}>
          <button 
            onClick={() => router.push(backTo)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ 
            fontSize: '15px', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'white'
          }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            {title}
          </div>

          <div style={{ width: '80px' }} />
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Градиентная полоска сверху */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '3px',
            background: `linear-gradient(90deg, ${accent}, ${accent}80, transparent)`
          }} />

          {children}
        </div>
      </div>
    </div>
  );
}
