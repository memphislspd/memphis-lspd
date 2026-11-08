// components/GlobalSearch.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Список всего, что можно найти на сайте
const SEARCH_ITEMS = [
  // Страницы
  { title: 'Главная', path: '/start', category: 'Страницы', icon: '🏠' },
  { title: 'Заявления (Трудоустройство, Перевод)', path: '/applications', category: 'Страницы', icon: '📝' },
  { title: 'Отделы', path: '/departments', category: 'Страницы', icon: '🏢' },
  { title: 'Для сотрудников (Внутренние формы)', path: '/hub', category: 'Страницы', icon: '🛡️' },
  { title: 'Реестр пропусков', path: '/passes', category: 'Страницы', icon: '🪪' },
  { title: 'Мой профиль', path: '/profile', category: 'Страницы', icon: '👤' },
  
  // Формы
  { title: 'Отпуск', path: '/forms/leave', category: 'Формы', icon: '🏖️' },
  { title: 'Запрос на повышение', path: '/forms/promotion', category: 'Формы', icon: '📈' },
  { title: 'Отчёт о повышении', path: '/forms/report', category: 'Формы', icon: '📋' },
  { title: 'Заявление на увольнение', path: '/forms/resignation', category: 'Формы', icon: '🚪' },
  { title: 'Отработка взыскания', path: '/forms/recovery', category: 'Формы', icon: '⚖️' },
  { title: 'Обжалование наказания', path: '/forms/appeal', category: 'Формы', icon: '📜' },
  { title: 'Перевод в отдел', path: '/forms/transfer', category: 'Формы', icon: '🔄' },
  { title: 'Спец вооружение', path: '/forms/weapon-request', category: 'Формы', icon: '🔫' },
];

export default function GlobalSearch({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Фильтруем элементы по введенному запросу
  const filteredItems = SEARCH_ITEMS.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Сброс состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Обработка клавиш (стрелки вверх/вниз, Enter, Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        router.push(filteredItems[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        
        <div className="search-header">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск страниц или форм..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <button className="search-esc" onClick={onClose}>ESC</button>
        </div>

        <div className="search-results">
          {filteredItems.length === 0 ? (
            <div className="search-empty">Ничего не найдено по запросу "{query}"</div>
          ) : (
            filteredItems.map((item, index) => (
              <div 
                key={item.path}
                className={`search-item ${index === selectedIndex ? 'is-selected' : ''}`}
                onClick={() => { router.push(item.path); onClose(); }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="search-item__icon">{item.icon}</div>
                <div className="search-item__info">
                  <span className="search-item__title">{item.title}</span>
                  <span className="search-item__category">{item.category}</span>
                </div>
                {index === selectedIndex && <span className="search-item__enter">↵ Enter</span>}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
