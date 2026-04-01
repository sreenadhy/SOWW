import { startTransition, useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProductCatalog from './components/ProductCatalog';
import AuthPanel from './components/AuthPanel';
import CheckoutPanel from './components/CheckoutPanel';
import Footer from './components/Footer';
import { createOrder, getProducts, requestOtp, verifyOtp } from './services/api';
import './styles/app.css';

const AUTH_STORAGE_KEY = 'sritha-oils-auth';

const defaultShippingForm = {
  fullName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [cart, setCart] = useState({});

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpState, setOtpState] = useState({
    loading: false,
    error: '',
    requested: false,
    expiresAt: '',
    devOtp: '',
  });
  const [authState, setAuthState] = useState(() => readStoredAuth());

  const [shippingForm, setShippingForm] = useState(defaultShippingForm);
  const [orderState, setOrderState] = useState({
    loading: false,
    error: '',
    success: null,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (authState?.accessToken) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authState]);

  useEffect(() => {
    if (authState?.phoneNumber) {
      setPhoneNumber(authState.phoneNumber);
      setShippingForm((current) => ({
        ...current,
        phoneNumber: current.phoneNumber || authState.phoneNumber,
      }));
    }
  }, [authState]);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError('');

    try {
      const data = await getProducts();
      startTransition(() => {
        setProducts(Array.isArray(data) ? data : []);
        setProductsLoading(false);
      });
    } catch (error) {
      setProductsError(error.message || 'Unable to load products right now.');
      setProductsLoading(false);
    }
  }

  function updateCart(productId, nextQuantity) {
    setCart((currentCart) => {
      const nextCart = { ...currentCart };
      if (nextQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQuantity;
      }
      return nextCart;
    });
  }

  async function handleRequestOtp() {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setOtpState((current) => ({
        ...current,
        error: 'Enter a valid 10 digit phone number.',
      }));
      return;
    }

    setOtpState({
      loading: true,
      error: '',
      requested: false,
      expiresAt: '',
      devOtp: '',
    });

    try {
      const data = await requestOtp(phoneNumber);
      setOtpState({
        loading: false,
        error: '',
        requested: true,
        expiresAt: data?.expiresAt || '',
        devOtp: data?.otp || '',
      });
    } catch (error) {
      setOtpState({
        loading: false,
        error: error.message || 'Unable to request OTP.',
        requested: false,
        expiresAt: '',
        devOtp: '',
      });
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim()) {
      setOtpState((current) => ({
        ...current,
        error: 'Enter the OTP you received to continue.',
      }));
      return;
    }

    setOtpState((current) => ({
      ...current,
      loading: true,
      error: '',
    }));

    try {
      const data = await verifyOtp(phoneNumber, otpCode.trim());
      startTransition(() => {
        setAuthState(data);
        setOtpState((current) => ({
          ...current,
          loading: false,
          error: '',
        }));
      });
    } catch (error) {
      setOtpState((current) => ({
        ...current,
        loading: false,
        error: error.message || 'OTP verification failed.',
      }));
    }
  }

  function handleLogout() {
    setAuthState(null);
    setOtpCode('');
    setOtpState({
      loading: false,
      error: '',
      requested: false,
      expiresAt: '',
      devOtp: '',
    });
  }

  function handleShippingChange(event) {
    const { name, value } = event.target;
    setShippingForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handlePlaceOrder() {
    if (!authState?.accessToken) {
      setOrderState({
        loading: false,
        error: 'Verify your phone number before placing an order.',
        success: null,
      });
      return;
    }

    if (cartItems.length === 0) {
      setOrderState({
        loading: false,
        error: 'Add at least one product to the cart.',
        success: null,
      });
      return;
    }

    setOrderState({
      loading: true,
      error: '',
      success: null,
    });

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shipping: shippingForm,
      };

      const data = await createOrder(payload, authState.accessToken);
      setOrderState({
        loading: false,
        error: '',
        success: data,
      });
      setCart({});
      await loadProducts();
    } catch (error) {
      setOrderState({
        loading: false,
        error: error.message || 'Unable to place order.',
        success: null,
      });
    }
  }

  const cartItems = products
    .filter((product) => cart[product.id] > 0)
    .map((product) => ({
      ...product,
      quantity: cart[product.id],
      lineTotal: product.price * cart[product.id],
    }));

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);
  const estimatedShipping = cartItems.length === 0 || subtotal >= 1000 ? 0 : 60;
  const estimatedTotal = subtotal + estimatedShipping;

  return (
    <div className="app-shell">
      <Header cartCount={cartCount} isAuthenticated={Boolean(authState?.accessToken)} />

      <main className="page-content">
        <HeroSection
          productCount={products.length}
          cartCount={cartCount}
          isAuthenticated={Boolean(authState?.accessToken)}
        />

        <section className="content-grid">
          <ProductCatalog
            products={products}
            isLoading={productsLoading}
            error={productsError}
            onRetry={loadProducts}
            cart={cart}
            onUpdateCart={updateCart}
            formatCurrency={formatCurrency}
          />

          <div className="side-panel-stack">
            <AuthPanel
              phoneNumber={phoneNumber}
              otpCode={otpCode}
              otpState={otpState}
              authState={authState}
              onPhoneNumberChange={setPhoneNumber}
              onOtpCodeChange={setOtpCode}
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleVerifyOtp}
              onLogout={handleLogout}
            />

            <CheckoutPanel
              cartItems={cartItems}
              shippingForm={shippingForm}
              onShippingChange={handleShippingChange}
              onPlaceOrder={handlePlaceOrder}
              orderState={orderState}
              isAuthenticated={Boolean(authState?.accessToken)}
              formatCurrency={formatCurrency}
              subtotal={subtotal}
              shippingFee={estimatedShipping}
              total={estimatedTotal}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
