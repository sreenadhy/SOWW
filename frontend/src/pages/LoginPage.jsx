import { useEffect, useMemo, useState } from 'react';
import InlineSpinner from '../components/InlineSpinner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInputField from '../components/OtpInputField';
import PhoneNumberField from '../components/PhoneNumberField';
import organicOilsPoster from '../assets/organic-oils-poster.svg';
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
  const location = useLocation();
  const {
    authStage,
    authPhoneNumber,
    authLoading,
    authError,
    authMessage,
    authDevOtp,
    authCooldownEndsAt,
    isAuthenticated,
    requestOtp,
    resendOtp,
    verifyOtp,
    registerUser,
    resetAuthFlow,
  } = useStorefront();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [now, setNow] = useState(Date.now());
  const redirectPath = location.state?.from || ROUTES.home;

  useEffect(() => {
    if (authPhoneNumber) {
      setPhoneNumber(authPhoneNumber);
    }
  }, [authPhoneNumber]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    if (!authCooldownEndsAt || authCooldownEndsAt <= Date.now()) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authCooldownEndsAt]);

  const resendSeconds = useMemo(
    () => Math.max(0, Math.ceil((authCooldownEndsAt - now) / 1000)),
    [authCooldownEndsAt, now],
  );

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
        navigate(redirectPath, { replace: true });
      }
    } catch {}
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      await registerUser({ name, email });
      navigate(redirectPath, { replace: true });
    } catch {}
  }

  async function handleStartOver() {
    await resetAuthFlow();
    setPhoneNumber('');
    setOtp('');
    setName('');
    setEmail('');
  }

  async function handleResendOtp() {
    try {
      await resendOtp();
    } catch {}
  }

  return (
    <section className="login-page">
      <div className="login-layout">
        <aside className="login-showcase panel-card">
          <p className="eyebrow">Simple account flow</p>
          <h1 className="login-showcase-title">
            <span>Login with OTP and continue shopping</span>
          </h1>
          <p className="login-showcase-text">
            Secure mobile verification with a clean sign-in flow.
          </p>

          <div className="login-showcase-art">
            <img
              className="login-showcase-image"
              src={organicOilsPoster}
              alt="Organic oil bottles with natural ingredients"
            />
          </div>
        </aside>

        <div className="login-panel panel-card">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Secure access</p>
              <h2>Continue with your mobile number</h2>
            </div>
            <Link className="secondary-button compact" to={ROUTES.home}>
              Back to home
            </Link>
          </div>

          <StageIndicator activeStage={authStage} />

          {authMessage && authStage !== 'otp' ? (
            <p className="login-feedback login-feedback-success login-feedback-inline" role="status">
              {authMessage}
            </p>
          ) : null}

          {authError ? (
            <p className="form-error login-feedback" role="alert">
              {authError}
            </p>
          ) : null}

          {authStage === 'phone' ? (
            <form className="login-stage" onSubmit={handleRequestOtp}>
              <PhoneNumberField
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(normalizePhoneNumber(event.target.value))}
                disabled={authLoading}
              />

              <p className="login-support-text">
                Enter your 10-digit mobile number to receive an OTP by SMS.
              </p>

              <button
                type="submit"
                className="primary-button panel-button"
                disabled={authLoading || !isValidPhoneNumber(phoneNumber)}
              >
                {authLoading ? (
                  <>
                    <InlineSpinner />
                    Sending OTP...
                  </>
                ) : (
                  'Request OTP'
                )}
              </button>
            </form>
          ) : null}

          {authStage === 'otp' ? (
            <form className="login-stage" onSubmit={handleVerifyOtp}>
              <p className="login-feedback login-feedback-success login-feedback-inline login-otp-note" role="status">
                {authMessage || 'OTP generated successfully.'} OTP sent to <strong>{authPhoneNumber}</strong>. Enter the 6-digit code.
              </p>

              {authDevOtp ? (
                <div className="info-callout login-dev-otp">
                  <p className="callout-title">Development OTP</p>
                  <p>
                    SMS is not connected in this backend mode. Use <strong>{authDevOtp}</strong>{' '}
                    to continue.
                  </p>
                </div>
              ) : null}

              <OtpInputField
                value={otp}
                onChange={(event) => setOtp(normalizeOtp(event.target.value))}
                disabled={authLoading}
              />

              <div className="login-resend-row">
                <button
                  type="button"
                  className="text-button"
                  onClick={handleResendOtp}
                  disabled={authLoading || resendSeconds > 0}
                >
                  {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : 'Resend OTP'}
                </button>
                <button type="button" className="text-button" onClick={handleStartOver}>
                  Use another number
                </button>
              </div>

              <button
                type="submit"
                className="primary-button panel-button"
                disabled={authLoading || !isValidOtp(otp)}
              >
                {authLoading ? (
                  <>
                    <InlineSpinner />
                    Verifying OTP...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>
          ) : null}

          {authStage === 'register' ? (
            <form className="login-stage" onSubmit={handleRegister}>
              <div className="state-card compact success-panel">
                <p className="callout-title">Create your account</p>
                <p>
                  We verified <strong>{authPhoneNumber}</strong>. Complete your profile to
                  continue.
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
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
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
                  {authLoading ? (
                    <>
                      <InlineSpinner />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>
            </form>
          ) : null}

        </div>
      </div>
    </section>
  );
}
