import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BlacklistPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blacklist, setBlacklist] = useState([]);
  const [resetId, setResetId] = useState('');
  const [message, setMessage] = useState('');
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

  const filtered = blacklist.filter(b => 
    !searchQuery || 
    b.id?.includes(searchQuery) || 
    b.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ip?.includes(searchQuery)
  );

  const inputStyle = {
    width:'100%', padding:'10px 14px',
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'8px', color:'white', fontSize:'14px',
    boxSizing:'border-box'
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
          <button 
            onClick={() => router.push('/admin')}
            style={{
              background: 'rgba(255,255,255,0.05)', color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 14px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ fontSize:'15px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'18px' }}>🚫</span>
            Управление банами
          </div>

          <div style={{ fontSize:'12px', color:'#8b8ba7', background:'rgba(255,255,255,0.05)', padding:'6px 12px', borderRadius:'8px', fontWeight:600 }}>
            {filtered.length}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Сброс спам-лимита */}
        <div style={{
          background: 'rgba(255,152,0,0.08)',
          border: '1px solid rgba(255,152,0,0.25)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, #FF9800, #FF980080, transparent)' }} />

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
            <div style={{ width:'4px', height:'18px', background:'#FF9800', borderRadius:'2px' }} />
            <h2 style={{ fontSize:'16px', margin:0, fontWeight:600 }}>🔄 Сброс спам-лимита</h2>
          </div>

          <p style={{ color:'#8b8ba7', fontSize:'13px', marginBottom:'16px' }}>
            Введите Discord ID пользователя чтобы сбросить его лимиты на отправку заявок
          </p>

          <div style={{ display:'flex', gap:'10px' }}>
            <input
              type="text"
              placeholder="Discord ID"
              value={resetId}
              onChange={(e) => setResetId(e.target.value)}
              style={{ ...inputStyle, flex:1 }}
            />
            <button onClick={resetSpam} style={{
              background:'rgba(255,152,0,0.15)',
              color:'#FFB74D',
              border:'1px solid rgba(255,152,0,0.3)',
              padding:'10px 20px',
              borderRadius:'8px',
              fontSize:'13px',
              fontWeight:600,
              cursor:'pointer',
              whiteSpace:'nowrap'
            }}>
              Сбросить
            </button>
          </div>
        </div>

        {/* Поиск */}
        <div style={{ marginBottom:'20px' }}>
          <input
            type="text"
            placeholder="🔍 Поиск по ID, имени или IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Список банов */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <div style={{ width:'4px', height:'18px', background:'#DC3545', borderRadius:'2px' }} />
          <h2 style={{ fontSize:'16px', margin:0, fontWeight:600 }}>📋 Список банов</h2>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '60px 30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>
              {blacklist.length === 0 ? '✨' : '🔍'}
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
              {blacklist.length === 0 ? 'Список банов пуст' : 'Ничего не найдено'}
            </h3>
            <p style={{ color: '#8b8ba7', fontSize: '13px', margin: 0 }}>
              {blacklist.length === 0 ? 'Все пользователи чистые' : 'Попробуйте изменить запрос'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtered.map(ban => (
              <div key={ban.id} style={{
                background:'rgba(255,0,0,0.05)',
                border:'1px solid rgba(255,0,0,0.25)',
                borderRadius:'14px',
                padding:'18px 20px',
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                gap:'16px',
                position:'relative',
                overflow:'hidden'
              }}>
                <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'3px', background:'#DC3545' }} />

                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:'15px', marginBottom:'6px', fontWeight:600, color:'white' }}>
                    {ban.username || 'Неизвестный'}
                  </h3>
                  <div style={{ fontSize:'12px', color:'#8b8ba7', display:'flex', flexDirection:'column', gap:'3px' }}>
                    <span>🆔 {ban.id}</span>
                    {ban.ip && <span>🌐 {ban.ip}</span>}
                    <span>📝 {ban.reason || 'Не указана'}</span>
                    <span>📅 {ban.date || 'Неизвестно'}</span>
                  </div>
                </div>

                <button onClick={() => unban(ban.id)} style={{
                  background:'rgba(76,175,80,0.15)',
                  color:'#4CAF50',
                  border:'1px solid rgba(76,175,80,0.3)',
                  padding:'10px 16px',
                  borderRadius:'8px',
                  fontSize:'12px',
                  fontWeight:600,
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  gap:'6px',
                  whiteSpace:'nowrap'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Разбанить
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
