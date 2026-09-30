import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '../../components/FormShell';
import { DEPARTMENTS, TRANSFER_DEPARTMENTS } from '../../lib/departments';

const RANKS = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const RATING_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function TransferForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [formData, setFormData] = useState({
    fullName: '', rank: '', currentDepartment: '', targetDepartment: '', reason: '',
    dbWhatIs: '', dbExperience: '', dbExamples: '', dbServers: '', dbKnowledge: '', dbLawKnowledge: ''
  });

  const targetDept = formData.targetDepartment;
  const currentDept = formData.currentDepartment;
  const showDbFields = targetDept === 'db';
  const isSameDepartment = currentDept && targetDept && currentDept === targetDept;
  const isDbComplete = !showDbFields || (formData.dbWhatIs.trim() && formData.dbExperience && formData.dbExamples.trim() && formData.dbServers.trim() && formData.dbKnowledge && formData.dbLawKnowledge);

  const isFormValid = () => {
    if (!formData.fullName.trim() || !formData.rank || !formData.currentDepartment || !formData.targetDepartment || !formData.reason.trim()) return false;
    if (isSameDepartment) return false;
    if (!isDbComplete) return false;
    return true;
  };

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    });
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d.profile);
      setFormData(prev => ({ ...prev, fullName: d.profile.fullName || '', currentDepartment: d.profile.department || '' }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (isSameDepartment) { window.toast.error('Нельзя перевестись в тот же отдел!'); return; }
      window.toast.error('Заполните все обязательные поля!'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'transfer', ...formData })
      });
      if (res.ok) { window.toast.success('Заявка отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { window.toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };

  return (
    <FormShell title="Перевод в отдел" icon="🔄" accent="#2196F3">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Имя Фамилия + Статик * {profile.fullName && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData,fullName:e.target.value})} placeholder="Sanya Suspect 270726" disabled={!!profile.fullName} style={{...s, opacity:profile.fullName?0.5:1}} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Ваш ранг *</label>
          <select required value={formData.rank} onChange={e => setFormData({...formData,rank:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите ранг --</option>
            {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Текущий отдел * {profile.department && <span style={{ color:'#4CAF50', fontSize:'11px', fontWeight:600 }}>(из профиля)</span>}</label>
          <select required value={formData.currentDepartment} onChange={e => setFormData({...formData,currentDepartment:e.target.value})} disabled={!!profile.department} style={{...s, appearance:'none', cursor:profile.department?'not-allowed':'pointer', opacity:profile.department?0.5:1}}>
            <option value="">-- Выберите отдел --</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Желаемый отдел *</label>
          <select required value={formData.targetDepartment} onChange={e => setFormData({...formData,targetDepartment:e.target.value,dbWhatIs:'',dbExperience:'',dbExamples:'',dbServers:'',dbKnowledge:'',dbLawKnowledge:''})} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите отдел --</option>
            {TRANSFER_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
          </select>
        </div>
        {isSameDepartment && <div style={{ background:'rgba(244,67,54,0.15)', border:'1px solid #F44336', borderRadius:'10px', padding:'14px 18px', marginBottom:'20px', color:'#EF9A9A', fontSize:'14px' }}>❌ Нельзя перевестись в тот же отдел!</div>}
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Причина перевода *</label>
          <textarea required value={formData.reason} onChange={e => setFormData({...formData,reason:e.target.value})} placeholder="Опишите причину..." rows="4" style={{...s, resize:'vertical', minHeight:'100px'}} />
        </div>
        {showDbFields && (
          <div style={{ background:'rgba(33,150,243,0.08)', border:'1px solid rgba(33,150,243,0.25)', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
            <h3 style={{ marginBottom:'20px', fontSize:'16px', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px' }}>📋 Дополнительные вопросы для DB</h3>
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Чем занимается DB? *</label>
              <textarea required value={formData.dbWhatIs} onChange={e => setFormData({...formData,dbWhatIs:e.target.value})} placeholder="Опишите..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Опыт работы в DB? *</label>
              <select required value={formData.dbExperience} onChange={e => setFormData({...formData,dbExperience:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
                <option value="">-- Выберите --</option>
                <option value="Нет опыта, но хочу попробовать">Нет опыта</option>
                <option value="Был средним составом в подобных отделах">Был средним составом</option>
                <option value="Занимал руководящую должность">Занимал руководящую должность</option>
              </select>
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>Примеры работ *</label>
              <textarea required value={formData.dbExamples} onChange={e => setFormData({...formData,dbExamples:e.target.value})} placeholder="Примеры работ..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>На каких серверах были в DB? *</label>
              <textarea required value={formData.dbServers} onChange={e => setFormData({...formData,dbServers:e.target.value})} placeholder="Серверы..." rows="3" style={{...s, resize:'vertical', minHeight:'80px'}} />
            </div>
            <div style={{ display:'flex', gap:'15px' }}>
              <div style={{ flex:1, marginBottom:'20px' }}>
                <label style={lbl}>Знания по работе DB *</label>
                <select required value={formData.dbKnowledge} onChange={e => setFormData({...formData,dbKnowledge:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
                  <option value="">-- Оцените --</option>
                  {RATING_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ flex:1, marginBottom:'20px' }}>
                <label style={lbl}>Знания по законке *</label>
                <select required value={formData.dbLawKnowledge} onChange={e => setFormData({...formData,dbLawKnowledge:e.target.value})} style={{...s, appearance:'none', cursor:'pointer'}}>
                  <option value="">-- Оцените --</option>
                  {RATING_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
        <button type="submit" disabled={submitting || !isFormValid()} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #2196F3, #64B5F6)', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.5:1, marginTop:'10px', boxShadow:'0 4px 12px rgba(33,150,243,0.25)' }}>
          {submitting ? '⏳ Отправка...' : '📤 Отправить'}
        </button>
      </form>
    </FormShell>
  );
}
