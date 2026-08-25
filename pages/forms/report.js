import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DEPARTMENTS = [
  { id: 'af', name: 'AF', emoji: '✈️' },
  { id: 'iad', name: 'IAD', emoji: '⚖️' },
  { id: 'swat', name: 'SWAT', emoji: '🛡️' },
  { id: 'pai', name: 'PAI', emoji: '🎓' },
  { id: 'dvd', name: 'DVD', emoji: '🚗' },
  { id: 'db', name: 'DB', emoji: '🕵️' },
  { id: 'k9', name: 'K9', emoji: '🐕' },
  { id: 'cpd', name: 'CPD', emoji: '🚔' },
  { id: 'halt', name: 'HALT', emoji: '🚁' },
  { id: 'ted', name: 'TED', emoji: '🔫' },
  { id: 'srt', name: 'SRT', emoji: '🛡️' },
  { id: 'nred', name: 'NRED', emoji: '🚨' },
  { id: 'med', name: 'MED', emoji: '🏥' }
];

const RANKS = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' },
  { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '8', label: '8' },
  { value: '9', label: '9' }, { value: '10', label: '10' }
];

export default function ReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [formData, setFormData] = useState({
    fullName: '', department: '', currentRank: '', targetRank: '', isInstructor: '', workLinks: ''
  });

  const targetRankNum = parseInt(formData.targetRank);
  const showInstructorField = targetRankNum === 10;

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    });
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d.profile);
      setFormData(prev => ({
        ...prev,
        fullName: d.profile.fullName || '',
        department: d.profile.department || ''
      }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showInstructorField && formData.isInstructor !== 'yes') {
      alert('⚠️ Для повышения на 10 ранг необходимо быть назначенным на инструктора');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report', department: formData.department, fullName: formData.fullName,
          currentRank: formData.currentRank, targetRank: formData.targetRank,
          isInstructor: formData.isInstructor || 'no', workLinks: formData.workLinks
        })
      });
      if (res.ok) { alert('✅ Отчёт успешно отправлен!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { alert('❌ Ошибка при отправке отчёта: ' + error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      <div style={{ maxWidth:'600px',margin:'0 auto',background:'rgba(255,255,255,0.05)',borderRadius:'20px',padding:'40px',border:'1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ marginBottom:'30px',fontSize:'28px' }}>📋 Отчёт о повышении</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s,opacity:profile.fullName?0.5:1}} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Выберите отдел * {profile.department && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <select required value={formData.department} onChange={e => setFormData({...formData,department:e.target.value})} disabled={!!profile.department} style={{...s,appearance:'none',cursor:profile.department?'not-allowed':'pointer',opacity:profile.department?0.5:1}}>
              <option value="">-- Выберите отдел --</option>
              {DEPARTMENTS.map(dept => <option key={dept.id} value={dept.id}>{dept.emoji} {dept.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Ваш текущий ранг *</label>
            <select required value={formData.currentRank} onChange={e => setFormData({...formData,currentRank:e.target.value})} style={{...s,appearance:'none',cursor:'pointer'}}>
              <option value="">-- Выберите текущий ранг --</option>
              {RANKS.map(rank => <option key={rank.value} value={rank.value}>{rank.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>На какой ранг повышаетесь *</label>
            <select required value={formData.targetRank} onChange={e => setFormData({...formData,targetRank:e.target.value,isInstructor:''})} style={{...s,appearance:'none',cursor:'pointer'}}>
              <option value="">-- Выберите целевой ранг --</option>
              {RANKS.map(rank => <option key={rank.value} value={rank.value}>{rank.label}</option>)}
            </select>
          </div>
          {showInstructorField && (
            <div style={{ background:'rgba(255,152,0,0.08)',border:'1px solid rgba(255,152,0,0.25)',borderRadius:'12px',padding:'18px',marginBottom:'20px' }}>
              <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Назначены ли вы на инструктора? *</label>
              <select required value={formData.isInstructor} onChange={e => setFormData({...formData,isInstructor:e.target.value})} style={{...s,appearance:'none',cursor:'pointer'}}>
                <option value="">-- Выберите ответ --</option>
                <option value="yes">✅ Да</option>
                <option value="no">❌ Нет</option>
              </select>
              <div style={{ marginTop:'8px',fontSize:'13px',color:'#FFB74D' }}>⚠️ Для повышения на 10 ранг необходимо быть назначенным на инструктора</div>
            </div>
          )}
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Ссылки на проделанную работу *</label>
            <textarea required value={formData.workLinks} onChange={e => setFormData({...formData,workLinks:e.target.value})} placeholder="Вставьте ссылки на ваши отчёты, посты или другие доказательства работы..." rows="4" style={{...s,resize:'vertical',minHeight:'100px'}} />
          </div>
          <button type="submit" disabled={submitting || (showInstructorField && formData.isInstructor !== 'yes')} style={{ width:'100%',padding:'14px',background:'#5865F2',color:'white',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:600,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,marginTop:'10px' }}>
            {submitting ? '⏳ Отправка...' : '📤 Отправить отчёт'}
          </button>
        </form>
      </div>
    </div>
  );
}
