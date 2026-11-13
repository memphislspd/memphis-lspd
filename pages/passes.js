
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';
import AdminSectionHeader from '../components/AdminSectionHeader';
import { adminPanelStyle, adminPanelHeaderStyle, adminInputStyle, adminPrimaryButtonStyle } from '../components/adminStyles';

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

  const inputStyle = { ...adminInputStyle, flex: '1 1 150px', fontSize: '12px' };

  return (
    <PageLayout user={user}>
      <AdminSectionHeader
        title="Реестр пропусков"
        description="База данных выданных пропусков на территорию департамента."
        showBack={isAdmin}
      />

      {/* ТЕРМИНАЛ: ДОБАВЛЕНИЕ ПРОПУСКА */}
      {isAdmin && (
        <div style={{ 
          ...adminPanelStyle, marginBottom: '30px' 
        }}>
          <div style={{ 
            ...adminPanelHeaderStyle, justifyContent: 'flex-start' 
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
              ...adminPrimaryButtonStyle, padding: '12px 24px', width: '100%'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(63, 131, 248, 0.24)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(63, 131, 248, 0.14)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              [ ВЫДАТЬ ПРОПУСК ]
            </button>
          </form>
        </div>
      )}

      {/* ТЕРМИНАЛ: ТАБЛИЦА ПРОПУСКОВ */}
      <div style={{ 
        ...adminPanelStyle 
      }}>
        
        <div style={{ 
          ...adminPanelHeaderStyle
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>█</span> РЕЕСТР ВЫДАННЫХ ПРОПУСКОВ
          </div>
          <div style={{ color: '#7f8a9a' }}>ЗАПИСЕЙ: {passes.length}</div>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: isAdmin ? '680px' : '620px' }}>
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
        </div>
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
