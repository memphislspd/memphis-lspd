// pages/admin/requests.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';

export default function RequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetchSubmissions();
  }, []);

  const fetchSubmissions = () => {
    fetch('/api/admin/requests')
      .then(r => r.json())
      .then(d => {
        if (d.submissions) setSubmissions(d.submissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleProcess = async (id) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'process' })
      });
      if (res.ok) {
        // Обновляем локально, чтобы не делать лишний запрос
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, processed: true } : s));
        window.toast.success('Заявка помечена как обработанная');
      } else {
        window.toast.error('Ошибка обновления');
      }
    } catch (e) {
      window.toast.error('Ошибка сети');
    }
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  return (
    <AdminPageGuard>
      <PageLayout user={user}>
      <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
        ← НАЗАД В АДМИНКУ
      </button>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Архив заявок</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Все отправленные формы, сохраненные в базе данных.</p>
      </div>

      <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--blue)', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
          <span>[ СИСТЕМНЫЙ ЛОГ ЗАЯВОК ]</span>
          <span>ЗАПИСЕЙ: {submissions.length}</span>
        </div>

        {/* Заголовки колонок */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1.2fr 100px 120px 140px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', fontSize: '11px', color: '#7f8a9a', fontFamily: "'DM Mono', monospace", borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div>ТИП</div>
          <div>ЗАГОЛОВОК</div>
          <div>ОТПРАВИТЕЛЬ</div>
          <div>ВОЗРАСТ</div>
          <div>СТАТУС</div>
          <div style={{ textAlign: 'right' }}>ДЕЙСТВИЕ</div>
        </div>

        {/* Строки таблицы */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {submissions.map(req => {
            // Определяем цвет статуса
            let statusColor = '#FF9800'; // Оранжевый (Ожидает)
            let statusText = 'ОЖИДАЕТ';
            if (req.processed) {
              statusColor = '#4CAF50'; // Зеленый
              statusText = 'ОБРАБОТАНО';
            } else if (req.isOld) {
              statusColor = '#ff2640'; // Красный
              statusText = 'ПРОСРОЧЕНО';
            }

            return (
              <div key={req.id} style={{ 
                display: 'grid', 
                gridTemplateColumns: '100px 1.5fr 1.2fr 100px 120px 140px', 
                padding: '16px 20px', 
                borderBottom: '1px solid rgba(148, 163, 184, 0.05)', 
                alignItems: 'center', 
                fontSize: '13px', 
                fontFamily: "'DM Mono', monospace",
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ color: 'var(--blue)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {req.type || 'N/A'}
                </div>
                
                <div style={{ color: 'white', fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '15px' }}>
                  {req.title || 'Заявка'}
                </div>
                
                <div style={{ color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '15px' }}>
                  {req.username || 'Неизвестный'} <span style={{color:'#4b5563'}}>({req.userId})</span>
                </div>
                
                <div style={{ color: req.isOld ? '#ff2640' : '#9ca3af' }}>
                  {req.ageHours}ч. назад
                </div>
                
                <div>
                  <span style={{ 
                    color: statusColor, 
                    border: `1px solid ${statusColor}`, 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    display: 'inline-block',
                    opacity: req.processed ? 0.7 : 1
                  }}>
                    {statusText}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {!req.processed ? (
                    <button 
                      onClick={() => handleProcess(req.id)}
                      style={{ 
                        background: 'rgba(63, 131, 248, 0.1)', color: 'var(--blue)', 
                        border: '1px solid rgba(63, 131, 248, 0.3)', padding: '6px 12px', 
                        borderRadius: '4px', cursor: 'pointer', fontSize: '11px', 
                        fontWeight: 'bold', fontFamily: "'DM Mono', monospace",
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(63, 131, 248, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(63, 131, 248, 0.1)'}
                    >
                      [ ОБРАБОТАТЬ ]
                    </button>
                  ) : (
                    <span style={{ color: '#4b5563', fontSize: '11px' }}>[ АРХИВ ]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {submissions.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
            [ БАЗА ЗАЯВОК ПУСТА ]
          </div>
        )}
      </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
