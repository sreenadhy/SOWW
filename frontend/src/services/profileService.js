import { request } from './http';

export function fetchProfile(token) {
  return request('/api/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProfile(payload, token) {
  return request('/api/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
