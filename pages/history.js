import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SkeletonProfile } from '../components/Skeleton';

// Иконки и цвета по типу заявки
const TYPE_META = {
  promotion: { icon: '📈', color: '#4CAF50', label: 'Повышение' },
  transfer: { icon: '🔄', color: '#2196F3', label: 'Перевод' },
  report: { icon: '📋', color: '#FF9800', label: 'Отчёт' },
  highrank: { icon: '🌟', color: '#FF69B4', label: 'Хай Ранги' },
  resignation: { icon: '🚪', color: '#DC3545', label: 'Увольнение' },
  reinstatement: { icon: '🔄', color: '#9C27B0', label: 'Восстановление' },
  'transfer-to-lspd': { icon: '🏛️', color: '#00BCD4', label: 'Перевод в LSPD' },
  hiring: { icon: '📝', color: '#4CAF50', label: 'Трудоустройство' },
  'weapon-request': { icon: '🔫', color: '#FF5722', label: 'Вооружение' },
  leave: { icon: '🏖️', color: '#00BCD4', label: 'Отпуск' },
  premium: { icon: '🎯', color: '#FFD700', label: 'Премия' },
  complaint: { icon: '🚨', color: '#FF0000', label: 'Жалоба' }
};

// Красивая дата
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function History() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.history) setHistory(d.history);
      setLoading(false);
    }).catch(() => router.push('/'));
  }, []);

if (loading || !user) return <SkeletonProfile />;

  // Уникальные типы для фильтра
  const availableTypes = ['all', ...new Set(history.map(h => h.type).filter(Boolean))];
  const filtered = filter === 'all' ? history : history.filter(h => h.type === filter);

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
          maxWidth: '900px', margin: '0 auto', padding: '16px 20px', gap: '16px'
        }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
            Мои заявки
          </div>

          <div style={{ 
            fontSize: '12px', 
            color: '#8b8ba7',
            background: 'rgba(255,255,255,0.05)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: 600,
            minWidth: '80px',
            textAlign: 'center'
          }}>
            {filtered.length}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Заголовок */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <div style={{ width:'4px', height:'20px', background:'#5865F2', borderRadius:'2px' }} />
          <h1 style={{ fontSize:'20px', margin:0, fontWeight:600 }}>
            История заявок
          </h1>
        </div>

        {/* Фильтр по типам */}
        {history.length > 0 && availableTypes.length > 2 && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '20px', 
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {availableTypes.map(type => {
              const meta = TYPE_META[type];
              const isActive = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    background: isActive ? (meta?.color || '#5865F2') + '25' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? (meta?.color || '#5865F2') + '60' : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? 'white' : '#8b8ba7',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  {type === 'all' ? '📁 Все' : `${meta?.icon || '📄'} ${meta?.label || type}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Список заявок */}
        {filtered.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '60px 30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>
              У вас пока нет заявок
            </h3>
            <p style={{ color: '#8b8ba7', fontSize: '14px', margin: 0 }}>
              Отправьте первую заявку через дашборд
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((item, i) => {
              const meta = TYPE_META[item.type] || { icon: '📄', color: '#5865F2', label: 'Заявка' };
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = meta.color + '60';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {/* Цветная полоска слева */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: '3px', background: meta.color
                  }} />

                  {/* Иконка */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    borderRadius: '12px',
                    background: meta.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}>
                    {meta.icon}
                  </div>

                  {/* Контент */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'white',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title || meta.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#8b8ba7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>

                  {/* Статус бейдж */}
                  <div style={{
                    background: 'rgba(76,175,80,0.15)',
                    border: '1px solid rgba(76,175,80,0.3)',
                    color: '#4CAF50',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    Отправлено
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
