import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_MOCK_USERS,
  DEMO_OTP,
  registerMockUser,
  requestMockOtp,
  verifyMockOtp,
} from '../services/mockAuthService';
import { fetchProducts } from '../services/productService';
import {
  loadCart,
  loadRegisteredUsers,
  loadSession,
  saveCart,
  saveRegisteredUsers,
  saveSession,
} from '../services/storageService';
import { normalizePhoneNumber } from '../utils/auth';
import { formatCurrency } from '../utils/storefront';

const StorefrontContext = createContext(null);

function normalizeStoredSession(storedSession) {
  if (!storedSession) {
    return null;
  }

  if (storedSession.user?.phoneNumber) {
    return storedSession;
  }

  if (!storedSession.phoneNumber) {
    return null;
  }

  const normalizedPhone = normalizePhoneNumber(storedSession.phoneNumber);

  if (!normalizedPhone) {
    return null;
  }

  return {
    token: storedSession.accessToken || `legacy-session-${normalizedPhone}`,
    verifiedAt: storedSession.verifiedAt || new Date().toISOString(),
    user: {
      id: storedSession.userId || `legacy-user-${normalizedPhone}`,
      name: storedSession.name || normalizedPhone,
      email: storedSession.email || '',
      phoneNumber: normalizedPhone,
    },
  };
}

export function StorefrontProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState(() => loadCart());
  const [session, setSession] = useState(() => normalizeStoredSession(loadSession()));
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const storedUsers = loadRegisteredUsers(DEFAULT_MOCK_USERS);
    return Array.isArray(storedUsers) && storedUsers.length > 0
      ? storedUsers
      : DEFAULT_MOCK_USERS;
  });
  const [authStage, setAuthStage] = useState('phone');
  const [authPhoneNumber, setAuthPhoneNumber] = useState('');
  const [authOtpHint, setAuthOtpHint] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authOtpVerified, setAuthOtpVerified] = useState(false);

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
    saveRegisteredUsers(registeredUsers);
  }, [registeredUsers]);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError('');

    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setProductsLoading(false);
    } catch (error) {
      setProductsError(error.message || 'Unable to load products right now.');
      setProductsLoading(false);
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

  function resetAuthFlow() {
    setAuthStage('phone');
    setAuthPhoneNumber('');
    setAuthOtpHint('');
    setAuthLoading(false);
    setAuthError('');
    setAuthOtpVerified(false);
  }

  async function requestOtp(phoneNumber) {
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await requestMockOtp(phoneNumber);
      setAuthPhoneNumber(response.phoneNumber);
      setAuthOtpHint(response.otpHint);
      setAuthStage('otp');
      setAuthOtpVerified(false);
      return {
        status: 'otp-requested',
        phoneNumber: response.phoneNumber,
      };
    } catch (error) {
      setAuthError(error.message || 'Unable to request OTP right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyOtp(otp) {
    setAuthLoading(true);
    setAuthError('');

    try {
      const verification = await verifyMockOtp(authPhoneNumber, otp);
      const existingUser = registeredUsers.find(
        (registeredUser) => registeredUser.phoneNumber === verification.phoneNumber,
      );

      setAuthOtpVerified(true);

      if (existingUser) {
        setSession({
          token: verification.token,
          verifiedAt: verification.verifiedAt,
          user: existingUser,
        });
        resetAuthFlow();
        return {
          status: 'existing',
          user: existingUser,
        };
      }

      setAuthStage('register');
      return {
        status: 'new',
        phoneNumber: verification.phoneNumber,
      };
    } catch (error) {
      setAuthError(error.message || 'Unable to verify OTP right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function registerUser({ name, email }) {
    setAuthLoading(true);
    setAuthError('');

    try {
      if (!authOtpVerified || !authPhoneNumber) {
        throw new Error('Verify OTP before creating the account.');
      }

      const nextUser = await registerMockUser({
        phoneNumber: authPhoneNumber,
        name,
        email,
      });

      const nextUsers = [
        nextUser,
        ...registeredUsers.filter(
          (registeredUser) => registeredUser.phoneNumber !== nextUser.phoneNumber,
        ),
      ];

      setRegisteredUsers(nextUsers);
      setSession({
        token: `mock-token-${nextUser.phoneNumber}-${Date.now()}`,
        verifiedAt: new Date().toISOString(),
        user: nextUser,
      });
      resetAuthFlow();
      return {
        status: 'registered',
        user: nextUser,
      };
    } catch (error) {
      setAuthError(error.message || 'Unable to create the account right now.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    setSession(null);
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
  const totalAmount = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const currentUser = session?.user || null;
  const isAuthenticated = Boolean(currentUser?.phoneNumber);
  const otpVerified = Boolean(session?.verifiedAt) || authOtpVerified;

  const value = {
    products,
    productsLoading,
    productsError,
    cart,
    cartItems,
    cartCount,
    totalAmount,
    formatCurrency,
    currentUser,
    isAuthenticated,
    session,
    authStage,
    authPhoneNumber,
    authOtpHint,
    authLoading,
    authError,
    otpVerified,
    demoOtp: DEMO_OTP,
    demoExistingUser: registeredUsers[0] || DEFAULT_MOCK_USERS[0],
    loadProducts,
    updateCart,
    removeFromCart,
    requestOtp,
    verifyOtp,
    registerUser,
    resetAuthFlow,
    logout,
  };

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }

  return context;
}
