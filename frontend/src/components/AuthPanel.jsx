import '../styles/auth-panel.css';

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return '';
  }

  try {
    return new Date(expiresAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return expiresAt;
  }
}

export default function AuthPanel({
  phoneNumber,
  otpCode,
  otpState,
  authState,
  onPhoneNumberChange,
  onOtpCodeChange,
  onRequestOtp,
  onVerifyOtp,
  onLogout,
}) {
  const isAuthenticated = Boolean(authState?.accessToken);

  return (
    <section className="panel-card auth-panel" id="auth">
      <div className="panel-heading">
        <p className="section-kicker">Access</p>
        <h2>OTP verification</h2>
      </div>

      <label className="field-group">
        <span>Phone number</span>
        <input
          type="tel"
          placeholder="9876543210"
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange(event.target.value.replace(/\D/g, ''))}
          maxLength={10}
          disabled={isAuthenticated}
        />
      </label>

      {!isAuthenticated ? (
        <>
          <div className="inline-actions">
            <button
              type="button"
              className="primary-button compact"
              onClick={onRequestOtp}
              disabled={otpState.loading}
            >
              {otpState.loading ? 'Sending...' : 'Request OTP'}
            </button>

            {otpState.requested ? (
              <span className="soft-badge">
                Expires by {formatExpiry(otpState.expiresAt)}
              </span>
            ) : null}
          </div>

          {otpState.requested ? (
            <label className="field-group">
              <span>One-time password</span>
              <input
                type="text"
                placeholder="Enter 6 digit OTP"
                value={otpCode}
                onChange={(event) => onOtpCodeChange(event.target.value.replace(/\D/g, ''))}
                maxLength={6}
              />
            </label>
          ) : null}

          {otpState.devOtp ? (
            <div className="info-callout">
              <p className="callout-title">Development shortcut</p>
              <p>
                Backend dev mode returned OTP <strong>{otpState.devOtp}</strong>.
              </p>
            </div>
          ) : null}

          {otpState.requested ? (
            <button
              type="button"
              className="secondary-button panel-button"
              onClick={onVerifyOtp}
              disabled={otpState.loading}
            >
              {otpState.loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          ) : null}
        </>
      ) : (
        <div className="auth-success-card">
          <span className="success-dot" />
          <div>
            <p className="callout-title">Session active</p>
            <p>{authState.phoneNumber} is verified and ready for checkout.</p>
          </div>
          <button type="button" className="text-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}

      {otpState.error ? <p className="form-error">{otpState.error}</p> : null}
    </section>
  );
}
