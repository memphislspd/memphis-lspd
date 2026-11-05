// pages/applications.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const publicForms = [
  { id: 'hiring', title: 'Трудоустройство', description: 'Подать заявку на вступление в LSPD', icon: '📝' },
  { id: 'transfer-to-lspd', title: 'Перевод в LSPD', description: 'Перевод из другой организации', icon: '🏛️' },
  { id: 'reinstatement', title: 'Восстановление', description: 'Восстановление в LSPD', icon: '🔄' }
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
  }, []);

  if (!user) return null;

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Заявления</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Выберите необходимую форму для подачи заявки.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {publicForms.map((form, index) => (
          <div 
            key={form.id} 
            onClick={() => router.push(`/forms/${form.id}`)}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderLeft: '4px solid transparent',
              borderRadius: '8px', 
              padding: '24px 32px', 
              cursor: 'pointer', 
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.borderLeftColor = '#2563EB';
              e.currentTarget.style.transform = 'translateX(10px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderLeftColor = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ fontSize: '14px', color: '#2563EB', fontWeight: '900', fontFamily: 'monospace' }}>
                0{index + 1}
              </div>
              <div style={{ fontSize: '32px', opacity: 0.8 }}>{form.icon}</div>
              <div>
                <h3 style={{ fontSize: '20px', margin: '0 0 6px 0', fontWeight: '800', letterSpacing: '0.5px' }}>{form.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{form.description}</p>
              </div>
            </div>
            
            {/* Стрелка справа */}
            <div style={{ color: '#2563EB', fontSize: '24px', fontWeight: '300', opacity: 0.5 }}>→</div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
