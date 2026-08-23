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
  { id: 'alpha', name: 'ALPHA', emoji: '💥' },
  { id: 'mcd', name: 'MCD', emoji: '🚨' },
  { id: 'cpd', name: 'CPD', emoji: '🚔' },
  { id: 'halt', name: 'HALT', emoji: '🚁' },
  { id: 'pa', name: 'PA', emoji: '🎓' },
  { id: 'ctrt', name: 'CTRT', emoji: '🔫' }
];

const RANKS = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' },
  { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '8', label: '8' },
  { value: '9', label: '9' }, { value: '10', label: '10' },
  { value: '11', label: '11' }, { value: '12', label: '12' },
  { value: '13', label: '13' }, { value: '14', label: '14' },
  { value: '15', label: '15' }
];

const WEAPONS = [
  { value: 'drone', label: '🚁 Дрон', requiresDept: ['k9', 'db'] },
  { value: 'combat-mg', label: '🔫 Combat MG', requiresDept: null },
  { value: 'combat-mg-mk2', label: '🔫 Combat MG Mk2', requiresDept: null },
  { value: 'marksman-rifle-mk2', label: '🎯 Marksman Rifle Mk2', requiresDept: null },
  { value: 'sniper-rifle', label: '🎯 Sniper Rifle', requiresDept: null },
  { value: 'heavy-sniper', label: '🎯 Heavy Sniper', requiresDept: null },
  { value: 'heavy-sniper-mk2', label: '🎯 Heavy Sniper Mk2', requiresDept: null },
  { value: 'precision-rifle', label: '🎯 Precision Rifle', requiresDept: null }
];

export default function WeaponRequestForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [formData, setFormData] = useState({
    fullName: '', department: '', rank: '', weapon: ''
  });

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

  const selectedWeapon = WEAPONS.find(w => w.value === formData.weapon);
  const isDroneBlocked = selectedWeapon?.requiresDept && !selectedWeapon.requiresDept.includes(formData.department);

  const isFormValid = () => {
    if (!formData.fullName.trim()) return false;
    if (!formData.department) return false;
    if (!formData.rank) return false;
    if (!formData.weapon) return false;
    if (isDroneBlocked) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (isDroneBlocked) { alert('❌ Дрон доступен только для отделов K9 и DB!'); return; }
      alert('❌ Пожалуйста, заполните все обязательные поля!'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weapon-request', fullName: formData.fullName,
          department: formData.department, rank: formData.rank,
          weapon: selectedWeapon?.label || formData.weapon
        })
      });
      if (res.ok) { alert('✅ Запрос на спец вооружение успешно отправлен!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { alert('❌ Ошибка при отправке запроса: ' + error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      <div style={{ maxWidth:'600px',margin:'0 auto',background:'rgba(255,255,255,0.05)',borderRadius:'20px',padding:'40px',border:'1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ marginBottom:'30px',fontSize:'28px' }}>🔫 Запрос на спец вооружение</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s,opacity:profile.fullName?0.5:1}} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Отдел * {profile.department && <span style={{ color:'#4CAF50',fontSize:'12px' }}>(из профиля)</span>}</label>
            <select required value={formData.department} onChange={e => setFormData({...formData,department:e.target.value,weapon:''})} disabled={!!profile.department} style={{...s,appearance:'none',cursor:profile.department?'not-allowed':'pointer',opacity:profile.department?0.5:1}}>
              <option value="">-- Выберите отдел --</option>
              {DEPARTMENTS.map(dept => <option key={dept.id} value={dept.id}>{dept.emoji} {dept.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Ранг *</label>
            <select required value={formData.rank} onChange={e => setFormData({...formData,rank:e.target.value})} style={{...s,appearance:'none',cursor:'pointer'}}>
              <option value="">-- Выберите ранг --</option>
              {RANKS.map(rank => <option key={rank.value} value={rank.value}>{rank.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Какое оружие запрашивается *</label>
            <select required value={formData.weapon} onChange={e => setFormData({...formData,weapon:e.target.value})} style={{...s,appearance:'none',cursor:'pointer'}}>
              <option value="">-- Выберите оружие --</option>
              {WEAPONS.map(weapon => (
                <option key={weapon.value} value={weapon.value} disabled={weapon.requiresDept && !weapon.requiresDept.includes(formData.department)}>
                  {weapon.label}{weapon.requiresDept && !weapon.requiresDept.includes(formData.department) ? ' (K9/DB)' : ''}
                </option>
              ))}
            </select>
            {isDroneBlocked && (
              <div style={{ background:'rgba(255,152,0,0.15)',border:'1px solid #FF9800',borderRadius:'10px',padding:'12px 16px',marginTop:'10px',display:'flex',alignItems:'center',gap:'10px' }}>
                <span style={{ fontSize:'20px' }}>⚠️</span>
                <span style={{ color:'#FFB74D',fontSize:'14px' }}>Дрон доступен только для отделов K9 и DB</span>
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting || !isFormValid()} style={{ width:'100%',padding:'14px',background:'#FF5722',color:'white',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:600,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,marginTop:'10px' }}>
            {submitting ? '⏳ Отправка...' : '📤 Отправить запрос'}
          </button>
        </form>
      </div>
    </div>
  );
}
