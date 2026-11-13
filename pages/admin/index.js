// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';

const ADMIN_TOOLS = [
  {
    title: 'Старший состав',
    description: 'Управление высшим командованием (Шеф, Заместители).',
    code: 'SYS-01',
    path: '/admin/staff',
  },
  {
    title: 'Отделы',
    description: 'Создание отделов, добавление описаний и хайрангов.',
    code: 'SYS-02',
    path: '/admin/departments',
  },
  {
    title: 'Реестр пропусков',
    description: 'Добавление и управление пропусками на территорию.',
    code: 'SYS-03',
    path: '/passes',
  },
  {
    title: 'Все заявки',
    description: 'Просмотр всех отправленных форм и заявок.',
    code: 'SYS-04',
    path: '/admin/requests',
  },
  {
    title: 'Черный список',
    description: 'Управление забаненными пользователями.',
    code: 'SYS-05',
    path: '/admin/blacklist',
  },
  {
    title: 'Разблокировка',
    description: 'Снятие глобального лока сайта (если сработал антиспам).',
    code: 'SYS-06',
    path: '/admin/reset',
  },
  {
    title: 'Проверка ролей',
    description: 'Поиск пользователей по ID и проверка их ролей Discord.',
    code: 'SYS-07',
    path: '/admin/roles',
  },
  {
    title: 'Супер-Админка',
    description: 'Выдача доступа к панели управления вручную по ID.',
    code: 'SYS-08',
    path: '/admin/super',
    isRestricted: true // Выделим её красным цветом
  },
  {
    title: 'Журнал действий',
    description: 'История административных изменений и операций.',
    code: 'SYS-09',
    path: '/admin/logs',
    isRestricted: true
  }
];

export default function AdminHub() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      setIsAdmin(d.isAdmin);
      setIsSuperAdmin(Boolean(d.isSuperAdmin));
      setLoading(false);
      if (!d.isAdmin) router.push('/start');
    });
  }, []);

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  return (
    <PageLayout user={user}>
      
      {/* Заголовок терминала */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '10px', 
          background: 'rgba(255, 38, 64, 0.1)', border: '1px solid rgba(255, 38, 64, 0.3)', 
          padding: '6px 14px', borderRadius: '4px', marginBottom: '20px' 
        }}>
          <span style={{ color: '#ff2640', fontSize: '12px', animation: 'blink 1.5s step-end infinite' }}>●</span>
          <span style={{ color: '#ff2640', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', fontFamily: "'DM Mono', monospace" }}>
            ADMINISTRATOR ACCESS
          </span>
        </div>
        
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>
          Центр Управления
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>
          Панель администратора Memphis Police Department.
        </p>
      </div>

      {/* Сетка модулей */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        {ADMIN_TOOLS.filter(tool => !tool.isRestricted || isSuperAdmin).map((tool) => (
          <div 
            key={tool.title}
            onClick={() => router.push(tool.path)}
            style={{
              background: 'rgba(11, 15, 22, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '4px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(63, 131, 248, 0.05)';
              e.currentTarget.style.borderColor = tool.isRestricted ? 'rgba(255, 38, 64, 0.5)' : 'rgba(63, 131, 248, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.querySelector('.arrow').style.opacity = '1';
              e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(11, 15, 22, 0.6)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.querySelector('.arrow').style.opacity = '0.3';
              e.currentTarget.querySelector('.arrow').style.transform = 'translateX(-5px)';
            }}
          >
            {/* Технический код модуля */}
            <div style={{ 
              fontFamily: "'DM Mono', monospace", 
              fontSize: '11px', 
              color: tool.isRestricted ? '#ff2640' : 'var(--blue)', 
              letterSpacing: '1px', 
              marginBottom: '16px' 
            }}>
              [{tool.code}]
            </div>

            {/* Название */}
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'white', 
              fontFamily: "'Space Grotesk', sans-serif" 
            }}>
              {tool.title}
            </h3>

            {/* Описание */}
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '13px', 
              margin: '0 0 24px 0', 
              lineHeight: 1.5, 
              flex: 1 
            }}>
              {tool.description}
            </p>

            {/* Нижняя панель (Перейти) */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '16px'
            }}>
              <span style={{ 
                fontSize: '11px', 
                color: tool.isRestricted ? '#ff2640' : 'var(--blue)', 
                fontWeight: '700', 
                letterSpacing: '1px', 
                fontFamily: "'DM Mono', monospace" 
              }}>
                [ ПЕРЕЙТИ ]
              </span>
              <span 
                className="arrow"
                style={{ 
                  color: tool.isRestricted ? '#ff2640' : 'var(--blue)', 
                  fontSize: '16px', 
                  opacity: 0.3, 
                  transform: 'translateX(-5px)',
                  transition: 'all 0.2s ease'
                }}
              >
                →
              </span>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </PageLayout>
  );
}
