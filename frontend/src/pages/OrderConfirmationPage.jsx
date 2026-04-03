import { Link } from 'react-router-dom';
import OrderSummaryCard from '../components/OrderSummaryCard';
import PageIntro from '../components/PageIntro';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';

function formatDate(value) {
  if (!value) {
    return 'Just now';
  }

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatPaymentLabel(paymentMethod) {
  if (paymentMethod === 'card') {
    return 'Card';
  }

  if (paymentMethod === 'cod') {
    return 'Cash on Delivery';
  }

  return 'UPI';
}

export default function OrderConfirmationPage() {
  const { lastOrder, formatCurrency, clearLastOrder } = useStorefront();

  if (!lastOrder) {
    return (
      <PageIntro
        eyebrow="Confirmation"
        title="No recent order yet"
        description="Place an order from the payment page and the full confirmation view will appear here."
        actions={(
          <Link className="primary-button" to={ROUTES.products}>
            Return to products
          </Link>
        )}
      />
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Order Confirmation"
        title="Order placed successfully"
        description={`Order ${lastOrder.orderId} is confirmed and ready for fulfillment.`}
        actions={(
          <>
            <Link className="secondary-button" to={ROUTES.products} onClick={clearLastOrder}>
              Start a new order
            </Link>
            <Link className="primary-button" to={ROUTES.cart}>
              View fresh cart
            </Link>
          </>
        )}
      />

      <section className="page-split">
        <section className="panel-card confirmation-card">
          <div className="confirmation-badge">Confirmed</div>

          <div className="details-grid">
            <div>
              <span>Order ID</span>
              <strong>{lastOrder.orderId}</strong>
            </div>
            <div>
              <span>Placed at</span>
              <strong>{formatDate(lastOrder.placedAt)}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{formatPaymentLabel(lastOrder.paymentMethod)}</strong>
            </div>
            <div>
              <span>Total amount</span>
              <strong>{formatCurrency(lastOrder.totalAmount)}</strong>
            </div>
          </div>

          <div className="confirmation-address">
            <p className="callout-title">Shipping address</p>
            <p>{lastOrder.shipping.fullName}</p>
            <p>{lastOrder.shipping.phoneNumber}</p>
            <p>{lastOrder.shipping.addressLine1}</p>
            {lastOrder.shipping.addressLine2 ? <p>{lastOrder.shipping.addressLine2}</p> : null}
            <p>
              {lastOrder.shipping.city}, {lastOrder.shipping.state} -{' '}
              {lastOrder.shipping.postalCode}
            </p>
          </div>
        </section>

        <OrderSummaryCard
          title="Confirmed order details"
          cartItems={lastOrder.items}
          formatCurrency={formatCurrency}
          subtotal={lastOrder.subtotal}
          shippingFee={lastOrder.shippingFee}
          total={lastOrder.totalAmount}
        />
      </section>
    </>
  );
}
