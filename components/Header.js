// components/Header.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ user }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const navItems = [
    { label: 'Заявления', path: '/applications' },
    { label: 'Отделы', path: '/departments' },
    { label: 'Для сотрудников', path: '/hub' },
    { label: 'Пропуска', path: '/passes' },
  ];

  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: '1533765326213222491',
      redirect_uri: 'https://memphis-lspd.vercel.app/api/auth',
      response_type: 'code',
      scope: 'identify guilds guilds.members.read',
      state: router.asPath || '/dashboard',
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  return (
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
        </nav>

        <div className="site-header__actions">
          {isAdmin && <button className="admin-link" onClick={() => router.push('/admin')}>Админка</button>}
          {user ? (
            <button className="profile-chip" onClick={() => router.push('/profile')} aria-label="Открыть профиль">
              <span>{user.username}</span>
              <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="" />
            </button>
          ) : <button className="header-login" onClick={handleLogin}>Войти ↗</button>}
        </div>
      </div>
    </header>
  );
}
