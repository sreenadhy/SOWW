import { normalizePhoneNumber, PHONE_NUMBER_LENGTH } from '../utils/auth';

export default function PhoneNumberField({
  value,
  onChange,
  disabled = false,
  error = '',
}) {
  function handleChange(event) {
    onChange(normalizePhoneNumber(event.target.value));
  }

  return (
    <label className={`field-group${error ? ' field-group-has-error' : ''}`}>
      <span className="field-label">Mobile number</span>
      <div className="field-input-shell phone-input-shell">
        <span className="field-prefix" aria-hidden="true">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="[0-9]*"
          maxLength={PHONE_NUMBER_LENGTH}
          placeholder="Enter your 10-digit mobile number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
        />
      </div>
      <span className={`field-message${error ? ' field-message-error' : ''}`}>
        {error || "We'll use this number only for your secure OTP login."}
      </span>
    </label>
  );
}
