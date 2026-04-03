import QuantityControl from './QuantityControl';
import '../styles/cart-items.css';

export default function CartItemsList({
  items,
  onUpdateCart,
  onRemove,
  formatCurrency,
  emptyMessage = 'Your cart is empty.',
}) {
  if (items.length === 0) {
    return <div className="state-card">{emptyMessage}</div>;
  }

  return (
    <div className="cart-items-list">
      {items.map((item) => (
        <article className="cart-item-card" key={item.id}>
          <div className="cart-item-copy">
            <div className="cart-item-title-row">
              <div>
                <span className="product-unit">{item.unit}</span>
                <h3>{item.name}</h3>
              </div>
              <strong>{formatCurrency(item.lineTotal)}</strong>
            </div>

            <p>{item.description}</p>

            <div className="cart-item-meta">
              <span>{formatCurrency(item.price)} each</span>
              <span>{item.availableStock} available</span>
            </div>
          </div>

          <div className="cart-item-actions">
            <QuantityControl
              quantity={item.quantity}
              max={item.availableStock}
              onChange={(nextQuantity) => onUpdateCart(item.id, nextQuantity)}
              label={item.name}
            />

            <button
              type="button"
              className="text-button"
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
