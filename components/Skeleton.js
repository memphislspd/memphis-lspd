// components/Skeleton.js

// Базовый мерцающий блок
export function SkeletonBlock({ width = '100%', height = '16px', borderRadius = '4px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(63,131,248,0.15) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeletonShimmer 1.5s ease-in-out infinite',
      ...style
    }} />
  );
}

// Шапка (общая для всех страниц)
export function SkeletonHeader() {
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      height: '96px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', 
      marginBottom: '40px', padding: '0 20px', maxWidth: '1180px', margin: '0 auto 40px'
    }}>
      {/* Логотип */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SkeletonBlock width="40px" height="40px" borderRadius="10px" />
        <div>
          <SkeletonBlock width="120px" height="10px" style={{ marginBottom: '6px' }} />
          <SkeletonBlock width="80px" height="8px" />
        </div>
      </div>
      {/* Навигация */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} width="80px" height="36px" />)}
      </div>
      {/* Профиль */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <SkeletonBlock width="60px" height="12px" />
        <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
      </div>
    </div>
  );
}

// Общий контейнер для скелетонов
function SkeletonLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)', overflow: 'hidden' }}>
      <style jsx global>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <SkeletonHeader />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 20px' }}>
        {children}
      </div>
    </div>
  );
}

// 1. Скелетон для списков (hub, applications)
export function SkeletonList({ rows = 5 }) {
  return (
    <SkeletonLayout>
      <SkeletonBlock width="300px" height="36px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="450px" height="16px" style={{ marginBottom: '40px' }} />

      <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBlock width="200px" height="12px" />
          <SkeletonBlock width="40px" height="12px" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: i !== rows - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none', gap: '20px' }}>
            <SkeletonBlock width="40px" height="14px" />
            <div style={{ flex: 1 }}>
              <SkeletonBlock width="40%" height="16px" style={{ marginBottom: '6px' }} />
              <SkeletonBlock width="60%" height="12px" />
            </div>
            <SkeletonBlock width="60px" height="24px" />
          </div>
        ))}
      </div>
    </SkeletonLayout>
  );
}

// 2. Скелетон для сетки карточек (departments)
export function SkeletonGrid({ cards = 6 }) {
  return (
    <SkeletonLayout>
      <SkeletonBlock width="280px" height="36px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="420px" height="16px" style={{ marginBottom: '40px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '4px', padding: '24px', minHeight: '200px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <SkeletonBlock width="50px" height="50px" />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width="70%" height="18px" style={{ marginBottom: '8px' }} />
                <SkeletonBlock width="100%" height="12px" style={{ marginBottom: '4px' }} />
                <SkeletonBlock width="80%" height="12px" />
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <SkeletonBlock width="100%" height="30px" style={{ marginBottom: '8px' }} />
              <SkeletonBlock width="100%" height="30px" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonLayout>
  );
}

// 3. Скелетон для профиля (две колонки)
export function SkeletonProfile() {
  return (
    <SkeletonLayout>
      <SkeletonBlock width="250px" height="36px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="350px" height="16px" style={{ marginBottom: '40px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Левая колонка (ID-карта) */}
        <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', padding: '40px 20px', textAlign: 'center' }}>
          <SkeletonBlock width="120px" height="120px" borderRadius="50%" style={{ margin: '0 auto 24px' }} />
          <SkeletonBlock width="60%" height="24px" style={{ margin: '0 auto 8px' }} />
          <SkeletonBlock width="40%" height="14px" style={{ margin: '0 auto 24px' }} />
          <SkeletonBlock width="100%" height="42px" />
        </div>
        {/* Правая колонка (Данные) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', padding: '24px' }}>
            <SkeletonBlock width="150px" height="12px" style={{ marginBottom: '16px' }} />
            <SkeletonBlock width="100%" height="50px" />
          </div>
          <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', padding: '24px' }}>
            <SkeletonBlock width="150px" height="12px" style={{ marginBottom: '16px' }} />
            <SkeletonBlock width="100%" height="50px" />
          </div>
        </div>
      </div>
    </SkeletonLayout>
  );
}

// 4. Скелетон для таблицы (passes)
export function SkeletonTable({ rows = 5 }) {
  return (
    <SkeletonLayout>
      <SkeletonBlock width="300px" height="36px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="450px" height="16px" style={{ marginBottom: '40px' }} />

      <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBlock width="200px" height="12px" />
          <SkeletonBlock width="80px" height="12px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '16px 20px', gap: '15px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} height="12px" />)}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '18px 20px', gap: '15px', borderBottom: i !== rows - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none' }}>
            {[1, 2, 3, 4, 5].map(j => <SkeletonBlock key={j} height="16px" />)}
          </div>
        ))}
      </div>
    </SkeletonLayout>
  );
}
