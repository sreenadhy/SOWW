function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8080`;
  }

  return 'http://localhost:8080';
}

function tryParseJson(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function request(endpoint, options = {}) {
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

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
