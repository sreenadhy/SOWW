import { useMemo, useRef } from 'react';
import { normalizeOtp, OTP_LENGTH } from '../utils/auth';

export default function OtpInputField({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = '',
}) {
  const inputRefs = useRef([]);
  const digits = useMemo(
    () => Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || ''),
    [value],
  );

  function emit(nextDigits) {
    const normalizedValue = normalizeOtp(nextDigits.join(''));
    onChange(normalizedValue);

    if (normalizedValue.length === OTP_LENGTH) {
      onComplete?.(normalizedValue);
    }
  }

  function handleDigitChange(index, event) {
    const incomingDigits = String(event.target.value).replace(/\D/g, '');
    const nextDigits = [...digits];

    if (!incomingDigits) {
      nextDigits[index] = '';
      emit(nextDigits);
      return;
    }

    incomingDigits.split('').forEach((digit, offset) => {
      const targetIndex = index + offset;

      if (targetIndex < OTP_LENGTH) {
        nextDigits[targetIndex] = digit;
      }
    });

    emit(nextDigits);

    const focusIndex = Math.min(index + incomingDigits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    inputRefs.current[focusIndex]?.select();
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      event.preventDefault();
    }
  }

  function handlePaste(event) {
    event.preventDefault();
    const pastedValue = normalizeOtp(event.clipboardData.getData('text'));

    if (!pastedValue) {
      return;
    }

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedValue[index] || '');
    emit(nextDigits);

    const focusIndex = Math.min(pastedValue.length, OTP_LENGTH) - 1;
    inputRefs.current[Math.max(focusIndex, 0)]?.focus();
  }

  return (
    <div className={`field-group${error ? ' field-group-has-error' : ''}`}>
      <span className="field-label">OTP verification code</span>
      <div className="otp-input-grid" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            className="otp-digit"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(event) => handleDigitChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            aria-invalid={Boolean(error)}
          />
        ))}
      </div>
      <span className={`field-message${error ? ' field-message-error' : ''}`}>
        {error || 'Enter the 6-digit code sent to your mobile number.'}
      </span>
    </div>
  );
}
