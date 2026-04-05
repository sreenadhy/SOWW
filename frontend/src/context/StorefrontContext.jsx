import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { requestOtpCode, registerAccount, verifyOtpCode } from '../services/authService';
import { fetchAddresses, updateAddress } from '../services/addressService';
import { fetchOrders, submitOrder } from '../services/orderService';
import { fetchProducts } from '../services/productService';
import { fetchProfile, updateProfile } from '../services/profileService';
import {
  loadCart,
  loadLastOrder,
  loadPaymentMethod,
  loadSession,
  loadShipping,
  saveCart,
  saveLastOrder,
  savePaymentMethod,
  saveSession,
  saveShipping,
} from '../services/storageService';
import {
  isSessionExpired,
  isValidOtp,
  isValidPhoneNumber,
  normalizeAuthSession,
  normalizeOtp,
  normalizePhoneNumber,
} from '../utils/auth';
import {
  DEFAULT_PAYMENT_METHOD,
  DEFAULT_SHIPPING_FORM,
  formatCurrency,
  validateShippingForm,
} from '../utils/storefront';
import coconutImg from '../assets/Cco.png';
import sunflowerImg from '../assets/Sunflower.png';
import sesameImg from '../assets/Sunfloer.png';
import mustardImg from '../assets/Mustered.png';
import castorImg from '../assets/Castor_Oil.png';
import groundnutImg from '../assets/grounndnut.png';

const StorefrontContext = createContext(null);

function normalizeStoredSession(storedSession) {
  if (!storedSession) {
    return null;
  }

  if (storedSession.user?.phoneNumber) {
    return storedSession;
  }

  const normalized = normalizeAuthSession(storedSession);

  if (!normalized?.accessToken) {
    return null;
  }

  return {
    accessToken: normalized.accessToken,
    tokenType: normalized.tokenType,
    expiresAt: normalized.expiresAt,
    verifiedAt: normalized.verifiedAt,
    user: {
      id: normalized.userId,
      name: normalized.name || '',
      email: normalized.email || '',
      phoneNumber: normalized.phoneNumber || '',
    },
  };
}

function mergeShippingLine(addressLine1, addressLine2) {
  return [addressLine1, addressLine2].map((value) => value?.trim()).filter(Boolean).join(', ');
}

function mapAddressToShippingForm(address) {
  const fullAddress = address?.fullAddress || '';
  const [line1, ...rest] = fullAddress.split(',');

  return {
    fullName: '',
    phoneNumber: '',
    addressLine1: line1?.trim() || fullAddress,
    addressLine2: rest.join(',').trim(),
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.pincode || '',
  };
}

