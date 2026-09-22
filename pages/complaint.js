import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ComplaintForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complainantName: '',
    targetName: '',
    description: '',
    evidence: '',
    incidentDate: ''
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
          setFormData(prev => ({ ...prev, complainantName: data.profile.fullName }));
        }
      });
  }, []);

  const isValid = () => {
    return formData.complainantName.trim()
      && formData.targetName.trim()
      && formData.description.trim()
      && formData.evidence.trim()
      && formData.incidentDate.trim();
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
          type: 'complaint',
          complainantName: formData.complainantName,
          targetName: formData.targetName,
          description: formData.description,
          evidence: formData.evidence,
          incidentDate: formData.incidentDate
        })
      });
      if (res.ok) { alert('✅ Жалоба отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { alert('❌ ' + e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      
      <div style={{ maxWidth:'600px',margin:'0 auto',background:'rgba(255,0,0,0.05)',borderRadius:'20px',padding:'40px',border:'1px solid rgba(255,0,0,0.2)' }}>
        <h1 style={{ marginBottom:'30px',fontSize:'28px' }}>🚨 Жалоба на сотрудника</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Ваше Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <input type="text" required value={formData.complainantName} onChange={e => setFormData({...formData, complainantName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s,opacity:profile.fullName?0.5:1}} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Имя Фамилия + Статик нарушителя *</label>
            <input type="text" required value={formData.targetName} onChange={e => setFormData({...formData, targetName:e.target.value})} placeholder="Ivan Ivanov 123456" style={s} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Дата и время инцидента *</label>
            <input type="text" required value={formData.incidentDate} onChange={e => setFormData({...formData, incidentDate:e.target.value})} placeholder="20.09.2026, 21:30" style={s} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Описание ситуации *</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description:e.target.value})} placeholder="Опишите что произошло..." rows="6" style={{...s,resize:'vertical',minHeight:'150px'}} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Доказательства (ссылки на скриншоты/видео) *</label>
            <textarea required value={formData.evidence} onChange={e => setFormData({...formData, evidence:e.target.value})} placeholder="Вставьте ссылки: imgur, yapx, youtube, medal, streamable..." rows="4" style={{...s,resize:'vertical',minHeight:'100px'}} />
            <div style={{ marginTop:'8px',fontSize:'12px',color:'#8b8ba7' }}>
              Разрешённые хостинги: imgur, yapx, youtube, medal, streamable, discord, ibb
            </div>
          </div>

          <button type="submit" disabled={submitting || !isValid()} style={{ width:'100%',padding:'14px',background:'#FF0000',color:'white',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:600,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,marginTop:'10px' }}>
            {submitting ? '⏳ Отправка...' : '🚨 Отправить жалобу'}
          </button>
        </form>
      </div>
    </div>
  );
}
//
