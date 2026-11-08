// components/GlobalLoader.js
export default function GlobalLoader() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)',
      zIndex: 99999, overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .sk-block {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(63,131,248,0.15) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 4px;
        }
      `}</style>

      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '96px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', padding: '0 20px', maxWidth: '1180px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sk-block" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
          <div>
            <div className="sk-block" style={{ width: '120px', height: '10px', marginBottom: '6px' }} />
            <div className="sk-block" style={{ width: '80px', height: '8px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="sk-block" style={{ width: '80px', height: '36px' }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="sk-block" style={{ width: '60px', height: '12px' }} />
          <div className="sk-block" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Контент */}
      <div style={{ maxWidth: '1180px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div className="sk-block" style={{ width: '300px', height: '36px', marginBottom: '12px' }} />
        <div className="sk-block" style={{ width: '450px', height: '16px', marginBottom: '40px' }} />
        
        <div style={{ background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', padding: '24px' }}>
          <div className="sk-block" style={{ width: '100%', height: '60px', marginBottom: '16px' }} />
          <div className="sk-block" style={{ width: '100%', height: '60px', marginBottom: '16px' }} />
          <div className="sk-block" style={{ width: '100%', height: '60px' }} />
        </div>
      </div>
    </div>
  );
}
