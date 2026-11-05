// components/PageLayout.js
import Header from './Header';

export default function PageLayout({ user, children }) {
  return (
    <div className="app-shell">
      <Header user={user} />
      <main className="page-container">{children}</main>
    </div>
  );
}
