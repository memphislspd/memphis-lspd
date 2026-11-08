// pages/applications.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const publicForms = [
  { id: 'hiring', title: 'Трудоустройство', description: 'Подать заявку на вступление в LSPD', code: 'A-01' },
  { id: 'transfer-to-lspd', title: 'Перевод в LSPD', description: 'Перевод из другой организации', code: 'A-02' },
  { id: 'reinstatement', title: 'Восстановление', description: 'Восстановление в LSPD', code: 'A-03' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#030303' }} />;
  if (!user) return null;

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Заявления</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Выберите необходимую форму для подачи заявки.</p>
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
          justifyContent: 'space-between',
          color: 'var(--blue)',
          fontSize: '12px',
          letterSpacing: '1px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            СИСТЕМА ПРИЕМА ЗАЯВЛЕНИЙ
          </div>
          <span style={{ color: '#7f8a9a' }}>[{publicForms.length}]</span>
        </div>

        {/* Список заявлений */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {publicForms.map((form, index) => (
            <div 
              key={form.id}
              onClick={() => router.push(`/forms/${form.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: index !== publicForms.length - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none',
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
                <div style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 'bold', minWidth: '40px' }}>
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

      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </PageLayout>
  );
}
