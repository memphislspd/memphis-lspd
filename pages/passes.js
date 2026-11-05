// pages/passes.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

export default function PassesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passes, setPasses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ name: '', staticId: '', passNumber: '', issueDate: '' });

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/admin/check').then(r => r.json()).then(d => setIsAdmin(d.isAdmin));
    fetchPasses();
  }, []);

  const fetchPasses = () => fetch('/api/passes').then(r => r.json()).then(d => setPasses(d));

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/passes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
    });
    if (res.ok) {
      setFormData({ name: '', staticId: '', passNumber: '', issueDate: '' });
      fetchPasses();
    } else alert('Ошибка добавления');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
      <Header user={user} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Реестр пропусков</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Список всех выданных пропусков на территорию.</p>

        {/* Форма добавления только для админов */}
        {isAdmin && (
          <form onSubmit={handleAdd} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input required placeholder="Имя Фамилия" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ flex: '1 1 200px', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
            <input required placeholder="Статик" value={formData.staticId} onChange={e => setFormData({...formData, staticId: e.target.value})} style={{ flex: '1 1 150px', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
            <input required placeholder="Номер пропуска" value={formData.passNumber} onChange={e => setFormData({...formData, passNumber: e.target.value})} style={{ flex: '1 1 150px', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
            <input required placeholder="Дата (дд.мм.гггг)" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} style={{ flex: '1 1 150px', padding: '12px', background: '#000', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
            <button type="submit" style={{ padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Добавить</button>
          </form>
        )}

        {/* Таблица пропусков */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '16px 24px', background: 'rgba(255,255,255,0.05)', fontWeight: '700', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <div>Имя</div>
            <div>Статик</div>
            <div>Номер</div>
            <div>Дата выдачи</div>
          </div>
          {passes.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
              <div style={{ fontWeight: '600' }}>{p.name}</div>
              <div style={{ color: '#9ca3af' }}>{p.staticId}</div>
              <div style={{ color: '#2563EB', fontWeight: '700' }}>{p.passNumber}</div>
              <div style={{ color: '#9ca3af' }}>{p.issueDate}</div>
            </div>
          ))}
          {passes.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>Пропусков пока нет</div>}
        </div>
      </div>
    </div>
  );
}
