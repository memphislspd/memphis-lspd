import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPageGuard({ children, superAdminOnly = false }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      try {
        const [meResponse, accessResponse] = await Promise.all([
          fetch('/api/me', { cache: 'no-store' }),
          fetch('/api/admin/check', { cache: 'no-store' }),
        ]);
        const [me, access] = await Promise.all([
          meResponse.json(),
          accessResponse.json(),
        ]);

        if (!active) return;

        if (!me?.user) {
          router.replace('/start');
          return;
        }

        const permitted = superAdminOnly ? access?.isSuperAdmin : access?.isAdmin;
        if (!permitted) {
          router.replace(access?.isAdmin ? '/admin' : '/start');
          return;
        }

        setAllowed(true);
      } catch (error) {
        if (active) router.replace('/start');
      } finally {
        if (active) setChecking(false);
      }
    };

    checkAccess();
    return () => {
      active = false;
    };
  }, [router, superAdminOnly]);

  if (checking || !allowed) {
    return (
      <div style={{ minHeight: '100vh', background: '#030303', color: '#8b98aa', display: 'grid', placeItems: 'center' }}>
        Проверка доступа...
      </div>
    );
  }

  return children;
}
