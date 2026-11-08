// pages/hub.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';

const REQUIRED_ROLE_ID = '1552313180041121802';
const HIGH_RANK_ROLE_ID = '1514608894679191597';

// Группируем формы по категориям
const CATEGORIES = [
  {
    id: 'personnel',
    title: 'ЛИЧНЫЕ ОТЧЕТЫ',
    items: [
      { id: 'leave', title: 'Отпуск', description: 'OOC или IC отпуск', code: 'F-05' },
      { id: 'resignation', title: 'Заявление на увольнение', description: 'Подать заявление на увольнение', code: 'F-04' },
      { id: 'transfer', title: 'Перевод в отдел', description: 'Перевод в другой отдел LSPD', code: 'F-06' },
    ]
  },
  {
    id: 'reporting',
    title: 'ОТЧЕТНОСТЬ',
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
    title: 'СПЕЦ. ЗАПРОСЫ',
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
  const [activeCategory, setActiveCategory] = useState('personnel'); // По умолчанию открыт "Личный состав"

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

  // Находим текущую активную категорию для отображения
  const currentCategoryData = filteredCategories.find(c => c.id === activeCategory) || filteredCategories[0];

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Для сотрудников</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Внутренние служебные документы и формы.</p>
      </div>

      {/* Двухколоночный интерфейс */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* ЛЕВАЯ ПАНЕЛЬ (Меню) */}
        <div style={{ 
          flex: '0 0 250px', // Фиксированная ширина для меню
          display: 'flex', 
          flexDirection: 'column',
          borderLeft: '1px solid rgba(148, 163, 184, 0.15)',
          gap: '4px',
          width: '100%',
          maxWidth: '100%',
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#7f8a9a', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '12px' }}>
            ОГЛАВЛЕНИЕ
          </div>
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? 'rgba(63, 131, 248, 0.08)' : 'transparent',
                border: 'none',
                borderLeft: activeCategory === cat.id ? '3px solid var(--blue)' : '3px solid transparent',
                color: activeCategory === cat.id ? 'white' : '#9ca3af',
                padding: '12px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeCategory === cat.id ? '600' : '400',
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { if(activeCategory !== cat.id) e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { if(activeCategory !== cat.id) e.currentTarget.style.color = '#9ca3af'; }}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ (Досье / Список документов) */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ 
            background: 'rgba(11, 15, 22, 0.4)', 
            border: '1px solid rgba(148, 163, 184, 0.15)', 
            borderRadius: '4px', // Строгие углы
            overflow: 'hidden'
          }}>
            {/* Шапка выбранной категории */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--blue)', letterSpacing: '1px' }}>
                // {currentCategoryData.title}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#7f8a9a' }}>
                ФАЙЛОВ: {currentCategoryData.items.length}
              </span>
            </div>

            {/* Список документов */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {currentCategoryData.items.map((form, index) => (
                <div 
                  key={form.id}
                  onClick={() => router.push(`/forms/${form.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: index !== currentCategoryData.items.length - 1 ? '1px solid rgba(148, 163, 184, 0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'transparent'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(63, 131, 248, 0.05)';
                    e.currentTarget.style.paddingLeft = '28px'; // Небольшой сдвиг текста вправо
                    e.currentTarget.querySelector('.arrow').style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '24px';
                    e.currentTarget.querySelector('.arrow').style.opacity = '0.2';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#6b7280', minWidth: '40px' }}>
                      {form.code}
                    </span>
                    <div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '600', color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {form.title}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                        {form.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Стрелка справа */}
                  <span 
                    className="arrow"
                    style={{ color: 'var(--blue)', fontSize: '18px', opacity: 0.2, transition: 'opacity 0.2s ease' }}
                  >
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
