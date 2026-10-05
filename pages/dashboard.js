import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SkeletonDashboard } from '@/components/Skeleton';

const categories = [
  {
    title: '📝 Электронные заявления',
    color: '#4CAF50',
    items: [
      { id: 'hiring', title: 'Трудоустройство', description: 'Подать заявку на вступление в LSPD', icon: '📝' },
      { id: 'transfer-to-lspd', title: 'Перевод в LSPD', description: 'Перевод из другой организации', icon: '🏛️' },
      { id: 'reinstatement', title: 'Восстановление', description: 'Восстановление в LSPD', icon: '🔄' }
    ]
  },
 {
  title: '📋 Секретариат',
  color: '#2196F3',
  items: [
    { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', icon: '📈' },
    { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', icon: '🚪' },
    { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', icon: '🏖️' },
    { id: 'weapon-request', title: 'Спец вооружение', description: 'Запрос на получение спец вооружения', icon: '🔫' },
    { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', icon: '⚖️' }
  ]
},
  {
    title: '🏢 Отделы',
    color: '#FF9800',
    items: [
      { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', icon: '🔄' },
      { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', icon: '📋' }
    ]
  },
  {
    title: '🌟 Старший состав',
    color: '#FF69B4',
    items: [
      { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', icon: '🌟' }
    ]
  }
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0, chart: [], maxCount: 1 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user); setLoading(false);
    });
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {});
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>

      {/* Sticky шапка */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 20px',
          gap: '16px'
        }}>
          {/* Логотип */}
          <div 
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="11" fill="url(#logoGrad)"/>
              <path d="M13 11h4v13h7v4H13V11z" fill="white"/>
              <circle cx="27" cy="14" r="2.8" fill="#00BCD4"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#5865F2"/>
                  <stop offset="1" stopColor="#9C27B0"/>
                </linearGradient>
              </defs>
            </svg>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
                LSPD Forms
              </div>
              <div style={{ fontSize: '12px', color: '#8b8ba7', marginTop: '2px' }}>
                Memphis Police
              </div>
            </div>
          </div>

          {/* Кнопки справа */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
              alt="Avatar" 
              onClick={() => router.push('/profile')}
              style={{ width:'34px', height:'34px', borderRadius:'50%', cursor:'pointer', border:'2px solid rgba(88,101,242,0.4)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#5865F2'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(88,101,242,0.4)'}
            />

            {isAdmin && (
              <button 
                onClick={() => router.push('/admin')}
                style={{ 
                  background: 'rgba(255,215,0,0.15)',
                  color: '#FFD700',
                  border: '1px solid rgba(255,215,0,0.3)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,215,0,0.15)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Админка
              </button>
            )}
            
            <button 
              onClick={() => router.push('/profile')} 
              style={{ 
                background: 'rgba(88,101,242,0.15)',
                color: '#8ea1ff',
                border: '1px solid rgba(88,101,242,0.3)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,101,242,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(88,101,242,0.15)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Профиль
            </button>
            
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'rgba(220,53,69,0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(220,53,69,0.3)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,53,69,0.1)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div style={{ padding: '0 20px 40px' }}>

        {/* Статистика */}
        <div style={{ maxWidth:'1200px', margin:'0 auto 20px', display:'flex', gap:'15px', flexWrap: 'wrap' }}>
          <div style={{ flex:'1 1 150px', background:'rgba(88,101,242,0.1)', border:'1px solid rgba(88,101,242,0.3)', borderRadius:'12px', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color:'#5865F2' }}>{stats.today}</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'5px', fontWeight:500 }}>Сегодня</div>
          </div>
          <div style={{ flex:'1 1 150px', background:'rgba(76,175,80,0.1)', border:'1px solid rgba(76,175,80,0.3)', borderRadius:'12px', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'32px', fontWeight:700, color:'#4CAF50' }}>{stats.total}</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'5px', fontWeight:500 }}>Всего</div>
          </div>
          <div 
            style={{ flex:'1 1 150px', background:'rgba(255,152,0,0.1)', border:'1px solid rgba(255,152,0,0.3)', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }} 
            onClick={() => router.push('/history')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,152,0,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,152,0,0.1)'}
          >
            <div style={{ fontSize:'32px', fontWeight:700, color:'#FF9800' }}>📋</div>
            <div style={{ color:'#8b8ba7', fontSize:'13px', marginTop:'5px', fontWeight:500 }}>Мои заявки</div>
          </div>
        </div>

        {/* График активности */}
        {stats.chart && stats.chart.length > 0 && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto 30px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg, #5865F2, #9C27B0, transparent)' }} />

            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'24px' }}>
              <div style={{ width:'4px', height:'18px', background:'#5865F2', borderRadius:'2px' }} />
              <h2 style={{ fontSize:'16px', margin:0, fontWeight:600 }}>📊 Активность за неделю</h2>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
              height: '180px',
              padding: '0 8px'
            }}>
              {stats.chart.map((day, i) => {
                const heightPercent = stats.maxCount > 0 ? (day.count / stats.maxCount) * 100 : 0;
                const barHeight = Math.max(heightPercent, day.count > 0 ? 8 : 0);
                
                return (
                  <div 
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      height: '100%',
                      justifyContent: 'flex-end',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: day.isToday ? '#5865F2' : (day.count > 0 ? 'white' : '#8b8ba7'),
                      opacity: day.count > 0 ? 1 : 0.4,
                      transition: 'opacity 0.2s'
                    }}>
                      {day.count}
                    </div>

                    <div 
                      style={{
                        width: '100%',
                        maxWidth: '50px',
                        height: `${barHeight}%`,
                        minHeight: day.count > 0 ? '8px' : '4px',
                        background: day.isToday
                          ? 'linear-gradient(180deg, #5865F2, #9C27B0)'
                          : (day.count > 0 
                            ? 'linear-gradient(180deg, rgba(88,101,242,0.7), rgba(88,101,242,0.3))'
                            : 'rgba(255,255,255,0.05)'),
                        borderRadius: '8px 8px 4px 4px',
                        transition: 'all 0.3s',
                        boxShadow: day.isToday ? '0 4px 16px rgba(88,101,242,0.4)' : 'none'
                      }}
                    />

                    <div style={{
                      fontSize: '11px',
                      color: day.isToday ? 'white' : '#8b8ba7',
                      fontWeight: day.isToday ? 600 : 500,
                      textTransform: 'lowercase'
                    }}>
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Категории */}
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          {categories.map((cat, catIdx) => (
            <div 
              key={cat.title} 
              style={{ 
                marginBottom:'32px',
                animation: `sectionFadeIn 0.5s ease ${catIdx * 0.1}s both`
              }}
            >

              {/* Заголовок категории */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <div style={{ width:'4px', height:'20px', background: cat.color, borderRadius:'2px' }} />
                <h2 style={{ fontSize:'18px', margin:0, fontWeight:600, color:'white' }}>
                  {cat.title}
                </h2>
                <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
                <span style={{ fontSize:'12px', color:'#8b8ba7', fontWeight:500 }}>
                  {cat.items.length}
                </span>
              </div>

              {/* Карточки */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'12px' }}>
                {cat.items.map((item, itemIdx) => (
                  <div 
                    key={item.id} 
                    onClick={() => router.push(`/forms/${item.id}`)} 
                    style={{ 
                      background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.08)',
                      borderRadius:'14px',
                      padding:'20px',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:'16px',
                      transition:'all 0.2s',
                      position:'relative',
                      overflow:'hidden',
                      animation: `cardFadeIn 0.4s ease ${catIdx * 0.1 + itemIdx * 0.05}s both`
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = cat.color + '80';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}20`;
                      const iconBox = e.currentTarget.querySelector('.icon-box');
                      if (iconBox) iconBox.style.background = cat.color + '25';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.boxShadow = '';
                      const iconBox = e.currentTarget.querySelector('.icon-box');
                      if (iconBox) iconBox.style.background = cat.color + '15';
                    }}
                  >
                    {/* Иконка в квадрате */}
                    <div 
                      className="icon-box"
                      style={{ 
                        width:'48px',
                        height:'48px',
                        minWidth:'48px',
                        borderRadius:'12px',
                        background: cat.color + '15',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        fontSize:'24px',
                        transition:'background 0.2s'
                      }}
                    >
                      {item.icon}
                    </div>

                    {/* Текст */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontSize:'15px', 
                        marginBottom:'4px', 
                        fontWeight:600,
                        color:'white',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap'
                      }}>
                        {item.title}
                      </h3>
                      <p style={{ 
                        color:'#8b8ba7', 
                        fontSize:'12px', 
                        margin:0,
                        lineHeight:1.4,
                        display:'-webkit-box',
                        WebkitLineClamp:2,
                        WebkitBoxOrient:'vertical',
                        overflow:'hidden'
                      }}>
                        {item.description}
                      </p>
                    </div>

                    {/* Стрелка справа */}
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#8b8ba7" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ minWidth:'16px', opacity:0.5 }}
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS анимации */}
      <style jsx global>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sectionFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
