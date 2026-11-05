// components/StaffCard.js
export default function StaffCard({ member, onDelete, isAdminView }) {
  // Определяем градиент для должности
  const getRankGradient = (rank) => {
    if (rank === 'Chief of Police') return 'linear-gradient(45deg, #9e6bff, #9fc1ff)';
    if (rank === 'Deputy Chief') return 'linear-gradient(45deg, #2a2b36, #a0a3ce)';
    return 'linear-gradient(45deg, #8b8ba7, #ffffff)'; // Дефолт
  };

  return (
    <div style={{
      width: '260px',
      background: '#121212',
      backgroundImage: 'repeating-linear-gradient(45deg, #181818, #181818 10px, #121212 10px, #121212 20px)',
      border: '1px solid #2a2a2a',
      borderRadius: '16px',
      padding: '24px 20px',
      position: 'relative',
      textAlign: 'center',
      fontFamily: 'monospace',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Плашка в углу */}
      <div style={{
        position: 'absolute', top: '15px', right: '-10px',
        background: '#ff2640', color: 'white', fontSize: '10px', fontWeight: 'bold',
        padding: '4px 12px', letterSpacing: '1px', textTransform: 'uppercase',
        boxShadow: '0 2px 10px rgba(255,38,64,0.4)'
      }}>
        HIGH COMMAND
      </div>

      {/* Аватарка (или замочек, если её нет) */}
      {member.avatar ? (
        <img 
          src={member.avatar} 
          alt={member.name}
          style={{ width: '80px', height: '80px', borderRadius: '16px', margin: '10px auto 20px auto', display: 'block', border: '1px solid #333', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '80px', height: '80px', borderRadius: '16px', margin: '10px auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', background: '#1a1a1a' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      )}

      {/* Имя */}
      <div style={{ color: '#8b8ba7', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' }}>ИМЯ</div>
      <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>{member.name}</div>

      {/* Должность */}
      <div style={{ color: '#8b8ba7', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' }}>ДОЛЖНОСТЬ</div>
      <div style={{ 
        fontSize: '14px', fontWeight: 'bold', marginBottom: '20px',
        background: getRankGradient(member.rank),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 10px rgba(255,255,255,0.1)'
      }}>
        {member.rank}
      </div>

      {/* Дискорд */}
      <div style={{ color: '#8b8ba7', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' }}>DISCORD</div>
      <div style={{ color: '#5865F2', fontSize: '13px', marginBottom: '20px' }}>{member.discord}</div>

      {/* Подвал */}
      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '15px', color: '#444', fontSize: '10px', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>LSPD INTRANET</span>
        {isAdminView && (
          <button onClick={() => onDelete(member.id)} style={{ background: 'transparent', border: 'none', color: '#ff2640', cursor: 'pointer', fontSize: '10px' }}>
            [ УДАЛИТЬ ]
          </button>
        )}
      </div>
    </div>
  );
}
