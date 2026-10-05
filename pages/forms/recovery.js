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

// Описание допустимых мероприятий для баллов
const MP_ACTIVITIES = [
  {
    name: 'Дроп',
    hint: 'Скрин в зоне дропа с нажатой E, состоя в группе.',
  },
  {
    name: 'Поставка / крафт',
    hint: '2 скрина с перерывом более 5 минут в машине, которая едет в колонне (желательно с маткой).',
  },
  {
    name: 'Отбитие бизнеса / банка',
    hint: 'Скрин отбитого банка — видна опасная зона, оружие в руке, мёртвые грабители.',
  },
  {
    name: 'МП от отдела',
    hint: 'Скрин в составе группы во время самого МП либо отписанное МП в соответствующий канал.',
  },
];

// Возвращает требования под выбранный варн + ранг + способ
function getRequirement(warn, rank, method) {
  if (!warn || !rank || !method) return null;

  const isCadet = rank === 'cadet';
  const table = {
    cadet: {
      '1/3': { supplies: '300 бинтов на склад', points: 2 },
      '2/3': { supplies: '400 бинтов на склад', points: 4 },
    },
    regular: {
      '1/3': { supplies: '500 бинтов + 10 капсул восстановления на склад', points: 3 },
      '2/3': { supplies: '1000 бинтов + 15 капсул восстановления на склад', points: 5 },
    },
  };

  const key = isCadet ? 'cadet' : 'regular';
  const entry = table[key][warn];

  return {
    method,
    suppliesText: entry.supplies,
    pointsCount: entry.points,
    activities: MP_ACTIVITIES,
  };
}

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

  const requirement = getRequirement(formData.warn, formData.rank, formData.method);

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

        {/* Плашка с требованиями — появляется после всех трёх выборов */}
        {requirement && (
          <div
            style={{
              background:
                requirement.method === 'supplies'
                  ? 'linear-gradient(135deg, rgba(33,150,243,0.10), rgba(88,101,242,0.10))'
                  : 'linear-gradient(135deg, rgba(255,152,0,0.10), rgba(244,67,54,0.10))',
              border:
                requirement.method === 'supplies'
                  ? '1px solid rgba(33,150,243,0.3)'
                  : '1px solid rgba(255,152,0,0.3)',
              borderRadius: '12px',
              padding: '20px',
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
                background:
                  requirement.method === 'supplies'
                    ? 'linear-gradient(180deg, #2196F3, #5865F2)'
                    : 'linear-gradient(180deg, #FF9800, #F44336)',
              }}
            />

            {/* Заголовок плашки */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>
                {requirement.method === 'supplies' ? '💊' : '🎯'}
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>
                  Что нужно для отработки {formData.warn}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b8ba7' }}>
                  {formData.rank === 'cadet' ? 'Кадет (1–2 ранг)' : 'Обычный сотрудник'}
                  {' • '}
                  {requirement.method === 'supplies' ? 'Способ: Бинты+Капсулы' : 'Способ: Баллы (МП)'}
                </p>
              </div>
            </div>

            {/* Если способ — Бинты+Капсулы */}
            {requirement.method === 'supplies' && (
              <>
                <div style={{ fontSize: '15px', color: 'white', lineHeight: 1.5, fontWeight: 500, marginBottom: '12px' }}>
                  {requirement.suppliesText}
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#b8b8c8',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: 'white' }}>📸 Доказательство:</strong> скрин с планшета (планшет → LSPD → склад), на котором видно, что ты положил бинты и капсулы восстановления на склад.
                </div>
              </>
            )}

            {/* Если способ — Баллы */}
            {requirement.method === 'points' && (
              <>
                <div style={{ fontSize: '15px', color: 'white', lineHeight: 1.5, fontWeight: 500, marginBottom: '12px' }}>
                  Нужно участие в <strong style={{ color: '#FF9800' }}>{requirement.pointsCount} МП</strong>
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#b8b8c8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Подходящие мероприятия:
                  </div>
                  {requirement.activities.map((act, i) => (
                    <div
                      key={i}
                      style={{
                        paddingBottom: i < requirement.activities.length - 1 ? '10px' : 0,
                        marginBottom: i < requirement.activities.length - 1 ? '10px' : 0,
                        borderBottom: i < requirement.activities.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '13px', color: 'white', fontWeight: 600, marginBottom: '4px' }}>
                        • {act.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b8ba7', lineHeight: 1.5, paddingLeft: '12px' }}>
                        {act.hint}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(255,152,0,0.08)',
                    border: '1px solid rgba(255,152,0,0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#b8b8c8',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: 'white' }}>📸 Все скрины</strong> должны быть с включённой бодикамерой и подтверждать, что ты полноценный участник мероприятия.
                </div>
              </>
            )}
          </div>
        )}

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

        {/* Список МП */}
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
