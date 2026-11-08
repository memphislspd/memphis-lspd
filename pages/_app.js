// pages/_app.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GlobalLoader from '../components/GlobalLoader';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.toast = (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
    };
    window.toast.success = (msg) => window.toast(msg, 'success');
    window.toast.error = (msg) => window.toast(msg, 'error');
  }, []);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      {/* Глобальный скелетон при переходах */}
      {loading && <GlobalLoader />}

      {/* Тосты */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100000, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const color = isSuccess ? '#4CAF50' : isError ? '#ff2640' : '#5865F2';
          const bg = isSuccess ? 'rgba(76,175,80,0.15)' : isError ? 'rgba(244,67,54,0.15)' : 'rgba(88,101,242,0.15)';
          return (
            <div key={toast.id} style={{ background: bg, backdropFilter: 'blur(20px)', border: `1px solid ${color}`, borderRadius: '4px', padding: '16px 20px', color: 'white', fontSize: '14px', fontWeight: 500, maxWidth: '380px', minWidth: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease', pointerEvents: 'auto' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                {isSuccess ? '✓' : isError ? '✕' : 'ℹ'}
              </div>
              <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { font-size: 16px; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #030303; color: white; line-height: 1.5; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
        ::selection { background: rgba(37, 99, 235, 0.4); }
      `}</style>
      
      <Component {...pageProps} />
    </>
  );
}
