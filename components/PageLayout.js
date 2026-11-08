// components/PageLayout.js
import Header from './Header';
import GlobalLoader from './GlobalLoader'; // <-- Импортируем наш скелетон

export default function PageLayout({ user, children }) {
  // Если данных о пользователе еще нет — показываем скелетон
  if (!user) {
    return <GlobalLoader />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at 50% 0%, #111827 0%, #030303 70%)', 
      color: 'white', 
      fontFamily: "'Montserrat', 'Inter', -apple-system, sans-serif", 
      overflowX: 'hidden' 
    }}>
      <Header user={user} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
        {children}
      </div>
    </div>
  );
}
