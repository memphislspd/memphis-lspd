// components/FormShell.js
import { useRouter } from 'next/router';
import Header from './Header';
import { useEffect, useState } from 'react';

const PUBLIC_FORMS = ['hiring', 'transfer-to-lspd', 'reinstatement'];

export default function FormShell({ title, icon, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    });
  }, []);

  // Определяем, куда вести кнопку "Назад"
  const currentFormId = router.pathname.split('/').pop();
  const backLink = PUBLIC_FORMS.includes(currentFormId) ? '/applications' : '/hub';

  return (
    <div style={{ 
      minHeight: '100vh', 
      // Тот же фон, что и на главной странице
      background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)', 
      color: 'white', 
      fontFamily: "'Montserrat', 'Inter', -apple-system, sans-serif", 
      overflowX: 'hidden' 
    }}>
      {user && <Header user={user} />}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 100px' }}>
        
        {/* Кнопка Назад */}
        <button 
          onClick={() => router.push(backLink)} 
          style={{ 
            background: 'transparent', color: '#9ca3af', border: 'none', fontSize: '14px', 
            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '24px', transition: 'color 0.2s', padding: 0
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
        >
          ← Вернуться назад
        </button>

        {/* Карточка формы (в стиле главной страницы) */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          {/* Шапка формы */}
          <div style={{ 
            padding: '30px', 
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
            background: `rgba(255,255,255,0.01)`,
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>
              {icon}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
              <p style={{ color: '#9ca3af', margin: '4px 0 0 0', fontSize: '13px' }}>Заполните все обязательные поля</p>
            </div>
          </div>

          {/* Контент формы */}
          <div style={{ padding: '30px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
