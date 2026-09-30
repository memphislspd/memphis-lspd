import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '../../components/FormShell';

const RANKS = Array.from({ length: 15 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

export default function ReinstatementForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({ fullName: '', rankAtDismissal: '', rankProof: '', wasWarned: '', stateFractionsProof: '' });

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

  const isFormValid = () => {
    if (!formData.fullName.trim() || !formData.rankAtDismissal || !formData.rankProof.trim() || !formData.wasWarned) return false;
    if (formData.wasWarned === 'yes' && !formData.stateFractionsProof.trim()) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) { window.toast.error('Заполните все обязательные поля!'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reinstatement', ...formData })
      });
      if (res.ok) { window.toast.success('Заявка на восстановление отправлена!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell title="Восстановление" icon="🔄" accent="#9C27B0">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s, opacity:profile.fullName?0.5:1}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Ранг на момент увольнения *</label>
          <select required value={formData.rankAtDismissal} onChange={e => setFormData({...formData, rankAtDismissal:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите ранг --</option>
            {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Доказательство ранга *</label>
          <textarea required value={formData.rankProof} onChange={e => setFormData({...formData, rankProof:e.target.value})} placeholder="Ссылка на скриншот планшета..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Вы были уволены после Ban/Warn? *</label>
          <select required value={formData.wasWarned} onChange={e => setFormData({...formData, wasWarned:e.target.value, stateFractionsProof:''})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите ответ --</option>
            <option value="yes">✅ Да</option>
            <option value="no">❌ Нет</option>
          </select>
        </div>
        {formData.wasWarned === 'yes' && (
          <div style={{ background:'rgba(156,39,176,0.08)', border:'1px solid rgba(156,39,176,0.25)', borderRadius:'12px', padding:'18px', marginBottom:'20px' }}>
            <label style={lbl}>Скриншот одобрения из State Fractions *</label>
            <textarea required value={formData.stateFractionsProof} onChange={e => setFormData({...formData, stateFractionsProof:e.target.value})} placeholder="Ссылка на скриншот..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
          </div>
        )}
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Discord ID</label>
          <input type="text" value={`${user.username} (${user.id})`} disabled style={{...s, opacity:0.5}} />
        </div>
        <button type="submit" disabled={submitting || !isFormValid()} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #9C27B0, #BA68C8)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(156,39,176,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить заявку'}
        </button>
      </form>
    </FormShell>
  );
}
