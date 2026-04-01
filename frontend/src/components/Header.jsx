import '../styles/header.css';

export default function Header({ cartCount, isAuthenticated }) {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <div className="brand-mark">SO</div>
        <div>
          <p className="brand-kicker">Pure essentials</p>
          <a className="brand-name" href="#top">
            Sritha Oils
          </a>
        </div>
      </div>

      <nav className="site-nav" aria-label="Primary">
        <a href="#catalog">Catalog</a>
        <a href="#auth">OTP Access</a>
        <a href="#checkout">Checkout</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="header-meta">
        <span className={`status-chip ${isAuthenticated ? 'connected' : 'muted'}`}>
          {isAuthenticated ? 'Verified customer' : 'Guest session'}
        </span>
        <a className="cart-chip" href="#checkout">
          Cart <strong>{cartCount}</strong>
        </a>
      </div>
    </header>
  );
}
