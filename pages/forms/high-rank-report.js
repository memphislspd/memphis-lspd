import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

const RANK_OPTIONS = ['1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг', '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг', '11-12 ранг', '12-13 ранг', '13-14 ранг', '14-15 ранг'];

export default function HighRankReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({ fullName: '', rankRange: '', workLink: '' });

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.user) { router.push('/'); return; }
      setUser(data.user);
    });
    fetch('/api/profile').then(res => res.json()).then(data => {
      setProfile(data.profile);
      if (data.profile.fullName) setFormData(prev => ({ ...prev, fullName: data.profile.fullName }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'highrank', ...formData })
      });
      if (res.ok) { window.toast.success('Отчёт на повышение отправлен!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell title="Хай Ранги" icon="🌟" accent="#FF69B4">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s, opacity:profile.fullName?0.5:1}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>С какого на какой ранг *</label>
          <select required value={formData.rankRange} onChange={e => setFormData({...formData, rankRange:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите диапазон --</option>
            {RANK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Ссылка на проделанную работу *</label>
          <textarea required value={formData.workLink} onChange={e => setFormData({...formData, workLink:e.target.value})} placeholder="Вставьте ссылки на ваши отчёты..." rows="5" style={{...s, resize:'vertical', minHeight:'120px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Discord ID</label>
          <input type="text" value={`${user.username} (${user.id})`} disabled style={{...s, opacity:0.5}} />
        </div>
        <button type="submit" disabled={submitting} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #FF69B4, #FF8DC7)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'600', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(255,105,180,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить отчёт'}
        </button>
      </form>
    </FormShell>
  );
}
