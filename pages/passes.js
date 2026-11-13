import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';
import AdminSectionHeader from '../components/AdminSectionHeader';
import { adminPanelStyle, adminPanelHeaderStyle, adminInputStyle, adminPrimaryButtonStyle } from '../components/adminStyles';

const EMPTY_FORM = {
  name: '',
  staticId: '',
  passNumber: '',
  issueDate: '',
  validFrom: '',
  validUntil: '',
  link: ''
};

const fieldLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  color: '#94a3b8',
  fontSize: '11px',
  fontFamily: "'DM Mono', monospace",
  letterSpacing: '0.5px'
};

const inputStyle = {
  ...adminInputStyle,
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  fontSize: '13px'
};

const secondaryButtonStyle = {
  background: 'rgba(148, 163, 184, 0.08)',
  color: '#cbd5e1',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: '4px',
  padding: '9px 12px',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: "'DM Mono', monospace",
  fontWeight: 700
};

function todayUtc() {
  // API и интерфейс используют одну календарную дату UTC для одинакового статуса у всех сотрудников.
  return new Date().toISOString().slice(0, 10);
}

function getPassStatus(pass, today) {
  if (pass.revokedAt) {
    return { kind: 'revoked', label: 'АННУЛИРОВАН', reason: 'Аннулирован администратором' };
  }
  if (pass.validUntil && today > pass.validUntil) {
    return { kind: 'expired', label: 'АННУЛИРОВАН', reason: 'Срок действия истёк автоматически' };
  }
  if (pass.validFrom && today < pass.validFrom) {
    return { kind: 'pending', label: 'ЕЩЁ НЕ ДЕЙСТВУЕТ', reason: 'Срок действия ещё не начался' };
  }
  if (pass.validFrom && pass.validUntil) {
    return { kind: 'active', label: 'ДЕЙСТВУЕТ', reason: 'Пропуск действителен' };
  }
  return { kind: 'unspecified', label: 'СРОК НЕ ЗАДАН', reason: 'Для старой записи не указан период действия' };
}

function formatDate(value) {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (match) return `${match[3]}.${match[2]}.${match[1]}`;
  return String(value);
}

function dateForInput(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value));
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

