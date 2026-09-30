import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '../../components/FormShell';
import { DEPARTMENTS } from '../../lib/departments';

const RANKS = Array.from({ length: 15 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

const WEAPONS = [
  { value: 'drone', label: '🚁 Дрон', requiresDept: ['k9', 'db'] },
  { value: 'defik', label: '🛡️ Дефибриллятор', requiresDept: null },
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
  const [formData, setFormData] = useState({ fullName: '', department: '', rank: '', weapon: '' });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    });
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d.profile);
      setFormData(prev => ({ ...prev, fullName: d.profile.fullName || '', department: d.profile.department || '' }));
    });
  }, []);

  const selectedWeapon = WEAPONS.find(w => w.value === formData.weapon);
  const isDroneBlocked = selectedWeapon?.requiresDept && !selectedWeapon.requiresDept.includes(formData.department);

  const isFormValid = () => formData.fullName.trim() && formData.department && formData.rank && formData.weapon && !isDroneBlocked;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (isDroneBlocked) { window.toast.error('Дрон доступен только для отделов K9 и DB!'); return; }
      window.toast.error('Заполните все обязательные поля!'); return;
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
      if (res.ok) { window.toast.success('Запрос отправлен!'); router.push('/dashboard'); }
      else { const error = await res.json(); throw new Error(error.error || 'Ошибка отправки'); }
    } catch (error) { window.toast.error(error.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell title="Спец вооружение" icon="🔫" accent="#FF5722">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s, opacity:profile.fullName?0.5:1}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Отдел * {profile.department && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <select required value={formData.department} onChange={e => setFormData({...formData,department:e.target.value,weapon:''})} disabled={!!profile.department} style={{...s, appearance:'none', cursor:profile.department?'not-allowed':'pointer', opacity:profile.department?0.5:1}}>
            <option value="">-- Выберите отдел --</option>
            {DEPARTMENTS.map(dept => <option key={dept.id} value={dept.id}>{dept.emoji} {dept.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Ранг *</label>
          <select required value={formData.rank} onChange={e => setFormData({...formData,rank:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите ранг --</option>
            {RANKS.map(rank => <option key={rank.value} value={rank.value}>{rank.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Какое оружие запрашивается *</label>
          <select required value={formData.weapon} onChange={e => setFormData({...formData,weapon:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите оружие --</option>
            {WEAPONS.map(weapon => (
              <option key={weapon.value} value={weapon.value} disabled={weapon.requiresDept && !weapon.requiresDept.includes(formData.department)}>
                {weapon.label}{weapon.requiresDept && !weapon.requiresDept.includes(formData.department) ? ' (K9/DB)' : ''}
              </option>
            ))}
          </select>
          {isDroneBlocked && (
            <div style={{ background:'rgba(255,152,0,0.15)', border:'1px solid #FF9800', borderRadius:'10px', padding:'12px 16px', marginTop:'10px', display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'20px' }}>⚠️</span>
              <span style={{ color:'#FFB74D', fontSize:'14px' }}>Дрон доступен только для отделов K9 и DB</span>
            </div>
          )}
        </div>
        <button type="submit" disabled={submitting || !isFormValid()} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #FF5722, #FF8A65)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(255,87,34,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить запрос'}
        </button>
      </form>
    </FormShell>
  );
}
