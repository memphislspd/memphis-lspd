// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const REQUIRED_ROLE_ID = '1552313180041121802';
const HIGH_RANK_ROLE_ID = '1514608894679191597';

// Группируем формы по 4 новым категориям
const CATEGORIES = [
  {
    id: 'reports',
    title: 'Отчеты',
    items: [
      { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', code: 'REP-01' },
      { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', code: 'REP-02' },
      { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', code: 'REP-03', requiredRole: HIGH_RANK_ROLE_ID },
    ]
  },
  {
    id: 'statements',
    title: 'Заявления',
    items: [
      { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', code: 'APP-01' },
      { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', code: 'APP-02' },
      { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', code: 'APP-03' },
    ]
  },
  {
    id: 'requests',
    title: 'Запросы',
    items: [
      { id: 'weapon-request', title: 'Специальное снаряжиение', description: 'Запрос на получение спец снарежения', code: 'REQ-01' },
    ]
  },
  {
    id: 'penalties',
    title: 'Взыскания',
    items: [
      { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', code: 'PEN-01' },
      { id: 'appeal', title: 'Обжалование наказания', description: 'Обжаловать выговор', code: 'PEN-02' },
    ]
  }
];

export default function HubPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      if (d.user.roles && d.user.roles.includes(REQUIRED_ROLE_ID)) {
        setHasAccess(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#030303' }} />;
  if (!user) return null;

  if (!hasAccess) {
    return (
      <PageLayout user={user}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ background: 'rgba(255, 38, 64, 0.05)', border: '1px solid #ff2640', padding: '50px', borderRadius: '4px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 40px rgba(255, 38, 64, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⛔</div>
            <h1 style={{ color: '#ff2640', fontSize: '32px', margin: '0 0 16px 0', fontWeight: '900', letterSpacing: '2px', fontFamily: "'Space Grotesk', sans-serif" }}>ACCESS DENIED</h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px', lineHeight: 1.6 }}>У вас недостаточно прав для доступа к этому разделу.<br/>Требуется роль сотрудника LSPD.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Фильтруем формы в зависимости от ролей пользователя
  const filteredCategories = CATEGORIES.map(category => {
    const availableItems = category.items.filter(item => {
      if (!item.requiredRole) return true;
      return user.roles && user.roles.includes(item.requiredRole);
    });
    return { ...category, items: availableItems };
  }).filter(category => category.items.length > 0); // Скрываем пустые категории

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Внутренние служебные документы и формы.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {filteredCategories.map((category, catIndex) => (
          <div key={category.id} style={{ 
            background: 'rgba(11, 15, 22, 0.6)', 
            border: '1px solid rgba(148, 163, 184, 0.15)', 
            borderRadius: '4px',
            fontFamily: "'DM Mono', monospace",
            overflow: 'hidden'
          }}>
            
            {/* Шапка категории */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--blue)',
              fontSize: '12px',
              letterSpacing: '1px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
                КАТЕГОРИЯ 0{catIndex + 1}: {category.title}
              </div>
              <span style={{ color: '#7f8a9a' }}>[{category.items.length}]</span>
            </div>

            {/* Список форм внутри категории */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {category.items.map((form, index) => (
                <div 
                  key={form.id}
                  onClick={() => router.push(`/forms/${form.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: index !== category.items.length - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(63, 131, 248, 0.1)';
                    e.currentTarget.querySelector('.terminal-arrow').style.opacity = '1';
                    e.currentTarget.querySelector('.terminal-arrow').style.transform = 'translateX(0)';
                    e.currentTarget.querySelector('.terminal-status').style.color = '#fff';
                    e.currentTarget.querySelector('.terminal-status').style.borderColor = 'var(--blue)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.querySelector('.terminal-arrow').style.opacity = '0';
                    e.currentTarget.querySelector('.terminal-arrow').style.transform = 'translateX(-10px)';
                    e.currentTarget.querySelector('.terminal-status').style.color = '#6b7280';
                    e.currentTarget.querySelector('.terminal-status').style.borderColor = 'rgba(148, 163, 184, 0.2)';
                  }}
                >
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    {/* Скрытая стрелка, появляется при наведении */}
                    <span 
                      className="terminal-arrow" 
                      style={{ 
                        color: 'var(--blue)', 
                        fontSize: '18px', 
                        opacity: 0, 
                        transform: 'translateX(-10px)',
                        transition: 'all 0.2s ease',
                        position: 'absolute',
                        left: '10px'
                      }}
                    >
                      →
                    </span>
                    
                    {/* Код формы */}
                    <div style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 'bold', minWidth: '50px' }}>
                      [{form.code}]
                    </div>

                    {/* Название и описание */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {form.title}
                      </span>
                      <span style={{ color: '#7f8a9a', fontSize: '12px' }}>
                        {form.description}
                      </span>
                    </div>
                  </div>

                  {/* Статус */}
                  <div 
                    className="terminal-status"
                    style={{ 
                      fontSize: '11px', 
                      color: '#6b7280',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    [EXECUTE]
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </PageLayout>
  );
}
