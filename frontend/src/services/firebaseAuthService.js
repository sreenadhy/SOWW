import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth';
import { ensureFirebaseAuth } from './firebaseApp';

const COUNTRY_CODE = '+91';

let recaptchaVerifier = null;
let confirmationResult = null;

function formatPhoneNumber(phoneNumber) {
  return `${COUNTRY_CODE}${phoneNumber}`;
}

export function mapFirebaseAuthError(error) {
  switch (error?.code) {
    case 'auth/invalid-phone-number':
      return 'Enter a valid 10-digit mobile number';
    case 'auth/missing-phone-number':
      return 'Enter a valid 10-digit mobile number';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'OTP expired. Please resend';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/captcha-check-failed':
      return 'Unable to verify reCAPTCHA. Please try again.';
    case 'auth/quota-exceeded':
      return 'OTP quota exceeded. Please try again later.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

async function getOrCreateRecaptchaVerifier(containerId) {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  const auth = await ensureFirebaseAuth();
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

export async function sendPhoneOtp(phoneNumber, containerId) {
  try {
    const auth = await ensureFirebaseAuth();
    const verifier = await getOrCreateRecaptchaVerifier(containerId);
    confirmationResult = await signInWithPhoneNumber(
      auth,
      formatPhoneNumber(phoneNumber),
      verifier,
    );

    return {
      phoneNumber,
      sentAt: Date.now(),
    };
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function verifyPhoneOtp(otp) {
  if (!confirmationResult) {
    throw new Error('Request OTP before verification');
  }

  try {
    const result = await confirmationResult.confirm(otp);
    confirmationResult = null;
    return result.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function logoutFirebaseUser() {
  const auth = await ensureFirebaseAuth();
  confirmationResult = null;
  await signOut(auth);
}

export async function getCurrentFirebaseUser() {
  const auth = await ensureFirebaseAuth();
  return auth.currentUser;
}

export async function subscribeToFirebaseAuthChanges(callback) {
  const auth = await ensureFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export function clearRecaptchaVerifier() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}
