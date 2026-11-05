// pages/applications.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

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
    <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
      <Header user={user} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Заявления</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Выберите необходимую форму для подачи заявки.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {publicForms.map(form => (
            <div 
              key={form.id} 
              onClick={() => router.push(`/forms/${form.id}`)}
              style={{ 
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '32px', background: 'rgba(37, 99, 235, 0.1)', padding: '16px', borderRadius: '12px' }}>{form.icon}</div>
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', fontWeight: '700' }}>{form.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{form.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
