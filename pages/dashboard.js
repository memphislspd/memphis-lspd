// pages/dashboard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/start');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#030303', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
      Перенаправление...
    </div>
  );
}
