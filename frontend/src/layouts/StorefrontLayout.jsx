import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import useStorefront from '../hooks/useStorefront';
import '../styles/app.css';

export default function StorefrontLayout() {
  const { cartCount, currentUser, isAuthenticated, logout } = useStorefront();

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />

      <main className="page-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
