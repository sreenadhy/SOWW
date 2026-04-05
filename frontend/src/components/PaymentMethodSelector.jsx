import '../styles/payment-methods.css';

const paymentOptions = [
  {
    id: 'online',
    title: 'Online Payment',
    description: 'Ready for payment gateway integration with card, UPI, or netbanking later.',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    description: 'Useful for local deliveries and assisted order confirmations.',
  },
];

export default function PaymentMethodSelector({ paymentMethod, onChange }) {
  return (
    <section className="panel-card payment-method-panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Payment</p>
          <h2>Select a payment method</h2>
        </div>
      </div>

      <div className="payment-options">
        {paymentOptions.map((option) => (
          <label className="payment-option" key={option.id}>
            <input
              type="radio"
              name="paymentMethod"
              value={option.id}
              checked={paymentMethod === option.id}
              onChange={() => onChange(option.id)}
            />
            <div>
              <strong>{option.title}</strong>
              <p>{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
