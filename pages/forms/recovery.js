import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';

const WARN_OPTIONS = [
  { value: '1/3', label: '1/3 warn' },
  { value: '2/3', label: '2/3 warn' },
];

const RANK_OPTIONS = [
  { value: 'cadet', label: 'Кадет (1–2 ранг)' },
  { value: 'regular', label: 'Обычный сотрудник (3+ ранг)' },
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
    suppliesProof: '',
    comment: '',
  });

  // Список МП для способа "Баллы"
  const [mpList, setMpList] = useState([{ type: '', proof: '' }]);

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

  // --- Работа с МП ---
  const addMp = () => {
    setMpList([...mpList, { type: '', proof: '' }]);
  };

  const removeMp = (index) => {
    setMpList(mpList.filter((_, i) => i !== index));
  };

  const updateMp = (index, field, value) => {
    setMpList(mpList.map((mp, i) => (i === index ? { ...mp, [field]: value } : mp)));
  };

  const isFormValid = () => {
    if (!formData.warn || !formData.rank || !formData.method) return false;
    if (formData.method === 'supplies' && !formData.suppliesProof.trim()) return false;
    if (formData.method === 'points') {
      if (mpList.length === 0) return false;
      for (const mp of mpList) {
        if (!mp.type || !mp.proof.trim()) return false;
      }
    }
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
        body: JSON.stringify({
          ...formData,
          mpList: formData.method === 'points' ? mpList : [],
        }),
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
              <option key={o.value} value={o.value}>{o.label}</option>
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
              <option key={o.value} value={o.value}>{o.label}</option>
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
              })
            }
            style={{ ...s, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">-- Выберите --</option>
            {METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
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

        {/* Список МП для способа "Баллы" */}
        {formData.method === 'points' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Список мероприятий * (можно добавить несколько)</label>

            {mpList.map((mp, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  position: 'relative',
                }}
              >
                {/* Номер МП + кнопка удаления */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#8b8ba7' }}>
                    МП #{index + 1}
                  </div>
                  {mpList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMp(index)}
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
                  )}
                </div>

                {/* Тип МП */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={lbl}>Тип мероприятия *</label>
                  <select
                    required
                    value={mp.type}
                    onChange={(e) => updateMp(index, 'type', e.target.value)}
                    style={{ ...s, appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="">-- Выберите --</option>
                    {MP_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Скрины для этого МП */}
                <div>
                  <label style={lbl}>Скрины * (каждый с новой строки, с бодикамерой)</label>
                  <textarea
                    required
                    value={mp.proof}
                    onChange={(e) => updateMp(index, 'proof', e.target.value)}
                    placeholder="Вставьте ссылки на скрины..."
                    rows="3"
                    style={{ ...s, resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
              </div>
            ))}

            {/* Кнопка добавить МП */}
            <button
              type="button"
              onClick={addMp}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(33,150,243,0.15)',
                color: '#64b5f6',
                border: '1px dashed rgba(33,150,243,0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              Добавить ещё МП
            </button>
          </div>
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
