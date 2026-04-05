import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';
import { isShippingFormComplete } from '../utils/storefront';

export default function ProtectedRoute({ requireShipping = false }) {
  const location = useLocation();
  const { isAuthenticated, sessionReady, shippingForm } = useStorefront();

  if (!sessionReady) {
    return <div className="state-card">Restoring your session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to={ROUTES.login}
        state={{ authRequired: true, from: location.pathname }}
      />
    );
  }

  if (requireShipping && !isShippingFormComplete(shippingForm)) {
    return (
      <Navigate
        replace
        to={ROUTES.checkout}
        state={{ shippingRequired: true, from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
