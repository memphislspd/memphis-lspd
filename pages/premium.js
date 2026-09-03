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
  { id: 'cpd', name: 'CPD', emoji: '🚔' },
  { id: 'halt', name: 'HALT', emoji: '🚁' },
  { id: 'ted', name: 'TED', emoji: '🔫' },
  { id: 'srt', name: 'SRT', emoji: '🛡️' },
  { id: 'nred', name: 'NRED', emoji: '🚨' },
  { id: 'med', name: 'MED', emoji: '🏥' }
];

export default function PremiumForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [department, setDepartment] = useState('');
  const [participants, setParticipants] = useState([]);
  const [step, setStep] = useState(0); // 0=selectDept, 1=name, 2=rank, 3=static, 4=weeks, 5=addMore
  const [currentParticipant, setCurrentParticipant] = useState({
    name: '', rank: '', static: '', weeks: ''
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        setLoading(false);
      });
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile);
        if (data.profile.fullName) {
          // Имя берём из профиля автоматически
        }
      });
  }, []);

  const handleNext = () => {
    if (step === 0) {
      if (!department) { alert('Выберите отдел!'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!currentParticipant.name.trim()) { alert('Введите имя!'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!currentParticipant.rank.trim()) { alert('Введите ранг!'); return; }
      setStep(3);
    } else if (step === 3) {
      if (!currentParticipant.static.trim()) { alert('Введите static ID!'); return; }
      setStep(4);
    } else if (step === 4) {
      if (!currentParticipant.weeks.trim()) { alert('Введите кол-во недель!'); return; }
      setParticipants([...participants, currentParticipant]);
      setCurrentParticipant({ name: '', rank: '', static: '', weeks: '' });
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (step === 1) setStep(0);
  };

  const addMore = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const participantsText = participants.map(p => 
        `${p.name} | ${p.rank} | ${p.static} | ${p.weeks}`
      ).join('\n');

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'premium',
          fullName: profile.fullName || user.username,
          department: department,
          participants: participantsText
        })
      });
      if (res.ok) { alert('✅ Премия отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { alert('❌ ' + e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      
      <div style={{ maxWidth:'500px',margin:'0 auto',background:'rgba(255,255,255,0.05)',borderRadius:'20px',padding:'40px',border:'1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ marginBottom:'30px',fontSize:'28px',textAlign:'center' }}>🎯 Премия</h1>

        {/* Прогресс участников */}
        {participants.length > 0 && (
          <div style={{ marginBottom:'20px',padding:'15px',background:'rgba(255,215,0,0.05)',borderRadius:'10px' }}>
            <div style={{ fontSize:'14px',color:'#FFD700',marginBottom:'10px' }}>Участники ({participants.length}):</div>
            {participants.map((p, i) => (
              <div key={i} style={{ fontSize:'13px',color:'#8b8ba7',marginBottom:'5px' }}>
                {i + 1}. {p.name} | {p.rank} | {p.static} | {p.weeks}
              </div>
            ))}
          </div>
        )}

        {step === 0 && (
          <div>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>За какой отдел премия? *</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} style={{...s,appearance:'none',cursor:'pointer'}}>
              <option value="">-- Выберите отдел --</option>
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
            </select>
            <button onClick={handleNext} style={{ width:'100%',padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:600,cursor:'pointer',marginTop:'20px' }}>
              Далее
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Имя Фамилия участника *</label>
            <input type="text" value={currentParticipant.name} onChange={e => setCurrentParticipant({...currentParticipant, name:e.target.value})} placeholder="Daemon Winchester" style={s} />
            <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
              <button onClick={handleBack} style={{ flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer' }}>Назад</button>
              <button onClick={handleNext} style={{ flex:1,padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer' }}>Далее</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Ранг участника *</label>
            <input type="text" value={currentParticipant.rank} onChange={e => setCurrentParticipant({...currentParticipant, rank:e.target.value})} placeholder="11" style={s} />
            <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
              <button onClick={handleBack} style={{ flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer' }}>Назад</button>
              <button onClick={handleNext} style={{ flex:1,padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer' }}>Далее</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Static ID участника *</label>
            <input type="text" value={currentParticipant.static} onChange={e => setCurrentParticipant({...currentParticipant, static:e.target.value})} placeholder="85761" style={s} />
            <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
              <button onClick={handleBack} style={{ flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer' }}>Назад</button>
              <button onClick={handleNext} style={{ flex:1,padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer' }}>Далее</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <label style={{ display:'block',marginBottom:'8px',color:'#8b8ba7' }}>Кол-во недель во фракции *</label>
            <input type="text" value={currentParticipant.weeks} onChange={e => setCurrentParticipant({...currentParticipant, weeks:e.target.value})} placeholder="1" style={s} />
            <div style={{ display:'flex',gap:'10px',marginTop:'20px' }}>
              <button onClick={handleBack} style={{ flex:1,padding:'14px',background:'rgba(255,255,255,0.1)',color:'white',border:'none',borderRadius:'10px',cursor:'pointer' }}>Назад</button>
              <button onClick={handleNext} style={{ flex:1,padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer' }}>Добавить</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'48px',marginBottom:'20px' }}>✅</div>
            <div style={{ fontSize:'18px',marginBottom:'30px' }}>Добавить ещё участника?</div>
            <div style={{ display:'flex',gap:'10px' }}>
              <button onClick={addMore} style={{ flex:1,padding:'14px',background:'#4CAF50',color:'white',border:'none',borderRadius:'10px',fontWeight:600,cursor:'pointer' }}>
                Да
              </button>
              <button onClick={handleSubmit} disabled={submitting} style={{ flex:1,padding:'14px',background:'#FFD700',color:'#0a0a1a',border:'none',borderRadius:'10px',fontWeight:600,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1 }}>
                {submitting ? '⏳...' : 'Отправить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
