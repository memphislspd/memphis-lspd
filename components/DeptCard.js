// components/DeptCard.js
export default function DeptCard({ dept, onDelete, onEdit, isAdminView }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)',
      backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 10px, transparent 10px, transparent 20px)',
      border: '1px solid #2a2a2a',
      borderRadius: '12px', 
      padding: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
      transition: 'all 0.2s',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '28px', background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.2)' }}>
          {dept.icon}
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'white', letterSpacing: '1px' }}>
          {dept.name}
        </h3>
      </div>

      <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
        {dept.description}
      </p>
      
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
        <div style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>Хайранги отдела</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dept.leaders && dept.leaders.length > 0 ? dept.leaders.map((hr, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{hr.name}</span>
              <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>{hr.rank}</span>
            </div>
          )) : (
            <div style={{ fontSize: '12px', color: '#555' }}>Не назначены</div>
          )}
        </div>
      </div>

      {/* Кнопки управления для админа */}
      {isAdminView && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={() => onEdit(dept)} style={{ flex: 1, background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid #2563EB', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            РЕДАКТИРОВАТЬ
          </button>
          <button onClick={() => onDelete(dept.id)} style={{ flex: 1, background: 'rgba(255,38,64,0.1)', color: '#ff2640', border: '1px solid #ff2640', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            УДАЛИТЬ
          </button>
        </div>
      )}
    </div>
  );
}
