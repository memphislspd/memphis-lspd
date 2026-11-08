// pages/admin/requests.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';

export default function RequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    // Предполагается, что у тебя есть API, отдающий все заявки.
    // Если он называется иначе - поменяй путь.
    fetch('/api/admin/requests').then(r => r.json()).then(d => {
      setRequests(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  return (
    <PageLayout user={user}>
      <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
        ← НАЗАД В АДМИНКУ
      </button>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Все заявки</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Лог всех отправленных форм сотрудниками.</p>
      </div>

      <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--blue)', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
          <span>[ СИСТЕМНЫЙ ЛОГ ЗАЯВОК ]</span>
          <span>ЗАПИСЕЙ: {requests.length}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 1fr 120px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', fontSize: '11px', color: '#7f8a9a', fontFamily: "'DM Mono', monospace", borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div>ТИП</div>
          <div>ЗАГОЛОВОК</div>
          <div>ОТПРАВИТЕЛЬ</div>
          <div>ДАТА</div>
          <div style={{ textAlign: 'right' }}>СТАТУС</div>
        </div>

        {requests.map(req => (
          <div key={req.id} style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 1fr 120px', padding: '16px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.05)', alignItems: 'center', fontSize: '13px', fontFamily: "'DM Mono', monospace" }}>
            <div style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{req.type?.toUpperCase() || 'N/A'}</div>
            <div style={{ color: 'white', fontWeight: 'bold', fontFamily: "'Space Grotesk', sans-serif" }}>{req.title || 'Заявка'}</div>
            <div style={{ color: '#9ca3af' }}>{req.userId || '-'}</div>
            <div style={{ color: '#9ca3af' }}>{new Date(req.date).toLocaleString('ru-RU')}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: req.status === 'accepted' ? '#4CAF50' : req.status === 'rejected' ? '#ff2640' : '#FF9800', border: `1px solid ${req.status === 'accepted' ? '#4CAF50' : req.status === 'rejected' ? '#ff2640' : '#FF9800'}`, padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                {req.status === 'accepted' ? 'ПРИНЯТО' : req.status === 'rejected' ? 'ОТКЛОНЕНО' : 'ОЖИДАЕТ'}
              </span>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '13px' }}>
            [ БАЗА ЗАЯВОК ПУСТА ]
          </div>
        )}
      </div>
    </PageLayout>
  );
}
