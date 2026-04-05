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
          <p className="callout-title">Authenticated shopper</p>
          <p>
            Signed in as {authState?.name || authState?.phoneNumber}. Protected checkout and
            order APIs are active.
          </p>
        </div>
        <button type="button" className="text-button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </section>
  );
}
