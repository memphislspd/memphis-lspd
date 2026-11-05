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

  if (loading) return <div style={{ minHeight: '100vh', background: '#000' }} />;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)', 
      color: 'white', 
      fontFamily: "'Inter', 'Montserrat', sans-serif", 
      overflowX: 'hidden' 
    }}>
      
      {/* 1. ШАПКА */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '0 60px', height: '72px',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/start')}>
          <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1.5px' }}>
            LSPD<span style={{ color: '#2563EB' }}>.</span>
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: '500', color: '#9ca3af' }}>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', color: 'white' }}>Заявления</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Отделы</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Для сотрудников</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Реестр пропусков</span>
        </nav>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{user.username}</span>
          <button onClick={() => router.push('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #333', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </header>

      {/* 2. ГЛАВНЫЙ ЭКРАН (Уменьшил отступы) */}
      <div style={{ padding: '80px 20px 60px', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', color: '#9ca3af', marginBottom: '24px', background: 'rgba(0,0,0,0.3)' }}>
          MAJESTIC ROLE PLAY — <span style={{ color: '#2563EB' }}>MEMPHIS</span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(50px, 7vw, 85px)', 
          fontWeight: '900', 
          margin: '0 0 20px 0', 
          letterSpacing: '-2px', 
          lineHeight: 1.05, 
        }}>
          Memphis Police<br/>Department
        </h1>
        
        <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.5 }}>
          Обеспечение правопорядка, защита граждан штата и поддержание закона на улицах города.
        </p>

        {/* Дата удалена, кнопка теперь ниже текста */}
        <button onClick={() => router.push('/dashboard')} style={{
          background: '#2563EB', color: 'white',
          border: 'none', padding: '14px 48px', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#3B82F6'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; }}
        >
          Подать заявление
        </button>
      </div>

      {/* 3. БЛОК МИССИИ (Уменьшил отступы) */}
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          <div style={{ color: '#ff2640', fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase' }}>
            НАША МИССИЯ
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
        </div>
        
        <div style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 16px 0' }}>
            Memphis Police Department стремится защищать американский народ и отстаивать Конституцию штата. Мы работаем над предотвращением преступности, борьбой с организованными крайм-структурами и коррупцией на всех уровнях.
          </p>
          <p style={{ margin: 0 }}>
            Наши офицеры обладают высочайшей квалификацией и готовы служить закону в любое время суток, обеспечивая безопасность граждан штата San Andreas.
          </p>
        </div>
      </div>

      {/* 4. БЛОК РУКОВОДСТВА (Уменьшил отступы) */}
      <div style={{ padding: '60px 20px 80px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '6px 16px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            TOP SECRET // CLEARANCE REQUIRED
          </div>
          
          <h2 style={{ fontSize: '44px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
            Руководство
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '40px' }}>
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
