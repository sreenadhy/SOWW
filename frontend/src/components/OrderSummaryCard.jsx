import '../styles/order-summary.css';

export default function OrderSummaryCard({
  title = 'Order summary',
  cartItems,
  formatCurrency,
  subtotal,
  shippingFee,
  total,
  showItems = true,
  footer,
}) {
  return (
    <section className="panel-card order-summary-card">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Summary</p>
          <h2>{title}</h2>
        </div>
      </div>

      {showItems ? (
        <div className="cart-list">
          {cartItems.length === 0 ? (
            <div className="state-card compact">No items added yet.</div>
          ) : (
            cartItems.map((item) => (
              <article className="cart-line" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    Qty {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </article>
            ))
          )}
        </div>
      ) : null}

      <div className="summary-box">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>{formatCurrency(shippingFee)}</strong>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      {footer ? <div className="summary-footer">{footer}</div> : null}
    </section>
  );
}
