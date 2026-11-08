// components/DeptCard.js
export default function DeptCard({ dept, onDelete, onEdit, isAdminView }) {
  return (
    <div style={{
      background: 'rgba(11, 15, 22, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%', // Растягивает карточку на всю высоту ячейки сетки
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(63, 131, 248, 0.5)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(63, 131, 248, 0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      
      {/* ШАПКА КАРТОЧКИ */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div style={{ 
          fontSize: '28px', 
          background: 'rgba(63, 131, 248, 0.1)', 
          padding: '12px', 
          borderRadius: '4px', 
          border: '1px solid rgba(63, 131, 248, 0.2)',
          lineHeight: 1
        }}>
          {dept.icon || '🏢'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '800', 
            margin: '0 0 8px 0', 
            color: 'white', 
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.5px'
          }}>
            {dept.name}
          </h3>
          
          {/* Описание с ограничением в 3 строки, чтобы не ломало высоту */}
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '13px', 
            margin: 0, 
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {dept.description || 'Описание отсутствует.'}
          </p>
        </div>
      </div>

      {/* БЛОК ХАЙРАНГОВ */}
      <div style={{ 
        flex: 1, // Занимает всё оставшееся место
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px 24px',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          fontFamily: "'DM Mono', monospace", 
          fontSize: '11px', 
          color: 'var(--blue)', 
          letterSpacing: '1px', 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>ХАЙРАНГИ ОТДЕЛА</span>
          <span style={{ color: '#6b7280' }}>[{dept.leaders?.length || 0}]</span>
        </div>

        {/* Контейнер для списка (со скроллом, если людей много) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          overflowY: 'auto',
          maxHeight: '180px', // Фиксированная максимальная высота
          paddingRight: '4px' // Отступ для скроллбара
        }}>
          {dept.leaders && dept.leaders.length > 0 ? (
            dept.leaders.map((leader, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: '10px 12px', 
                  borderRadius: '4px',
                  borderLeft: '2px solid rgba(63, 131, 248, 0.3)'
                }}
              >
                {/* Имя (обрезается, если слишком длинное) */}
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  marginRight: '10px',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  {leader.name}
                </span>
                
                {/* Должность */}
                <span style={{ 
                  fontSize: '11px', 
                  color: 'var(--blue)', 
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  fontFamily: "'DM Mono', monospace"
                }}>
                  {leader.rank}
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'DM Mono', monospace" }}>
              [ НЕ НАЗНАЧЕНЫ ]
            </div>
          )}
        </div>
      </div>

      {/* ПОДВАЛ КАРТОЧКИ (Кнопки для админа) */}
      {isAdminView && (
        <div style={{ 
          display: 'flex', 
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(0,0,0,0.4)'
        }}>
          <button 
            onClick={() => onEdit(dept)} 
            style={{ 
              flex: 1, background: 'transparent', color: '#9ca3af', 
              border: 'none', borderRight: '1px solid rgba(148, 163, 184, 0.1)', 
              padding: '12px', cursor: 'pointer', fontSize: '11px', 
              fontWeight: 'bold', fontFamily: "'DM Mono', monospace",
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            РЕДАКТИРОВАТЬ
          </button>
          <button 
            onClick={() => onDelete(dept.id)} 
            style={{ 
              flex: 1, background: 'transparent', color: '#ff2640', 
              border: 'none', padding: '12px', cursor: 'pointer', 
              fontSize: '11px', fontWeight: 'bold', fontFamily: "'DM Mono', monospace",
              transition: 'all 0.2s', opacity: 0.7
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          >
            УДАЛИТЬ
          </button>
        </div>
      )}
    </div>
  );
}
