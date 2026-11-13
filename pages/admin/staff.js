// pages/admin/staff.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffCard from '../../components/StaffCard';
import AdminPageGuard from '../../components/AdminPageGuard';
import PageLayout from '../../components/PageLayout';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { adminPanelStyle, adminInputStyle, adminPrimaryButtonStyle } from '../../components/adminStyles';

export default function AdminStaffPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', rank: 'Chief of Police', discord: '', avatar: '' });

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));
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

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  return (
    <AdminPageGuard>
      <PageLayout user={user}>
        <AdminSectionHeader title="Старший состав" description="Управление высшим командованием департамента." />

        <form onSubmit={handleAdd} style={{
          ...adminPanelStyle,
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'stretch',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <input type="text" placeholder="Имя (ник)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ ...adminInputStyle, flex: '1 1 200px' }} />
          <select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} style={{ ...adminInputStyle, flex: '1 1 200px' }}>
            <option value="Chief of Police">Chief of Police</option>
            <option value="Deputy Chief">Deputy Chief</option>
          </select>
          <input type="text" placeholder="Discord (@tag)" required value={formData.discord} onChange={e => setFormData({...formData, discord: e.target.value})} style={{ ...adminInputStyle, flex: '1 1 200px' }} />
          <input type="url" placeholder="Ссылка на аватарку (URL)" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} style={{ ...adminInputStyle, flex: '1 1 100%' }} />
          <button type="submit" style={{ ...adminPrimaryButtonStyle, flex: '1 1 100%' }}>ДОБАВИТЬ В СОСТАВ</button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '18px', alignItems: 'stretch' }}>
          {staff.map(member => (
            <StaffCard key={member.id} member={member} onDelete={handleDelete} isAdminView={true} />
          ))}
          {staff.length === 0 && (
            <div style={{ ...adminPanelStyle, gridColumn: '1 / -1', padding: '28px 20px', textAlign: 'center', color: '#8b98aa', fontSize: '13px' }}>
              Сотрудники старшего состава пока не добавлены.
            </div>
          )}
        </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
