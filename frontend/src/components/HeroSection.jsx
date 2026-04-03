import { Link } from 'react-router-dom';
import '../styles/hero-section.css';

export default function HeroSection({ productCount, cartCount, isAuthenticated }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Organic oils. Better informed choices.</p>
        <h1>Well-crafted organic oils for modern kitchens.</h1>
        <p className="hero-text">
          Browse live inventory, move through the new routed checkout flow, verify with
          OTP, and place secure orders through the existing Sritha Oils backend.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" to="/cart">
            Review cart
          </Link>
          <Link className="secondary-button" to="/payment">
            Continue to payment
          </Link>
        </div>
      </div>

      <div className="hero-panel">
        <div className="hero-stat-grid">
          <article>
            <span>Live catalog</span>
            <strong>{productCount || '05'}</strong>
            <p>seeded products from the backend</p>
          </article>
          <article>
            <span>Cart items</span>
            <strong>{cartCount}</strong>
            <p>ready for checkout</p>
          </article>
          <article>
            <span>Session</span>
            <strong>{isAuthenticated ? 'Ready' : 'Pending'}</strong>
            <p>{isAuthenticated ? 'JWT token active' : 'OTP verification required'}</p>
          </article>
        </div>

        <div className="hero-note">
          <p className="note-title">Built for the current backend</p>
          <p>Uses the existing products, OTP auth, and order APIs with no backend changes.</p>
        </div>
      </div>
    </section>
  );
}
