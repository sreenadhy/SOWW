import { request } from './http';

export function fetchProducts() {
  return request('/api/products');
}
