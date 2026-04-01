import '../styles/hero-section.css';

export default function HeroSection({ productCount, cartCount, isAuthenticated }) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Small-batch oils. Refined experience.</p>
        <h1>Well-crafted everyday essentials for modern kitchens.</h1>
        <p className="hero-text">
          Browse live inventory, verify with OTP, and place secure orders through the
          existing Sritha Oils backend from one clean storefront.
        </p>

        <div className="hero-actions">
          <a className="primary-button" href="#catalog">
            Explore products
          </a>
          <a className="secondary-button" href="#auth">
            Verify phone
          </a>
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
          <p>
            Uses the existing products, OTP auth, and order APIs with no backend changes.
          </p>
        </div>
      </div>
    </section>
  );
}
