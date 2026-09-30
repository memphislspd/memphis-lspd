export function Skeleton({ width = '100%', height = '20px', radius = '8px', style = {} }) {
  return (
    <>
      <div 
        className="skeleton"
        style={{ width, height, borderRadius: radius, ...style }} 
      />
      <style jsx>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.05) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '20px'
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
        <Skeleton width="48px" height="48px" radius="12px" />
        <div style={{ flex:1 }}>
          <Skeleton width="60%" height="14px" style={{ marginBottom:'8px' }} />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>
      <div style={{ padding:'0 20px 40px', maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ marginBottom:'30px', padding:'20px 0' }}>
          <Skeleton width="200px" height="32px" />
        </div>
        <div style={{ display:'flex', gap:'15px', marginBottom:'30px' }}>
          <Skeleton width="100%" height="100px" radius="12px" />
          <Skeleton width="100%" height="100px" radius="12px" />
          <Skeleton width="100%" height="100px" radius="12px" />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'32px' }}>
          {[1,2,3].map(i => (
            <div key={i}>
              <Skeleton width="180px" height="20px" style={{ marginBottom:'16px' }} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'12px' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'0 20px 40px' }}>
        <div style={{ 
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'16px', padding:'30px', textAlign:'center', marginBottom:'16px'
        }}>
          <Skeleton width="90px" height="90px" radius="50%" style={{ margin:'0 auto 16px' }} />
          <Skeleton width="150px" height="20px" style={{ margin:'0 auto 8px' }} />
          <Skeleton width="200px" height="14px" style={{ margin:'0 auto 20px' }} />
          <Skeleton width="140px" height="36px" radius="8px" style={{ margin:'0 auto' }} />
        </div>
        {[1,2].map(i => (
          <div key={i} style={{
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:'16px', padding:'24px', marginBottom:'16px'
          }}>
            <Skeleton width="120px" height="18px" style={{ marginBottom:'16px' }} />
            <Skeleton width="100%" height="40px" radius="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHistory() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 20px 40px' }}>
        <Skeleton width="180px" height="24px" style={{ marginBottom:'24px' }} />
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {[1,2,3,4,5].map(i => (
            <Skeleton key={i} width="100%" height="76px" radius="14px" />
          ))}
        </div>
      </div>
    </div>
  );
}
