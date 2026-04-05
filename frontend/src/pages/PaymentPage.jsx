import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrderSummaryCard from '../components/OrderSummaryCard';
import PageIntro from '../components/PageIntro';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import SessionStatusCard from '../components/SessionStatusCard';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';
import { isShippingFormComplete } from '../utils/storefront';

function formatPaymentLabel(paymentMethod) {
  if (paymentMethod === 'cod') {
    return 'Cash on Delivery';
  }

  return 'Online Payment';
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    shippingFee,
    total,
    authState,
    shippingForm,
    paymentMethod,
    orderState,
    formatCurrency,
    setPaymentMethod,
    handleLogout,
    placeOrder,
    clearOrderError,
  } = useStorefront();

  const shippingReady = isShippingFormComplete(shippingForm);

  useEffect(() => {
    clearOrderError();
  }, []);

  async function handlePlaceOrder() {
    try {
      const order = await placeOrder();

      if (order) {
        navigate(ROUTES.confirmation);
      }
    } catch {
      // Order errors are surfaced via shared order state.
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Payment"
        title="Verify and place the order"
        description="Review your selected payment method, shipping snapshot, and submit the order to the backend."
        actions={(
          <>
            <Link className="secondary-button" to={ROUTES.checkout}>
              Back to checkout
            </Link>
            <button
              className="primary-button"
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                cartItems.length === 0 ||
                !shippingReady ||
                orderState.loading ||
                !authState?.accessToken
              }
            >
              {orderState.loading ? 'Placing order...' : 'Pay and place order'}
            </button>
          </>
        )}
      />

      <section className="payment-layout">
        <div className="payment-main-stack">
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onChange={setPaymentMethod}
          />

          <SessionStatusCard authState={authState} onLogout={handleLogout} />

          {!shippingReady ? (
            <div className="info-callout muted-panel">
              <p className="callout-title">Checkout details missing</p>
              <p>Complete your shipping form before placing the order.</p>
            </div>
          ) : null}

          {orderState.error ? (
            <div className="state-card error">
              <p className="callout-title">Unable to place order</p>
              <p>{orderState.error}</p>
            </div>
          ) : null}
        </div>

        <div className="side-panel-stack">
          <section className="panel-card accent-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Shipping Snapshot</p>
                <h2>Ready for dispatch</h2>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <span>Name</span>
                <strong>{shippingForm.fullName || 'Not added yet'}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{shippingForm.phoneNumber || 'Not added yet'}</strong>
              </div>
              <div>
                <span>City</span>
                <strong>{shippingForm.city || 'Not added yet'}</strong>
              </div>
              <div>
                <span>Payment</span>
                <strong>{formatPaymentLabel(paymentMethod)}</strong>
              </div>
            </div>
          </section>

          <OrderSummaryCard
            title="Payment summary"
            cartItems={cartItems}
            formatCurrency={formatCurrency}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            footer={(
              <button
                className="primary-button panel-button"
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  cartItems.length === 0 ||
                  !shippingReady ||
                  orderState.loading ||
                  !authState?.accessToken
                }
              >
                {orderState.loading ? 'Submitting order...' : 'Confirm payment'}
              </button>
            )}
          />
        </div>
      </section>
    </>
  );
}
