import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import organicOilsPoster from '../assets/organic-oils-poster.svg';
import { ROUTES } from '../utils/routes';
import '../styles/splash-page.css';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate(ROUTES.products, { replace: true });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <main
      className="splash-shell"
      style={{
        '--splash-image': `url(${organicOilsPoster})`,
      }}
    >
      <div className="splash-panel">
        <div className="splash-mark">SO</div>
        <p className="eyebrow">Launching Storefront</p>
        <h1>Sritha Oils</h1>
        <p>Preparing the catalog, cart, checkout, and payment flow for your next order.</p>
        <div className="splash-loader" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