export function StorefrontProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState(() => loadCart());
  const [session, setSession] = useState(() => normalizeStoredSession(loadSession()));
  const [sessionReady, setSessionReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [authStage, setAuthStage] = useState('phone');
  const [authPhoneNumber, setAuthPhoneNumber] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authDevOtp, setAuthDevOtp] = useState('');
  const [authCooldownEndsAt, setAuthCooldownEndsAt] = useState(0);
  const [authOtpVerified, setAuthOtpVerified] = useState(false);
  const [shippingForm, setShippingForm] = useState(() => ({
    ...DEFAULT_SHIPPING_FORM,
    ...(loadShipping() || {}),
  }));
  const [paymentMethod, setPaymentMethodState] = useState(
    () => loadPaymentMethod() || DEFAULT_PAYMENT_METHOD,
  );
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [orderState, setOrderState] = useState({ loading: false, error: '' });
  const [lastOrder, setLastOrder] = useState(() => loadLastOrder());

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    saveShipping(shippingForm);
  }, [shippingForm]);

  useEffect(() => {
    savePaymentMethod(paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    saveLastOrder(lastOrder);
  }, [lastOrder]);

  useEffect(() => {
    if (session && !isSessionExpired(session)) {
      setSessionReady(true);
      return;
    }

    setSession(null);
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!session?.accessToken) {
      setProfile(null);
      setAddresses([]);
      setOrders([]);
      return;
    }

    refreshAccountData();
  }, [session?.accessToken]);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError('');

    try {
      const data = await fetchProducts();
      const productsWithImages = (Array.isArray(data) ? data : []).map((product) => {
        const name = product.name.toLowerCase();
        let image = '';
        if (name.includes('coconut')) image = coconutImg;
        else if (name.includes('sunflower')) image = sunflowerImg;
        else if (name.includes('sesame')) image = sesameImg;
        else if (name.includes('mustard')) image = mustardImg;
        else if (name.includes('castor')) image = castorImg;
        else if (name.includes('groundnut')) image = groundnutImg;
        return { ...product, image };
      });
      setProducts(productsWithImages);
    } catch (error) {
      setProductsError(error.message || 'Unable to load products right now.');
    } finally {
      setProductsLoading(false);
    }
  }

  async function refreshAccountData() {
    if (!session?.accessToken) {
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      const [profileResponse, ordersResponse, addressesResponse] = await Promise.all([
        fetchProfile(session.accessToken),
        fetchOrders(session.accessToken),
        fetchAddresses(session.accessToken),
      ]);

      setProfile(profileResponse?.user || null);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setAddresses(Array.isArray(addressesResponse) ? addressesResponse : []);

      if (profileResponse?.user) {
        setSession((currentSession) =>
          currentSession
            ? {
                ...currentSession,
                user: {
                  ...currentSession.user,
                  id: profileResponse.user.id,
                  name: profileResponse.user.name,
                  email: profileResponse.user.email,
                  phoneNumber: profileResponse.user.phone,
                },
              }
            : currentSession,
        );
      }

      const defaultAddress =
        (Array.isArray(addressesResponse) ? addressesResponse : []).find((address) => address.isDefault) ||
        (Array.isArray(addressesResponse) ? addressesResponse[0] : null);

      if (defaultAddress) {
        setSelectedAddressId((current) => current ?? defaultAddress.id);
        setUseSavedAddress(true);
        setShippingForm((currentForm) => ({
          ...currentForm,
          ...mapAddressToShippingForm(defaultAddress),
          fullName: profileResponse?.user?.name || currentForm.fullName,
          phoneNumber: profileResponse?.user?.phone || currentForm.phoneNumber,
        }));
      } else if (profileResponse?.user) {
        setShippingForm((currentForm) => ({
          ...currentForm,
          fullName: currentForm.fullName || profileResponse.user.name || '',
          phoneNumber: currentForm.phoneNumber || profileResponse.user.phone || '',
        }));
      }
    } catch (error) {
      setProfileError(error.message || 'Unable to load your profile right now.');
    } finally {
      setProfileLoading(false);
    }
  }

  function updateCart(productId, nextQuantity, maxStock) {
    setCart((currentCart) => {
      const safeQuantity = Math.max(0, Math.min(nextQuantity, maxStock));
      const nextCart = { ...currentCart };

      if (safeQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = safeQuantity;
      }

      return nextCart;
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) => {
      const nextCart = { ...currentCart };
      delete nextCart[productId];
      return nextCart;
    });
  }

  function updateShippingValue(field, value) {
    setUseSavedAddress(false);
    setSelectedAddressId(null);
    setShippingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function selectAddress(addressId) {
    const selectedAddress = addresses.find((address) => address.id === addressId);

    if (!selectedAddress) {
      return;
    }

    setSelectedAddressId(addressId);
    setUseSavedAddress(true);
    setShippingForm((currentForm) => ({
      ...currentForm,
      ...mapAddressToShippingForm(selectedAddress),
      fullName: currentForm.fullName || currentUser?.name || '',
      phoneNumber: currentUser?.phoneNumber || currentForm.phoneNumber,
    }));
  }

  function startNewAddress() {
    setUseSavedAddress(false);
    setSelectedAddressId(null);
    setShippingForm((currentForm) => ({
      ...DEFAULT_SHIPPING_FORM,
      fullName: currentUser?.name || currentForm.fullName,
      phoneNumber: currentUser?.phoneNumber || currentForm.phoneNumber,
    }));
  }

  function setPaymentMethod(method) {
    setPaymentMethodState(method);
  }

  function resetAuthFlow() {
    setAuthStage('phone');
    setAuthPhoneNumber('');
    setAuthLoading(false);
    setAuthError('');
    setAuthMessage('');
    setAuthDevOtp('');
    setAuthCooldownEndsAt(0);
    setAuthOtpVerified(false);
  }

  async function requestOtp(phoneNumber) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!isValidPhoneNumber(normalizedPhone)) {
      const message = 'Enter a valid 10-digit mobile number';
      setAuthError(message);
      throw new Error(message);
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const response = await requestOtpCode(normalizedPhone);
      setAuthPhoneNumber(normalizedPhone);
      setAuthStage('otp');
      setAuthDevOtp(response?.otp || '');
      setAuthCooldownEndsAt(Date.now() + 30 * 1000);
      setAuthMessage(response?.message || 'OTP sent successfully.');
      return response;
    } catch (error) {
      setAuthError(error.message || 'Unable to request OTP right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function resendOtp() {
    if (Date.now() < authCooldownEndsAt) {
      return null;
    }

    return requestOtp(authPhoneNumber);
  }

  async function verifyOtp(otp) {
    const normalizedValue = normalizeOtp(otp);

    if (!isValidOtp(normalizedValue)) {
      const message = 'OTP must be 6 digits';
      setAuthError(message);
      throw new Error(message);
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    setAuthDevOtp('');

    try {
      const response = await verifyOtpCode(authPhoneNumber, normalizedValue);

      if (!response?.registered) {
        setAuthOtpVerified(true);
        setAuthStage('register');
        setAuthMessage('Phone verified. Complete your profile to continue.');
        return { status: 'new' };
      }

      const normalizedSession = normalizeAuthSession(response);
      const nextSession = {
        accessToken: normalizedSession.accessToken,
        tokenType: normalizedSession.tokenType,
        expiresAt: normalizedSession.expiresAt,
        verifiedAt: normalizedSession.verifiedAt,
        user: {
          id: normalizedSession.userId,
          name: normalizedSession.name,
          email: normalizedSession.email,
          phoneNumber: normalizedSession.phoneNumber,
        },
      };

      setSession(nextSession);
      resetAuthFlow();
      return { status: 'existing', user: nextSession.user };
    } catch (error) {
      setAuthError(error.message || 'Unable to verify OTP right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function registerUser({ name, email, secondaryPhoneNumber = '' }) {
    if (!authOtpVerified || !authPhoneNumber) {
      const message = 'Verify OTP before creating the account.';
      setAuthError(message);
      throw new Error(message);
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const normalizedSession = await registerAccount({
        primaryPhoneNumber: authPhoneNumber,
        secondaryPhoneNumber: normalizePhoneNumber(secondaryPhoneNumber) || null,
        name: name.trim(),
        email: email?.trim() || '',
      });

      const nextSession = {
        accessToken: normalizedSession.accessToken,
        tokenType: normalizedSession.tokenType,
        expiresAt: normalizedSession.expiresAt,
        verifiedAt: normalizedSession.verifiedAt,
        user: {
          id: normalizedSession.userId,
          name: normalizedSession.name,
          email: normalizedSession.email,
          phoneNumber: normalizedSession.phoneNumber,
        },
      };

      setSession(nextSession);
      resetAuthFlow();
      return { status: 'registered', user: nextSession.user };
    } catch (error) {
      setAuthError(error.message || 'Unable to create your account right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function updateProfileDetails(payload) {
    if (!session?.accessToken) {
      throw new Error('Login is required');
    }

    const response = await updateProfile(payload, session.accessToken);
    setProfile(response);
    setSession((currentSession) =>
      currentSession
        ? {
            ...currentSession,
            user: {
              ...currentSession.user,
              id: response.id,
              name: response.name,
              email: response.email,
              phoneNumber: response.phone,
            },
          }
        : currentSession,
    );

    return response;
  }

  async function updateSavedAddress(addressId, payload) {
    if (!session?.accessToken) {
      throw new Error('Login is required');
    }

    const updatedAddress = await updateAddress(addressId, payload, session.accessToken);
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => (address.id === addressId ? updatedAddress : address)),
    );
    return updatedAddress;
  }

  async function placeOrder() {
    if (!session?.accessToken) {
      throw new Error('Login is required');
    }

    const shippingErrors = validateShippingForm(shippingForm);
    if (!useSavedAddress && Object.keys(shippingErrors).length > 0) {
      throw new Error('Complete the address details before placing the order.');
    }

    setOrderState({ loading: true, error: '' });

    try {
      const payload = {
        addressId: useSavedAddress ? selectedAddressId : null,
        address: useSavedAddress
          ? null
          : {
              addressLine: mergeShippingLine(shippingForm.addressLine1, shippingForm.addressLine2),
              city: shippingForm.city.trim(),
              state: shippingForm.state.trim(),
              pincode: shippingForm.postalCode.trim(),
              saveAsDefault: addresses.length === 0,
            },
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'ONLINE',
        paymentDetails:
          paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : `${String(paymentMethod).toUpperCase()} selected at checkout`,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await submitOrder(payload, session.accessToken);
      const nextOrder = {
        ...response,
        orderId: response.orderNumber,
        placedAt: response.createdAt,
        shipping: {
          fullName: shippingForm.fullName,
          phoneNumber: shippingForm.phoneNumber,
          addressLine1: response.address?.fullAddress || shippingForm.addressLine1,
          addressLine2: shippingForm.addressLine2,
          city: response.address?.city || shippingForm.city,
          state: response.address?.state || shippingForm.state,
          postalCode: response.address?.pincode || shippingForm.postalCode,
        },
        items: cartItems,
        paymentMethod,
      };

      setLastOrder(nextOrder);
      setCart({});
      setOrderState({ loading: false, error: '' });
      await refreshAccountData();
      return nextOrder;
    } catch (error) {
      setOrderState({ loading: false, error: error.message || 'Unable to place order right now.' });
      throw error;
    }
  }

  function clearOrderError() {
    setOrderState((currentState) =>
      currentState.error ? { ...currentState, error: '' } : currentState,
    );
  }

  function clearLastOrder() {
    setLastOrder(null);
    saveLastOrder(null);
  }

  function logout() {
    setSession(null);
    setProfile(null);
    setAddresses([]);
    setOrders([]);
    setSelectedAddressId(null);
    setUseSavedAddress(false);
    resetAuthFlow();
  }

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => cart[product.id] > 0)
        .map((product) => ({
          ...product,
          quantity: cart[product.id],
          lineTotal: product.price * cart[product.id],
        })),
    [cart, products],
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = cartItems.length > 0 ? 60 : 0;
  const total = subtotal + shippingFee;
  const currentUser = session?.user || null;
  const isAuthenticated = Boolean(currentUser?.phoneNumber);

  const value = {
    products,
    productsLoading,
    productsError,
    cart,
    cartItems,
    cartCount,
    subtotal,
    shippingFee,
    total,
    totalAmount: total,
    formatCurrency,
    session,
    sessionReady,
    currentUser,
    isAuthenticated,
    profile,
    addresses,
    orders,
    profileLoading,
    profileError,
    authStage,
    authPhoneNumber,
    authLoading,
    authError,
    authMessage,
    authDevOtp,
    authCooldownEndsAt,
    otpVerified: authOtpVerified,
    authState: {
      accessToken: session?.accessToken || null,
      user: currentUser,
      isAuthenticated,
      phoneNumber: currentUser?.phoneNumber || '',
      name: currentUser?.name || '',
    },
    shippingForm,
    paymentMethod,
    selectedAddressId,
    useSavedAddress,
    orderState,
    lastOrder,
    loadProducts,
    refreshAccountData,
    updateCart,
    removeFromCart,
    requestOtp,
    resendOtp,
    verifyOtp,
    registerUser,
    resetAuthFlow,
    logout,
    updateProfileDetails,
    updateSavedAddress,
    updateShippingValue,
    selectAddress,
    startNewAddress,
    setPaymentMethod,
    placeOrder,
    clearOrderError,
    clearLastOrder,
    handleLogout: logout,
  };

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }

  return context;
}
