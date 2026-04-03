import { request } from './http';

export function submitOrder(payload, token) {
  return request('/api/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
