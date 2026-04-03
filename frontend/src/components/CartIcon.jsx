import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import '../styles/cart-icon.css';

export default function CartIcon({ count }) {
  return (
    <Link
      className="cart-icon-link"
      to={ROUTES.cart}
      aria-label={`Cart with ${count} items`}
    >
      <span className="cart-icon-frame" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H7" />
          <circle cx="10" cy="19" r="1.4" />
          <circle cx="18" cy="19" r="1.4" />
        </svg>
      </span>
      <span className="cart-icon-label">Cart</span>
      <span className="cart-badge">{count}</span>
    </Link>
  );
}
