// pages/forms/high-rank-report.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

const REQUIRED_ROLE_ID = '1514608894679191597'; // Роль, дающая доступ к хай-отчетам

const RANK_OPTIONS = ['1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг', '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг', '11-12 ранг', '12-13 ранг', '13-14 ранг', '14-15 ранг'];

export default function HighRankReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({ fullName: '', rankRange: '', workLink: '' });

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.user) { router.replace('/'); return; }
      setUser(data.user);
      if (data.user.roles && data.user.roles.includes(REQUIRED_ROLE_ID)) {
        setHasAccess(true);
      }
    }).catch(() => router.replace('/'));
    
    fetch('/api/profile').then(res => res.json()).then(data => {
      const nextProfile = data?.profile || { fullName: '' };
      setProfile(nextProfile);
      if (nextProfile.fullName) setFormData(prev => ({ ...prev, fullName: nextProfile.fullName }));
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
        body: JSON.stringify({ type: 'highrank', ...formData })
      });
      if (res.ok) { window.toast.success('Отчёт на повышение отправлен!'); router.push('/hub'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#030303', color:'white' }}>Загрузка...</div>;

  // Экран, если зашли по ссылке без роли
  if (!hasAccess) {
    return (
      <FormShell user={user} title="Доступ запрещен" icon="⛔">
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ color: '#ff2640', marginBottom: '16px', fontSize: '24px' }}>ACCESS DENIED</h2>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>У вас нет необходимой роли для подачи отчета на повышение (Хай Ранги).</p>
          <button onClick={() => router.push('/hub')} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Вернуться назад</button>
        </div>
      </FormShell>
    );
  }

  const s = { width:'100%', padding:'12px 15px', background:'#0a0a0a', border:'1px solid #2a2a2a', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#9ca3af', fontSize:'13px', fontWeight:'600' };

  return (
    <FormShell user={user} title="Хай Ранги" icon="🌟">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:'600' }}>(из профиля)</span>}</label>
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
        <button type="submit" disabled={submitting} style={{ width:'100%', padding:'14px', background:'#2563EB', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'bold', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px' }}>
          {submitting ? 'Отправка...' : 'Отправить отчёт'}
        </button>
      </form>
    </FormShell>
  );
}
