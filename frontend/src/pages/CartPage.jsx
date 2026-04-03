import { Link } from 'react-router-dom';
import QuantityControl from '../components/QuantityControl';
import useStorefront from '../hooks/useStorefront';
import { getOrganicProductContent } from '../utils/productContent';
import { ROUTES } from '../utils/routes';
import '../styles/cart-page.css';

export default function CartPage() {
  const { cartItems, totalAmount, formatCurrency, updateCart, removeFromCart } = useStorefront();

  return (
    <section className="cart-page">
      <div className="cart-page-header">
        <div>
          <p className="section-kicker">Your Cart</p>
          <h1>Shopping cart</h1>
        </div>
        <Link className="secondary-button" to={ROUTES.home}>
          Continue shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="state-card cart-empty">
          <p>Your cart is empty.</p>
          <Link className="primary-button" to={ROUTES.home}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => {
              const productContent = getOrganicProductContent(item);

              return (
                <article className="cart-row" key={item.id}>
                  <div className="cart-row-copy">
                    <div className="cart-row-title">
                      <h2>{productContent.displayName}</h2>
                      <strong>{formatCurrency(item.lineTotal)}</strong>
                    </div>
                    <p>{productContent.description}</p>
                    <span className="cart-row-meta">{formatCurrency(item.price)} each</span>
                  </div>

                  <div className="cart-row-actions">
                    <QuantityControl
                      quantity={item.quantity}
                      max={item.availableStock}
                      onChange={(nextQuantity) =>
                        updateCart(item.id, nextQuantity, item.availableStock)
                      }
                      label={item.name}
                    />
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <p className="section-kicker">Order Total</p>
            <h2>{formatCurrency(totalAmount)}</h2>
            <button type="button" className="primary-button panel-button">
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
