import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StaffCard from '../components/StaffCard';

const DISCORD_CLIENT_ID = '1533765326213222491';
const DISCORD_REDIRECT_URI = 'https://memphis-lspd.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (!router.isReady) return undefined;

    if (router.query.error === 'new_account') {
      setError(`Ваш Discord аккаунт создан ${router.query.days || '0'} дней назад. Требуется минимум ${router.query.min || '5'} дней.`);
    } else if (router.query.error === 'access_denied') {
      setError('Вы отклонили авторизацию.');
    } else if (router.query.error) {
      setError('Ошибка авторизации. Попробуйте снова.');
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    fetch('/api/me', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) router.replace(router.query.redirect || '/dashboard');
      })
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [router.isReady, router.query.error, router.query.days, router.query.min, router.query.redirect]);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/staff', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setStaff(Array.isArray(data) ? data : []))
      .catch(() => {});

    return () => controller.abort();
  }, []);

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

  return (
    <div className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="/start" aria-label="Los Santos Police Department">
          <span className="landing-brand__mark">⌁</span>
          <span><strong>LOS SANTOS</strong><small>POLICE DEPARTMENT</small></span>
        </a>
        <nav className="landing-nav" aria-label="Основная навигация">
          <a className="is-active" href="/start">Главная</a>
          <a href="/applications">Заявления</a>
          <a href="/departments">Отделы</a>
          <a href="/hub">Для сотрудников</a>
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

        <section className="landing-command" aria-labelledby="landing-command-title">
          <div className="landing-command__eyebrow">TOP SECRET // CLEARANCE REQUIRED</div>
          <div className="landing-section-label"><span>03</span> РУКОВОДСТВО</div>
          <h2 id="landing-command-title">Командование департамента</h2>
          <p>Высшее руководство Los Santos Police Department</p>
          <div className="landing-command__grid">
            {staff.map((member) => (
              <StaffCard key={member.id} member={member} isAdminView={false} />
            ))}
          </div>
        </section>
      </main>
      <footer className="landing-footer"><span>LSPD SYSTEM / MEMPHIS</span><span>SECURE ACCESS · 2026</span></footer>
    </div>
  );
}
