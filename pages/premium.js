import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '../components/FormShell';
import { DEPARTMENTS } from '../lib/departments';

export default function PremiumForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [department, setDepartment] = useState('');
  const [participants, setParticipants] = useState([]);
  const [step, setStep] = useState(0);
  const [currentParticipant, setCurrentParticipant] = useState({ name: '', rank: '', static: '', weeks: '' });

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.user) { router.push('/'); return; }
      setUser(data.user);
      setLoading(false);
    });
    fetch('/api/profile').then(res => res.json()).then(data => setProfile(data.profile));
  }, []);

  const handleNext = () => {
    if (step === 0) {
      if (!department) { window.toast.error('Выберите отдел!'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!currentParticipant.name.trim()) { window.toast.error('Введите имя!'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!currentParticipant.rank.trim()) { window.toast.error('Введите ранг!'); return; }
      setStep(3);
    } else if (step === 3) {
      if (!currentParticipant.static.trim()) { window.toast.error('Введите Static ID!'); return; }
      setStep(4);
    } else if (step === 4) {
      if (!currentParticipant.weeks.trim()) { window.toast.error('Введите кол-во недель!'); return; }
      setParticipants([...participants, currentParticipant]);
      setCurrentParticipant({ name: '', rank: '', static: '', weeks: '' });
      setStep(5);
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); else if (step === 1) setStep(0); };
  const addMore = () => setStep(1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const participantsText = participants.map(p => `${p.name} | ${p.rank} | ${p.static} | ${p.weeks}`).join('\n');
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'premium', fullName: profile.fullName || user.username, department, participants: participantsText })
      });
      if (res.ok) { window.toast.success('Премия отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { window.toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a1a', color:'white' }}>Загрузка...</div>;

  const s = { width:'100%', padding:'12px 15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box' };
  const lbl = { display:'block', marginBottom:'8px', color:'#8b8ba7', fontSize:'13px', fontWeight:500 };
  const btnStyle = (bg) => ({ flex:1, padding:'14px', background:bg, color:'white', border:'none', borderRadius:'10px', fontWeight:600, cursor:'pointer' });

  return (
    <FormShell title="Премия" icon="🎯" accent="#FFD700">
      {participants.length > 0 && (
        <div style={{ marginBottom:'20px', padding:'15px', background:'rgba(255,215,0,0.05)', borderRadius:'10px', border:'1px solid rgba(255,215,0,0.2)' }}>
          <div style={{ fontSize:'13px', color:'#FFD700', marginBottom:'10px', fontWeight:600 }}>Участники ({participants.length}):</div>
          {participants.map((p, i) => (
            <div key={i} style={{ fontSize:'13px', color:'#8b8ba7', marginBottom:'5px' }}>
              {i + 1}. {p.name} | {p.rank} | {p.static} | {p.weeks}
            </div>
          ))}
        </div>
      )}

      {step === 0 && (
        <div>
          <label style={lbl}>За какой отдел премия? *</label>
          <select value={department} onChange={e => setDepartment(e.target.value)} style={{...s, appearance:'none', cursor:'pointer'}}>
            <option value="">-- Выберите отдел --</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
          </select>
          <button onClick={handleNext} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, #FFD700, #FFEB3B)', color:'#0a0a1a', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'20px' }}>Далее</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <label style={lbl}>Имя Фамилия участника *</label>
          <input type="text" value={currentParticipant.name} onChange={e => setCurrentParticipant({...currentParticipant, name:e.target.value})} placeholder="Daemon Winchester" style={s} />
          <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
            <button onClick={handleBack} style={btnStyle('rgba(255,255,255,0.1)')}>Назад</button>
            <button onClick={handleNext} style={{ ...btnStyle('linear-gradient(135deg, #FFD700, #FFEB3B)'), color:'#0a0a1a' }}>Далее</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label style={lbl}>Ранг участника *</label>
          <input type="text" value={currentParticipant.rank} onChange={e => setCurrentParticipant({...currentParticipant, rank:e.target.value})} placeholder="11" style={s} />
          <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
            <button onClick={handleBack} style={btnStyle('rgba(255,255,255,0.1)')}>Назад</button>
            <button onClick={handleNext} style={{ ...btnStyle('linear-gradient(135deg, #FFD700, #FFEB3B)'), color:'#0a0a1a' }}>Далее</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label style={lbl}>Static ID участника *</label>
          <input type="text" value={currentParticipant.static} onChange={e => setCurrentParticipant({...currentParticipant, static:e.target.value})} placeholder="85761" style={s} />
          <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
            <button onClick={handleBack} style={btnStyle('rgba(255,255,255,0.1)')}>Назад</button>
            <button onClick={handleNext} style={{ ...btnStyle('linear-gradient(135deg, #FFD700, #FFEB3B)'), color:'#0a0a1a' }}>Далее</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <label style={lbl}>Кол-во недель во фракции *</label>
          <input type="text" value={currentParticipant.weeks} onChange={e => setCurrentParticipant({...currentParticipant, weeks:e.target.value})} placeholder="1" style={s} />
          <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
            <button onClick={handleBack} style={btnStyle('rgba(255,255,255,0.1)')}>Назад</button>
            <button onClick={handleNext} style={{ ...btnStyle('linear-gradient(135deg, #FFD700, #FFEB3B)'), color:'#0a0a1a' }}>Добавить</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'20px' }}>✅</div>
          <div style={{ fontSize:'16px', marginBottom:'30px' }}>Добавить ещё участника?</div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={addMore} style={btnStyle('linear-gradient(135deg, #4CAF50, #66BB6A)')}>Да</button>
            <button onClick={handleSubmit} disabled={submitting} style={{ ...btnStyle('linear-gradient(135deg, #FFD700, #FFEB3B)'), color:'#0a0a1a', opacity: submitting ? 0.5 : 1 }}>
              {submitting ? '⏳...' : 'Отправить'}
            </button>
          </div>
        </div>
      )}
    </FormShell>
  );
}
