import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

const EXPERIENCE_OPTIONS = ['Нет опыта', 'Был в LSCSD', 'Был в FIB', 'Был в SANG', 'Другое'];
const LAW_KNOWLEDGE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function HiringForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({ fullName: '', age: '', experience: '', lawKnowledge: '', passport: '', militaryId: '', medical: '' });

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

  const isFormValid = () => formData.fullName.trim() && formData.age.trim() && formData.experience && formData.lawKnowledge && formData.passport.trim() && formData.militaryId.trim() && formData.medical.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) { window.toast.error('Заполните все обязательные поля!'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hiring', ...formData })
      });
      if (res.ok) { window.toast.success('Заявка на трудоустройство отправлена!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell title="Трудоустройство" icon="📝" accent="#4CAF50">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s, opacity:profile.fullName?0.5:1}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Возраст (RP) *</label>
          <input type="text" required value={formData.age} onChange={e => setFormData({...formData, age:e.target.value})} placeholder="25" style={s} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Опыт работы в гос. структурах *</label>
          <select required value={formData.experience} onChange={e => setFormData({...formData, experience:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите вариант --</option>
            {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Знание законов RP (1-10) *</label>
          <select required value={formData.lawKnowledge} onChange={e => setFormData({...formData, lawKnowledge:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Оцените знания --</option>
            {LAW_KNOWLEDGE.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Скриншот паспорта *</label>
          <textarea required value={formData.passport} onChange={e => setFormData({...formData, passport:e.target.value})} placeholder="Ссылка на скриншот..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Скриншот военного билета *</label>
          <textarea required value={formData.militaryId} onChange={e => setFormData({...formData, militaryId:e.target.value})} placeholder="Ссылка на скриншот..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Скриншот мед. справок *</label>
          <textarea required value={formData.medical} onChange={e => setFormData({...formData, medical:e.target.value})} placeholder="Ссылка на скриншот..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Discord ID</label>
          <input type="text" value={`${user.username} (${user.id})`} disabled style={{...s, opacity:0.5}} />
        </div>
        <button type="submit" disabled={submitting || !isFormValid()} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #4CAF50, #66BB6A)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(76,175,80,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить заявку'}
        </button>
      </form>
    </FormShell>
  );
}
