import { request } from './http';

export function fetchAddresses(token) {
  return request('/api/addresses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateAddress(addressId, payload, token) {
  return request(`/api/addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
