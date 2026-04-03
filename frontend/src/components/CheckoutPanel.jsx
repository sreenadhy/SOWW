import '../styles/checkout-panel.css';

export default function CheckoutPanel({
  cartItems,
  shippingForm,
  onShippingChange,
  onPlaceOrder,
  orderState,
  isAuthenticated,
  formatCurrency,
  subtotal,
  shippingFee,
  total,
}) {
  return (
    <section className="panel-card checkout-panel" id="checkout">
      <div className="panel-heading">
        <p className="section-kicker">Checkout</p>
        <h2>Shipping and order summary</h2>
      </div>

      <div className="cart-list">
        {cartItems.length === 0 ? (
          <div className="state-card compact">Your cart is empty. Add products to continue.</div>
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

      <div className="summary-box">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>Estimated shipping</span>
          <strong>{formatCurrency(shippingFee)}</strong>
        </div>
        <div className="summary-total">
          <span>Estimated total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      <div className="shipping-grid">
        <label className="field-group">
          <span>Full name</span>
          <input
            name="fullName"
            value={shippingForm.fullName}
            onChange={onShippingChange}
            placeholder="Sritha Customer"
          />
        </label>
        <label className="field-group">
          <span>Phone number</span>
          <input
            name="phoneNumber"
            value={shippingForm.phoneNumber}
            onChange={onShippingChange}
            placeholder="9876543210"
          />
        </label>
        <label className="field-group full-span">
          <span>Address line 1</span>
          <input
            name="addressLine1"
            value={shippingForm.addressLine1}
            onChange={onShippingChange}
            placeholder="12 Market Street"
          />
        </label>
        <label className="field-group full-span">
          <span>Address line 2</span>
          <input
            name="addressLine2"
            value={shippingForm.addressLine2}
            onChange={onShippingChange}
            placeholder="Near Temple Road"
          />
        </label>
        <label className="field-group">
          <span>City</span>
          <input
            name="city"
            value={shippingForm.city}
            onChange={onShippingChange}
            placeholder="Chennai"
          />
        </label>
        <label className="field-group">
          <span>State</span>
          <input
            name="state"
            value={shippingForm.state}
            onChange={onShippingChange}
            placeholder="Tamil Nadu"
          />
        </label>
        <label className="field-group">
          <span>Postal code</span>
          <input
            name="postalCode"
            value={shippingForm.postalCode}
            onChange={onShippingChange}
            placeholder="600001"
          />
        </label>
      </div>

      {!isAuthenticated ? (
        <div className="info-callout muted-panel">
          <p className="callout-title">Verification needed</p>
          <p>Complete OTP verification before placing the order.</p>
        </div>
      ) : null}

      {orderState.error ? <p className="form-error">{orderState.error}</p> : null}

      {orderState.success ? (
        <div className="info-callout success-panel">
          <p className="callout-title">Order confirmed</p>
          <p>
            Order <strong>{orderState.success.orderId}</strong> was created successfully.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        className="primary-button panel-button"
        onClick={onPlaceOrder}
        disabled={orderState.loading || cartItems.length === 0 || !isAuthenticated}
      >
        {orderState.loading ? 'Placing order...' : 'Place order'}
      </button>
    </section>
  );
}
