import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductArtwork from '../components/ProductArtwork';
import useStorefront from '../hooks/useStorefront';
import { isValidOtp, isValidPhoneNumber, normalizeOtp, normalizePhoneNumber } from '../utils/auth';
import { ROUTES } from '../utils/routes';
import '../styles/login-page.css';

function StageIndicator({ activeStage }) {
  const steps = [
    { id: 'phone', label: 'Phone' },
    { id: 'otp', label: 'OTP' },
    { id: 'register', label: 'Create account' },
  ];

  return (
    <div className="login-stage-indicator" aria-label="Login steps">
      {steps.map((step) => {
        const isActive = step.id === activeStage;
        const isComplete =
          (activeStage === 'otp' || activeStage === 'register') && step.id === 'phone'
            ? true
            : activeStage === 'register' && step.id === 'otp';

        return (
          <div
            key={step.id}
            className={`login-stage-pill ${isActive ? 'active' : ''} ${
              isComplete ? 'complete' : ''
            }`}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    authStage,
    authPhoneNumber,
    authOtpHint,
    authLoading,
    authError,
    demoExistingUser,
    demoOtp,
    isAuthenticated,
    requestOtp,
    verifyOtp,
    registerUser,
    resetAuthFlow,
  } = useStorefront();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authPhoneNumber) {
      setPhoneNumber(authPhoneNumber);
    }
  }, [authPhoneNumber]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleRequestOtp(event) {
    event.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    setPhoneNumber(normalizedPhone);

    try {
      await requestOtp(normalizedPhone);
      setOtp('');
    } catch {}
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    const normalizedValue = normalizeOtp(otp);
    setOtp(normalizedValue);

    try {
      const result = await verifyOtp(normalizedValue);

      if (result.status === 'existing') {
        navigate(ROUTES.home, { replace: true });
      }
    } catch {}
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      await registerUser({ name, email });
      navigate(ROUTES.home, { replace: true });
    } catch {}
  }

  function handleStartOver() {
    resetAuthFlow();
    setPhoneNumber('');
    setOtp('');
    setName('');
    setEmail('');
  }

  return (
    <section className="login-page">
      <div className="login-layout">
        <aside className="login-showcase panel-card">
          <p className="eyebrow">Simple account flow</p>
          <h1>Login with OTP and continue shopping without leaving the storefront.</h1>
          <p className="login-showcase-text">
            This screen uses a mocked phone login flow so we can polish the experience
            first and plug in the real backend later.
          </p>

          <div className="login-showcase-art">
            <ProductArtwork variant="sunflower" emphasis="hero" />
          </div>

          <div className="login-showcase-grid">
            <article>
              <strong>Existing user demo</strong>
              <p>{demoExistingUser.phoneNumber}</p>
            </article>
            <article>
              <strong>Demo OTP</strong>
              <p>{demoOtp}</p>
            </article>
            <article>
              <strong>New user demo</strong>
              <p>Use any other valid 10-digit number</p>
            </article>
          </div>
        </aside>

        <div className="login-panel panel-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Secure access</p>
              <h2>Continue with your phone number</h2>
            </div>
            <Link className="secondary-button compact" to={ROUTES.home}>
              Back to home
            </Link>
          </div>

          <StageIndicator activeStage={authStage} />

          {authError ? (
            <p className="form-error login-feedback" role="alert">
              {authError}
            </p>
          ) : null}

          {authStage === 'phone' ? (
            <form className="login-stage" onSubmit={handleRequestOtp}>
              <label className="field-group">
                <span>Phone number</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(normalizePhoneNumber(event.target.value))}
                  disabled={authLoading}
                />
              </label>

              <div className="info-callout">
                <p className="callout-title">Demo flow</p>
                <p>
                  Use <strong>{demoExistingUser.phoneNumber}</strong> for an existing
                  user, or any other 10-digit number to open the create-account step.
                </p>
              </div>

              <button
                type="submit"
                className="primary-button panel-button"
                disabled={authLoading || !isValidPhoneNumber(phoneNumber)}
              >
                {authLoading ? 'Requesting OTP...' : 'Request OTP'}
              </button>
            </form>
          ) : null}

          {authStage === 'otp' ? (
            <form className="login-stage" onSubmit={handleVerifyOtp}>
              <div className="state-card compact">
                OTP sent to <strong>{authPhoneNumber}</strong>. Use{' '}
                <strong>{authOtpHint || demoOtp}</strong> to continue.
              </div>

              <label className="field-group">
                <span>OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => setOtp(normalizeOtp(event.target.value))}
                  disabled={authLoading}
                />
              </label>

              <div className="login-action-row">
                <button type="button" className="text-button" onClick={handleStartOver}>
                  Use another number
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading || !isValidOtp(otp)}
                >
                  {authLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          ) : null}

          {authStage === 'register' ? (
            <form className="login-stage" onSubmit={handleRegister}>
              <div className="state-card compact success-panel">
                <p className="callout-title">Phone verified</p>
                <p>
                  We didn&apos;t find an account for <strong>{authPhoneNumber}</strong>.
                  Create one now to continue.
                </p>
              </div>

              <label className="field-group">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={authLoading}
                />
              </label>

              <label className="field-group">
                <span>Email (optional)</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={authLoading}
                />
              </label>

              <div className="login-action-row">
                <button type="button" className="text-button" onClick={handleStartOver}>
                  Start over
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading || !name.trim()}
                >
                  {authLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
