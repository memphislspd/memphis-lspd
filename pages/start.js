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
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: 'white',
      fontFamily: 'sans-serif',
      overflowX: 'hidden'
    }}>

      {/* 1. ШАПКА */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2px', color: 'white' }}>
          LSPD
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#a0a3ce', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            Заявки
          </button>
          <button onClick={() => router.push('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #5865F2', cursor: 'pointer', padding: 0 }}>
             <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </nav>

      {/* 2. ГЛАВНЫЙ ЭКРАН (HERO) */}
      <div style={{ 
        padding: '120px 20px', 
        textAlign: 'center',
        // Имитация фона с машинами (можно заменить на реальные картинки машин по бокам)
        background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15) 0%, transparent 60%)'
      }}>
        <div style={{ color: '#ff2640', fontSize: '12px', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>
          MAJESTIC ROLE PLAY - MEMPHIS
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-2px', lineHeight: 1 }}>
          Memphis Police<br/>Department
        </h1>
        <p style={{ color: '#a0a3ce', fontSize: '18px', maxWidth: '600px', margin: '0 auto 50px auto', lineHeight: 1.6 }}>
          Обеспечение правопорядка, защита граждан штата и поддержание закона на улицах города.
        </p>
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: 'white',
          border: 'none', padding: '18px 40px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
          cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.3)'; }}
        >
          Подать заявление
        </button>
      </div>

      {/* 3. БЛОК МИССИИ */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', color: '#ff2640', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '30px' }}>
          НАША МИССИЯ
        </div>
        <p style={{ color: '#a0a3ce', fontSize: '16px', lineHeight: 1.8, textAlign: 'justify' }}>
          Memphis Police Department стремится защищать американский народ и отстаивать Конституцию штата. Мы работаем над предотвращением преступности, борьбой с организованными крайм-структурами и коррупцией на всех уровнях. 
          <br/><br/>
          Наши офицеры обладают высочайшей квалификацией и готовы служить закону в любое время суток, обеспечивая безопасность граждан штата San Andreas.
        </p>
      </div>

      {/* 4. БЛОК РУКОВОДСТВА */}
      <div style={{ padding: '80px 20px 120px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '8px 20px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', boxShadow: '0 0 20px rgba(255,38,64,0.4)' }}>
            TOP SECRET // CLEARANCE REQUIRED
          </div>
          
          <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px 0', letterSpacing: '-1px' }}>
            Руководство
          </h2>
          <p style={{ color: '#a0a3ce', fontSize: '16px', marginBottom: '60px', letterSpacing: '1px' }}>
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
