import AddressSelectionCard from '../components/AddressSelectionCard';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrderSummaryCard from '../components/OrderSummaryCard';
import PageIntro from '../components/PageIntro';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import ShippingForm from '../components/ShippingForm';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';
import { validateShippingForm } from '../utils/storefront';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [shippingErrors, setShippingErrors] = useState({});
  const {
    cartItems,
    addresses,
    shippingForm,
    subtotal,
    shippingFee,
    total,
    selectedAddressId,
    useSavedAddress,
    updateShippingValue,
    selectAddress,
    startNewAddress,
    formatCurrency,
    paymentMethod,
    setPaymentMethod,
  } = useStorefront();

  function handleContinue() {
    const nextErrors = useSavedAddress ? {} : validateShippingForm(shippingForm);
    setShippingErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      navigate(ROUTES.payment);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Checkout"
        title="Review delivery and payment details"
        description="Choose the right address, confirm your contact information, and lock in the payment method for this order."
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
        <div className="payment-main-stack">
          <AddressSelectionCard
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            useSavedAddress={useSavedAddress}
            onSelectAddress={selectAddress}
            onAddNew={startNewAddress}
          />

          <section className="panel-card checkout-form-card">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Shipping</p>
                <h2>{useSavedAddress ? 'Selected address' : 'Add new address'}</h2>
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

          <PaymentMethodSelector paymentMethod={paymentMethod} onChange={setPaymentMethod} />
        </div>

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
                Continue to review
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
