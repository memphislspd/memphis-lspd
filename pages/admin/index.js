// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';

const ADMIN_TOOLS = [
  {
    title: 'Старший состав',
    description: 'Управление высшим командованием (Шеф, Заместители).',
    icon: '👑',
    path: '/admin/staff',
    color: '#FFD700' // Золотой
  },
  {
    title: 'Отделы',
    description: 'Создание отделов, добавление описаний и хайрангов.',
    icon: '🏢',
    path: '/admin/departments',
    color: '#2563EB' // Синий
  },
  {
    title: 'Реестр пропусков',
    description: 'Добавление и управление пропусками на территорию.',
    icon: '🪪',
    path: '/passes', // Форма добавления уже встроена туда для админов
    color: '#4CAF50' // Зеленый
  },
  {
    title: 'Все заявки',
    description: 'Просмотр всех отправленных форм и заявок.',
    icon: '📋',
    path: '/admin/requests',
    color: '#9C27B0' // Фиолетовый
  },
  {
    title: 'Черный список',
    description: 'Управление забаненными пользователями.',
    icon: '🚫',
    path: '/admin/blacklist',
    color: '#ff2640' // Красный
  },
  {
    title: 'Разблокировка',
    description: 'Снятие глобального лока сайта (если сработал антиспам).',
    icon: '🔓',
    path: '/admin/reset', // Или куда у тебя ведет эта кнопка
    color: '#FF9800' // Оранжевый
  }
];

export default function AdminHub() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => {
      setIsAdmin(d.isAdmin);
      setLoading(false);
      if (!d.isAdmin) router.push('/start'); // Выкидываем, если не админ
    });
  }, []);

  if (loading || !user) return null;

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', padding: '8px 16px', borderRadius: '6px', marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Administrator Access</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Центр Управления</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Панель администратора Memphis Police Department.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {ADMIN_TOOLS.map((tool) => (
          <div 
            key={tool.title}
            onClick={() => router.push(tool.path)}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `4px solid transparent`,
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderLeftColor = tool.color;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${tool.color}15`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderLeftColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{tool.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: 'white' }}>{tool.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: tool.color, fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Перейти</span>
              <span style={{ color: tool.color, fontSize: '18px' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
