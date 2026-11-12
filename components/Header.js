// components/Header.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ user }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let active = true;
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => {
        if (active) setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const closeMenu = () => setIsMenuOpen(false);
    router.events.on('routeChangeStart', closeMenu);
    return () => router.events.off('routeChangeStart', closeMenu);
  }, [router.events]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

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

  const navigate = path => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      router.replace('/start');
    }
  };

  const handleLogin = () => {
    setIsMenuOpen(false);
    const returnTo = router.asPath || '/start';
    window.location.href = `/api/auth/start?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <header className={isMenuOpen ? 'site-header site-header--menu-open' : 'site-header'}>
      <div className="site-header__inner">
        <button
          className="brand"
          onClick={() => navigate('/start')}
          aria-label="LSPD — на главную"
        >
          <span className="brand__mark" aria-hidden="true">◈</span>
          <span className="brand__text">
            <strong>LOS SANTOS</strong>
            <small>POLICE DEPARTMENT</small>
          </span>
        </button>

        <nav
          className={isMenuOpen ? 'site-nav site-nav--open' : 'site-nav'}
          id="primary-navigation"
          aria-label="Основная навигация"
        >
          <button
            className={router.pathname === '/start' ? 'is-active' : ''}
            onClick={() => navigate('/start')}
            aria-current={router.pathname === '/start' ? 'page' : undefined}
          >
            Главная
          </button>

          {navItems.map(item => (
            <button
              key={item.path}
              className={router.pathname === item.path ? 'is-active' : ''}
              onClick={() => navigate(item.path)}
              aria-current={router.pathname === item.path ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}

          {isAdmin && (
            <button
              className={`admin-nav-btn ${router.pathname.startsWith('/admin') ? 'is-active' : ''}`}
              onClick={() => navigate('/admin')}
              aria-current={router.pathname.startsWith('/admin') ? 'page' : undefined}
            >
              Админка
            </button>
          )}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <button
              className="profile-chip"
              onClick={() => navigate('/profile')}
              aria-label="Открыть профиль"
              title={profileName}
            >
              <span>{profileName}</span>
              {profileAvatar && <img src={profileAvatar} alt="" />}
            </button>
          ) : (
            <button className="header-login" onClick={handleLogin}>Войти ↗</button>
          )}

          {user && (
            <button
              className="header-logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Выйти из аккаунта"
            >
              {isLoggingOut ? 'Выход...' : 'Выйти'}
            </button>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(open => !open)}
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            <span className="mobile-menu-toggle__icon" aria-hidden="true">
              <span className="mobile-menu-toggle__line" />
              <span className="mobile-menu-toggle__line mobile-menu-toggle__line--middle" />
              <span className="mobile-menu-toggle__line" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
