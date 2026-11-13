// pages/admin/reset.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';
import AdminPageGuard from '../../components/AdminPageGuard';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { adminPanelStyle, adminPanelHeaderStyle } from '../../components/adminStyles';

export default function ResetPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
  }, []);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-global-lock', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        window.toast.success(data.message || 'Сайт разблокирован!');
      } else {
        window.toast.error(data.error || 'Ошибка разблокировки');
      }
    } catch (e) {
      window.toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  return (
    <AdminPageGuard>
      <PageLayout user={user}>
      <AdminSectionHeader title="Разблокировка" description="Снятие глобального лока сайта." />

      <div style={{ ...adminPanelStyle, maxWidth: '600px' }}>
        <div style={{ ...adminPanelHeaderStyle, color: '#ff6b7d' }}>
          [ СИСТЕМА БЕЗОПАСНОСТИ ]
        </div>
        <div style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            Если сайт заблокирован из-за спама или срабатывания антиспама, нажмите кнопку ниже, чтобы удалить ключи блокировки из базы данных.
          </p>
          <button 
            onClick={handleUnlock}
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', background: loading ? '#1a2330' : '#ff2640', 
              color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', 
              fontFamily: "'DM Mono', monospace", letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#ff4d63'; }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#ff2640'; }}
          >
            {loading ? '[ ВЫПОЛНЕНИЕ... ]' : '[ СНЯТЬ БЛОКИРОВКУ ]'}
          </button>
        </div>
      </div>
      </PageLayout>
    </AdminPageGuard>
  );
}
