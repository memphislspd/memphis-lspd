// components/PageLayout.js
import Header from './Header';
import GlobalLoader from './GlobalLoader';

export default function PageLayout({ user, children }) {
  if (!user) return <GlobalLoader />;

  return (
    <div className="site-page-shell">
      <Header user={user} />
      <main className="site-page-content">{children}</main>
    </div>
  );
}
