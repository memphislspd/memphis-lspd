// components/DeptCard.js
export default function DeptCard({ name, description, icon, highRanks }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)',
      border: '1px solid #333', borderRadius: '16px', padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.2s'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '32px', background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>{icon}</div>
        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#2563EB' }}>{name}</h3>
      </div>
      <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', minHeight: '44px' }}>{description}</p>
      
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
        <div style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Хайранги отдела</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {highRanks.map((hr, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{hr.name}</span>
              <span style={{ fontSize: '12px', color: '#a0a3ce' }}>{hr.rank}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
