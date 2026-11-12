// pages/forms/promotion.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';
import FormLoading from '@/components/FormLoading';

const RANK_OPTIONS = [
  '1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг',
  '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг',
  '11-12 ранг', '12-13 ранг'
];

// Shared form shell receives the already authenticated user.
export default function PromotionForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ fullName: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    rankRange: '',
    reportLink: ''
  });

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        const nextProfile = data?.profile || { fullName: '' };
        setProfile(nextProfile);
        if (nextProfile.fullName) {
          setFormData(prev => ({ ...prev, fullName: prev.fullName || nextProfile.fullName }));
        }
      })
      .catch(() => {
        setProfile({ fullName: '' });
        window.toast?.error('Не удалось загрузить профиль. Заполните имя вручную.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'promotion',
          fullName: formData.fullName,
          rankRange: formData.rankRange,
          reportLink: formData.reportLink
        })
      });
      if (res.ok) { 
        window.toast.success('Заявка отправлена!'); 
        router.push('/hub'); // Теперь ведет в хаб для сотрудников
      }
      else { 
        const error = await res.json(); 
        throw new Error(error.error || 'Ошибка отправки'); 
      }
    } catch (error) { 
      window.toast.error(error.message); 
    }
    finally { 
      setSubmitting(false); 
    }
  };

  // Показываем простую загрузку, пока не получили данные профиля
  if (loading) return <FormLoading />;
  if (!user) return null;

  return (
    <FormShell user={user} title="Запрос на повышение" icon="📈">
      <form onSubmit={handleSubmit}>
        
        {/* Имя Фамилия */}
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', marginBottom:'8px', color:'#9ca3af', fontSize:'13px', fontWeight:600 }}>
            Имя Фамилия + Статик *
          </label>
          <input 
            type="text" required
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
            placeholder="Например: Sanya Suspect 270726"
           
           
          />
          {profile.fullName && <p className="form-field-hint">Загружено из профиля — поле можно изменить.</p>}
        </div>

        {/* Диапазон рангов */}
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', marginBottom:'8px', color:'#9ca3af', fontSize:'13px', fontWeight:600 }}>
            С какого на какой ранг вы повышаетесь *
          </label>
          <select
            required
            value={formData.rankRange}
            onChange={e => setFormData({...formData, rankRange: e.target.value})}
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Выберите диапазон рангов --</option>
            {RANK_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Ссылка на отчет */}
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', marginBottom:'8px', color:'#9ca3af', fontSize:'13px', fontWeight:600 }}>
            Ссылка на одобренный отчет о повышении *
          </label>
          <textarea 
            required
            value={formData.reportLink}
            onChange={e => setFormData({...formData, reportLink: e.target.value})}
            placeholder="Вставьте ссылку на ваш одобренный отчет о повышении..."
            rows="4"
            style={{ resize:'vertical', minHeight:'100px' }}
          />
        </div>

        {/* Discord ID */}
        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', marginBottom:'8px', color:'#9ca3af', fontSize:'13px', fontWeight:600 }}>
            Discord ID
          </label>
          <input 
            type="text" 
            value={`${user.username} (${user.id})`}
            disabled 
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>

        {/* Кнопка отправки (глобальные стили сделают её синей) */}
        <button 
          type="submit" 
          disabled={submitting}
          style={{ marginTop: '10px' }}
        >
          {submitting ? 'Отправка...' : 'Отправить заявку'}
        </button>
        
      </form>
    </FormShell>
  );
}
