import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DEPARTMENTS } from '../lib/departments';
import { SkeletonProfile } from '../components/Skeleton';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDept, setEditingDept] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    });
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d.profile);
      setNewName(d.profile.fullName || '');
    });
  }, []);

  const saveName = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: newName })
    });
    const d = await res.json();
    if (res.ok) {
      setProfile(d.profile);
      setEditingName(false);
      window.toast.success('Имя сохранено!');
    }
  };

  const saveDepartment = async (deptId) => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: deptId })
    });
    const d = await res.json();
    if (res.ok) {
      setProfile(d.profile);
      setEditingDept(false);
      window.toast.success(deptId ? 'Отдел обновлён!' : 'Отдел убран');
    }
  };

  const copyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    window.toast.success('ID скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

if (loading || !user) return <SkeletonProfile />;

  const currentDept = DEPARTMENTS.find(d => d.id === profile.department);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#1a1a3e 100%)', color:'white' }}>

      {/* Sticky шапка */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', gap: '16px'
        }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Назад
          </button>

          <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
            Профиль
          </div>

          <div style={{ width: '80px' }} />
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Карточка пользователя */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #5865F2, #9C27B0, #00BCD4)'
          }} />

          <img 
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
            alt="Avatar" 
            style={{ 
              width:'90px', height:'90px', borderRadius:'50%', 
              border:'3px solid rgba(88,101,242,0.4)',
              marginBottom: '16px'
            }} 
          />
          <h1 style={{ margin:'0 0 6px', fontSize:'22px', fontWeight:700 }}>{user.username}</h1>
          <p style={{ color:'#8b8ba7', fontSize:'13px', marginBottom:'20px', fontFamily:'JetBrains Mono, monospace' }}>{user.id}</p>
          
          <button 
            onClick={copyId} 
            style={{ 
              background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(88,101,242,0.15)',
              color: copied ? '#4CAF50' : '#8ea1ff',
              border: `1px solid ${copied ? 'rgba(76,175,80,0.3)' : 'rgba(88,101,242,0.3)'}`,
              padding:'9px 18px',
              borderRadius:'8px',
              fontSize:'13px',
              fontWeight:600,
              display:'inline-flex',
              alignItems:'center',
              gap:'8px',
              transition:'all 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {copied ? (
                <polyline points="20 6 9 17 4 12"/>
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </>
              )}
            </svg>
            {copied ? 'Скопировано' : 'Копировать ID'}
          </button>
        </div>

        {/* Игровые данные */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'4px', height:'18px', background:'#4CAF50', borderRadius:'2px' }} />
            <h2 style={{ fontSize:'16px', margin:0, fontWeight:600 }}>🎮 Игровые данные</h2>
          </div>

          {editingName ? (
            <div>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Имя Фамилия + Статик"
                style={{
                  width:'100%',
                  padding:'12px 14px',
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:'10px',
                  color:'white',
                  fontSize:'14px',
                  marginBottom:'10px',
                  boxSizing:'border-box'
                }}
              />
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={saveName} style={{ flex:1,background:'rgba(76,175,80,0.15)',color:'#4CAF50',border:'1px solid rgba(76,175,80,0.3)',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:600 }}>
                  Сохранить
                </button>
                <button onClick={() => { setEditingName(false); setNewName(profile.fullName || ''); }} style={{ flex:1,background:'rgba(255,255,255,0.05)',color:'#8b8ba7',border:'1px solid rgba(255,255,255,0.1)',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:600 }}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
              <span style={{ color: profile.fullName ? 'white' : '#8b8ba7', fontSize:'14px', fontFamily: profile.fullName ? 'JetBrains Mono, monospace' : 'inherit' }}>
                {profile.fullName || 'Не указано'}
              </span>
              <button onClick={() => setEditingName(true)} style={{ background:'rgba(255,255,255,0.05)',color:'white',border:'1px solid rgba(255,255,255,0.1)',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:'6px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Изменить
              </button>
            </div>
          )}
        </div>

        {/* Отдел */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'4px', height:'18px', background:'#2196F3', borderRadius:'2px' }} />
            <h2 style={{ fontSize:'16px', margin:0, fontWeight:600 }}>🏢 Отдел</h2>
          </div>

          {editingDept ? (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:'8px', marginBottom:'12px' }}>
                {DEPARTMENTS.map(d => (
                  <button key={d.id} onClick={() => saveDepartment(d.id)} style={{ background: profile.department === d.id ? 'rgba(88,101,242,0.2)' : 'rgba(255,255,255,0.03)',border: `1px solid ${profile.department === d.id ? 'rgba(88,101,242,0.5)' : 'rgba(255,255,255,0.08)'}`,borderRadius:'10px',padding:'12px 8px',cursor:'pointer',color:'white',textAlign:'center',transition:'all 0.2s' }}>
                    <div style={{ fontSize:'22px' }}>{d.emoji}</div>
                    <div style={{ fontSize:'11px', marginTop:'4px', fontWeight:600 }}>{d.name}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => { setEditingDept(false); }} style={{ width:'100%',background:'rgba(255,255,255,0.05)',color:'#8b8ba7',border:'1px solid rgba(255,255,255,0.1)',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:600 }}>
                Отмена
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
              <span style={{ color: currentDept ? 'white' : '#8b8ba7', fontSize:'15px', display:'flex', alignItems:'center', gap:'8px', fontWeight:600 }}>
                {currentDept ? `${currentDept.emoji} ${currentDept.name}` : 'Не выбран'}
              </span>
              <div style={{ display:'flex', gap:'8px' }}>
                {currentDept && (
                  <button onClick={() => saveDepartment('')} style={{ background:'rgba(220,53,69,0.1)',color:'#ff6b6b',border:'1px solid rgba(220,53,69,0.3)',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:600 }}>
                    Убрать
                  </button>
                )}
                <button onClick={() => setEditingDept(true)} style={{ background:'rgba(33,150,243,0.15)',color:'#4fc3f7',border:'1px solid rgba(33,150,243,0.3)',padding:'8px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:'6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {currentDept ? 'Сменить' : 'Выбрать'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
