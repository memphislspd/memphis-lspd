// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const REQUIRED_ROLE_ID = '1552313180041121802';
const HIGH_RANK_ROLE_ID = '1514608894679191597';

const internalForms = [
  { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', code: 'F-01' },
  { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', code: 'F-02' },
  { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', code: 'F-03', requiredRole: HIGH_RANK_ROLE_ID },
  { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', code: 'F-04' },
  { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', code: 'F-05' },
  { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', code: 'F-06' },
  { id: 'weapon-request', title: 'Спец вооружение', description: 'Запрос на получение спец вооружения', code: 'F-07' },
  { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', code: 'F-08' },
  { id: 'appeal', title: 'Обжалование наказания', description: 'Обжаловать выговор', code: 'F-09' },
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

  const visibleForms = internalForms.filter(form => {
    if (!form.requiredRole) return true;
    return user.roles && user.roles.includes(form.requiredRole);
  });

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Внутренние служебные документы и формы.</p>
      </div>

      {/* Терминальный контейнер */}
      <div style={{ 
        background: 'rgba(11, 15, 22, 0.6)', 
        border: '1px solid rgba(148, 163, 184, 0.15)', 
        borderRadius: '4px',
        fontFamily: "'DM Mono', monospace",
        overflow: 'hidden'
      }}>
        
        {/* Шапка терминала */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--blue)',
          fontSize: '12px',
          letterSpacing: '1px'
        }}>
          <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
          ДОСТУПНЫЕ ДОКУМЕНТЫ: [{visibleForms.length}]
        </div>

        {/* Список форм */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {visibleForms.map((form, index) => (
            <div 
              key={form.id}
              onClick={() => router.push(`/forms/${form.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: index !== visibleForms.length - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none',
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
                <div style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 'bold' }}>
                  [{form.code}]
                </div>

                {/* Название и описание */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'white', fontSize: '15px', fontWeight: 'bold' }}>
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

      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </PageLayout>
  );
}
