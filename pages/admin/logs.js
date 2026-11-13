import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Неизвестная дата' : date.toLocaleString('ru-RU');
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async (nextOffset = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/audit-logs?limit=50&offset=${nextOffset}`, { cache: 'no-store' });
      if (response.status === 401 || response.status === 403) {
        router.replace('/admin');
        return;
      }
      if (!response.ok) throw new Error('Не удалось загрузить журнал');
      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setOffset(nextOffset);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      window.toast.error(error.message || 'Ошибка загрузки журнала');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' }).then(r => r.json()).then(data => {
      if (!data.user) { router.replace('/'); return; }
      setUser(data.user);
    }).catch(() => router.replace('/'));
    loadLogs(0);
  }, [loadLogs, router]);

  return (
    <AdminPageGuard superAdminOnly>
      <PageLayout user={user}>
        <button onClick={() => router.push('/admin')} style={{ marginBottom: '20px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Назад в админку</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800' }}>Журнал действий</h1>
          <button onClick={() => loadLogs(offset)} disabled={loading} style={{ padding: '10px 16px' }}>ОБНОВИТЬ</button>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>История административных изменений. Доступна только владельцу супер-админки.</p>
        <div style={{ border: '1px solid rgba(148,163,184,0.15)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(11,15,22,0.6)' }}>
          {loading && <div style={{ padding: '24px', color: '#9ca3af' }}>Загрузка журнала...</div>}
          {!loading && logs.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: '#9ca3af' }}>Записей пока нет. Новые действия администраторов будут появляться здесь.</div>}
          {!loading && logs.map((entry, index) => (
            <div key={entry.id || index} style={{ padding: '18px 22px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '7px' }}>
                <strong style={{ color: '#f3f4f6' }}>{entry.description || entry.action}</strong>
                <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>{formatDate(entry.timestamp)}</span>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
                Администратор: <span style={{ color: '#cbd5e1' }}>{entry.actorName || 'Unknown'}</span>
                {' · '}Discord ID: <span style={{ fontFamily: 'monospace' }}>{entry.actorId || '—'}</span>
                {entry.targetId && <> {' · '}Цель: <span style={{ fontFamily: 'monospace' }}>{entry.targetId}</span></>}
                {entry.targetName && <> {' · '}{entry.targetName}</>}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '5px', fontFamily: 'monospace' }}>{entry.action}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <span style={{ color: '#64748b', fontSize: '12px' }}>Показано: {logs.length} · Страница {Math.floor(offset / 50) + 1}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => loadLogs(Math.max(0, offset - 50))} disabled={loading || offset === 0}>НАЗАД</button>
            <button onClick={() => loadLogs(offset + 50)} disabled={loading || !hasMore}>ДАЛЕЕ</button>
          </div>
        </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
