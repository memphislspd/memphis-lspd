// pages/admin/departments.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DeptCard from '../../components/DeptCard';

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние формы
  const [formData, setFormData] = useState({ name: '', icon: '', description: '' });
  const [leaders, setLeaders] = useState([{ name: '', rank: '' }]);

  useEffect(() => { fetchDepts(); }, []);

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

  const handleAdd = async (e) => {
    e.preventDefault();
    // Фильтруем пустые поля лидеров
    const validLeaders = leaders.filter(l => l.name.trim() && l.rank.trim());
    
    const res = await fetch('/api/departments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, leaders: validLeaders })
    });
    if (res.ok) {
      setFormData({ name: '', icon: '', description: '' });
      setLeaders([{ name: '', rank: '' }]);
      fetchDepts();
    } else alert('Ошибка добавления');
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот отдел?')) return;
    const res = await fetch('/api/departments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchDepts();
  };

  if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px 20px', fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#8b8ba7', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Назад в админку</button>
        <h1 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: '800' }}>Управление Отделами</h1>

        {/* Форма добавления */}
        <form onSubmit={handleAdd} style={{ background: '#121212', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <input type="text" placeholder="Название (например, SWAT)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: '1 1 300px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
            <input type="text" placeholder="Иконка (эмодзи, например 🛡️)" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{ flex: '0 1 150px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
          <textarea placeholder="Описание отдела (чем занимаются)" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px', marginBottom: '20px', resize: 'vertical' }} />

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#a0a3ce' }}>Хайранги отдела</div>
            {leaders.map((leader, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Имя Фамилия" value={leader.name} onChange={e => handleLeaderChange(index, 'name', e.target.value)} style={{ flex: 1, padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                <input type="text" placeholder="Должность (например, Командир)" value={leader.rank} onChange={e => handleLeaderChange(index, 'rank', e.target.value)} style={{ flex: 1, padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
                <button type="button" onClick={() => handleRemoveLeader(index)} style={{ padding: '0 15px', background: 'rgba(255,38,64,0.1)', color: '#ff2640', border: '1px solid #ff2640', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={handleAddLeader} style={{ padding: '10px 20px', background: 'transparent', color: '#2563EB', border: '1px dashed #2563EB', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>+ Добавить хайранг</button>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Создать отдел</button>
        </form>

        {/* Сетка с карточками */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {departments.map(dept => (
            <DeptCard key={dept.id} dept={dept} onDelete={handleDelete} isAdminView={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
