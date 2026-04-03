import { Navigate, Route, Routes } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import ProductListingPage from './pages/ProductListingPage';
import { ROUTES } from './utils/routes';

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<ProductListingPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.cart} element={<CartPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to={ROUTES.home} />} />
    </Routes>
  );
}
