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

export function fetchOrders(token) {
  return request('/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchOrderTracking(orderId, token) {
  return request(`/api/orders/${orderId}/tracking`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateOrderStatus(orderId, payload, token) {
  return request(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
