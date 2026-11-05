// pages/admin/staff.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffCard from '../../components/StaffCard';

export default function AdminStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', rank: 'Chief of Police', discord: '', avatar: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const res = await fetch('/api/staff');
    if (res.ok) {
      const data = await res.json();
      setStaff(data);
    }
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setFormData({ name: '', rank: 'Chief of Police', discord: '', avatar: '' });
      fetchStaff(); // Обновляем список
    } else {
      alert('Ошибка добавления');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этого человека?')) return;
    const res = await fetch('/api/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) fetchStaff();
  };

  if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#8b8ba7', border: 'none', cursor: 'pointer' }}>← Назад в админку</button>
        <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>Управление Старшим Составом</h1>

        {/* Форма добавления */}
        <form onSubmit={handleAdd} style={{ background: '#121212', padding: '20px', borderRadius: '12px', border: '1px solid #2a2a2a', marginBottom: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Имя (Ник)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: '1 1 200px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          <select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} style={{ flex: '1 1 200px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
            <option value="Chief of Police">Chief of Police</option>
            <option value="Deputy Chief">Deputy Chief</option>
          </select>
          <input type="text" placeholder="Discord (@tag)" required value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})} style={{ flex: '1 1 200px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          <input type="text" placeholder="Ссылка на аватарку (URL)" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} style={{ flex: '1 1 100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          <button type="submit" style={{ flex: '1 1 100%', padding: '14px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Добавить в состав</button>
        </form>

        {/* Сетка с карточками */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {staff.map(member => (
            <StaffCard key={member.id} member={member} onDelete={handleDelete} isAdminView={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
