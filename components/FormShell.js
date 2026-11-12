import { useRouter } from 'next/router';
import Header from './Header';

const PUBLIC_FORMS = ['hiring', 'transfer-to-lspd', 'reinstatement'];

export default function FormShell({
  title,
  icon,
  accent = '#3f83f8',
  subtitle = 'Заполните обязательные поля для отправки обращения',
  backLink: customBackLink,
  user,
  children
}) {
  const router = useRouter();
  const currentFormId = router.pathname.split('/').pop();
  const backLink = customBackLink || (PUBLIC_FORMS.includes(currentFormId) ? '/applications' : '/hub');

  return (
    <div className="app-shell">
      {user && <Header user={user} />}
      <main className="form-container">
        <button type="button" className="back-link" onClick={() => router.push(backLink)}>
          ← Вернуться назад
        </button>
        <section className="form-card" style={{ '--form-accent': accent }}>
          <header className="form-card__header">
            {icon && (
              <span
                className="form-card__icon"
                aria-hidden="true"
                style={{ color: accent, borderColor: `${accent}66`, backgroundColor: `${accent}18` }}
              >
                {icon}
              </span>
            )}
            <div className="form-card__heading">
              <span className="form-card__index">LSPD / FORM</span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </header>
          <div className="form-card__body">{children}</div>
        </section>
      </main>
    </div>
  );
}
