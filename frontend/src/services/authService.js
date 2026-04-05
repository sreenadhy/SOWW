import { request } from './http';
import { normalizeAuthSession } from '../utils/auth';

const REFRESH_ENDPOINT = import.meta.env.VITE_AUTH_REFRESH_PATH || '/api/auth/refresh';

export function requestOtpCode(phoneNumber) {
  return request('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export function verifyOtpCode(phoneNumber, otp) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
  });
}

export async function registerAccount(payload) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return normalizeAuthSession(response);
}

export async function refreshAuthSession(refreshToken) {
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await request(REFRESH_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    return normalizeAuthSession({
      ...response,
      refreshToken: response?.refreshToken || refreshToken,
    });
  } catch (error) {
    if (error.status === 404 || error.status === 405 || error.status === 501) {
      return null;
    }

    throw error;
  }
}
