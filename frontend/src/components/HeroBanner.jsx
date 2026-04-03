import { Link } from 'react-router-dom';
import ProductArtwork from './ProductArtwork';
import { ROUTES } from '../utils/routes';
import '../styles/hero-banner.css';

function sessionLabel(isAuthenticated, currentUser) {
  if (isAuthenticated) {
    return `Welcome back, ${currentUser?.name || currentUser?.phoneNumber}`;
  }

  return 'Guest browsing with quick mock OTP login';
}

export default function HeroBanner({
  cartCount,
  currentUser,
  isAuthenticated,
  productCount,
}) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-copy">
        <p className="eyebrow">Organic oils for everyday kitchens</p>
        <h1>Clean, nutrient-rich oils for better daily cooking choices.</h1>
        <p className="hero-banner-text">
          Explore organic and cold-pressed oils, understand their benefits at a
          glance, and shop with a cleaner, more informative storefront experience.
        </p>

        <div className="hero-banner-actions">
          <a className="primary-button" href="#catalog">
            Explore collection
          </a>
          <Link className="secondary-button" to={ROUTES.cart}>
            View cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
        </div>

        <div className="hero-banner-stats">
          <article>
            <span>Catalog</span>
            <strong>{String(productCount).padStart(2, '0')}</strong>
            <p>organic kitchen picks</p>
          </article>
          <article>
            <span>Cart items</span>
            <strong>{cartCount}</strong>
            <p>easy quantity control</p>
          </article>
          <article>
            <span>Session</span>
            <strong>{isAuthenticated ? 'Live' : 'Guest'}</strong>
            <p>{sessionLabel(isAuthenticated, currentUser)}</p>
          </article>
        </div>
      </div>

      <div className="hero-banner-visual">
        <div className="hero-banner-main-art">
          <div className="hero-banner-main-copy">
            <span className="soft-badge">Organic oil guide</span>
            <h2>Choose oils with better nutrition, aroma, and everyday versatility.</h2>
          </div>
          <ProductArtwork variant="coconut" emphasis="hero" />
        </div>

        <div className="hero-highlight-grid">
          <article className="hero-highlight-card">
            <ProductArtwork variant="sunflower" emphasis="mini" />
            <div>
              <h3>Balanced everyday cooking</h3>
              <p>Thoughtful oils for frying, sauteing, and wholesome family meals.</p>
            </div>
          </article>
          <article className="hero-highlight-card">
            <ProductArtwork variant="sesame" emphasis="mini" />
            <div>
              <h3>Traditional flavor and aroma</h3>
              <p>Cold-pressed options with richer taste and a naturally fuller finish.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
