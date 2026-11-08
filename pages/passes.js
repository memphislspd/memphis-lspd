// pages/passes.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

export default function PassesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passes, setPasses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Добавили поле link в стейт
  const [formData, setFormData] = useState({ name: '', staticId: '', passNumber: '', issueDate: '', link: '' });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin));
    fetchPasses();
  }, []);

  const fetchPasses = () => fetch('/api/passes').then(r => r.json()).then(d => setPasses(d));

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/passes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
    });
    if (res.ok) {
      setFormData({ name: '', staticId: '', passNumber: '', issueDate: '', link: '' });
      fetchPasses();
      window.toast.success('Пропуск добавлен в реестр');
    } else {
      window.toast.error('Ошибка добавления');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ВНИМАНИЕ: Вы уверены, что хотите удалить этот пропуск из реестра?')) return;
    const res = await fetch('/api/passes', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
    if (res.ok) {
      fetchPasses();
      window.toast.success('Запись удалена');
    } else {
      window.toast.error('Ошибка удаления');
    }
  };

  if (!user) return null;

  // Обновили сетку, добавив колонку для ссылки (1fr)
  const gridColumns = isAdmin ? '1.5fr 1fr 1fr 1fr 1fr 50px' : '1.5fr 1fr 1fr 1fr 1fr';

  const inputStyle = { 
    flex: '1 1 150px', padding: '12px', 
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148, 163, 184, 0.2)', 
    color: 'white', borderRadius: '4px', fontFamily: "'DM Mono', monospace", 
    fontSize: '12px', outline: 'none'
  };

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Реестр пропусков</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>База данных выданных пропусков на территорию департамента.</p>
      </div>

      {/* ТЕРМИНАЛ: ДОБАВЛЕНИЕ ПРОПУСКА */}
      {isAdmin && (
        <div style={{ 
          background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', 
          borderRadius: '4px', marginBottom: '30px', overflow: 'hidden' 
        }}>
          <div style={{ 
            padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            background: 'rgba(0, 0, 0, 0.3)', color: 'var(--blue)', fontSize: '12px',
            fontFamily: "'DM Mono', monospace", letterSpacing: '1px', display: 'flex', gap: '10px' 
          }}>
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span> ГЕНЕРАЦИЯ НОВОГО ПРОПУСКА
          </div>
          
          <form onSubmit={handleAdd} style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input required placeholder="ИМЯ ФАМИЛИЯ" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            <input required placeholder="СТАТИК" value={formData.staticId} onChange={e => setFormData({...formData, staticId: e.target.value})} style={inputStyle} />
            <input required placeholder="НОМЕР" value={formData.passNumber} onChange={e => setFormData({...formData, passNumber: e.target.value})} style={inputStyle} />
            <input required placeholder="ДАТА (ДД.ММ.ГГГГ)" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} style={inputStyle} />
            
            {/* НОВОЕ ПОЛЕ: ССЫЛКА */}
            <input type="url" placeholder="ССЫЛКА (URL)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} style={{...inputStyle, flex: '1 1 100%'}} />
            
            <button type="submit" style={{ 
              padding: '12px 24px', background: 'var(--blue)', color: 'white', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', 
              fontWeight: 'bold', height: '42px', fontSize: '12px',
              fontFamily: "'DM Mono', monospace", letterSpacing: '1px',
              transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(63, 131, 248, 0.2)', width: '100%'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5b96ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              [ ВЫДАТЬ ПРОПУСК ]
            </button>
          </form>
        </div>
      )}

      {/* ТЕРМИНАЛ: ТАБЛИЦА ПРОПУСКОВ */}
      <div style={{ 
        background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', 
        borderRadius: '4px', overflow: 'hidden' 
      }}>
        
        <div style={{ 
          padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(0, 0, 0, 0.3)', color: 'var(--blue)', fontSize: '12px',
          fontFamily: "'DM Mono', monospace", letterSpacing: '1px', display: 'flex', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>█</span> РЕЕСТР ВЫДАННЫХ ПРОПУСКОВ
          </div>
          <div style={{ color: '#7f8a9a' }}>ЗАПИСЕЙ: {passes.length}</div>
        </div>

        {/* Заголовки колонок (Добавлена "Ссылка") */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: gridColumns, padding: '16px 20px', 
          background: 'rgba(255, 255, 255, 0.02)', fontWeight: '700', fontSize: '11px', 
          color: '#7f8a9a', textTransform: 'uppercase', letterSpacing: '1px',
          fontFamily: "'DM Mono', monospace", borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <div>Имя</div>
          <div>Статик</div>
          <div>Номер</div>
          <div>Дата</div>
          <div>Ссылка</div> {/* <-- Новая колонка */}
          {isAdmin && <div style={{ textAlign: 'center' }}>X</div>}
        </div>

        {/* Строки таблицы */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {passes.map(p => (
            <div 
              key={p.id} 
              style={{ 
                display: 'grid', gridTemplateColumns: gridColumns, padding: '16px 20px', 
                borderBottom: '1px solid rgba(148, 163, 184, 0.05)', fontSize: '13px',
                alignItems: 'center', transition: 'background 0.15s', fontFamily: "'DM Mono', monospace"
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(63, 131, 248, 0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: '700', color: 'white', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px' }}>{p.name}</div>
              <div style={{ color: '#9ca3af' }}>{p.staticId}</div>
              <div style={{ color: 'var(--blue)', fontWeight: 'bold' }}>#{p.passNumber}</div>
              <div style={{ color: '#9ca3af' }}>{p.issueDate}</div>
              
              {/* НОВАЯ КОЛОНКА: ССЫЛКА */}
              <div>
                {p.link ? (
                  <a 
                    href={p.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#3f83f8', 
                      textDecoration: 'underline', 
                      transition: 'color 0.2s',
                      fontWeight: '600'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#5b96ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3f83f8'}
                  >
                    ссылка
                  </a>
                ) : (
                  <span style={{ color: '#4b5563' }}>нет</span>
                )}
              </div>
              
              {isAdmin && (
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    style={{ 
                      background: 'transparent', border: 'none', color: '#4b5563', 
                      cursor: 'pointer', fontSize: '16px', transition: 'color 0.2s', padding: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff2640'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                    title="Удалить пропуск"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {passes.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
            [ В БАЗЕ ДАННЫХ НЕТ ЗАПИСЕЙ ]
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </PageLayout>
  );
}
