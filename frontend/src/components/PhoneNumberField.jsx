export default function PhoneNumberField({ value, onChange, disabled = false }) {
  return (
    <label className="field-group">
      <span>Phone number</span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="Enter your 10-digit mobile number"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}
