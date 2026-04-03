import { Link, useLocation, useSearchParams } from 'react-router-dom';
import CartIcon from './CartIcon';
import { ROUTES } from '../utils/routes';
import '../styles/header.css';

export default function Header({ cartCount, currentUser, isAuthenticated, onLogout }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHomePage = location.pathname === ROUTES.home;
  const searchValue = isHomePage ? searchParams.get('q') || '' : '';

  function handleSearchChange(event) {
    const nextValue = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextValue.trim()) {
      nextSearchParams.set('q', nextValue);
    } else {
      nextSearchParams.delete('q');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <header className={`site-header${isHomePage ? ' site-header--with-search' : ''}`}>
      <Link className="brand-lockup" to={ROUTES.home}>
        <div className="brand-mark">SO</div>
        <div>
          <p className="brand-kicker">Organic oils</p>
          <span className="brand-name">Sritha Oils</span>
        </div>
      </Link>

      {isHomePage ? (
        <label className="header-search" aria-label="Search products">
          <input
            type="search"
            placeholder="Search organic oils"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </label>
      ) : null}

      <div className="header-actions">
        {isAuthenticated ? (
          <>
            <div className="session-pill">
              <span className="session-pill-label">Signed in</span>
              <strong>{currentUser?.name || currentUser?.phoneNumber}</strong>
            </div>
            <button type="button" className="secondary-button compact" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="secondary-button compact" to={ROUTES.login}>
            Login
          </Link>
        )}

        <CartIcon count={cartCount} />
      </div>
    </header>
  );
}
