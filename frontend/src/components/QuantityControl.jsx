import '../styles/quantity-control.css';

export default function QuantityControl({
  quantity,
  max,
  onChange,
  label,
  disabled = false,
}) {
  const safeQuantity = quantity || 0;

  return (
    <div className="qty-controls" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(safeQuantity - 1)}
        disabled={disabled || safeQuantity <= 0}
        aria-label={`Decrease ${label}`}
      >
        -
      </button>
      <span>{safeQuantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(safeQuantity + 1, max))}
        disabled={disabled || safeQuantity >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
