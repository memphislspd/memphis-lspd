// components/Header.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ user }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Проверяем, является ли пользователь админом
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1100px', height: '80px', padding: '0 20px' }}>
        
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/start')}>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', fontFamily: "'Montserrat', sans-serif" }}>
            LSPD<span style={{ color: '#2563EB' }}>.</span>
          </div>
        </div>
        
        {/* Навигация */}
        <nav style={{ display: 'flex', gap: '40px', fontSize: '14px', fontWeight: '600', letterSpacing: '0.5px', color: '#9ca3af' }}>
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <span 
                key={item.path}
                onClick={() => router.push(item.path)} 
                style={{ cursor: 'pointer', color: isActive ? 'white' : '#9ca3af', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = '#9ca3af' }}
              >
                {item.label}
              </span>
            );
          })}
        </nav>

        {/* Профиль и Админка */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* Кнопка Админки (видна только админам) */}
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')} 
              style={{ 
                background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', 
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Админка
            </button>
          )}

          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{user?.username}</span>
          <button onClick={() => router.push('/profile')} style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #333', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
        
      </div>
    </header>
  );
}
