import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '../../components/FormShell';
import FormLoading from '../../components/FormLoading';

export default function ResignationForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({ fullName: '', screenshot: '' });

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.user) { router.push('/'); return; }
      setUser(data.user);
    }).catch(() => router.replace('/'));
    fetch('/api/profile').then(res => res.json()).then(data => {
      const nextProfile = data?.profile || { fullName: '' };
      setProfile(nextProfile);
      if (nextProfile.fullName) setFormData(prev => ({ ...prev, fullName: prev.fullName || nextProfile.fullName }));
    }).catch(() => {
      setProfile({ fullName: '' });
      window.toast?.error('Не удалось загрузить профиль. Заполните имя вручную.');
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'resignation', ...formData })
      });
      if (res.ok) { window.toast.success('Заявление на увольнение отправлено!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <FormLoading />;
  if (!user) return null;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell user={user} title="Увольнение" icon="🚪" accent="#DC3545">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик *</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName:e.target.value})} placeholder="Sanya Suspect 270726" style={s} />
          {profile.fullName && <p className="form-field-hint">Загружено из профиля — поле можно изменить.</p>}
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Скриншот планшета *</label>
          <textarea required value={formData.screenshot} onChange={e => setFormData({...formData, screenshot:e.target.value})} placeholder="Ссылка на скриншот планшета..." rows="4" style={{...s, resize:'vertical', minHeight:'100px'}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Discord ID</label>
          <input type="text" value={`${user.username} (${user.id})`} disabled style={{...s, opacity:0.5}} />
        </div>
        <button type="submit" disabled={submitting} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #DC3545, #F0627A)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(220,53,69,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить заявление'}
        </button>
      </form>
    </FormShell>
  );
}
