// components/Skeleton.js

// Базовый блок-заглушка с анимацией (мерцание синим)
export function SkeletonBlock({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(63,131,248,0.1) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeletonShimmer 1.6s ease-in-out infinite',
      ...style
    }} />
  );
}

// Общая анимация (вставляется один раз на странице)
export function SkeletonStyles() {
  return (
    <style jsx global>{`
      @keyframes skeletonShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}

// ============================================
// 1. Скелетон для ГЛАВНОЙ (start)
// ============================================
export function SkeletonDashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)', overflow: 'hidden' }}>
      <SkeletonStyles />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '96px', marginBottom: '40px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonBlock width="40px" height="40px" borderRadius="10px" />
            <div>
              <SkeletonBlock width="130px" height="12px" style={{ marginBottom: '6px' }} />
              <SkeletonBlock width="90px" height="8px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <SkeletonBlock width="90px" height="42px" />
            <SkeletonBlock width="100px" height="42px" />
            <SkeletonBlock width="90px" height="42px" />
            <SkeletonBlock width="100px" height="42px" />
            <SkeletonBlock width="110px" height="42px" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <SkeletonBlock width="60px" height="14px" />
            <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
            <SkeletonBlock width="70px" height="36px" />
          </div>
        </div>

        {/* Главный экран (Hero) */}
        <div style={{ textAlign: 'center', padding: '60px 20px 100px' }}>
          <SkeletonBlock width="240px" height="26px" style={{ margin: '0 auto 30px' }} />
          <SkeletonBlock width="85%" maxWidth="900px" height="180px" borderRadius="8px" style={{ margin: '0 auto 30px' }} />
          <SkeletonBlock width="50%" maxWidth="500px" height="18px" style={{ margin: '0 auto 12px' }} />
          <SkeletonBlock width="40%" maxWidth="400px" height="18px" style={{ margin: '0 auto 40px' }} />
          <SkeletonBlock width="220px" height="52px" borderRadius="6px" style={{ margin: '0 auto' }} />
        </div>

        {/* Блок миссии */}
        <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)', padding: '60px 0' }}>
          <SkeletonBlock width="180px" height="16px" style={{ margin: '0 auto 30px' }} />
          <SkeletonBlock width="100%" maxWidth="800px" height="80px" style={{ margin: '0 auto 16px' }} />
          <SkeletonBlock width="100%" maxWidth="800px" height="40px" style={{ margin: '0 auto' }} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. Скелетон для СПИСКОВ-ТЕРМИНАЛОВ (hub, applications)
// ============================================
export function SkeletonList({ rows = 5 }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)' }}>
      <SkeletonStyles />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '96px', marginBottom: '40px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <SkeletonBlock width="180px" height="40px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} width="90px" height="42px" />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <SkeletonBlock width="60px" height="14px" />
            <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
          </div>
        </div>

        {/* Заголовок страницы */}
        <SkeletonBlock width="300px" height="36px" style={{ marginBottom: '12px' }} />
        <SkeletonBlock width="450px" height="16px" style={{ marginBottom: '40px' }} />

        {/* Терминальный блок со списком */}
        <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
          {/* Шапка терминала */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
            <SkeletonBlock width="250px" height="14px" />
            <SkeletonBlock width="60px" height="14px" />
          </div>

          {/* Строки */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '24px', borderBottom: i !== rows - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none', gap: '20px' }}>
              <SkeletonBlock width="50px" height="14px" />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width="40%" height="16px" style={{ marginBottom: '8px' }} />
                <SkeletonBlock width="60%" height="12px" />
              </div>
              <SkeletonBlock width="70px" height="26px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. Скелетон для ТАБЛИЦ (passes)
// ============================================
export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)' }}>
      <SkeletonStyles />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '96px', marginBottom: '40px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <SkeletonBlock width="180px" height="40px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} width="90px" height="42px" />)}
          </div>
          <SkeletonBlock width="140px" height="36px" />
        </div>

        {/* Заголовок */}
        <SkeletonBlock width="320px" height="36px" style={{ marginBottom: '12px' }} />
        <SkeletonBlock width="480px" height="16px" style={{ marginBottom: '40px' }} />

        {/* Таблица */}
        <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between' }}>
            <SkeletonBlock width="250px" height="14px" />
            <SkeletonBlock width="90px" height="14px" />
          </div>
          
          {/* Заголовки колонок */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '16px 20px', gap: '15px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} height="12px" />)}
          </div>

          {/* Строки */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '18px 20px', gap: '15px', borderBottom: i !== rows - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none' }}>
              {[1, 2, 3, 4, 5].map(j => <SkeletonBlock key={j} height="16px" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. Скелетон для СЕТКИ КАРТОЧЕК (admin, departments)
// ============================================
export function SkeletonGrid({ cards = 6 }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)' }}>
      <SkeletonStyles />
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '96px', marginBottom: '40px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
          <SkeletonBlock width="180px" height="40px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} width="90px" height="42px" />)}
          </div>
          <SkeletonBlock width="140px" height="36px" />
        </div>

        {/* Заголовок */}
        <SkeletonBlock width="280px" height="36px" style={{ marginBottom: '12px' }} />
        <SkeletonBlock width="420px" height="16px" style={{ marginBottom: '40px' }} />

        {/* Сетка карточек */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '12px', padding: '24px', minHeight: '160px' }}>
              <SkeletonBlock width="40px" height="40px" borderRadius="8px" style={{ marginBottom: '20px' }} />
              <SkeletonBlock width="70%" height="20px" style={{ marginBottom: '12px' }} />
              <SkeletonBlock width="90%" height="14px" style={{ marginBottom: '8px' }} />
              <SkeletonBlock width="60%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
