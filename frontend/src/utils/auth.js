const REFRESH_BUFFER_MS = 2 * 60 * 1000;
export const PHONE_NUMBER_LENGTH = 10;
export const OTP_LENGTH = 6;

function decodeJwtPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(normalized);
  } catch {
    return null;
  }
}

export function getTokenExpiration(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return null;
  }

  return new Date(payload.exp * 1000).toISOString();
}

export function normalizeAuthSession(payload) {
  if (!payload?.accessToken) {
    return null;
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || null,
    tokenType: payload.tokenType || 'Bearer',
    expiresAt: payload.expiresAt || getTokenExpiration(payload.accessToken),
    userId: payload.userId ?? null,
    phoneNumber: payload.phoneNumber || '',
    verifiedAt: payload.verifiedAt || new Date().toISOString(),
  };
}

export function getSessionExpiryTime(session) {
  if (!session?.expiresAt) {
    return null;
  }

  const timestamp = new Date(session.expiresAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isSessionExpired(session) {
  const expiryTime = getSessionExpiryTime(session);

  if (!expiryTime) {
    return true;
  }

  return expiryTime <= Date.now();
}

export function getSessionRefreshDelay(session, bufferMs = REFRESH_BUFFER_MS) {
  const expiryTime = getSessionExpiryTime(session);

  if (!expiryTime || !session?.refreshToken) {
    return null;
  }

  return Math.max(expiryTime - Date.now() - bufferMs, 0);
}

export function shouldAttemptRefresh(session) {
  return Boolean(session?.refreshToken);
}

export function normalizePhoneNumber(phoneNumber = '') {
  return String(phoneNumber).replace(/\D/g, '').slice(0, PHONE_NUMBER_LENGTH);
}

export function isValidPhoneNumber(phoneNumber = '') {
  return new RegExp(`^\\d{${PHONE_NUMBER_LENGTH}}$`).test(normalizePhoneNumber(phoneNumber));
}

export function normalizeOtp(otp = '') {
  return String(otp).replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function isValidOtp(otp = '') {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(normalizeOtp(otp));
}
