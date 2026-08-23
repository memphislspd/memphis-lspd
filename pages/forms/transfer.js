import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DEPARTMENTS = [
  { id: 'af', name: 'AF', emoji: '✈️' },
  { id: 'iad', name: 'IAD', emoji: '⚖️' },
  { id: 'swat', name: 'SWAT', emoji: '🛡️' },
  { id: 'dvd', name: 'DVD', emoji: '🚗' },
  { id: 'db', name: 'DB', emoji: '🕵️' },
  { id: 'k9', name: 'K9', emoji: '🐕' },
  { id: 'alpha', name: 'ALPHA', emoji: '💥' },
  { id: 'mcd', name: 'MCD', emoji: '🚨' },
  { id: 'cpd', name: 'CPD', emoji: '🚔' },
  { id: 'halt', name: 'HALT', emoji: '🚁' },
  { id: 'ctrt', name: 'CTRT', emoji: '🔫' }
];

const RANKS = [
  { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
  { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9' },
  { value: '10', label: '10' }
];

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
    if (!formData.fullName.trim()) return false;
    if (!formData.rank) return false;
    if (!formData.currentDepartment) return false;
    if (!formData.targetDepartment) return false;
    if (!formData.reason.trim()) return false;
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
      setFormData(prev => ({
        ...prev,
        fullName: d.profile.fullName || '',
        currentDepartment: d.profile.department || ''
      }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (isSameDepartment) { alert('❌ Нельзя перевестись в тот же отдел!'); return; }
      alert('❌ Заполните все обязательные поля!'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer', targetDepartment: formData.targetDepartment,
          fullName: formData.fullName, rank: formData.rank,
          currentDepartment: formData.currentDepartment, reason: formData.reason,
          dbWhatIs: formData.dbWhatIs, dbExperience: formData.dbExperience,
          dbExamples: formData.dbExamples, dbServers: formData.dbServers,
          dbKnowledge: formData.dbKnowledge, dbLawKnowledge: formData.dbLawKnowledge
        })
      });
      if (res.ok) { alert('✅ Заявка отправлена!'); router.push('/dashboard'); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e) { alert('❌ ' + e.message); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#0a0a1a',color:'white' }}>Загрузка...</div>;

  const s = { width:'100%',padding:'12px 15px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',color:'white',fontSize:'15px',boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)',padding:'30px',color:'white' }}>
      <button onClick={() => router.push('/dashboard')} style={{ background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.2)',padding:'10px 20px',borderRadius:'8px',cursor:'pointer',marginBottom:'20px' }}>← Назад</button>
      <div style={{ maxWidth:'600px',margin:'0 auto',background:'rgba
