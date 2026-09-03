import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PremiumForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    participants: ''
  });

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/');
          return;
        }
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

  const isValid = () => {
    return formData.fullName.trim() && formData.participants.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) { alert('Заполните все поля!'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'premium',
          fullName: formData.fullName,
          participants: formData.participants
        })
      });
      if (res.ok) { alert('✅ Отправлено!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { alert('❌ ' + e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      
      <div style={{ maxWidth:'600px',margin:'0 auto',background:'rgba(255,255,255,0.05)',borderRadius:'20px',padding:'40px',border:'1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ marginBottom:'30px',fontSize:'28px' }}>🎯 Премия</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s,opacity:profile.fullName?0.5:1}} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Участники *</label>
            <textarea required value={formData.participants} onChange={e => setFormData({...formData,participants:e.target.value})} placeholder={'Daemon Winchester | 11 | 85761 | 1\nAleksey Winchester | 11 | 87771 | 1'} rows="10" style={{...s,resize:'vertical',minHeight:'200px',fontFamily:'monospace'}} />
            <div style={{ marginTop:'8px',fontSize:'13px',color:'#8b8ba7' }}>
              Формат: Имя | Ранг | Static | Недель
            </div>
          </div>

          <button type="submit" disabled={submitting || !isValid()} style={{ width:'100%',padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:600,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,marginTop:'10px' }}>
            {submitting ? '⏳ Отправка...' : '📤 Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
}
