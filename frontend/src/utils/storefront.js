export const DEFAULT_SHIPPING_FORM = {
  fullName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

export const DEFAULT_PAYMENT_METHOD = 'upi';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function sanitizeDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function validateShippingForm(shippingForm) {
  const errors = {};

  if (!shippingForm.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!/^\d{10}$/.test(shippingForm.phoneNumber.trim())) {
    errors.phoneNumber = 'Phone number must be 10 digits.';
  }

  if (!shippingForm.addressLine1.trim()) {
    errors.addressLine1 = 'Address line 1 is required.';
  }

  if (!shippingForm.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!shippingForm.state.trim()) {
    errors.state = 'State is required.';
  }

  if (!/^\d{6}$/.test(shippingForm.postalCode.trim())) {
    errors.postalCode = 'Postal code must be 6 digits.';
  }

  return errors;
}

export function isShippingFormComplete(shippingForm) {
  return Object.keys(validateShippingForm(shippingForm)).length === 0;
}
