import { NavLink } from 'react-router-dom';
import useStorefront from '../hooks/useStorefront';
import { ROUTES } from '../utils/routes';

const steps = [
  { label: 'Products', path: ROUTES.products },
  { label: 'Cart', path: ROUTES.cart },
  { label: 'Checkout', path: ROUTES.checkout },
  { label: 'Payment', path: ROUTES.payment },
  { label: 'Confirmation', path: ROUTES.confirmation },
];

export default function FlowSteps() {
  const { lastOrder } = useStorefront();

  return (
    <nav className="flow-steps" aria-label="Order flow">
      {steps.map((step) => {
        if (step.path === ROUTES.confirmation && !lastOrder) {
          return (
            <span className="flow-step disabled" key={step.path}>
              {step.label}
            </span>
          );
        }

        return (
          <NavLink
            key={step.path}
            className={({ isActive }) => `flow-step${isActive ? ' active' : ''}`}
            to={step.path}
          >
            {step.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
