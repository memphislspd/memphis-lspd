// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const REQUIRED_ROLE_ID = '1552313180041121802'; // Роль сотрудника
const HIGH_RANK_ROLE_ID = '1514608894679191597'; // Роль для хай-отчетов

const internalForms = [
  { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', icon: '📈' },
  { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', icon: '📋' },
  { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', icon: '🌟', requiredRole: HIGH_RANK_ROLE_ID },
  { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', icon: '🚪' },
  { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', icon: '🏖️' },
  { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', icon: '🔄' },
  { id: 'weapon-request', title: 'Спец вооружение', description: 'Запрос на получение спец вооружения', icon: '🔫' },
  { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', icon: '⚖️' },
  { id: 'appeal', title: 'Обжалование наказания', description: 'Обжаловать выговор', icon: '📜' },
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
          <div style={{ background: 'rgba(255, 38, 64, 0.05)', border: '1px solid #ff2640', padding: '50px', borderRadius: '12px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 40px rgba(255, 38, 64, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⛔</div>
            <h1 style={{ color: '#ff2640', fontSize: '36px', margin: '0 0 16px 0', fontWeight: '900', letterSpacing: '2px' }}>ACCESS DENIED</h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px', lineHeight: 1.6 }}>У вас недостаточно прав для доступа к этому разделу.<br/>Требуется роль сотрудника LSPD.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Фильтруем формы: если у формы есть requiredRole и у юзера его нет — скрываем
  const visibleForms = internalForms.filter(form => {
    if (!form.requiredRole) return true;
    return user.roles && user.roles.includes(form.requiredRole);
  });

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Внутренние формы и служебные документы.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {visibleForms.map((form) => (
          <div 
            key={form.id} 
            onClick={() => router.push(`/forms/${form.id}`)}
            style={{ 
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
              borderLeft: '4px solid transparent', borderRadius: '8px', padding: '20px 24px', 
              cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)'; e.currentTarget.style.borderLeftColor = '#2563EB'; e.currentTarget.style.transform = 'translateX(5px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '24px', opacity: 0.8 }}>{form.icon}</div>
              <div>
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '700' }}>{form.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{form.description}</p>
              </div>
            </div>
            <div style={{ color: '#2563EB', fontSize: '18px', opacity: 0.5 }}>→</div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
