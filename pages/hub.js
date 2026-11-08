// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const REQUIRED_ROLE_ID = '1552313180041121802';
const HIGH_RANK_ROLE_ID = '1514608894679191597';

// Группируем формы по категориям с новыми названиями
const CATEGORIES = [
  {
    id: 'personnel',
    title: 'ЛИЧНЫЙ СОСТАВ',
    items: [
      { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', code: 'F-05' },
      { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', code: 'F-04' },
      { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', code: 'F-06' },
    ]
  },
  {
    id: 'reporting',
    title: 'РАПОРТЫ И ДОКУМЕНТЫ',
    items: [
      { id: 'promotion', title: 'Запрос на повышение', description: 'Подать запрос на повышение', code: 'F-01' },
      { id: 'report', title: 'Отчёт о повышении', description: 'Отчёт для своего отдела', code: 'F-02' },
      { id: 'high-rank-report', title: 'Отчёт на повышение (Хай Ранги)', description: 'Повышение для старшего состава', code: 'F-03', requiredRole: HIGH_RANK_ROLE_ID },
      { id: 'recovery', title: 'Отработка взыскания', description: 'Подать заявку на отработку warn', code: 'F-08' },
      { id: 'appeal', title: 'Обжалование наказания', description: 'Обжаловать выговор', code: 'F-09' },
    ]
  },
  {
    id: 'special',
    title: 'ВООРУЖЕНИЕ И СНАБЖЕНИЕ',
    items: [
      { id: 'weapon-request', title: 'Спец вооружение', description: 'Запрос на получение спец вооружения', code: 'F-07' },
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

  // Фильтруем формы в зависимости от ролей
  const filteredCategories = CATEGORIES.map(category => {
    const availableItems = category.items.filter(item => {
      if (!item.requiredRole) return true;
      return user.roles && user.roles.includes(item.requiredRole);
    });
    return { ...category, items: availableItems };
  }).filter(category => category.items.length > 0);

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Внутренние служебные документы и формы.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {filteredCategories.map((category, catIndex) => (
          <div key={category.id}>
            
            {/* Заголовок категории */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", color: 'var(--blue)', fontSize: '12px', letterSpacing: '2px' }}>
                // СЕКТОР 0{catIndex + 1}
              </div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(63, 131, 248, 0.3), transparent)' }} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#9ca3af', fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>
                {category.title}
              </div>
            </div>

            {/* Сетка карточек */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {category.items.map((form) => (
                <div 
                  key={form.id} 
                  onClick={() => router.push(`/forms/${form.id}`)}
                  className="tactical-card"
                >
                  {/* Уголки-скобки (Прицел) */}
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>

                  {/* Крупный полупрозрачный номер (Код формы) */}
                  <div style={{ 
                    position: 'absolute', top: '15px', right: '15px', 
                    fontFamily: "'DM Mono', monospace", fontSize: '48px', 
                    fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.03)', 
                    lineHeight: 1, pointerEvents: 'none' 
                  }}>
                    {form.code.replace('F-', '')}
                  </div>

                  <h3 style={{ 
                    fontSize: '18px', margin: '0 0 8px 0', fontWeight: '700', 
                    color: 'white', fontFamily: "'Space Grotesk', sans-serif",
                    position: 'relative', zIndex: 1
                  }}>
                    {form.title}
                  </h3>
                  <p style={{ color: '#7f8a9a', fontSize: '13px', margin: 0, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                    {form.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Стили для тактических карточек */}
      <style jsx>{`
        .tactical-card {
          position: relative;
          background: rgba(11, 15, 22, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.12);
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .tactical-card:hover {
          background: rgba(63, 131, 248, 0.05);
          border-color: transparent; /* Убираем обычную рамку, оставляем только прицел */
          box-shadow: 0 0 20px rgba(63, 131, 248, 0.1);
        }

        /* Уголки прицела */
        .corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: rgba(148, 163, 184, 0.3);
          border-style: solid;
          transition: all 0.2s ease;
        }
        
        .top-left { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .top-right { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .bottom-left { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .bottom-right { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        /* Увеличение скобок при наведении */
        .tactical-card:hover .corner {
          width: 14px;
          height: 14px;
          border-color: var(--blue);
        }
      `}</style>
    </PageLayout>
  );
}
