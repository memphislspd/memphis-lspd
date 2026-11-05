// components/Header.js
import { useRouter } from 'next/router';

export default function Header({ user }) {
  const router = useRouter();

  const navItems = [
    { label: 'Заявления', path: '/applications' },
    { label: 'Отделы', path: '/departments' },
    { label: 'Для сотрудников', path: '/hub' },
    { label: 'Реестр пропусков', path: '/passes' },
  ];

  return (
    <header style={{ 
      width: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', justifyContent: 'center' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', height: '72px', padding: '0 20px' }}>
        
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/start')}>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', fontFamily: "'Montserrat', sans-serif" }}>
            LSPD<span style={{ color: '#2563EB' }}>.</span>
          </div>
        </div>
        
        {/* Навигация */}
        <nav style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}>
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <span 
                key={item.path}
                onClick={() => router.push(item.path)} 
                style={{ 
                  cursor: 'pointer', 
                  color: isActive ? 'white' : '#9ca3af', 
                  borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                  paddingBottom: '24px', // Чтобы линия была ровно под шапкой
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = '#9ca3af' }}
              >
                {item.label}
              </span>
            );
          })}
        </nav>

        {/* Профиль */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{user?.username}</span>
          <button onClick={() => router.push('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #333', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </div>
    </header>
  );
}
