import { useState } from 'react';
import InlineSpinner from './InlineSpinner';
import QrCodeDisplay from './QrCodeDisplay';
import OtpInputField from './OtpInputField';

export default function TotpSetupCard({
  phoneNumber,
  secret,
  qrCodeUri,
  onVerifyCode,
  onCancel,
  loading = false,
  error = '',
  message = '',
}) {
  const [totpCode, setTotpCode] = useState('');
  const [touched, setTouched] = useState(false);

  async function handleVerifyCode(code) {
    setTotpCode(code);
    setTouched(true);
    if (code.length === 6) {
      try {
        await onVerifyCode(code);
      } catch {
        // Error is handled by parent component
      }
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (totpCode.length === 6) {
      onVerifyCode(totpCode);
    }
  }

  return (
    <div className="totp-setup-card">
      <div className="setup-section">
        <h3 className="setup-title">Set Up Google Authenticator</h3>

        <div className="setup-instructions">
          <ol className="instructions-list">
            <li>Install Google Authenticator on your phone</li>
            <li>Scan the QR code below or enter the secret key manually</li>
            <li>Enter the 6-digit code from Google Authenticator</li>
          </ol>
        </div>

        {message && (
          <p className="form-message form-message-info" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="qr-section">
        {secret && qrCodeUri ? (
          <QrCodeDisplay
            qrCodeUri={qrCodeUri}
            secret={secret}
            phoneNumber={phoneNumber}
          />
        ) : (
          <div className="qr-loading">
            <InlineSpinner />
            <p>Generating QR code...</p>
          </div>
        )}
      </div>

      <form className="totp-verification-form" onSubmit={handleManualSubmit}>
        <OtpInputField
          value={totpCode}
          onChange={setTotpCode}
          onComplete={handleVerifyCode}
          disabled={loading}
          error={touched && totpCode.length < 6 ? 'Enter the complete 6-digit code' : ''}
        />

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading || totpCode.length < 6}
          >
            {loading ? (
              <>
                <InlineSpinner />
                Verifying...
              </>
            ) : (
              'Verify TOTP'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

