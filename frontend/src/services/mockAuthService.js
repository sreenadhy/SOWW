import { isValidOtp, isValidPhoneNumber, normalizePhoneNumber } from '../utils/auth';

const AUTH_DELAY_MS = 700;

export const DEMO_OTP = '123456';
export const DEFAULT_MOCK_USERS = [
  {
    id: 'sritha-demo-user-1',
    name: 'Sritha Customer',
    email: 'customer@srithaoils.demo',
    phoneNumber: '9876543210',
    createdAt: '2026-04-02T09:00:00.000Z',
  },
];

function wait(duration = AUTH_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export async function requestMockOtp(phoneNumber) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  await wait();

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    throw new Error('Enter a valid 10-digit phone number.');
  }

  return {
    phoneNumber: normalizedPhoneNumber,
    otpHint: DEMO_OTP,
  };
}

export async function verifyMockOtp(phoneNumber, otp) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  await wait();

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    throw new Error('Enter a valid 10-digit phone number.');
  }

  if (!isValidOtp(otp)) {
    throw new Error('Enter the 6-digit OTP.');
  }

  if (String(otp).trim() !== DEMO_OTP) {
    throw new Error(`Invalid OTP. Use ${DEMO_OTP} for this demo login.`);
  }

  return {
    phoneNumber: normalizedPhoneNumber,
    token: `mock-token-${normalizedPhoneNumber}-${Date.now()}`,
    verifiedAt: new Date().toISOString(),
  };
}

export async function registerMockUser({ phoneNumber, name, email }) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  await wait();

  if (!name?.trim()) {
    throw new Error('Enter your name to create the account.');
  }

  return {
    id: `sritha-user-${Date.now()}`,
    name: name.trim(),
    email: email?.trim() || '',
    phoneNumber: normalizedPhoneNumber,
    createdAt: new Date().toISOString(),
  };
}
