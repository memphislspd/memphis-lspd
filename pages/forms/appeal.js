import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

export default function AppealForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    rank: '',
    date: '',
    screenshotInLine: '',
    screenshotOnMP: '',
    extraScreenshots: [],
    comment: '',
  });

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push('/');
          return;
        }
        setUser(d.user);
        setLoading(false);
      });
  }, []);

  const addExtra = () => {
    setFormData({ ...formData, extraScreenshots: [...formData.extraScreenshots, ''] });
  };

  const removeExtra = (i) => {
    setFormData({
      ...formData,
      extraScreenshots: formData.extraScreenshots.filter((_, idx) => idx !== i),
    });
  };

  const updateExtra = (i, val) => {
    const arr = [...formData.extraScreenshots];
    arr[i] = val;
    setFormData({ ...formData, extraScreenshots: arr });
  };

  const isValid = () => {
    return (
      formData.fullName.trim() &&
      formData.rank.trim() &&
      formData.date.trim() &&
      formData.screenshotInLine.trim() &&
      formData.screenshotOnMP.trim()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      window.toast.error('Заполните все обязательные поля!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        window.toast.success('Обжалование отправлено!');
        router.push('/dashboard');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка отправки');
      }
    } catch (e) {
      window.toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a1a', color: 'white' }}>
        Загрузка...
      </div>
    );
  }

  const s = {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '15px',
    boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block',
    marginBottom: '8px',
    color: '#8b8ba7',
    fontSize: '13px',
    fontWeight: 500,
  };

  return (
    <FormShell title="Обжалование наказания" icon="📜" accent="#9C27B0">
      <form onSubmit={handleSubmit}>
        {/* Подсказка */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(156,39,176,0.10), rgba(88,101,242,0.10))',
            border: '1px solid rgba(156,39,176,0.3)',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(180deg, #9C27B0, #5865F2)',
            }}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>⚠️</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>
                Важное условие
              </div>
              <div style={{ fontSize: '13px', color: '#b8b8c8', lineHeight: 1.6 }}>
                Данный тип обжалования работает <strong style={{ color: 'white' }}>только в случае, если вы присутствовали на мероприятии</strong>.
                В качестве доказательства нужно <strong style={{ color: 'white' }}>минимум 2 скриншота</strong>:
                как вы были в строю и как вы были на самом МП.
              </div>
            </div>
          </div>
        </div>

        {/* Информация о сотруднике */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Имя Фамилия + Статик *</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Sanya Suspect 270726"
            style={s}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Ранг *</label>
          <input
            type="text"
            required
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            placeholder="Например: 5"
            style={s}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Дата получения выговора *</label>
          <input
            type="text"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="15.08.2024"
            style={s}
          />
        </div>

        {/* Обязательные скрины */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>📸 Скрин, где вы в строю *</label>
          <textarea
            required
            value={formData.screenshotInLine}
            onChange={(e) => setFormData({ ...formData, screenshotInLine: e.target.value })}
            placeholder="Вставьте ссылку на скриншот..."
            rows="3"
            style={{ ...s, resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>📸 Скрин, где вы на самом МП *</label>
          <textarea
            required
            value={formData.screenshotOnMP}
            onChange={(e) => setFormData({ ...formData, screenshotOnMP: e.target.value })}
            placeholder="Вставьте ссылку на скриншот..."
            rows="3"
            style={{ ...s, resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* Дополнительные скрины */}
        {formData.extraScreenshots.map((screenshot, i) => (
          <div key={i} style={{ marginBottom: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ ...lbl, marginBottom: 0 }}>📸 Дополнительный скрин #{i + 1}</label>
              <button
                type="button"
                onClick={() => removeExtra(i)}
                style={{
                  background: 'rgba(244,67,54,0.15)',
                  color: '#ff6b6b',
                  border: '1px solid rgba(244,67,54,0.3)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ✕ Удалить
              </button>
            </div>
            <textarea
              value={screenshot}
              onChange={(e) => updateExtra(i, e.target.value)}
              placeholder="Вставьте ссылку на скриншот..."
              rows="3"
              style={{ ...s, resize: 'vertical', minHeight: '80px' }}
            />
          </div>
        ))}

        {/* Кнопка добавить скрин */}
        <button
          type="button"
          onClick={addExtra}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(156,39,176,0.15)',
            color: '#BA68C8',
            border: '1px dashed rgba(156,39,176,0.4)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
          Добавить ещё скриншот
        </button>

        {/* Комментарий */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Комментарий (необязательно)</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Что-то важное..."
            rows="2"
            style={{ ...s, resize: 'vertical', minHeight: '60px' }}
          />
        </div>

        {/* Discord ID */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Discord ID</label>
          <input
            type="text"
            value={`${user.username} (${user.id})`}
            disabled
            style={{ ...s, opacity: 0.5 }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isValid()}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.5 : 1,
            marginTop: '10px',
            boxShadow: '0 4px 12px rgba(156,39,176,0.25)',
          }}
        >
          {submitting ? '⏳ Отправка...' : '📤 Отправить обжалование'}
        </button>
      </form>
    </FormShell>
  );
}
