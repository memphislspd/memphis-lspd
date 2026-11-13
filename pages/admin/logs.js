import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { adminPanelStyle, adminPrimaryButtonStyle } from '../../components/adminStyles';

const actionButtonStyle = {
  ...adminPrimaryButtonStyle,
  WebkitAppearance: 'none',
  appearance: 'none',
  transition: 'background 150ms ease, border-color 150ms ease, opacity 150ms ease',
};

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
        <AdminSectionHeader
          title="Журнал действий"
          description="История административных изменений. Доступна только владельцу супер-админки."
          actions={
            <button type="button" onClick={() => loadLogs(offset)} disabled={loading} style={{ ...actionButtonStyle, opacity: loading ? 0.45 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>ОБНОВИТЬ</button>
          }
        />
        <div style={{ ...adminPanelStyle }}>
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
            <button type="button" onClick={() => loadLogs(Math.max(0, offset - 50))} disabled={loading || offset === 0} style={{ ...actionButtonStyle, opacity: loading || offset === 0 ? 0.4 : 1, cursor: loading || offset === 0 ? 'not-allowed' : 'pointer' }}>НАЗАД</button>
            <button type="button" onClick={() => loadLogs(offset + 50)} disabled={loading || !hasMore} style={{ ...actionButtonStyle, opacity: loading || !hasMore ? 0.4 : 1, cursor: loading || !hasMore ? 'not-allowed' : 'pointer' }}>ДАЛЕЕ</button>
          </div>
        </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
