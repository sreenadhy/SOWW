import { Navigate, Route, Routes } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import ProductListingPage from './pages/ProductListingPage';
import SplashPage from './pages/SplashPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './utils/routes';

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<SplashPage />} />
      <Route element={<StorefrontLayout />}>
        <Route path={ROUTES.products} element={<ProductListingPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.cart} element={<CartPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path={ROUTES.checkout} element={<CheckoutPage />} />
          <Route path={ROUTES.payment} element={<PaymentPage />} />
          <Route path={ROUTES.confirmation} element={<OrderConfirmationPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to={ROUTES.home} />} />
    </Routes>
  );
}
