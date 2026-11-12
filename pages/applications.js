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

  if (!user) return null;

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Центр обращений</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Подавайте кадровые заявления или направляйте жалобы на действия сотрудников LSPD.</p>
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
            СИСТЕМА ПРИЕМА ОБРАЩЕНИЙ
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

      <section aria-labelledby="additional-requests-title" style={{ marginTop: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '12px',
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '1px'
        }}>
          <span id="additional-requests-title" style={{ color: '#9aa6b7' }}>ДОПОЛНИТЕЛЬНЫЕ ОБРАЩЕНИЯ</span>
          <span style={{ color: '#7f8a9a' }}>01 / COMPLAINTS</span>
        </div>

        <button
          type="button"
          className="complaint-entry"
          onClick={() => router.push('/complaint')}
          aria-label="Подать жалобу на сотрудника"
        >
          <span className="complaint-entry__icon" aria-hidden="true">!</span>
          <span className="complaint-entry__content">
            <span className="complaint-entry__title">Жалоба на сотрудника</span>
            <span className="complaint-entry__description">Сообщить о нарушении или неправомерных действиях сотрудника LSPD</span>
          </span>
          <span className="complaint-entry__action">[OPEN ↗]</span>
        </button>
      </section>

      <style jsx global>{`
        .complaint-entry {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          border: 1px solid rgba(248, 113, 113, .24);
          border-radius: 4px;
          background: linear-gradient(115deg, rgba(88, 28, 36, .22), rgba(11, 15, 22, .72));
          color: white;
          text-align: left;
          cursor: pointer;
          transition: border-color .18s ease, background .18s ease, transform .18s ease;
        }

        .complaint-entry:hover {
          border-color: rgba(248, 113, 113, .52);
          background: linear-gradient(115deg, rgba(127, 29, 43, .28), rgba(15, 19, 28, .9));
          transform: translateY(-1px);
        }

        .complaint-entry:focus-visible {
          outline: 2px solid #f17883;
          outline-offset: 3px;
        }

        .complaint-entry__icon {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(248, 113, 113, .3);
          border-radius: 4px;
          background: rgba(127, 29, 43, .2);
          color: #f17883;
          font: 700 21px 'Space Grotesk', sans-serif;
        }

        .complaint-entry__content {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
          gap: 4px;
        }

        .complaint-entry__title {
          color: #fff;
          font: 700 15px 'Space Grotesk', sans-serif;
        }

        .complaint-entry__description {
          color: #9b8990;
          font: 12px 'DM Mono', monospace;
          line-height: 1.5;
        }

        .complaint-entry__action {
          flex: 0 0 auto;
          margin-left: auto;
          color: #f17883;
          font: 11px 'DM Mono', monospace;
          white-space: nowrap;
          transition: color .18s ease;
        }

        .complaint-entry:hover .complaint-entry__action {
          color: #ffb0b8;
        }

        @media (max-width: 560px) {
          .complaint-entry {
            gap: 12px;
            padding: 15px 14px;
          }

          .complaint-entry__icon {
            flex-basis: 38px;
            width: 38px;
            height: 38px;
          }

          .complaint-entry__title { font-size: 14px; }
          .complaint-entry__description { font-size: 11px; }
          .complaint-entry__action { font-size: 10px; }
        }

        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </PageLayout>
  );
}
