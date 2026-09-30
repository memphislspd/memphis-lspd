import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TYPE_ICONS = {
  promotion: { icon: '📈', label: 'Повышение', color: '#4CAF50' },
  transfer: { icon: '🔄', label: 'Перевод', color: '#2196F3' },
  report: { icon: '📋', label: 'Отчёт', color: '#FF9800' },
  highrank: { icon: '🌟', label: 'Хай Ранги', color: '#FF69B4' },
  resignation: { icon: '🚪', label: 'Увольнение', color: '#DC3545' },
  reinstatement: { icon: '🔄', label: 'Восстановление', color: '#9C27B0' },
  'transfer-to-lspd': { icon: '🏛️', label: 'Перевод в LSPD', color: '#00BCD4' },
  hiring: { icon: '📝', label: 'Трудоустройство', color: '#4CAF50' },
  'weapon-request': { icon: '🔫', label: 'Вооружение', color: '#FF5722' },
  leave: { icon: '🏖️', label: 'Отпуск', color: '#00BCD4' },
  premium: { icon: '🎯', label: 'Премия', color: '#FFD700' },
  complaint: { icon: '🚨', label: 'Жалоба', color: '#FF0000' }
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all | old | new

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      setIsAdmin(d.isAdmin);
      if (d.isAdmin) {
        loadSubmissions();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadSubmissions = () => {
    fetch('/api/admin/requests')
      .then(r => r.json())
      .then(d => {
        if (d.submissions) setSubmissions(d.submissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markProcessed = async (id) => {
    const res = await fetch('/api/admin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'process' })
    });
    if (res.ok) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, processed: true, isOld: false } : s));
      window.toast.success('Отмечено обработанным');
    } else {
      window.toast.error('Ошибка');
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
        <button onClick={() => router.push('/dashboard')} style={{
          background:'rgba(88,101,242,0.15)', color:'#8ea1ff',
          border:'1px solid rgba(88,101,242,0.3)',
          padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:600, marginTop:'20px'
        }}>
          ← На главную
        </button>
      </div>
    </div>
  );

  const filtered = submissions.filter(s => {
    if (filter === 'old') return s.isOld && !s.processed;
    if (filter === 'new') return !s.isOld && !s.processed;
    return true;
  });

  const oldCount = submissions.filter(s => s.isOld && !s.processed).length;

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
          <button onClick={() => router.push('/admin')} style={{
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
            <span style={{ fontSize:'18px' }}>📥</span>
            Все заявки
          </div>

          {oldCount > 0 ? (
            <div style={{ background:'rgba(220,53,69,0.15)', color:'#ff6b6b', border:'1px solid rgba(220,53,69,0.3)', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:600 }}>
              🔴 {oldCount} старых
            </div>
          ) : (
            <div style={{ fontSize:'12px', color:'#8b8ba7', background:'rgba(255,255,255,0.05)', padding:'6px 12px', borderRadius:'8px', fontWeight:600 }}>
              {filtered.length}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Фильтры */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
          {[
            { id: 'all', label: '📁 Все', count: submissions.length },
            { id: 'old', label: '🔴 Старые', count: submissions.filter(s => s.isOld && !s.processed).length },
            { id: 'new', label: '🟢 Новые', count: submissions.filter(s => !s.isOld && !s.processed).length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'rgba(88,101,242,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f.id ? 'rgba(88,101,242,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f.id ? 'white' : '#8b8ba7',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {f.label}
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Список */}
        {filtered.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '60px 30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Пусто</h3>
            <p style={{ color: '#8b8ba7', fontSize: '13px', margin: 0 }}>
              {filter === 'old' ? 'Нет старых необработанных заявок' : 'Нет заявок'}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtered.map((s, i) => {
              const meta = TYPE_ICONS[s.type] || { icon: '📄', label: 'Заявка', color: '#5865F2' };
              const isHighlighted = s.isOld && !s.processed;
              
              return (
                <div
                  key={s.id || i}
                  style={{
                    background: isHighlighted ? 'rgba(220,53,69,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isHighlighted ? 'rgba(220,53,69,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `cardFadeIn 0.3s ease ${i * 0.03}s both`
                  }}
                >
                  {/* Полоска слева */}
                  <div style={{
                    position:'absolute', top:0, left:0, bottom:0, width:'3px',
                    background: isHighlighted ? '#DC3545' : meta.color
                  }} />

                  {/* Иконка */}
                  <div style={{
                    width:'44px', height:'44px', minWidth:'44px',
                    borderRadius:'12px',
                    background: meta.color + '15',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'22px'
                  }}>
                    {meta.icon}
                  </div>

                  {/* Инфа */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:600, color:'white', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.title || meta.label}
                    </div>
                    <div style={{ fontSize:'12px', color:'#8b8ba7', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                      <span>👤 {s.authorName}</span>
                      <span>🆔 {s.authorId}</span>
                      <span>🕐 {s.ageHours}ч назад</span>
                      {s.processed && <span style={{ color:'#4CAF50' }}>✓ обработано</span>}
                    </div>
                  </div>

                  {/* Кнопки */}
                  {!s.processed && (
                    <button
                      onClick={() => markProcessed(s.id)}
                      style={{
                        background:'rgba(76,175,80,0.15)',
                        color:'#4CAF50',
                        border:'1px solid rgba(76,175,80,0.3)',
                        padding:'8px 14px',
                        borderRadius:'8px',
                        fontSize:'12px',
                        fontWeight:600,
                        cursor:'pointer',
                        display:'flex',
                        alignItems:'center',
                        gap:'6px',
                        whiteSpace:'nowrap'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Обработано
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
