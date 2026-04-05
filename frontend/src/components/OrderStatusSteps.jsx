import '../styles/order-status-steps.css';

const STATUS_STEPS = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function toLabel(status) {
  return String(status || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function OrderStatusSteps({ status }) {
  const activeIndex = Math.max(STATUS_STEPS.indexOf(status), 0);

  return (
    <div className="order-status-steps" aria-label={`Order status ${toLabel(status)}`}>
      {STATUS_STEPS.map((step, index) => (
        <div
          key={step}
          className={`order-status-step ${index <= activeIndex ? 'active' : ''}`}
        >
          <span>{toLabel(step)}</span>
        </div>
      ))}
    </div>
  );
}
