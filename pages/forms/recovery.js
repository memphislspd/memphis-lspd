import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

const WARN_OPTIONS = [
  { value: '1/3', label: '1/3 warn' },
  { value: '2/3', label: '2/3 warn' },
];

const RANK_OPTIONS = [
  { value: 'cadet', label: 'Кадет (1–2 ранг)' },
  { value: 'regular', label: 'Обычный сотрудник' },
];

const METHOD_OPTIONS = [
  { value: 'supplies', label: 'Бинты+Капсулы' },
  { value: 'points', label: 'Баллы (участие в МП)' },
];

const MP_TYPES = [
  { value: 'drop', label: 'Дроп' },
  { value: 'supply', label: 'Поставка/крафт' },
  { value: 'bank', label: 'Отбитие бизнеса/банка' },
  { value: 'dept_mp', label: 'МП от отдела' },
];

export default function RecoveryForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    warn: '',
    rank: '',
    method: '',
    // Для бинтов
    suppliesProof: '',
    // Для баллов
    mpType: '',
    mpProof: '',
    // Общее
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

  const isFormValid = () => {
    if (!formData.warn || !formData.rank || !formData.method) return false;
    if (formData.method === 'supplies' && !formData.suppliesProof.trim()) return false;
    if (formData.method === 'points' && (!formData.mpType || !formData.mpProof.trim())) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      window.toast.error('Заполните все обязательные поля!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user: user }),
      });
      if (res.ok) {
        window.toast.success('Заявка на отработку отправлена!');
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
    <FormShell title="Отработка взыскания" icon="⚖️" accent="#F44336">
      <form onSubmit={handleSubmit}>
        {/* Тип варна */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Тип взыскания *</label>
          <select
            required
            value={formData.warn}
            onChange={(e) => setFormData({ ...formData, warn: e.target.value })}
            style={{ ...s, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Выберите --</option>
            {WARN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ранг */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Ваш ранг *</label>
          <select
            required
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            style={{ ...s, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Выберите --</option>
            {RANK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Способ отработки */}
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Способ отработки *</label>
          <select
            required
            value={formData.method}
            onChange={(e) =>
              setFormData({
                ...formData,
                method: e.target.value,
                suppliesProof: '',
                mpType: '',
                mpProof: '',
              })
            }
            style={{ ...s, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Выберите --</option>
            {METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Поля для Бинты+Капсулы */}
        {formData.method === 'supplies' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Скриншот склада * (планшет → LSPD → склад)</label>
            <textarea
              required
              value={formData.suppliesProof}
              onChange={(e) => setFormData({ ...formData, suppliesProof: e.target.value })}
              placeholder="Вставьте ссылку на скриншот..."
              rows="3"
              style={{ ...s, resize: 'vertical', minHeight: '80px' }}
            />
          </div>
        )}

        {/* Поля для Баллов */}
        {formData.method === 'points' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Тип мероприятия *</label>
              <select
                required
                value={formData.mpType}
                onChange={(e) => setFormData({ ...formData, mpType: e.target.value })}
                style={{ ...s, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">-- Выберите --</option>
                {MP_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Ссылки на скрины * (каждый с новой строки, с бодикамерой)</label>
              <textarea
                required
                value={formData.mpProof}
                onChange={(e) => setFormData({ ...formData, mpProof: e.target.value })}
                placeholder="Вставьте ссылки на скрины..."
                rows="5"
                style={{ ...s, resize: 'vertical', minHeight: '120px' }}
              />
            </div>
          </>
        )}

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
          disabled={submitting || !isFormValid()}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #F44336, #EF5350)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.5 : 1,
            marginTop: '10px',
            boxShadow: '0 4px 12px rgba(244,67,54,0.25)',
          }}
        >
          {submitting ? '⏳ Отправка...' : '📤 Отправить на проверку'}
        </button>
      </form>
    </FormShell>
  );
}
