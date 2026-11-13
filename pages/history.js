import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

const TYPE_META = {
  promotion: { icon: '📈', color: '#4CAF50', label: 'Повышение' },
  transfer: { icon: '🔄', color: '#2196F3', label: 'Перевод' },
  report: { icon: '📋', color: '#FF9800', label: 'Отчёт' },
  highrank: { icon: '🌟', color: '#FF69B4', label: 'Хай Ранги' },
  resignation: { icon: '🚪', color: '#DC3545', label: 'Увольнение' },
  reinstatement: { icon: '🔄', color: '#9C27B0', label: 'Восстановление' },
  'transfer-to-lspd': { icon: '🏛️', color: '#00BCD4', label: 'Перевод в LSPD' },
  hiring: { icon: '📝', color: '#4CAF50', label: 'Трудоустройство' },
  'weapon-request': { icon: '🔫', color: '#FF5722', label: 'Вооружение' },
  leave: { icon: '🏖️', color: '#00BCD4', label: 'Отпуск' },
  premium: { icon: '🎯', color: '#FFD700', label: 'Премия' },
  complaint: { icon: '🚨', color: '#FF0000', label: 'Жалоба' }
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return minutes + ' мин назад';
  if (hours < 24) return hours + ' ч назад';
  if (days < 7) return days + ' дн назад';

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function History() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.history) setHistory(d.history);
      setLoading(false);
    }).catch(() => router.push('/'));
  }, []);

  if (loading) {
    return <div className="history-loading"><span className="form-loading__spinner" /></div>;
  }

  const availableTypes = ['all', ...new Set(history.map(item => item.type).filter(Boolean))];
  const filtered = filter === 'all' ? history : history.filter(item => item.type === filter);

  return (
    <div className="site-page-shell history-page">
      <Header user={user} />
      <main className="history-content">
        <div className="history-heading">
          <div>
            <span className="history-eyebrow">MEMPHIS LSPD / ЛИЧНЫЙ КАБИНЕТ</span>
            <h1>История обращений</h1>
            <p>Все отправленные вами заявления и обращения в одном месте.</p>
          </div>
          <div className="history-count" aria-label={'Всего обращений: ' + filtered.length}>
            <strong>{filtered.length}</strong>
            <span>ЗАПИСЕЙ</span>
          </div>
        </div>

        {history.length > 0 && availableTypes.length > 2 && (
          <div className="history-filters" role="group" aria-label="Фильтр по типу обращения">
            {availableTypes.map(type => {
              const meta = TYPE_META[type];
              const isActive = filter === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={isActive ? 'history-filter is-active' : 'history-filter'}
                  onClick={() => setFilter(type)}
                  aria-pressed={isActive}
                >
                  {type === 'all' ? 'Все обращения' : (meta?.icon || '📄') + ' ' + (meta?.label || type)}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty__mark" aria-hidden="true">—</div>
            <h2>Пока нет обращений</h2>
            <p>Отправленные вами обращения появятся здесь.</p>
          </div>
        ) : (
          <div className="history-list">
            {filtered.map((item, index) => {
              const meta = TYPE_META[item.type] || { icon: '📄', color: '#7f9fc7', label: 'Заявка' };
              return (
                <article className="history-item" key={item.id || (item.type + '-' + item.date + '-' + index)}>
                  <div className="history-item__icon" aria-hidden="true">{meta.icon}</div>
                  <div className="history-item__content">
                    <strong>{item.title || meta.label}</strong>
                    <span className="history-item__date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <span className="history-status"><i />Отправлено</span>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
