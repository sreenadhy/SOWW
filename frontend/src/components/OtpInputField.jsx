export default function OtpInputField({ value, onChange, disabled = false }) {
  return (
    <label className="field-group">
      <span>OTP</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Enter 6-digit OTP"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}