export default function PassesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [passes, setPasses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issueDateDesc');
  const [today, setToday] = useState(todayUtc);

  const fetchPasses = async () => {
    const response = await fetch('/api/passes', { cache: 'no-store' });
    if (!response.ok) throw new Error('Не удалось загрузить реестр пропусков');
    const data = await response.json();
    setPasses(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        if (cancelled) return;
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
      })
      .catch(() => { if (!cancelled) router.push('/'); });

    fetch('/api/admin/check', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => { if (!cancelled) setIsAdmin(Boolean(data.isAdmin)); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });

    fetchPasses().catch(error => window.toast?.error(error.message));
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setToday(todayUtc()), 30000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const method = editingId ? 'PATCH' : 'POST';
    const payload = editingId
      ? { ...formData, id: editingId, action: 'update' }
      : formData;

    try {
      const response = await fetch('/api/passes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось сохранить пропуск');
      setPasses(Array.isArray(data) ? data : []);
      window.toast?.success(editingId ? 'Данные пропуска обновлены' : 'Пропуск добавлен в реестр');
      resetForm();
    } catch (error) {
      window.toast?.error(error.message || 'Ошибка сохранения');
    }
  };

  const handleEdit = (pass) => {
    setFormData({
      name: pass.name || '',
      staticId: pass.staticId || '',
      passNumber: pass.passNumber || '',
      issueDate: dateForInput(pass.issueDate),
      validFrom: dateForInput(pass.validFrom),
      validUntil: dateForInput(pass.validUntil),
      link: pass.link || ''
    });
    setEditingId(pass.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRevoke = async (pass) => {
    if (!confirm(`Аннулировать пропуск №${pass.passNumber} для ${pass.name}? Это действие нельзя отменить.`)) return;
    try {
      const response = await fetch('/api/passes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pass.id, action: 'revoke' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось аннулировать пропуск');
      setPasses(Array.isArray(data) ? data : []);
      window.toast?.success('Пропуск аннулирован');
    } catch (error) {
      window.toast?.error(error.message || 'Ошибка аннулирования');
    }
  };

  const visiblePasses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru-RU');
    const filtered = passes.filter(pass => {
      const status = getPassStatus(pass, today);
      const matchesSearch = !query || [pass.name, pass.staticId, pass.passNumber]
        .some(value => String(value || '').toLocaleLowerCase('ru-RU').includes(query));
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && status.kind === 'active')
        || (statusFilter === 'revoked' && (status.kind === 'revoked' || status.kind === 'expired'))
        || (statusFilter === 'pending' && status.kind === 'pending')
        || (statusFilter === 'unspecified' && status.kind === 'unspecified');
      return matchesSearch && matchesStatus;
    });

    const compareText = (a, b, field) => String(a[field] || '').localeCompare(String(b[field] || ''), 'ru', { numeric: true });
    filtered.sort((a, b) => {
      if (sortBy === 'name') return compareText(a, b, 'name');
      if (sortBy === 'passNumber') return compareText(a, b, 'passNumber');
      if (sortBy === 'validUntil') return compareText(a, b, 'validUntil');
      return compareText(b, a, 'issueDate');
    });
    return filtered;
  }, [passes, search, statusFilter, sortBy, today]);

  if (!user) return null;

  const gridColumns = isAdmin
    ? '1.2fr 0.75fr 0.65fr 0.85fr 1.2fr 0.45fr 1fr 1.4fr'
    : '1.2fr 0.75fr 0.65fr 0.85fr 1.2fr 0.45fr 1fr';
  const gridMinWidth = isAdmin ? '1120px' : '980px';

  const updateField = (field, value) => setFormData(current => ({ ...current, [field]: value }));

  return (
    <PageLayout user={user}>
      <AdminSectionHeader
        title="Реестр пропусков"
        description="Учёт выданных пропусков, сроков действия и аннулированных записей."
        showBack={isAdmin}
      />

      {isAdmin && (
        <div style={{ ...adminPanelStyle, marginBottom: '26px' }}>
          <div style={{ ...adminPanelHeaderStyle, justifyContent: 'flex-start' }}>
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            {editingId ? ' РЕДАКТИРОВАНИЕ ПРОПУСКА' : ' ВЫДАЧА НОВОГО ПРОПУСКА'}
          </div>
          <form onSubmit={handleSave} style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '15px', alignItems: 'end' }}>
            <label style={fieldLabelStyle}>
              ИМЯ И ФАМИЛИЯ
              <input required maxLength={120} value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Имя Фамилия" style={inputStyle} />
            </label>
            <label style={fieldLabelStyle}>
              СТАТИК
              <input required maxLength={40} value={formData.staticId} onChange={e => updateField('staticId', e.target.value)} placeholder="ID сотрудника" style={inputStyle} />
            </label>
            <label style={fieldLabelStyle}>
              НОМЕР ПРОПУСКА
              <input required maxLength={40} value={formData.passNumber} onChange={e => updateField('passNumber', e.target.value)} placeholder="Номер" style={inputStyle} />
            </label>
            <label style={fieldLabelStyle}>
              ДАТА ВЫДАЧИ
              <input required type="date" value={formData.issueDate} onChange={e => updateField('issueDate', e.target.value)} style={inputStyle} />
            </label>
            <label style={fieldLabelStyle}>
              ДЕЙСТВУЕТ ОТ
              <input required type="date" value={formData.validFrom} onChange={e => updateField('validFrom', e.target.value)} style={inputStyle} />
            </label>
            <label style={fieldLabelStyle}>
              ДЕЙСТВУЕТ ДО
              <input required type="date" min={formData.validFrom || undefined} value={formData.validUntil} onChange={e => updateField('validUntil', e.target.value)} style={inputStyle} />
            </label>
            <label style={{ ...fieldLabelStyle, gridColumn: '1 / -1' }}>
              ССЫЛКА НА ДОКУМЕНТ (НЕОБЯЗАТЕЛЬНО)
              <input type="url" value={formData.link} onChange={e => updateField('link', e.target.value)} placeholder="https://..." style={inputStyle} />
            </label>
            <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', flexWrap: 'wrap' }}>
              <button type="submit" style={{ ...adminPrimaryButtonStyle, padding: '12px 22px', flex: '1 1 220px' }}>
                {editingId ? '[ СОХРАНИТЬ ИЗМЕНЕНИЯ ]' : '[ ВЫДАТЬ ПРОПУСК ]'}
              </button>
              {editingId && <button type="button" onClick={resetForm} style={secondaryButtonStyle}>ОТМЕНА</button>}
            </div>
          </form>
          <div style={{ padding: '0 20px 18px', color: '#64748b', fontSize: '11px', lineHeight: 1.5 }}>
            Пропуск действует включительно до даты «ДО». Со следующего календарного дня он автоматически получит статус «АННУЛИРОВАН».
          </div>
        </div>
      )}

      <div style={{ ...adminPanelStyle }}>
        <div style={{ ...adminPanelHeaderStyle }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>█</span> РЕЕСТР ПРОПУСКОВ
          </div>
          <div style={{ color: '#7f8a9a' }}>ПОКАЗАНО: {visiblePasses.length} / {passes.length}</div>
        </div>

        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '10px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск: имя, статик или номер"
            aria-label="Поиск пропусков"
            style={inputStyle}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Фильтр по статусу" style={inputStyle}>
            <option value="all">Все статусы</option>
            <option value="active">Действующие</option>
            <option value="revoked">Аннулированные</option>
            <option value="pending">Ещё не действуют</option>
            <option value="unspecified">Срок не задан</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Сортировка пропусков" style={inputStyle}>
            <option value="issueDateDesc">Сначала новые</option>
            <option value="name">По имени</option>
            <option value="passNumber">По номеру</option>
            <option value="validUntil">По окончанию срока</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: gridMinWidth }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridColumns,
              gap: '10px',
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.02)',
              fontWeight: 700,
              fontSize: '10px',
              color: '#7f8a9a',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              fontFamily: "'DM Mono', monospace",
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div>Имя</div>
              <div>Статик</div>
              <div>Номер</div>
              <div>Выдан</div>
              <div>Период действия</div>
              <div>Ссылка</div>
              <div>Статус</div>
              {isAdmin && <div>Действия</div>}
            </div>

            {visiblePasses.map(pass => {
              const status = getPassStatus(pass, today);
              const statusColor = status.kind === 'active' ? '#4ade80'
                : status.kind === 'revoked' || status.kind === 'expired' ? '#ff5268'
                : status.kind === 'pending' ? '#fbbf24' : '#94a3b8';
              const isRevoked = status.kind === 'revoked' || status.kind === 'expired';

              return (
                <div
                  key={pass.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gridColumns,
                    gap: '10px',
                    padding: '15px 18px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
                    fontSize: '12px',
                    alignItems: 'center',
                    fontFamily: "'DM Mono', monospace"
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'white', fontFamily: "'Space Grotesk', sans-serif', fontSize: '13px', overflowWrap: 'anywhere' }}>{pass.name}</div>
                  <div style={{ color: '#9ca3af' }}>{pass.staticId}</div>
                  <div style={{ color: 'var(--blue)', fontWeight: 700 }}>#{pass.passNumber}</div>
                  <div style={{ color: '#9ca3af' }}>{formatDate(pass.issueDate)}</div>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    {pass.validFrom && pass.validUntil
                      ? <>{formatDate(pass.validFrom)}<span style={{ color: '#64748b' }}> — </span>{formatDate(pass.validUntil)}</>
                      : 'Не задан'}
                  </div>
                  <div>
                    {pass.link ? (
                      <a href={pass.link} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}>открыть</a>
                    ) : <span style={{ color: '#4b5563' }}>нет</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ color: statusColor, border: `1px solid ${statusColor}66`, background: `${statusColor}12`, padding: '4px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {status.label}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '9px', lineHeight: 1.3 }}>{status.reason}</span>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleEdit(pass)} style={secondaryButtonStyle}>ИЗМЕНИТЬ</button>
                      {!isRevoked && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(pass)}
                          style={{ ...secondaryButtonStyle, color: '#ff7183', borderColor: 'rgba(255, 82, 104, 0.35)' }}
                        >
                          АННУЛИРОВАТЬ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {visiblePasses.length === 0 && (
          <div style={{ padding: '38px 20px', textAlign: 'center', color: '#6b7280', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
            {passes.length === 0 ? '[ В БАЗЕ ДАННЫХ НЕТ ПРОПУСКОВ ]' : '[ ПО ЗАПРОСУ НИЧЕГО НЕ НАЙДЕНО ]'}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </PageLayout>
  );
}
