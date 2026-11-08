// pages/admin/departments.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DeptCard from '../../components/DeptCard';
import PageLayout from '../../components/PageLayout';

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние формы
  const [formData, setFormData] = useState({ name: '', icon: '', description: '' });
  const [leaders, setLeaders] = useState([{ name: '', rank: '' }]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    const res = await fetch('/api/departments');
    if (res.ok) setDepartments(await res.json());
    setLoading(false);
  };

  const handleAddLeader = () => setLeaders([...leaders, { name: '', rank: '' }]);
  const handleRemoveLeader = (index) => setLeaders(leaders.filter((_, i) => i !== index));
  const handleLeaderChange = (index, field, value) => {
    const newLeaders = [...leaders];
    newLeaders[index][field] = value;
    setLeaders(newLeaders);
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({ name: dept.name, icon: dept.icon, description: dept.description });
    setLeaders(dept.leaders && dept.leaders.length > 0 ? dept.leaders : [{ name: '', rank: '' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', icon: '', description: '' });
    setLeaders([{ name: '', rank: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validLeaders = leaders.filter(l => l.name.trim() && l.rank.trim());
    
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId 
      ? { id: editingId, ...formData, leaders: validLeaders } 
      : { ...formData, leaders: validLeaders };

    const res = await fetch('/api/departments', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      handleCancelEdit();
      fetchDepts();
      window.toast.success(editingId ? 'Отдел обновлен!' : 'Отдел создан!');
    } else {
      window.toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот отдел?')) return;
    const res = await fetch('/api/departments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchDepts();
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  const inputStyle = { 
    flex: '1 1 200px', padding: '12px', 
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148, 163, 184, 0.2)', 
    color: 'white', borderRadius: '4px', fontFamily: "'DM Mono', monospace", 
    fontSize: '12px', outline: 'none'
  };

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
          ← НАЗАД В АДМИНКУ
        </button>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>
          {editingId ? 'Редактирование отдела' : 'Управление отделами'}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Создание и редактирование подразделений департамента.</p>
      </div>

      {/* ФОРМА (ТЕРМИНАЛ) */}
      <div style={{ 
        background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', 
        borderRadius: '4px', marginBottom: '40px', overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(0, 0, 0, 0.3)', color: 'var(--blue)', fontSize: '12px',
          fontFamily: "'DM Mono', monospace", letterSpacing: '1px' 
        }}>
          <span style={{ animation: 'blink 1s step-end infinite' }}>█</span> {editingId ? 'РЕДАКТИРОВАНИЕ ЗАПИСИ' : 'СОЗДАНИЕ НОВОГО ОТДЕЛА'}
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input type="text" placeholder="НАЗВАНИЕ (например, SWAT)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{...inputStyle, flex: '2 1 300px'}} />
            <input type="text" placeholder="ИКОНКА (эмодзи)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{...inputStyle, flex: '0 1 150px'}} />
          </div>
          
          <textarea placeholder="ОПИСАНИЕ ОТДЕЛА (чем занимаются)" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{...inputStyle, width: '100%', marginBottom: '24px', resize: 'vertical'}} />

          <div style={{ marginBottom: '24px', borderLeft: '2px solid rgba(148, 163, 184, 0.2)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '16px', color: '#7f8a9a', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
              СПИСОК ХАЙРАНГОВ
            </div>
            
            {leaders.map((leader, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="ИМЯ ФАМИЛИЯ" value={leader.name} onChange={e => handleLeaderChange(index, 'name', e.target.value)} style={{...inputStyle, flex: '1 1 200px'}} />
                <input type="text" placeholder="ДОЛЖНОСТЬ" value={leader.rank} onChange={e => handleLeaderChange(index, 'rank', e.target.value)} style={{...inputStyle, flex: '1 1 200px'}} />
                <button type="button" onClick={() => handleRemoveLeader(index)} style={{ padding: '0 20px', background: 'rgba(255,38,64,0.1)', color: '#ff2640', border: '1px solid rgba(255,38,64,0.3)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            ))}
            
            <button type="button" onClick={handleAddLeader} style={{ padding: '10px 20px', background: 'transparent', color: 'var(--blue)', border: '1px dashed var(--blue)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontFamily: "'DM Mono', monospace", fontSize: '12px', marginTop: '10px' }}>
              + ДОБАВИТЬ ХАЙРАНГА
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
              {editingId ? '[ СОХРАНИТЬ ИЗМЕНЕНИЯ ]' : '[ СОЗДАТЬ ОТДЕЛ ]'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '14px 24px', background: 'transparent', color: '#9ca3af', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Mono', monospace" }}>
                ОТМЕНА
              </button>
            )}
          </div>
        </form>
      </div>

      {/* СЕТКА КАРТОЧЕК */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
        {departments.map(dept => (
          <DeptCard key={dept.id} dept={dept} onDelete={handleDelete} onEdit={handleEdit} isAdminView={true} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </PageLayout>
  );
}
