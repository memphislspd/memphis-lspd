// components/Header.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ user }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedProfileAvatar, setSavedProfileAvatar] = useState('');

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
    if (!user?.id) {
      setSavedProfileAvatar('');
      return undefined;
    }
    let active = true;
    const storageKey = `memphis-lspd:profile-avatar:${user.id}`;
    let cachedAvatar = '';
    try {
      cachedAvatar = window.sessionStorage.getItem(storageKey) || '';
      if (cachedAvatar) setSavedProfileAvatar(cachedAvatar);
    } catch {}
    if (!cachedAvatar) {
      fetch('/api/profile/avatar')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (active && data?.avatarUrl) {
            setSavedProfileAvatar(data.avatarUrl);
            try { window.sessionStorage.setItem(storageKey, data.avatarUrl); } catch {}
          }
        })
        .catch(() => {});
    }
    const handleAvatarUpdate = event => {
      if (active && typeof event.detail === 'string') {
        setSavedProfileAvatar(event.detail);
        try { window.sessionStorage.setItem(storageKey, event.detail); } catch {}
      }
    };
    window.addEventListener('profile-avatar-updated', handleAvatarUpdate);
    return () => {
      active = false;
      window.removeEventListener('profile-avatar-updated', handleAvatarUpdate);
    };
  }, [user?.id]);

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
  const profileAvatar = savedProfileAvatar || user?.avatar_url || (user?.avatar && user?.id
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : null);

  const isApplicationsActive = router.pathname === '/applications' || router.pathname === '/complaint' || router.pathname.startsWith('/forms/');

  const navItems = [
    { label: 'Обращения', path: '/applications' },
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
    <>
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
                className={(router.pathname === item.path || (item.path === '/applications' && isApplicationsActive)) ? 'is-active' : ''}
                onClick={() => navigate(item.path)}
                aria-current={(router.pathname === item.path || (item.path === '/applications' && isApplicationsActive)) ? 'page' : undefined}
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
              <button className="header-login" onClick={handleLogin}>Войти <span aria-hidden="true">↗</span></button>
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

      <style jsx global>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(129, 156, 194, .16);
          background: rgba(7, 10, 16, .88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 10px 34px rgba(0, 0, 0, .12);
        }

        .site-header__inner {
          width: min(1440px, calc(100% - 64px));
          min-height: 84px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(185px, 1fr) auto minmax(185px, 1fr);
          align-items: center;
          gap: clamp(12px, 1.5vw, 24px);
        }

        .brand,
        .site-nav button,
        .profile-chip,
        .header-login,
        .header-logout,
        .mobile-menu-toggle {
          border: 0;
          background: transparent;
          cursor: pointer;
          font: inherit;
        }

        .brand {
          grid-column: 1;
          justify-self: start;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 0;
          color: var(--text, #f5f7fb);
          text-align: left;
        }

        .brand__mark {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(73, 145, 255, .58);
          border-radius: 12px;
          background: radial-gradient(circle at 30% 20%, rgba(63, 131, 248, .22), rgba(12, 22, 38, .92) 72%);
          color: #70adff;
          font-size: 19px;
          box-shadow: 0 0 28px rgba(63, 131, 248, .13);
        }

        .brand__text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          white-space: nowrap;
          letter-spacing: .16em;
          font-family: 'Space Grotesk', sans-serif;
        }

        .brand__text strong {
          color: #f3f6fc;
          font-size: 12px;
          font-weight: 700;
        }

        .brand__text small {
          color: #78879d;
          font: 8px 'DM Mono', monospace;
          letter-spacing: .18em;
        }

        .site-nav {
          grid-column: 2;
          justify-self: center;
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.35vw, 21px);
          padding: 0;
          border: 0;
          background: transparent;
        }

        .site-nav button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 84px;
          padding: 0 1px;
          color: #8795aa;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.25;
          white-space: nowrap;
          transition: color .18s ease;
        }

        .site-nav button::after {
          position: absolute;
          right: 0;
          bottom: 19px;
          left: 0;
          height: 2px;
          border-radius: 2px;
          background: #4b91ff;
          box-shadow: 0 0 12px rgba(75, 145, 255, .34);
          content: '';
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .2s ease;
        }

        .site-nav button:hover {
          color: #f4f7fc;
        }

        .site-nav button.is-active {
          color: #f4f7fc;
          font-weight: 600;
        }

        .site-nav button.is-active::after {
          transform: scaleX(1);
        }

        .site-nav .admin-nav-btn {
          margin-left: 4px;
          color: #91bdff;
        }

        .site-nav .admin-nav-btn:hover,
        .site-nav .admin-nav-btn.is-active {
          color: #d8e8ff;
        }

        .site-header__actions {
          grid-column: 3;
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .profile-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 180px;
          min-width: 0;
          padding: 0;
          color: #a6b3c5;
          font-size: 12px;
          transition: color .18s ease;
        }

        .profile-chip:hover {
          color: #fff;
        }

        .profile-chip span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-chip img {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(92, 150, 231, .42);
          border-radius: 50%;
          object-fit: cover;
        }

        .header-login {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 40px;
          padding: 0 17px;
          border-radius: 6px;
          background: linear-gradient(135deg, #367ce8, #2864c5);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          transition: background .18s ease, transform .18s ease, box-shadow .18s ease;
        }

        .header-login:hover {
          background: linear-gradient(135deg, #4b91ff, #3478df);
          box-shadow: 0 7px 22px rgba(49, 116, 222, .22);
          transform: translateY(-1px);
        }

        .header-login span {
          font-size: 15px;
          line-height: 1;
        }

        .header-logout {
          padding: 4px 0;
          color: #77869b;
          font-size: 11px;
          transition: color .18s ease;
        }

        .header-logout:hover {
          color: #f3a0a0;
        }

        .header-logout:disabled {
          cursor: wait;
          opacity: .6;
        }

        .mobile-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          padding: 0;
          color: #cbd7e7;
        }

        .mobile-menu-toggle:hover {
          color: #70adff;
        }

        .mobile-menu-toggle__icon {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 19px;
        }

        .mobile-menu-toggle__line {
          display: block;
          width: 19px;
          height: 2px;
          border-radius: 2px;
          background: currentColor;
          transition: transform .18s ease, opacity .18s ease;
        }

        .site-header--menu-open .mobile-menu-toggle__line:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .site-header--menu-open .mobile-menu-toggle__line--middle {
          opacity: 0;
        }

        .site-header--menu-open .mobile-menu-toggle__line:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }

        .site-nav button:focus-visible,
        .brand:focus-visible,
        .profile-chip:focus-visible,
        .header-login:focus-visible,
        .header-logout:focus-visible,
        .mobile-menu-toggle:focus-visible {
          outline: 2px solid #5b9cff;
          outline-offset: 4px;
        }

        @media (max-width: 1120px) {
          .site-header__inner {
            width: min(100% - 40px, 900px);
            min-height: 74px;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 0 14px;
            padding: 9px 0;
          }

          .brand {
            grid-column: 1;
            grid-row: 1;
          }

          .site-header__actions {
            grid-column: 2;
            grid-row: 1;
            gap: 12px;
          }

          .mobile-menu-toggle {
            display: inline-flex;
          }

          .site-nav {
            display: none;
            grid-column: 1 / -1;
            grid-row: 2;
            justify-self: stretch;
            width: 100%;
            margin-top: 7px;
            padding: 9px 0 2px;
            border-top: 1px solid rgba(129, 156, 194, .14);
          }

          .site-nav.site-nav--open {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 26px;
            row-gap: 0;
          }

          .site-nav button {
            justify-content: flex-start;
            min-width: 0;
            min-height: 47px;
            padding: 10px 2px;
            text-align: left;
            white-space: normal;
            font-size: 13px;
          }

          .site-nav button::after {
            right: auto;
            bottom: 5px;
            width: 34px;
            transform-origin: left center;
          }

          .site-nav button.is-active::after {
            transform: scaleX(1);
          }

          .site-nav .admin-nav-btn {
            margin-left: 0;
          }
        }

        @media (max-width: 560px) {
          .site-header__inner {
            width: calc(100% - 28px);
            min-height: 68px;
            gap: 0 8px;
          }

          .brand {
            gap: 0;
          }

          .brand__text {
            display: none;
          }

          .brand__mark {
            width: 39px;
            height: 39px;
            flex-basis: 39px;
          }

          .site-header__actions {
            gap: 9px;
          }

          .profile-chip {
            max-width: 36px;
            gap: 0;
          }

          .site-header__actions .profile-chip span {
            display: none;
          }

          .profile-chip img {
            flex-basis: 32px;
            width: 32px;
            height: 32px;
          }

          .header-login {
            min-height: 38px;
            padding: 0 13px;
            font-size: 11px;
          }

          .header-logout {
            display: none;
          }

          .mobile-menu-toggle {
            flex-basis: 40px;
            width: 40px;
            height: 40px;
          }

          .site-nav.site-nav--open {
            column-gap: 18px;
          }

          .site-nav button {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .site-nav button,
          .site-nav button::after,
          .header-login,
          .header-logout,
          .mobile-menu-toggle__line {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
