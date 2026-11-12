import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';
import FormLoading from '@/components/FormLoading';
import { DEPARTMENTS } from '@/lib/departments';

const LEAVE_TYPES = [
  { value: 'ooc', label: '🌍 OOC (по реальной жизни)' },
  { value: 'ic', label: '🎮 IC (по игре/RP)' }
];

export default function LeaveForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [formData, setFormData] = useState({ leaveType: '', fullName: '', department: '', reason: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      router.replace('/');
    });
    fetch('/api/profile').then(r => r.json()).then(d => {
      const nextProfile = d?.profile || {};
      setProfile(nextProfile);
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || nextProfile.fullName || '',
        department: prev.department || nextProfile.department || ''
      }));
    }).catch(() => {
      setProfile({ fullName: '', department: '' });
      window.toast?.error('Не удалось загрузить профиль. Заполните имя и отдел вручную.');
    });
  }, []);

  const isValid = () => formData.leaveType && formData.fullName.trim() && formData.department && formData.reason.trim() && formData.startDate.trim() && formData.endDate.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) { window.toast.error('Заполните все поля!'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leave', ...formData })
      });
      if (res.ok) { window.toast.success('Заявка на отпуск отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { window.toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <FormLoading />;
  if (!user) return null;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell user={user} title="Отпуск" icon="🏖️" accent="#00BCD4">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Тип отпуска *</label>
          <select required value={formData.leaveType} onChange={e => setFormData({...formData,leaveType:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите тип --</option>
            {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик *</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" style={s} />
          {profile.fullName && <p className="form-field-hint">Загружено из профиля — поле можно изменить.</p>}
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Отдел * {profile.department && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <select required value={formData.department} onChange={e => setFormData({...formData,department:e.target.value})} disabled={!!profile.department} style={{...s, appearance:'none', cursor:profile.department?'not-allowed':'pointer', opacity:profile.department?0.5:1}}>
            <option value="">-- Выберите отдел --</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Причина *</label>
          <textarea required value={formData.reason} onChange={e => setFormData({...formData,reason:e.target.value})} placeholder="Опишите причину..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
        </div>
        <div className="form-row--responsive" style={{ marginBottom:'20px' }}>
          <div style={{ flex:1 }}>
            <label style={lbl}>Дата начала *</label>
            <input type="text" required value={formData.startDate} onChange={e => setFormData({...formData,startDate:e.target.value})} placeholder="15.08.2024" style={s} />
          </div>
          <div style={{ flex:1 }}>
            <label style={lbl}>Дата окончания *</label>
            <input type="text" required value={formData.endDate} onChange={e => setFormData({...formData,endDate:e.target.value})} placeholder="20.08.2024" style={s} />
          </div>
        </div>
        <button type="submit" disabled={submitting || !isValid()} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #00BCD4, #4DD0E1)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(0,188,212,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить'}
        </button>
      </form>
    </FormShell>
  );
}
