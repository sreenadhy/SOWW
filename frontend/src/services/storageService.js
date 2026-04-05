const STORAGE_KEYS = {
  session: 'sritha-oils-auth',
  cart: 'sritha-oils-cart',
  shipping: 'sritha-oils-shipping',
  payment: 'sritha-oils-payment',
  lastOrder: 'sritha-oils-last-order',
};

function readStoredJson(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredJson(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  if (value === null || value === undefined) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadSession() {
  return readStoredJson(STORAGE_KEYS.session, null);
}

export function saveSession(session) {
  writeStoredJson(STORAGE_KEYS.session, session);
}

export function loadCart() {
  return readStoredJson(STORAGE_KEYS.cart, {});
}

export function saveCart(cart) {
  writeStoredJson(STORAGE_KEYS.cart, cart);
}

export function loadShipping() {
  return readStoredJson(STORAGE_KEYS.shipping, null);
}

export function saveShipping(shipping) {
  writeStoredJson(STORAGE_KEYS.shipping, shipping);
}

export function loadPaymentMethod() {
  return readStoredJson(STORAGE_KEYS.payment, null);
}

export function savePaymentMethod(paymentMethod) {
  writeStoredJson(STORAGE_KEYS.payment, paymentMethod);
}

export function loadLastOrder() {
  return readStoredJson(STORAGE_KEYS.lastOrder, null);
}

export function saveLastOrder(order) {
  writeStoredJson(STORAGE_KEYS.lastOrder, order);
}
