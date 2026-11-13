import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [denied, setDenied] = useState([]);
  const [newId, setNewId] = useState('');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await fetch('/api/admin/super');
    if (!res.ok) return;
    const data = await res.json();
    setAdmins(Array.isArray(data.admins) ? data.admins : []);
    setDenied(Array.isArray(data.denied) ? data.denied : []);
  };

  const changeAccess = async (method) => {
    const id = newId.trim();
    if (!/^\d{15,22}$/.test(id)) {
      window.toast.error('Введите корректный Discord ID');
      return;
    }
    const res = await fetch('/api/admin/super', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId: id })
    });
    if (res.ok) {
      setNewId('');
      await fetchAdmins();
      window.toast.success(method === 'POST' ? 'Админ добавлен' : 'Запрет обновлён');
    } else {
      const data = await res.json().catch(() => ({}));
      window.toast.error(data.error || 'Ошибка обновления');
    }
  };

  const removeAdmin = async (id) => {
    if (!confirm('Отозвать ручную выдачу админки?')) return;
    const res = await fetch('/api/admin/super', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId: id })
    });
    if (res.ok) fetchAdmins();
    else window.toast.error('Не удалось отозвать доступ');
  };

  const clearDeny = async (id) => {
    if (!confirm('Снять запрет на использование админки?')) return;
    const res = await fetch('/api/admin/super', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId: id })
    });
    if (res.ok) fetchAdmins();
    else window.toast.error('Не удалось снять запрет');
  };

  if (!user) return null;

  return (
    <AdminPageGuard superAdminOnly>
      <PageLayout user={user}>
        <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Назад в админку</button>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Супер-Админка</h1>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Выдача и отзыв ручного доступа, а также безусловный запрет админских прав по Discord ID.</p>
        <form onSubmit={e => { e.preventDefault(); changeAccess('POST'); }} style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
          <input type="text" placeholder="Discord ID" value={newId} onChange={e => setNewId(e.target.value)} required />
          <button type="submit" style={{ width: '200px', padding: '0 20px' }}>ВЫДАТЬ АДМИНКУ</button>
        </form>
        <button onClick={() => changeAccess('PUT')} style={{ marginBottom: '32px', background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>ЗАПРЕТИТЬ АДМИНКУ ПО ID</button>
        <h2>Ручные администраторы</h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
          {admins.map(id => <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontFamily: 'monospace', color: '#FFD700' }}>{id}</span>
            <button onClick={() => removeAdmin(id)}>ОТОЗВАТЬ</button>
          </div>)}
          {admins.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Ручных админов пока нет.</div>}
        </div>
        <h2>Запрещённые Discord ID</h2>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          {denied.map(id => <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontFamily: 'monospace', color: '#ff6b6b' }}>{id}</span>
            <button onClick={() => clearDeny(id)}>СНЯТЬ ЗАПРЕТ</button>
          </div>)}
          {denied.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Запретов нет.</div>}
        </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
