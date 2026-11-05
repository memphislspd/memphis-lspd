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
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden' }}>
      
      {/* 1. ШАПКА (Tactical Header) */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 40px', 
        height: '80px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => router.push('/start')}>
          <div style={{ width: '8px', height: '8px', background: '#ff2640', borderRadius: '50%', boxShadow: '0 0 10px #ff2640' }}></div>
          <div style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '2px', fontFamily: 'Impact, Arial Black, sans-serif' }}>
            LSPD<span style={{ color: '#2563EB' }}>.</span>
          </div>
          <div style={{ color: '#555', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginTop: '5px' }}>
            INTRANET
          </div>
        </div>
        
        {/* Навигация */}
        <div style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span 
            onClick={() => router.push('/dashboard')} 
            style={{ cursor: 'pointer', color: '#a0a3ce', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}
          >
            Заявления
          </span>
          <span style={{ cursor: 'pointer', color: '#a0a3ce', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}
          >
            Отделы
          </span>
          <span style={{ cursor: 'pointer', color: '#a0a3ce', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#a0a3ce'}
          >
            Для сотрудников
          </span>
        </div>

        {/* Профиль */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>{user.username}</span>
            <span style={{ fontSize: '11px', color: '#555' }}>Officer</span>
          </div>
          <button onClick={() => router.push('/profile')} style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #2563EB', cursor: 'pointer', padding: 0, boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)' }}>
             <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </header>

      {/* 2. ГЛАВНЫЙ ЭКРАН (Без машин, только текст) */}
      <div style={{ 
        position: 'relative', 
        padding: '140px 20px 120px', 
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 70%)'
      }}>
        <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', color: '#a0a3ce', marginBottom: '40px', background: 'rgba(0,0,0,0.5)' }}>
          MAJESTIC ROLE PLAY — MEMPHIS
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(50px, 8vw, 100px)', 
          fontWeight: '900', 
          margin: '0 0 24px 0', 
          letterSpacing: '-2px', 
          lineHeight: 0.9, 
          fontFamily: 'Impact, Arial Black, sans-serif',
          textShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}>
          MEMPHIS POLICE<br/>
          <span style={{ color: 'transparent', WebkitTextStroke: '2px white' }}>DEPARTMENT</span>
        </h1>
        
        <p style={{ color: '#a0a3ce', fontSize: '18px', maxWidth: '600px', margin: '0 auto 50px auto', lineHeight: 1.6 }}>
          Обеспечение правопорядка, защита граждан штата и поддержание закона на улицах города.
        </p>
        
        <button onClick={() => router.push('/dashboard')} style={{
          background: '#2563EB', color: 'white',
          border: 'none', padding: '18px 50px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)'; }}
        >
          Подать заявление
        </button>
      </div>

      {/* 3. БЛОК МИССИИ (Красивый текст) */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,38,64,0.5))' }} />
          <div style={{ color: '#ff2640', fontSize: '12px', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase' }}>
            Наша миссия
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,38,64,0.5), transparent)' }} />
        </div>
        
        {/* Карточка с текстом */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          borderLeft: '3px solid #2563EB', 
          padding: '30px 40px', 
          borderRadius: '0 12px 12px 0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <p style={{ color: '#d1d5db', fontSize: '17px', lineHeight: 1.8, margin: '0 0 20px 0', fontWeight: '300' }}>
            Memphis Police Department стремится защищать американский народ и отстаивать Конституцию штата. Мы работаем над предотвращением преступности, борьбой с организованными крайм-структурами и коррупцией на всех уровнях.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.8, margin: 0 }}>
            Наши офицеры обладают высочайшей квалификацией и готовы служить закону в любое время суток, обеспечивая безопасность граждан штата San Andreas.
          </p>
        </div>
      </div>

      {/* 4. БЛОК РУКОВОДСТВА (Без изменений) */}
      <div style={{ padding: '80px 20px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '8px 24px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', boxShadow: '0 0 20px rgba(255,38,64,0.4)' }}>
            TOP SECRET // CLEARANCE REQUIRED
          </div>
          
          <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px 0', letterSpacing: '-1px', fontFamily: 'Impact, Arial Black, sans-serif' }}>
            Руководство
          </h2>
          <p style={{ color: '#a0a3ce', fontSize: '15px', marginBottom: '60px' }}>
            Высшее командование Memphis Police Department
          </p>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {staff.length > 0 ? (
              staff.map(member => <StaffCard key={member.id} member={member} isAdminView={false} />)
            ) : (
              <div style={{ color: '#8b8ba7', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed #333' }}>
                Информация о руководстве засекречена.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
