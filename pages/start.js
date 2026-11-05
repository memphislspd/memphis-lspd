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
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', fontFamily: 'sans-serif', overflowX: 'hidden' }}>
      
      {/* 1. ШАПКА (Как на FIB) */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}>
        {/* Логотип слева */}
        <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '1px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#2563EB' }}>LSPD</span> INTRANET
        </div>
        
        {/* Навигация по центру */}
        <div style={{ display: 'flex', gap: '30px', fontSize: '13px', color: '#a0a3ce', fontWeight: 'bold' }}>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', color: 'white' }}>Заявления</span>
          <span style={{ cursor: 'pointer' }}>Отделы</span>
          <span style={{ cursor: 'pointer' }}>Для сотрудников</span>
        </div>

        {/* Профиль справа */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#a0a3ce' }}>{user.username}</div>
          <button onClick={() => router.push('/profile')} style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #2563EB', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </nav>

      {/* 2. ГЛАВНЫЙ ЭКРАН (HERO) С МАШИНАМИ */}
      <div style={{ position: 'relative', padding: '140px 20px 180px', textAlign: 'center', overflow: 'hidden' }}>
        
        {/* МАШИНА СЛЕВА (Замени ссылку на свою картинку машины с прозрачным фоном) */}
        <img 
          src="https://i.ibb.co/3W2Z4Q2/police-car-left.png" 
          alt="Car Left"
          style={{ position: 'absolute', left: '-5%', bottom: '-20px', width: '45%', maxWidth: '600px', opacity: 0.4, zIndex: 0, filter: 'grayscale(80%) brightness(50%)' }}
        />

        {/* МАШИНА СПРАВА (Замени ссылку) */}
        <img 
          src="https://i.ibb.co/3W2Z4Q2/police-car-right.png" 
          alt="Car Right"
          style={{ position: 'absolute', right: '-5%', bottom: '-20px', width: '45%', maxWidth: '600px', opacity: 0.4, zIndex: 0, filter: 'grayscale(80%) brightness(50%)' }}
        />

        {/* Текст по центру (Z-index выше, чтобы быть над машинами) */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#a0a3ce', marginBottom: '30px' }}>
            MAJESTIC ROLE PLAY - MEMPHIS
          </div>
          
          <h1 style={{ fontSize: '80px', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-2px', lineHeight: 0.95, textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            Memphis Police<br/>Department
          </h1>
          
          <p style={{ color: '#a0a3ce', fontSize: '16px', maxWidth: '500px', margin: '0 auto 50px auto', lineHeight: 1.6 }}>
            Обеспечение правопорядка, защита граждан штата и поддержание закона на улицах города.
          </p>
          
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: 'white',
            border: 'none', padding: '16px 40px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)'; }}
          >
            Подать заявление
          </button>
        </div>
      </div>

      {/* 3. БЛОК МИССИИ (Как на FIB) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', color: '#ff2640', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '30px', textTransform: 'uppercase' }}>
          Наша миссия
        </div>
        <p style={{ color: '#a0a3ce', fontSize: '15px', lineHeight: 1.8, textAlign: 'center' }}>
          Memphis Police Department стремится защищать американский народ и отстаивать Конституцию штата. Мы работаем над предотвращением преступности, борьбой с организованными крайм-структурами и коррупцией на всех уровнях. Наши офицеры обладают высочайшей квалификацией и готовы служить закону в любое время суток.
        </p>
      </div>

      {/* 4. БЛОК РУКОВОДСТВА */}
      <div style={{ padding: '80px 20px 120px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '8px 24px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', boxShadow: '0 0 20px rgba(255,38,64,0.4)' }}>
            TOP SECRET // CLEARANCE REQUIRED
          </div>
          
          <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px 0', letterSpacing: '-1px' }}>
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
