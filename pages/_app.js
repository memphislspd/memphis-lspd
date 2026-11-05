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
        :root { --bg: #07090d; --panel: #0b0f16; --panel-soft: rgba(16, 22, 33, .72); --line: rgba(148, 163, 184, .16); --muted: #7f8a9a; --text: #f5f7fb; --blue: #3f83f8; --blue-soft: rgba(63, 131, 248, .18); }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
        button, input, textarea, select { font: inherit; }
        button { color: inherit; }
        .app-shell { min-height: 100vh; background: radial-gradient(circle at 50% -12%, rgba(26, 47, 83, .4), transparent 32rem), linear-gradient(180deg, #080b10 0%, #07090d 100%); }
        .site-header { position: sticky; top: 0; z-index: 100; border-bottom: 1px solid var(--line); background: rgba(7, 9, 13, .78); backdrop-filter: blur(18px); }
        .site-header__inner { width: min(1180px, calc(100% - 40px)); min-height: 76px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
        .brand, .site-nav button, .profile-chip, .header-login, .admin-link { border: 0; background: transparent; cursor: pointer; }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0; text-align: left; }
        .brand__mark { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--blue); border-radius: 9px; color: var(--blue); box-shadow: 0 0 20px rgba(63, 131, 248, .18); }
        .brand__text { display: flex; flex-direction: column; gap: 1px; letter-spacing: .16em; font-family: 'Space Grotesk', sans-serif; }
        .brand__text strong { font-size: 11px; font-weight: 700; }
        .brand__text small { color: var(--muted); font: 7px 'DM Mono', monospace; letter-spacing: .18em; }
        .site-nav { display: flex; gap: 4px; padding: 4px; border: 1px solid rgba(148,163,184,.12); border-radius: 8px; background: rgba(11, 15, 22, .82); }
        .site-nav button { padding: 9px 14px; color: var(--muted); font-size: 12px; transition: .2s ease; }
        .site-nav button:hover, .site-nav button.is-active { color: var(--text); background: rgba(63, 131, 248, .13); border-radius: 5px; }
        .site-header__actions { display: flex; align-items: center; gap: 14px; }
        .admin-link { color: #eab308; font-size: 11px; }
        .profile-chip { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 12px; }
        .profile-chip img { width: 32px; height: 32px; border: 1px solid var(--line); border-radius: 50%; object-fit: cover; }
        .header-login { padding: 10px 18px; border-radius: 5px; background: var(--blue); color: white; font-size: 12px; font-weight: 600; }
        .page-container { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 64px 0 100px; }
        .login-shell { min-height: 100vh; display: grid; place-items: center; padding: 28px; background: radial-gradient(circle at 50% 20%, rgba(26,47,83,.42), transparent 34rem), var(--bg); }
        .login-card { width: min(460px, 100%); padding: 44px; border: 1px solid var(--line); background: rgba(11,15,22,.74); box-shadow: 0 30px 100px rgba(0,0,0,.4); text-align: center; }
        .login-card__mark { width: 56px; height: 56px; display: grid; place-items: center; margin: 0 auto 24px; border: 1px solid var(--blue); border-radius: 14px; color: var(--blue); font-size: 26px; box-shadow: 0 0 35px rgba(63,131,248,.2); }
        .eyebrow { color: var(--blue); font: 10px 'DM Mono', monospace; letter-spacing: .18em; }
        .login-card h1 { margin: 14px 0 8px; font: 600 clamp(28px, 5vw, 40px)/1.05 'Space Grotesk', sans-serif; letter-spacing: -.05em; }
        .login-card > p { color: var(--muted) !important; margin-bottom: 28px !important; }
        .login-card__button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px 20px; border: 0; border-radius: 4px; background: var(--blue); color: white; cursor: pointer; font-weight: 600; transition: .2s ease; }
        .login-card__button:hover { background: #5b96ff; transform: translateY(-2px); box-shadow: 0 15px 35px rgba(63,131,248,.25); }
        @media (max-width: 520px) { .login-card { padding: 32px 22px; } }
        .form-container { width: min(860px, calc(100% - 40px)); margin: 0 auto; padding: 44px 0 100px; }
        .back-link { margin-bottom: 22px; padding: 0; border: 0; background: transparent; color: var(--muted); cursor: pointer; font: 11px 'DM Mono', monospace; }
        .back-link:hover { color: var(--text); }
        .form-card { overflow: hidden; border: 1px solid var(--line); background: var(--panel-soft); box-shadow: 0 30px 80px rgba(0,0,0,.24); }
        .form-card__header { display: flex; align-items: flex-start; gap: 24px; padding: 32px; border-bottom: 1px solid var(--line); }
        .form-card__index { padding-top: 5px; color: var(--blue); font: 10px 'DM Mono', monospace; letter-spacing: .16em; white-space: nowrap; }
        .form-card__header h1 { margin: 0; font: 600 clamp(24px, 4vw, 38px)/1.1 'Space Grotesk', sans-serif; letter-spacing: -.04em; }
        .form-card__header p { margin: 9px 0 0; color: var(--muted); font-size: 13px; }
        .form-card__body { padding: 32px; }
        input, textarea, select { background: rgba(4, 7, 12, .72) !important; border: 1px solid var(--line) !important; border-radius: 4px !important; }
        input:focus, textarea:focus, select:focus { border-color: var(--blue) !important; box-shadow: 0 0 0 3px var(--blue-soft) !important; }
        button[type="submit"] { border-radius: 4px !important; background: var(--blue) !important; text-transform: none !important; box-shadow: 0 12px 32px rgba(63, 131, 248, .24) !important; }
        button[type="submit"]:hover:not(:disabled) { background: #5b96ff !important; }
        @media (max-width: 820px) { .site-header__inner { width: min(100% - 28px, 620px); flex-wrap: wrap; padding: 14px 0; } .site-nav { order: 3; width: 100%; overflow-x: auto; } .site-nav button { flex: 1; white-space: nowrap; } .site-header__actions .profile-chip span, .admin-link { display: none; } .page-container, .form-container { width: min(100% - 28px, 620px); padding-top: 36px; } }
        @media (max-width: 520px) { .form-card__header, .form-card__body { padding: 22px 18px; } .form-card__header { gap: 12px; } .form-card__index { font-size: 8px; } .brand__text { display: none; } }

        
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
