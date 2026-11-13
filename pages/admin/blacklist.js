// pages/admin/blacklist.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminSectionHeader from '../../components/AdminSectionHeader';

export default function BlacklistPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blacklist, setBlacklist] = useState([]);
  const [resetId, setResetId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      setIsAdmin(d.isAdmin);
      if (d.isAdmin) {
        fetch('/api/admin/blacklist')
          .then(r => r.json())
          .then(data => {
            if (data.blacklist) setBlacklist(data.blacklist);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const unban = async (userId) => {
    const res = await fetch('/api/admin/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unban', userId })
    });
    if (res.ok) {
      setBlacklist(blacklist.filter(b => b.id !== userId));
      window.toast.success('Пользователь разбанен');
    } else {
      window.toast.error('Ошибка разбана');
    }
  };

  const resetSpam = async () => {
    if (!resetId) {
      window.toast.error('Введите Discord ID');
      return;
    }
    const res = await fetch('/api/admin/reset-spam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: resetId })
    });
    const data = await res.json();
    if (res.ok) {
      window.toast.success(data.message || 'Спам-лимит сброшен');
      setResetId('');
    } else {
      window.toast.error(data.error || 'Ошибка');
    }
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  if (!isAdmin) {
    return (
      <PageLayout user={user}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ background: 'rgba(255, 38, 64, 0.05)', border: '1px solid #ff2640', padding: '50px', borderRadius: '4px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 40px rgba(255, 38, 64, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⛔</div>
            <h1 style={{ color: '#ff2640', fontSize: '32px', margin: '0 0 16px 0', fontWeight: '900', letterSpacing: '2px', fontFamily: "'Space Grotesk', sans-serif" }}>ACCESS DENIED</h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px', lineHeight: 1.6 }}>У вас недостаточно прав для доступа к этому разделу.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const filtered = blacklist.filter(b => 
    !searchQuery || 
    b.id?.includes(searchQuery) || 
    b.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ip?.includes(searchQuery)
  );

  // Общие стили
  const panelStyle = { background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' };
  const panelHeaderStyle = { padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--blue)', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' };
  const inputStyle = { width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148, 163, 184, 0.2)', color: 'white', fontSize: '14px', borderRadius: '4px', fontFamily: "'DM Mono', monospace", boxSizing: 'border-box', outline: 'none' };

  return (
    <PageLayout user={user}>
      <AdminSectionHeader title="Управление банами" description="Модерация, сброс лимитов и черный список." />

      {/* БЛОК: СБРОС СПАМ-ЛИМИТА */}
      <div style={panelStyle}>
        <div style={{ ...panelHeaderStyle, color: '#FF9800' }}>
          <span>[ СБРОС СПАМ-ЛИМИТА ]</span>
        </div>
        <div style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="DISCORD ID"
            value={resetId}
            onChange={(e) => setResetId(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 250px' }}
          />
          <button onClick={resetSpam} style={{
            padding: '12px 24px', background: 'rgba(255, 152, 0, 0.1)', color: '#FF9800',
            border: '1px solid rgba(255, 152, 0, 0.3)', borderRadius: '4px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '12px', fontFamily: "'DM Mono', monospace", transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 152, 0, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 152, 0, 0.1)'}
          >
            [ СБРОСИТЬ ЛИМИТЫ ]
          </button>
        </div>
      </div>

      {/* ПОИСК */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="[ ПОИСК ПО ID, ИМЕНИ ИЛИ IP ]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* СПИСОК БАНОВ */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <span>[ СПИСОК ЗАБЛОКИРОВАННЫХ ]</span>
          <span style={{ color: '#7f8a9a' }}>ЗАПИСЕЙ: {filtered.length}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
            {blacklist.length === 0 ? '[ СПИСОК БАНОВ ПУСТ ]' : '[ НИЧЕГО НЕ НАЙДЕНО ]'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(ban => (
              <div key={ban.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px', borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 38, 64, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '6px' }}>
                    {ban.username || 'Неизвестный'}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9ca3af', fontFamily: "'DM Mono', monospace", flexWrap: 'wrap' }}>
                    <span>ID: <span style={{ color: 'white' }}>{ban.id}</span></span>
                    {ban.ip && <span>IP: <span style={{ color: 'white' }}>{ban.ip}</span></span>}
                    <span>ПРИЧИНА: <span style={{ color: '#ff2640' }}>{ban.reason || 'Не указана'}</span></span>
                    <span>ДАТА: {ban.date || 'Неизвестно'}</span>
                  </div>
                </div>

                <button onClick={() => unban(ban.id)} style={{
                  background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50',
                  border: '1px solid rgba(76, 175, 80, 0.3)', padding: '8px 16px',
                  borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                  cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                  whiteSpace: 'nowrap', marginLeft: '20px', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)'}
                >
                  [ РАЗБАНИТЬ ]
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
