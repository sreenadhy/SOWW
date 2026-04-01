const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const rawBody = await response.text();
  const data = rawBody ? tryParseJson(rawBody) : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (rawBody && typeof data === 'string' ? data : null) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

function tryParseJson(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

export function getProducts() {
  return request('/api/products');
}

export function requestOtp(phoneNumber) {
  return request('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export function verifyOtp(phoneNumber, otp) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
  });
}

export function createOrder(payload, token) {
  return request('/api/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export { API_BASE_URL };
