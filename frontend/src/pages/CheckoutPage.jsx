import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrderSummaryCard from '../components/OrderSummaryCard';
import PageIntro from '../components/PageIntro';
import ShippingForm from '../components/ShippingForm';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';
import { validateShippingForm } from '../utils/storefront';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [shippingErrors, setShippingErrors] = useState({});
  const {
    cartItems,
    shippingForm,
    subtotal,
    shippingFee,
    total,
    updateShippingValue,
    formatCurrency,
  } = useStorefront();

  function handleContinue() {
    const nextErrors = validateShippingForm(shippingForm);
    setShippingErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      navigate(ROUTES.payment);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Checkout"
        title="Enter shipping details"
        description="Confirm the delivery address and contact information that should travel with this order."
        actions={(
          <>
            <Link className="secondary-button" to={ROUTES.cart}>
              Back to cart
            </Link>
            <button className="primary-button" type="button" onClick={handleContinue}>
              Continue to payment
            </button>
          </>
        )}
      />

      <section className="page-split">
        <section className="panel-card checkout-form-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Shipping</p>
              <h2>Delivery address</h2>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="state-card">
              Your cart is empty. Add products before filling out checkout details.
            </div>
          ) : (
            <ShippingForm
              shippingForm={shippingForm}
              errors={shippingErrors}
              onChange={updateShippingValue}
            />
          )}
        </section>

        <OrderSummaryCard
          title="Checkout summary"
          cartItems={cartItems}
          formatCurrency={formatCurrency}
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
          footer={(
            <div className="stacked-actions">
              <button
                className="primary-button panel-button"
                type="button"
                onClick={handleContinue}
                disabled={cartItems.length === 0}
              >
                Save and continue
              </button>
              <Link className="secondary-button panel-button" to={ROUTES.cart}>
                Return to cart
              </Link>
            </div>
          )}
        />
      </section>
    </>
  );
}
