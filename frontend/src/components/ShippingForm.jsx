import '../styles/shipping-form.css';

const fieldConfig = [
  { name: 'fullName', label: 'Full name', placeholder: 'Sritha Customer' },
  { name: 'phoneNumber', label: 'Phone number', placeholder: '9876543210' },
  {
    name: 'addressLine1',
    label: 'Address line 1',
    placeholder: '12 Market Street',
    fullSpan: true,
  },
  {
    name: 'addressLine2',
    label: 'Address line 2',
    placeholder: 'Near Temple Road',
    fullSpan: true,
  },
  { name: 'city', label: 'City', placeholder: 'Chennai' },
  { name: 'state', label: 'State', placeholder: 'Tamil Nadu' },
  { name: 'postalCode', label: 'Postal code', placeholder: '600001' },
];

export default function ShippingForm({ shippingForm, errors, onChange }) {
  return (
    <div className="shipping-grid">
      {fieldConfig.map((field) => (
        <label
          className={`field-group${field.fullSpan ? ' full-span' : ''}`}
          key={field.name}
        >
          <span>{field.label}</span>
          <input
            name={field.name}
            value={shippingForm[field.name]}
            onChange={(event) => onChange(field.name, event.target.value)}
            placeholder={field.placeholder}
          />
          {errors[field.name] ? <small className="field-error">{errors[field.name]}</small> : null}
        </label>
      ))}
    </div>
  );
}
