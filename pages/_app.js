// pages/_app.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.toast = (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };
    window.toast.success = (msg) => window.toast(msg, 'success');
    window.toast.error = (msg) => window.toast(msg, 'error');
    window.toast.info = (msg) => window.toast(msg, 'info');
  }, []);

  useEffect(() => {
    let interval;
    const handleStart = () => {
      setLoading(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? prev : prev + Math.random() * 15));
      }, 200);
    };
    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => { setLoading(false); setProgress(0); }, 300);
      clearInterval(interval);
    };
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
      clearInterval(interval);
    };
  }, [router]);

  const getToastColor = (type) => {
    if (type === 'success') return { bg: 'rgba(76,175,80,0.15)', border: '#4CAF50', icon: '✓' };
    if (type === 'error') return { bg: 'rgba(244,67,54,0.15)', border: '#F44336', icon: '✕' };
    return { bg: 'rgba(88,101,242,0.15)', border: '#5865F2', icon: 'ℹ' };
  };

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(10,10,26,0.97)', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ perspective: '800px', marginBottom: '40px' }}>
            <div style={{ width: '70px', height: '70px', transformStyle: 'preserve-3d', animation: 'cubeRotate 2s infinite linear' }}>
              <style>{`@keyframes cubeRotate { from { transform: rotateX(0deg) rotateY(0deg); } to { transform: rotateX(360deg) rotateY(360deg); } }`}</style>
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #5865F2',background:'rgba(88,101,242,0.15)',transform:'rotateY(0deg) translateZ(35px)' }} />
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #4CAF50',background:'rgba(76,175,80,0.15)',transform:'rotateY(90deg) translateZ(35px)' }} />
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #FF9800',background:'rgba(255,152,0,0.15)',transform:'rotateY(180deg) translateZ(35px)' }} />
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #FF69B4',background:'rgba(255,105,180,0.15)',transform:'rotateY(-90deg) translateZ(35px)' }} />
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #00BCD4',background:'rgba(0,188,212,0.15)',transform:'rotateX(90deg) translateZ(35px)' }} />
              <div style={{ position:'absolute',width:'100%',height:'100%',border:'2px solid #9C27B0',background:'rgba(156,39,176,0.15)',transform:'rotateX(-90deg) translateZ(35px)' }} />
            </div>
          </div>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '20px', letterSpacing: '2px' }}>LSPD FORMS</div>
          <div style={{ width: '250px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #5865F2, #4CAF50, #FF9800)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ color: '#8b8ba7', fontSize: '14px', marginTop: '10px' }}>{Math.min(Math.floor(progress), 100)}%</div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100000, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        {toasts.map(toast => {
          const colors = getToastColor(toast.type);
          return (
            <div key={toast.id} style={{ background: colors.bg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px 20px', color: 'white', fontSize: '14px', fontWeight: 500, maxWidth: '380px', minWidth: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease', pointerEvents: 'auto' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: colors.border, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>{colors.icon}</div>
              <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { font-size: 16px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { font-family: 'Montserrat', 'Inter', -apple-system, sans-serif; background: #030303; color: white; line-height: 1.5; }
        
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); background-clip: content-box; }
        ::selection { background: rgba(37, 99, 235, 0.4); }

        /* ==================================================== */
        /* ЕДИНЫЙ СТИЛЬ ДЛЯ ВСЕХ ФОРМ */
        /* ==================================================== */
        
        /* Поля ввода */
        input, textarea, select {
          width: 100% !important; /* <--- ВОТ ЭТОЙ СТРОКИ НЕ ХВАТАЛО */
          box-sizing: border-box !important;
          background-color: #0a0a0a !important; 
          border: 1px solid #2a2a2a !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 14px 16px !important;
          font-size: 15px !important;
          transition: all 0.2s ease !important;
        }

        /* Фокус на полях (синее свечение) */
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
        }

        /* Кнопки отправки */
        button[type="submit"] {
          width: 100% !important;
          background: #2563EB !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 16px !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3) !important;
          text-transform: uppercase !important;
          cursor: pointer !important;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: #3B82F6 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 15px 40px rgba(37, 99, 235, 0.5) !important;
        }

        button[type="submit"]:disabled {
          background: #1a1a1a !important;
          color: #666 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
        }

        select option { background: #121212 !important; color: white !important; }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
