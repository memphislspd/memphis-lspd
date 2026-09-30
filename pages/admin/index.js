import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, bannedCount: 0, isLocked: false, lockTtl: 0 });
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      setIsAdmin(d.isAdmin);
      setLoading(false);
      if (d.isAdmin) {
        fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
      }
    });
  }, []);

  const handleUnlock = async () => {
    setUnlockLoading(true);
    try {
      const res = await fetch('/api/admin/reset-global-lock', { method: 'POST' });
      if (res.ok) {
        window.toast.success('Сайт разблокирован!');
        setStats(prev => ({ ...prev, isLocked: false, lockTtl: 0 }));
      } else {
        window.toast.error('Ошибка разблокировки');
      }
    } catch (e) {
      window.toast.error(e.message);
    }
    setUnlockLoading(false);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>
      <div style={{ width:'50px', height:'50px', border:'4px solid rgba(88,101,242,0.15)', borderTopColor:'#5865F2', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'rgba(255,0,0,0.05)', border:'1px solid rgba(255,0,0,0.3)', borderRadius:'16px', padding:'40px', textAlign:'center', maxWidth:'400px' }}>
        <div style={{ fontSize:'64px', marginBottom:'20px' }}>⛔</div>
        <h1 style={{ fontSize:'22px', marginBottom:'10px' }}>Нет доступа</h1>
        <p style={{ color:'#8b8ba7', marginBottom:'24px', fontSize:'14px' }}>Эта страница только для администрации</p>
        <button onClick={() => router.push('/dashboard')} style={{
          background:'rgba(88,101,242,0.15)', color:'#8ea1ff',
          border:'1px solid rgba(88,101,242,0.3)',
          padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:600
        }}>
          ← Вернуться на главную
        </button>
      </div>
    </div>
  );

  const cardStyle = {
    background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'16px',
    padding:'24px',
    position:'relative',
    overflow:'hidden'
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>

      {/* Sticky шапка */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '1000px', margin: '0 auto', padding: '16px 20px', gap: '16px'
        }}>
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'rgba(255,255,255,0.05)', color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 14px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ fontSize:'15px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'18px' }}>🛡️</span>
            Админ-панель
          </div>

          <div style={{ width:'80px' }} />
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Приветствие */}
        <div style={{ marginBottom:'24px' }}>
          <h1 style={{ fontSize:'24px', marginBottom:'6px' }}>Добро пожаловать, {user?.username}!</h1>
          <p style={{ color:'#8b8ba7', fontSize:'14px' }}>Управление сайтом и модерация</p>
        </div>

        {/* Статистика */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px', marginBottom:'24px' }}>
          <div style={{ ...cardStyle, textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color:'#5865F2' }}>{stats.today}</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'4px' }}>Сегодня заявок</div>
          </div>
          <div style={{ ...cardStyle, textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color:'#4CAF50' }}>{stats.total}</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'4px' }}>Всего заявок</div>
          </div>
          <div style={{ ...cardStyle, textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color:'#DC3545' }}>{stats.bannedCount}</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'4px' }}>Забанено</div>
          </div>
          <div style={{ ...cardStyle, textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color: stats.isLocked ? '#F44336' : '#4CAF50' }}>
              {stats.isLocked ? '🔴' : '🟢'}
            </div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'4px' }}>
              {stats.isLocked ? 'Сайт заблокирован' : 'Сайт работает'}
            </div>
          </div>
        </div>

        {/* Секции управления */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' }}>

          {/* Баны */}
          <div
            onClick={() => router.push('/admin/blacklist')}
            style={{ ...cardStyle, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ position:'absolute', top:0, left:0, width:'4px', height:'100%', background:'#DC3545' }} />
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🚫</div>
            <h3 style={{ fontSize:'16px', marginBottom:'6px', fontWeight:600 }}>Управление банами</h3>
            <p style={{ color:'#8b8ba7', fontSize:'13px', margin:0 }}>Список забаненных, разбан, сброс спам-лимитов</p>
          </div>

          {/* Все заявки */}
          <div
            onClick={() => router.push('/admin/requests')}
            style={{ ...cardStyle, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <div style={{ position:'absolute', top:0, left:0, width:'4px', height:'100%', background:'#5865F2' }} />
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>📥</div>
            <h3 style={{ fontSize:'16px', marginBottom:'6px', fontWeight:600 }}>Все заявки</h3>
            <p style={{ color:'#8b8ba7', fontSize:'13px', margin:0 }}>Список всех заявок с подсветкой старых</p>
          </div>

          {/* Разблокировка сайта */}
          <div style={{ ...cardStyle }}>
            <div style={{ position:'absolute', top:0, left:0, width:'4px', height:'100%', background:'#F44336' }} />
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔓</div>
            <h3 style={{ fontSize:'16px', marginBottom:'6px', fontWeight:600 }}>Разблокировка сайта</h3>
            <p style={{ color:'#8b8ba7', fontSize:'13px', marginBottom:'16px' }}>
              {stats.isLocked
                ? `Сайт заблокирован. Осталось: ${Math.ceil(stats.lockTtl / 60)} мин.`
                : 'Сайт работает нормально'}
            </p>
            <button
              onClick={handleUnlock}
              disabled={unlockLoading || !stats.isLocked}
              style={{
                width:'100%', padding:'10px',
                background: stats.isLocked ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.05)',
                color: stats.isLocked ? '#ff6b6b' : '#8b8ba7',
                border: `1px solid ${stats.isLocked ? 'rgba(244,67,54,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius:'8px', fontSize:'13px', fontWeight:600,
                cursor: (unlockLoading || !stats.isLocked) ? 'not-allowed' : 'pointer',
                opacity: (unlockLoading || !stats.isLocked) ? 0.5 : 1
              }}
            >
              {unlockLoading ? 'Разблокировка...' : 'Разблокировать сайт'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
