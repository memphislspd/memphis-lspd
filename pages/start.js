import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const DISCORD_CLIENT_ID = '1533765326213222491';
const DISCORD_REDIRECT_URI = 'https://memphis-lspd.vercel.app/api/auth';

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.query.error === 'new_account') {
      setError(`Ваш Discord аккаунт создан ${router.query.days || '0'} дней назад. Требуется минимум ${router.query.min || '5'} дней.`);
    } else if (router.query.error === 'access_denied') {
      setError('Вы отклонили авторизацию.');
    } else if (router.query.error) {
      setError('Ошибка авторизации. Попробуйте снова.');
    }

    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) router.replace(router.query.redirect || '/dashboard');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router.query]);

  const handleDiscordLogin = () => {
    const redirect = router.query.redirect || '/dashboard';
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds guilds.members.read',
      state: redirect,
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  if (loading) return <div className="landing-loading">Загрузка системы<span>...</span></div>;

  return (
    <div className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="/start" aria-label="Los Santos Police Department">
          <span className="landing-brand__mark">⌁</span>
          <span><strong>LOS SANTOS</strong><small>POLICE DEPARTMENT</small></span>
        </a>
        <nav className="landing-nav" aria-label="Основная навигация">
          <a className="is-active" href="/">Главная</a>
          <a href="/applications">Заявления</a>
          <a href="/departments">Отделы</a>
          <a href="/staff">Для сотрудников</a>
        </nav>
        <button className="landing-login landing-login--small" onClick={handleDiscordLogin}>Войти <span>↗</span></button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__glow landing-hero__glow--red" />
          <div className="landing-hero__glow landing-hero__glow--blue" />
          <div className="landing-hero__content">
            <div className="landing-kicker"><i /> MAJESTIC ROLE PLAY <b>—</b> MEMPHIS</div>
            <h1>Закон.<br /><span>Порядок.</span><br />Los Santos.</h1>
            <p>Los Santos Police Department — служба, которой доверяют.<br />Защищаем граждан. Работаем честно. Действуем быстро.</p>
            {error && <div className="landing-error" role="alert">{error}</div>}
            <div className="landing-actions">
              <button className="landing-login" onClick={handleDiscordLogin}><DiscordIcon /> Подать заявление <span>↗</span></button>
              <a href="/departments" className="landing-more">О департаменте <span>›</span></a>
            </div>
          </div>
          <div className="landing-orbit" aria-hidden="true"><strong>24</strong><small>HOURS</small></div>
          <div className="landing-meta landing-meta--left">LSPD / 010</div>
          <div className="landing-meta landing-meta--center">EST. 2026</div>
          <div className="landing-meta landing-meta--right">LOS SANTOS, CA</div>
        </section>

        <section className="landing-mission">
          <div className="landing-section-label"><span>01</span> НАША МИССИЯ</div>
          <div>
            <h2>Служить и защищать —<br /><em>это наш выбор.</em></h2>
            <p>Мы создаём безопасный город, в котором каждый житель может чувствовать себя защищённым. Наша сила — в дисциплине, профессионализме и уважении к закону.</p>
            <a href="/departments" className="landing-text-link">Узнать больше ↗</a>
          </div>
          <div className="landing-quote">“</div>
        </section>

        <section className="landing-cards">
          <a href="/applications"><span>01</span><strong>Подать заявление</strong><small>Вступление и переводы</small><b>↗</b></a>
          <a href="/departments"><span>02</span><strong>Наши отделы</strong><small>Структура департамента</small><b>↗</b></a>
          <a href="/staff"><span>03</span><strong>Состав LSPD</strong><small>Команда и руководство</small><b>↗</b></a>
        </section>
      </main>
      <footer className="landing-footer"><span>LSPD SYSTEM / MEMPHIS</span><span>SECURE ACCESS · 2026</span></footer>
    </div>
  );
}
