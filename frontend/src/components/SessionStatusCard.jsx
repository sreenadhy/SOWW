import '../styles/session-status.css';

export default function SessionStatusCard({ authState, onLogout }) {
  return (
    <section className="panel-card session-status-card">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Session</p>
          <h2>Authenticated shopper</h2>
        </div>
      </div>

      <div className="auth-success-card">
        <span className="success-dot" />
        <div>
          <p className="callout-title">OTP verified</p>
          <p>{authState?.phoneNumber} is active for protected checkout and payment steps.</p>
        </div>
        <button type="button" className="text-button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </section>
  );
}
