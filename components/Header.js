// components/Header.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch'; // <-- Импортируем поиск

export default function Header({ user }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // <-- Стейт для поиска

  // Проверка на админа
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let active = true;
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => { if (active) setIsAdmin(Boolean(data.isAdmin)); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, [user]);

  // Слушатель Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const profileName = user?.global_name || user?.username || 'Профиль';
  const profileAvatar = user?.avatar_url || (user?.avatar && user?.id
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : null);

  const navItems = [
    { label: 'Заявления', path: '/applications' },
    { label: 'Отделы', path: '/departments' },
    { label: 'Для сотрудников', path: '/hub' },
    { label: 'Пропуска', path: '/passes' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await fetch('/api/logout', { method: 'POST' }); } 
    finally { router.replace('/start'); }
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <button className="brand" onClick={() => router.push('/start')} aria-label="LSPD — на главную">
            <span className="brand__mark">◈</span>
            <span className="brand__text"><strong>LOS SANTOS</strong><small>POLICE DEPARTMENT</small></span>
          </button>

          <nav className="site-nav" aria-label="Основная навигация">
            <button className={router.pathname === '/start' ? 'is-active' : ''} onClick={() => router.push('/start')}>Главная</button>
            {navItems.map(item => (
              <button key={item.path} className={router.pathname === item.path ? 'is-active' : ''} onClick={() => router.push(item.path)}>{item.label}</button>
            ))}
            
            {/* Кнопка поиска */}
            <button className="search-trigger" onClick={() => setIsSearchOpen(true)}>
              <span style={{ fontSize: '14px' }}>🔍</span> Поиск <kbd>Ctrl K</kbd>
            </button>

            {isAdmin && (
              <button className={`admin-nav-btn ${router.pathname.startsWith('/admin') ? 'is-active' : ''}`} onClick={() => router.push('/admin')}>Админка</button>
            )}
          </nav>

          <div className="site-header__actions">
            {user ? (
              <button className="profile-chip" onClick={() => router.push('/profile')}>
                <span>{profileName}</span>
                {profileAvatar && <img src={profileAvatar} alt="" />}
              </button>
            ) : <button className="header-login" onClick={() => router.push('/start')}>Войти ↗</button>}
            
            {user && (
              <button className="header-logout" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Выход...' : 'Выйти'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Рендерим модалку поиска */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
