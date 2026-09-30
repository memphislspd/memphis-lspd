import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const RANK_OPTIONS = [
  '1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг',
  '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг',
  '11-12 ранг', '12-13 ранг'
];

export default function PromotionForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    rankRange: '',
    reportLink: ''
  });

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        setLoading(false);
      });
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile);
        if (data.profile.fullName) {
          setFormData(prev => ({ ...prev, fullName: data.profile.fullName }));
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'promotion',
          fullName: formData.fullName,
          rankRange: formData.rankRange,
          reportLink: formData.reportLink
        })
      });
      if (res.ok) { window.toast.success('Заявка отправлена!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>
      <div style={{ width:'50px', height:'50px', border:'4px solid rgba(88,101,242,0.15)', borderTopColor:'#5865F2', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const s = { 
    width:'100%', padding:'12px 15px', 
    background:'rgba(255,255,255,0.05)', 
    border:'1px solid rgba(255,255,255,0.15)', 
    borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' 
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>

      {/* Sticky шапка */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '700px', margin: '0 auto', padding: '16px 20px', gap: '16px'
        }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.05)', color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 14px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📈</span>
            Запрос на повышение
          </div>

          <div style={{ width: '80px' }} />
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #4CAF50, #4CAF5080, transparent)'
          }} />

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 }}>
                Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}
              </label>
              <input 
                type="text" required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Например: Sanya Suspect 270726"
                disabled={!!profile.fullName}
                style={{...s, opacity: profile.fullName ? 0.5 : 1, cursor: profile.fullName ? 'not-allowed' : 'text'}}
              />
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 }}>
                С какого на какой ранг вы повышаетесь *
              </label>
              <select
                required
                value={formData.rankRange}
                onChange={e => setFormData({...formData, rankRange: e.target.value})}
                style={{...s, appearance:'none', cursor:'pointer'}}
              >
                <option value="">-- Выберите диапазон рангов --</option>
                {RANK_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 }}>
                Ссылка на одобренный отчет о повышении *
              </label>
              <textarea 
                required
                value={formData.reportLink}
                onChange={e => setFormData({...formData, reportLink: e.target.value})}
                placeholder="Вставьте ссылку на ваш одобренный отчет о повышении..."
                rows="4"
                style={{...s, resize:'vertical', minHeight:'100px'}}
              />
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 }}>
                Discord ID
              </label>
              <input 
                type="text" 
                value={`${user.username} (${user.id})`}
                disabled 
                style={{...s, opacity: 0.5, cursor: 'not-allowed'}}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{
                width:'100%', padding:'14px',
                background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                color:'white', border:'none', borderRadius:'10px',
                fontSize:'15px', fontWeight:600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
                marginTop:'10px',
                boxShadow: '0 4px 12px rgba(76,175,80,0.25)'
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,175,80,0.4)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px rgba(76,175,80,0.25)'; }}
            >
              {submitting ? '⏳ Отправка...' : '📤 Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
