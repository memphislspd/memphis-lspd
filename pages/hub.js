// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

const REQUIRED_ROLE_ID = '1552313180041121802';

const internalForms = [
  { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', icon: '📈' },
  { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', icon: '🚪' },
  { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', icon: '🏖️' },
  { id: 'weapon-request', title: 'Спец вооружение', description: 'Запрос на получение спец вооружения', icon: '🔫' },
  { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', icon: '⚖️' },
  { id: 'appeal', title: 'Обжалование наказания', description: 'Обжаловать выговор при присутствии на МП', icon: '📜' },
  { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', icon: '🔄' },
  { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', icon: '📋' },
  { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', icon: '🌟' }
];

export default function HubPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      
      // Проверяем наличие нужной роли
      if (d.user.roles && d.user.roles.includes(REQUIRED_ROLE_ID)) {
        setHasAccess(true);
      }
    });
  }, []);

  if (!user) return null;

  // Экран "Доступ запрещен", если нет роли
  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
        <Header user={user} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 72px)' }}>
          <div style={{ background: 'rgba(255, 38, 64, 0.1)', border: '1px solid #ff2640', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ color: '#ff2640', fontSize: '32px', margin: '0 0 16px 0' }}>ACCESS DENIED</h1>
            <p style={{ color: '#9ca3af', margin: 0 }}>У вас недостаточно прав для доступа к этому разделу. Требуется роль сотрудника LSPD.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
      <Header user={user} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Внутренние формы и служебные документы.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {internalForms.map(form => (
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
