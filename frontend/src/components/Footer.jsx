import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-grid">
        <div>
          <p className="footer-kicker">Sritha Oils</p>
          <h2>Thoughtful commerce for everyday staples.</h2>
          <p className="footer-copy">
            Crafted frontend experience for the existing Sritha Oils ordering backend.
          </p>
        </div>

        <div>
          <h3>Navigate</h3>
          <a href="#catalog">Catalog</a>
          <a href="#auth">OTP Access</a>
          <a href="#checkout">Checkout</a>
        </div>

        <div>
          <h3>Backend</h3>
          <a href="http://localhost:8080/api/products" target="_blank" rel="noreferrer">
            Products API
          </a>
          <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer">
            H2 Console
          </a>
          <span>JSON-driven storefront</span>
        </div>
      </div>

      <div className="footer-bar">
        <span>© 2026 Sritha Oils. All rights reserved.</span>
        <span>Designed for a clean, modern ordering flow.</span>
      </div>
    </footer>
  );
}
