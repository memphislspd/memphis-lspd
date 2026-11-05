// components/FormShell.js
import { useRouter } from 'next/router';
import Header from './Header';
import { useEffect, useState } from 'react';

const PUBLIC_FORMS = ['hiring', 'transfer-to-lspd', 'reinstatement'];

export default function FormShell({ title, icon, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    });
  }, []);

  // Определяем, куда вести кнопку "Назад"
  const currentFormId = router.pathname.split('/').pop();
  const backLink = PUBLIC_FORMS.includes(currentFormId) ? '/applications' : '/hub';

  return (
    <div className="app-shell">
      {user && <Header user={user} />}
      <main className="form-container">
        <button className="back-link" onClick={() => router.push(backLink)}>← Вернуться назад</button>
        <section className="form-card">
          <header className="form-card__header">
            <span className="form-card__index">LSPD / FORM</span>
            <div><h1>{title}</h1><p>Заполните обязательные поля для отправки заявления</p></div>
          </header>
          <div className="form-card__body">{children}</div>
        </section>
      </main>
    </div>
  );
}
