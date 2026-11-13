// pages/profile.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { DEPARTMENTS } from '../lib/departments';
import PageLayout from '../components/PageLayout';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDept, setEditingDept] = useState(false);
  const [newName, setNewName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
      setLoading(false);
    }).catch(() => router.replace('/'));

    fetch('/api/profile').then(r => r.json()).then(d => {
      const nextProfile = d?.profile || { fullName: '', department: '' };
      setProfile(nextProfile);
      setNewName(nextProfile.fullName || '');
    }).catch(() => window.toast?.error('Не удалось загрузить данные профиля.'));

    fetch('/api/profile/avatar').then(r => r.json()).then(d => {
      if (d?.avatarUrl) setAvatarUrl(d.avatarUrl);
    }).catch(() => window.toast?.error('Не удалось загрузить фото профиля.'));

    fetch('/api/stats').then(r => r.json()).then(d => {
      setHistory(Array.isArray(d?.history) ? d.history : []);
    }).catch(() => window.toast?.error('Не удалось загрузить историю обращений.'))
      .finally(() => setHistoryLoading(false));
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

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.toast.error('Выберите файл изображения.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      window.toast.error('Исходный файл слишком большой. Максимум 10 МБ.');
      return;
    }
    setSavingAvatar(true);
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > 12000 || bitmap.height > 12000) {
        bitmap.close?.();
        throw new Error('Слишком большое разрешение изображения.');
      }
      const size = 512;
      const crop = Math.min(bitmap.width, bitmap.height);
      const sx = (bitmap.width - crop) / 2;
      const sy = (bitmap.height - crop) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close?.();
        throw new Error('Не удалось обработать изображение.');
      }
      context.drawImage(bitmap, sx, sy, crop, crop, 0, 0, size, size);
      bitmap.close?.();
      let avatar = canvas.toDataURL('image/jpeg', 0.84);
      if (avatar.length > 350000) avatar = canvas.toDataURL('image/jpeg', 0.72);
      if (avatar.length > 350000) avatar = canvas.toDataURL('image/jpeg', 0.6);
      if (avatar.length > 350000) throw new Error('Выберите другое фото: его не удалось сжать до допустимого размера.');
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось сохранить фото.');
      setAvatarUrl(data.avatarUrl);
      window.dispatchEvent(new CustomEvent('profile-avatar-updated', { detail: data.avatarUrl }));
      window.toast.success('Фото профиля обновлено!');
    } catch (error) {
      window.toast.error(error.message || 'Не удалось обработать изображение.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const copyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    window.toast.success('ID скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', background: '#030303' }} />;

  const currentDept = DEPARTMENTS.find(d => d.id === profile.department);

  // Общие стили для терминальных блоков
  const panelStyle = { background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' };
  const panelHeaderStyle = { padding: '12px 20px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--blue)', fontSize: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' };
  const inputStyle = { width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--blue)', color: 'white', fontSize: '14px', borderRadius: '4px', fontFamily: "'DM Mono', monospace", boxSizing: 'border-box', outline: 'none' };
  const btnPrimary = { padding: '10px 20px', background: 'var(--blue)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.2s' };
  const btnOutline = { padding: '10px 20px', background: 'transparent', color: '#9ca3af', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.2s' };

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Личное дело</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Информация о вашем аккаунте и служебных данных.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ID-КАРТА */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            [ ИДЕНТИФИКАТОР ]
          </div>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            
            {/* Аватарка */}
            <div style={{ 
              width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', 
              padding: '3px', background: 'linear-gradient(135deg, var(--blue), #9C27B0)',
              boxShadow: '0 0 30px rgba(63, 131, 248, 0.2)'
            }}>
              <img
                src={avatarUrl || (user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : 'https://cdn.discordapp.com/embed/avatars/0.png')}
                alt="Фото профиля"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0b0f16' }}
              />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={savingAvatar}
              style={{ ...btnOutline, marginBottom: '20px', color: savingAvatar ? '#64748b' : '#a9caff', borderColor: 'rgba(63, 131, 248, 0.45)' }}
            >
              {savingAvatar ? 'ОБРАБОТКА ФОТО...' : 'ИЗМЕНИТЬ ФОТО'}
            </button>
            <p style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.5, margin: '-8px 0 20px' }}>
              При первом входе фото берётся из Discord. Дальше оно хранится отдельно и не меняется автоматически.
            </p>

            <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif", color: 'white' }}>
              {user.username}
            </h2>
            <p style={{ color: '#7f8a9a', fontSize: '13px', marginBottom: '24px', fontFamily: "'DM Mono', monospace" }}>
              {user.id}
            </p>
            
            <button 
              onClick={copyId} 
              style={{ 
                ...btnPrimary, 
                width: '100%', 
                background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(63, 131, 248, 0.1)',
                color: copied ? '#4CAF50' : 'var(--blue)',
                border: `1px solid ${copied ? '#4CAF50' : 'var(--blue)'}`,
              }}
            >
              {copied ? '[ СКОПИРОВАНО ]' : '[ СКОПИРОВАТЬ ID ]'}
            </button>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: СЛУЖЕБНЫЕ ДАННЫЕ */}
        <div>
          
          {/* Блок: Игровые данные */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              [ СЛУЖЕБНЫЕ ДАННЫЕ ]
            </div>
            <div style={{ padding: '24px' }}>
              
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#7f8a9a', marginBottom: '12px', letterSpacing: '1px' }}>
                ИМЯ ФАМИЛИЯ + СТАТИК
              </div>

              {editingName ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Например: Sanya Suspect 270726"
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={saveName} style={{ ...btnPrimary, flex: 1, background: '#4CAF50', border: '1px solid #4CAF50' }}>
                      СОХРАНИТЬ
                    </button>
                    <button onClick={() => { setEditingName(false); setNewName(profile.fullName || ''); }} style={{ ...btnOutline, flex: 1 }}>
                      ОТМЕНА
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '4px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <span style={{ color: profile.fullName ? 'white' : '#6b7280', fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '600' }}>
                    {profile.fullName || 'НЕ УКАЗАНО'}
                  </span>
                  <button onClick={() => setEditingName(true)} style={{ ...btnOutline, padding: '8px 14px' }}>
                    ИЗМЕНИТЬ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Блок: Отдел */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              [ ПОДРАЗДЕЛЕНИЕ ]
            </div>
            <div style={{ padding: '24px' }}>
              
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#7f8a9a', marginBottom: '12px', letterSpacing: '1px' }}>
                ТЕКУЩИЙ ОТДЕЛ
              </div>

              {editingDept ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    {DEPARTMENTS.map(d => (
                      <button 
                        key={d.id} 
                        onClick={() => saveDepartment(d.id)} 
                        style={{ 
                          background: profile.department === d.id ? 'rgba(63, 131, 248, 0.15)' : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${profile.department === d.id ? 'var(--blue)' : 'rgba(148, 163, 184, 0.15)'}`,
                          borderRadius: '4px', padding: '12px 8px', cursor: 'pointer',
                          color: 'white', textAlign: 'center', transition: 'all 0.2s',
                          fontFamily: "'DM Mono', monospace"
                        }}
                        onMouseEnter={e => { if(profile.department !== d.id) e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)'; }}
                        onMouseLeave={e => { if(profile.department !== d.id) e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)'; }}
                      >
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{d.emoji}</div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{d.name}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setEditingDept(false)} style={{ ...btnOutline, width: '100%' }}>
                    ОТМЕНА
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '4px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <span style={{ color: currentDept ? 'white' : '#6b7280', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentDept ? `${currentDept.emoji} ${currentDept.name}` : 'НЕ ВЫБРАН'}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {currentDept && (
                      <button onClick={() => saveDepartment('')} style={{ ...btnOutline, padding: '8px 14px', color: '#ff2640', borderColor: 'rgba(255, 38, 64, 0.3)' }}>
                        УБРАТЬ
                      </button>
                    )}
                    <button onClick={() => setEditingDept(true)} style={{ ...btnOutline, padding: '8px 14px' }}>
                      {currentDept ? 'СМЕНИТЬ' : 'ВЫБРАТЬ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <div style={{ ...panelStyle, marginTop: '30px' }}>
        <div style={panelHeaderStyle}>[ ИСТОРИЯ ОБРАЩЕНИЙ ]</div>
        <div style={{ padding: '8px 24px' }}>
          {historyLoading ? (
            <div style={{ padding: '22px 0', color: '#7f8a9a', fontSize: '13px' }}>Загрузка истории...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '22px 0', color: '#7f8a9a', fontSize: '13px' }}>Пока нет отправленных обращений.</div>
          ) : (
            history.slice(0, 10).map((item, index) => {
              const sent = item.status !== 'not_sent';
              const date = item.date && !Number.isNaN(new Date(item.date).getTime())
                ? new Date(item.date).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
                : 'Дата неизвестна';
              return (
                <div
                  key={item.id || `${item.type || 'request'}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                    padding: '16px 0',
                    borderBottom: index !== Math.min(history.length, 10) - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: '#e5edf8', fontSize: '14px', fontWeight: 600, marginBottom: '5px' }}>{item.title || 'Обращение'}</div>
                    <div style={{ color: '#718096', fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>{date}</div>
                  </div>
                  <span style={{
                    flex: '0 0 auto',
                    padding: '6px 9px',
                    borderRadius: '3px',
                    border: `1px solid ${sent ? 'rgba(76, 175, 80, .35)' : 'rgba(255, 82, 82, .35)'}`,
                    background: sent ? 'rgba(76, 175, 80, .1)' : 'rgba(255, 82, 82, .1)',
                    color: sent ? '#81c784' : '#ff8a80',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '.4px',
                  }}>
                    {sent ? 'ОТПРАВЛЕНО' : 'НЕ ОТПРАВЛЕНО'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}
