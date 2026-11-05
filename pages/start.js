// pages/start.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffCard from '../components/StaffCard';

export default function StartPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    });
    fetch('/api/staff').then(r => r.json()).then(d => setStaff(d)).catch(() => {});
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#050505' }} />;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Inter', 'Montserrat', -apple-system, sans-serif", overflowX: 'hidden' }}>
      
      {/* 1. ШАПКА (Ближе к референсу) */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '0 40px', height: '70px',
        background: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/start')}>
          <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px' }}>
            LSPD<span style={{ color: '#2563EB' }}>.</span>
          </div>
        </div>
        
        {/* Навигация (по центру) */}
        <div style={{ display: 'flex', gap: '30px', fontSize: '13px', fontWeight: '500', color: '#a0a3ce' }}>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', color: 'white' }}>Заявления</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}>Отделы</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}>Для сотрудников</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}>Реестр пропусков</span>
        </div>

        {/* Профиль */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{user.username}</div>
          <button onClick={() => router.push('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #333', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </header>

      {/* 2. ГЛАВНЫЙ ЭКРАН */}
      <div style={{ padding: '120px 20px 100px', textAlign: 'center' }}>
        
        {/* Верхняя плашка */}
        <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', color: '#a0a3ce', marginBottom: '40px', textTransform: 'uppercase' }}>
          MAJESTIC ROLE PLAY — <span style={{ color: '#2563EB' }}>MEMPHIS</span>
        </div>
        
        {/* Заголовок (Сплошной, огромный, без обводок) */}
        <h1 style={{ 
          fontSize: 'clamp(50px, 7vw, 90px)', 
          fontWeight: '900', 
          margin: '0 0 24px 0', 
          letterSpacing: '-1.5px', 
          lineHeight: 1.05, 
          fontFamily: "'Inter', sans-serif",
        }}>
          Memphis Police<br/>Department
        </h1>
        
        <p style={{ color: '#a0a3ce', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: 1.6, fontWeight: '400' }}>
          Обеспечение правопорядка, защита граждан штата и поддержание закона на улицах города.
        </p>

        {/* Дата (как на референсе) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '50px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '2px', fontWeight: '600' }}>EST. 19 DECEMBER 2025</div>
          <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>
        
        {/* Кнопка (Сделал как на референсе, но с твоим цветом) */}
        <button onClick={() => router.push('/dashboard')} style={{
          background: '#2563EB', color: 'white',
          border: 'none', padding: '14px 40px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Подать заявление
        </button>
      </div>

      {/* 3. БЛОК МИССИИ (Убрал карточку и выровнял по левому краю) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{ color: '#2563EB', fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase' }}>
            НАША МИССИЯ
          </div>
        </div>
        
        {/* Просто текст, без фона */}
        <div>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 1.8, margin: '0 0 20px 0', textAlign: 'left' }}>
            Memphis Police Department стремится защищать американский народ и отстаивать Конституцию штата. Мы работаем над предотвращением преступности, борьбой с организованными крайм-структурами и коррупцией на всех уровнях.
          </p>
          <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
            Наши офицеры обладают высочайшей квалификацией и готовы служить закону в любое время суток, обеспечивая безопасность граждан штата San Andreas.
          </p>
        </div>
      </div>

      {/* 4. БЛОК РУКОВОДСТВА (Заголовки сделал крупнее) */}
      <div style={{ padding: '80px 20px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '6px 16px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            TOP SECRET // CLEARANCE REQUIRED
          </div>
          
          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 15px 0', letterSpacing: '-1px', fontFamily: "'Inter', sans-serif" }}>
            Руководство
          </h2>
          <p style={{ color: '#a0a3ce', fontSize: '15px', marginBottom: '60px' }}>
            Высшее командование Memphis Police Department
          </p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {staff.length > 0 ? (
              staff.map(member => <StaffCard key={member.id} member={member} isAdminView={false} />)
            ) : (
              <div style={{ color: '#8b8ba7', padding: '40px' }}>
                Информация о руководстве засекречена.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
