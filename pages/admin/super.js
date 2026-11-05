// pages/admin/super.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [newId, setNewId] = useState('');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetchAdmins();
  }, []);

  const fetchAdmins = () => {
    fetch('/api/admin/super').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setAdmins(d);
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/super', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId: newId })
    });
    if (res.ok) {
      setNewId('');
      fetchAdmins();
      window.toast.success('Админ добавлен');
    } else window.toast.error('Ошибка добавления');
  };

  const handleRemove = async (id) => {
    if(!confirm('Удалить доступ?')) return;
    const res = await fetch('/api/admin/super', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId: id })
    });
    if (res.ok) fetchAdmins();
  };

  if (!user) return null;

  return (
    <PageLayout user={user}>
      <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Назад в админку</button>
      
      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Супер-Админка</h1>
      <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Выдача доступа к панели управления вручную по Discord ID.</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input 
          type="text" placeholder="Введите Discord ID (например, 200102286473691139)" 
          value={newId} onChange={e => setNewId(e.target.value)} required 
        />
        <button type="submit" style={{ width: '200px', padding: '0 20px' }}>ДОБАВИТЬ</button>
      </form>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
        {admins.map(id => (
          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#FFD700' }}>{id}</div>
            <button onClick={() => handleRemove(id)} style={{ background: 'rgba(255,38,64,0.1)', color: '#ff2640', border: '1px solid #ff2640', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>УДАЛИТЬ</button>
          </div>
        ))}
        {admins.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Ручных админов пока нет.</div>}
      </div>
    </PageLayout>
  );
}
