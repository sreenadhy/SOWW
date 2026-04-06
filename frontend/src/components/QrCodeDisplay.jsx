import { useMemo } from 'react';

// Simple QR code generator using qr-code-styling or we'll use a data URI approach
// For now, we'll display the secret manually since we don't have qrcode library installed
export default function QrCodeDisplay({ qrCodeUri, secret, phoneNumber }) {
  const qrImageUri = useMemo(() => {
    if (!qrCodeUri) return '';
    // Generate a simple QR code image using a QR service
    // Using qr-server.com as a free QR code generation service
    try {
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUri)}`;
    } catch (error) {
      return '';
    }
  }, [qrCodeUri]);

  return (
    <div className="qr-code-display">
      <div className="qr-code-container">
        {qrImageUri ? (
          <img
            src={qrImageUri}
            alt="TOTP QR Code"
            className="qr-code-image"
            loading="lazy"
          />
        ) : (
          <div className="qr-code-placeholder">
            <p>QR Code unavailable</p>
          </div>
        )}
      </div>

      <div className="secret-display">
        <p className="secret-label">Or enter this key manually:</p>
        <code className="secret-value">{secret}</code>
        <p className="secret-hint">
          Account: {phoneNumber} | Issuer: Sritha Oils
        </p>
      </div>
    </div>
  );
}

