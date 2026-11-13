// pages/admin/roles.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';
import AdminSectionHeader from '../../components/AdminSectionHeader';

const CHECK_ROLES = [
  { id: '1514608894700159145', name: 'Роль 1' },
  { id: '1514608894700159143', name: 'Роль 2' },
  { id: '1550848894789885962', name: 'Роль 3' },
  { id: '1514665211980939314', name: 'Роль 4' },
];

export default function RoleCheckerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/admin/roles?discordId=${searchId}`);
    const data = await res.json();
    setResult({ status: res.status, data });
    setLoading(false);
  };

  if (!user) return null;

  return (
    <AdminPageGuard>
      <PageLayout user={user}>
      <AdminSectionHeader title="Проверка ролей" description="Введите Discord ID, чтобы узнать, какие роли у человека были при последнем входе." />

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
        <input 
          type="text" placeholder="Введите Discord ID пользователя" 
          value={searchId} onChange={e => setSearchId(e.target.value)} required 
        />
        <button type="submit" style={{ width: '200px', padding: '0 20px' }}>{loading ? 'ПОИСК...' : 'НАЙТИ'}</button>
      </form>

      {result && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px' }}>
          {result.status === 404 ? (
            <div style={{ color: '#ff2640', textAlign: 'center', fontWeight: 'bold' }}>{result.data.error}</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <img src={`https://cdn.discordapp.com/avatars/${searchId}/${result.data.info.avatar}.png`} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>{result.data.info.username}</h2>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>{searchId}</span>
                </div>
              </div>
              
              <h3 style={{ fontSize: '16px', color: '#9ca3af', marginBottom: '20px' }}>Найденные роли из списка:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CHECK_ROLES.map(r => {
                  const hasRole = result.data.roles.includes(r.id);
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: hasRole ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${hasRole ? '#4CAF50' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{r.name}</span>
                      <span style={{ color: hasRole ? '#4CAF50' : '#666', fontWeight: 'bold' }}>{hasRole ? 'ЕСТЬ' : 'НЕТ'}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
      </PageLayout>
    </AdminPageGuard>
  );
}
