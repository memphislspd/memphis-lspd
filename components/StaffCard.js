// components/StaffCard.js
export default function StaffCard({ member, onDelete, isAdminView }) {
  // Определяем градиент для должности
  const getRankGradient = (rank) => {
    if (rank === 'Chief of Police') return 'linear-gradient(45deg, #9e6bff, #9fc1ff)';
    if (rank === 'Deputy Chief') return 'linear-gradient(45deg, #2a2b36, #a0a3ce)';
    return 'linear-gradient(45deg, #8b8ba7, #ffffff)';
  };

  return (
    <div style={{
      width: '100%',
      minWidth: 0,
      maxWidth: '340px',
      minHeight: '330px',
      background: 'rgba(11, 15, 22, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '4px',
      padding: '24px 20px',
      position: 'relative',
      textAlign: 'center',
      fontFamily: "'Montserrat', 'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'none',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'rgba(63, 131, 248, 0.5)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)';
    }}
    >
      <div style={{
        alignSelf: 'center',
        marginBottom: '16px',
        background: 'rgba(255, 38, 64, 0.1)',
        border: '1px solid rgba(255, 38, 64, 0.3)',
        color: '#ff6b7d',
        fontSize: '9px',
        fontWeight: '700',
        padding: '5px 9px',
        letterSpacing: '0.12em',
        fontFamily: "'DM Mono', monospace",
      }}>
        HIGH COMMAND
      </div>

      {member.avatar ? (
        <img
          src={member.avatar}
          alt={member.name}
          style={{ width: '80px', height: '80px', borderRadius: '8px', margin: '0 auto 18px', display: 'block', border: '1px solid rgba(148,163,184,0.2)', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '80px', height: '80px', borderRadius: '8px', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(0,0,0,0.25)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      )}

      <div style={{ color: '#7f8a9a', fontSize: '10px', letterSpacing: '0.14em', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>ИМЯ</div>
      <div style={{ color: '#f5f7fb', fontSize: '17px', fontWeight: '700', marginBottom: '18px', overflowWrap: 'anywhere', fontFamily: "'Space Grotesk', sans-serif" }}>{member.name}</div>

      <div style={{ color: '#7f8a9a', fontSize: '10px', letterSpacing: '0.14em', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>ДОЛЖНОСТЬ</div>
      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        marginBottom: '18px',
        background: getRankGradient(member.rank),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        overflowWrap: 'anywhere',
      }}>
        {member.rank}
      </div>

      <div style={{ color: '#7f8a9a', fontSize: '10px', letterSpacing: '0.14em', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>DISCORD</div>
      <div style={{ color: '#8db8ff', fontSize: '12px', marginBottom: '20px', overflowWrap: 'anywhere' }}>{member.discord}</div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(148,163,184,0.12)', paddingTop: '14px', color: '#64748b', fontSize: '9px', letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontFamily: "'DM Mono', monospace" }}>
        <span>LSPD INTRANET</span>
        {isAdminView && (
          <button type="button" onClick={() => onDelete(member.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b7d', cursor: 'pointer', fontSize: '10px', fontWeight: '700', fontFamily: "'DM Mono', monospace", padding: '6px 0' }}>
            [ УДАЛИТЬ ]
          </button>
        )}
      </div>
    </div>
  );
}
