import { useEffect, useMemo, useRef, useState } from 'react';
import InlineSpinner from '../components/InlineSpinner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OtpInputField from '../components/OtpInputField';
import PhoneNumberField from '../components/PhoneNumberField';
import organicOilsPoster from '../assets/organic-oils-poster.svg';
import useStorefront from '../hooks/useStorefront';
import { isValidOtp, isValidPhoneNumber, normalizeOtp, normalizePhoneNumber } from '../utils/auth';
import { ROUTES } from '../utils/routes';
import '../styles/login-page.css';

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

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
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [registerTouched, setRegisterTouched] = useState({
    name: false,
    email: false,
  });
  const autoSubmittedOtp = useRef('');
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
  const phoneFieldError =
    phoneTouched && !isValidPhoneNumber(phoneNumber)
      ? 'Enter a valid 10-digit mobile number'
      : '';
  const otpFieldError =
    otpTouched && !isValidOtp(otp) ? 'Enter the complete 6-digit OTP' : '';
  const nameFieldError =
    registerTouched.name && !name.trim() ? 'Enter your full name' : '';
  const emailFieldError =
    registerTouched.email && !isValidEmail(email) ? 'Enter a valid email address' : '';
  const canRequestOtp = isValidPhoneNumber(phoneNumber) && !authLoading;
  const canVerifyOtp = isValidOtp(otp) && !authLoading;
  const canRegister = Boolean(name.trim()) && isValidEmail(email) && !authLoading;
  const stageSummary =
    authStage === 'otp'
      ? 'We sent a one-time password to your mobile. Enter it below to continue.'
      : authStage === 'register'
        ? 'Your number is verified. Finish your profile to unlock checkout and order tracking.'
        : 'Use your mobile number for a fast, secure sign-in experience.';

  useEffect(() => {
    if (authStage !== 'otp') {
      autoSubmittedOtp.current = '';
      setOtpTouched(false);
      return;
    }

    if (!otp) {
      autoSubmittedOtp.current = '';
    }
  }, [authStage, otp]);

  async function handleRequestOtp(event) {
    event.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    setPhoneNumber(normalizedPhone);
    setPhoneTouched(true);

    if (!isValidPhoneNumber(normalizedPhone)) {
      return;
    }

    try {
      await requestOtp(normalizedPhone);
      setOtp('');
      setOtpTouched(false);
      autoSubmittedOtp.current = '';
    } catch {}
  }

  async function handleVerifyOtpValue(nextOtp) {
    const normalizedValue = normalizeOtp(nextOtp);
    setOtp(normalizedValue);
    setOtpTouched(true);

    if (!isValidOtp(normalizedValue)) {
      return;
    }

    try {
      const result = await verifyOtp(normalizedValue);

      if (result.status === 'existing') {
        navigate(redirectPath, { replace: true });
      }
    } catch {
      autoSubmittedOtp.current = '';
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    await handleVerifyOtpValue(otp);
  }

  function handleOtpComplete(nextOtp) {
    const normalizedValue = normalizeOtp(nextOtp);

    if (!isValidOtp(normalizedValue) || authLoading || autoSubmittedOtp.current === normalizedValue) {
      return;
    }

    autoSubmittedOtp.current = normalizedValue;
    void handleVerifyOtpValue(normalizedValue);
  }

  async function handleRegister(event) {
    event.preventDefault();
    setRegisterTouched({
      name: true,
      email: true,
    });

    if (!name.trim() || !isValidEmail(email)) {
      return;
    }

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
    setPhoneTouched(false);
    setOtpTouched(false);
    setRegisterTouched({
      name: false,
      email: false,
    });
    autoSubmittedOtp.current = '';
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
          <div className="login-showcase-copy">
            <p className="eyebrow">Simple account flow</p>
            <h1 className="login-showcase-title">
              Faster sign in for your organic oil orders.
            </h1>
            <p className="login-showcase-text">
              Verify your mobile number once and move smoothly from browsing to checkout on any
              screen size.
            </p>

            <div className="login-showcase-highlights">
              <div className="login-highlight-pill">Secure OTP login</div>
              <div className="login-highlight-pill">Responsive on mobile</div>
              <div className="login-highlight-pill">Quick cart access</div>
            </div>
          </div>

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
              <h2>Login with OTP</h2>
              <p className="login-panel-subtext">{stageSummary}</p>
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
            <form className="login-stage login-stage--phone" onSubmit={handleRequestOtp}>
              <PhoneNumberField
                value={phoneNumber}
                onChange={setPhoneNumber}
                disabled={authLoading}
                error={phoneFieldError}
              />

              <div className="login-step-card">
                <span className="login-step-count">Step 1</span>
                <strong>Enter your mobile number</strong>
                <p>We’ll send a one-time password to continue securely.</p>
              </div>

              <button
                type="submit"
                className="primary-button panel-button"
                disabled={!canRequestOtp}
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
            <form className="login-stage login-stage--otp" onSubmit={handleVerifyOtp}>
              <div className="otp-stage-banner" role="status">
                <p className="otp-stage-banner-title">
                  {authMessage || 'OTP generated successfully'}
                </p>
                <p>
                  OTP sent to <strong>{authPhoneNumber}</strong>. Enter the 6-digit code.
                </p>
              </div>

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
                onChange={setOtp}
                onComplete={handleOtpComplete}
                disabled={authLoading}
                error={otpFieldError}
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
                disabled={!canVerifyOtp}
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
            <form className="login-stage login-stage--register" onSubmit={handleRegister}>
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
                  onBlur={() =>
                    setRegisterTouched((currentState) => ({ ...currentState, name: true }))
                  }
                  disabled={authLoading}
                />
                {nameFieldError ? (
                  <span className="field-message field-message-error">{nameFieldError}</span>
                ) : (
                  <span className="field-message">
                    This name will appear in your orders and profile.
                  </span>
                )}
              </label>

              <label className="field-group">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() =>
                    setRegisterTouched((currentState) => ({ ...currentState, email: true }))
                  }
                  disabled={authLoading}
                  aria-invalid={Boolean(emailFieldError)}
                />
                {emailFieldError ? (
                  <span className="field-message field-message-error">{emailFieldError}</span>
                ) : (
                  <span className="field-message">
                    We’ll use this for order updates and account support.
                  </span>
                )}
              </label>

              <div className="login-action-row">
                <button type="button" className="text-button" onClick={handleStartOver}>
                  Start over
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!canRegister}
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
