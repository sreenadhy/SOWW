import { useEffect, useState } from 'react';
import '../styles/organic-info-modal.css';

function FeatureList({ items }) {
  return (
    <ul className="organic-modal-list">
      {items.map((item) => (
        <li key={item}>
          <span className="organic-modal-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" />
              <path d="M6.5 10.3 8.9 12.7 13.5 7.9" />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OrganicInfoModal({ isOpen, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
    }

    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.({ dontShowAgain });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dontShowAgain, isOpen, onClose]);

  function handleClose() {
    onClose?.({ dontShowAgain });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="organic-modal-backdrop" onClick={handleClose}>
      <div
        className="organic-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="organic-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="organic-modal-close"
          aria-label="Close organic oil information popup"
          onClick={handleClose}
        >
          <span aria-hidden="true">x</span>
        </button>

        <div className="organic-modal-header">
          <p className="eyebrow">Product education</p>
          <h2 id="organic-modal-title">Why Choose Organic Oils?</h2>
          <p>
            A quick guide to help shoppers understand how organic oils differ from
            heavily processed alternatives.
          </p>
        </div>

        <div className="organic-modal-grid">
          <section className="organic-modal-card">
            <h3>What is Organic Oil?</h3>
            <FeatureList
              items={[
                'Naturally extracted oils',
                'No chemicals or refining processes',
              ]}
            />
          </section>

          <section className="organic-modal-card">
            <h3>Benefits of Organic Oils</h3>
            <FeatureList
              items={[
                'Retains nutrients',
                'Better for health',
                'No harmful chemicals',
                'Rich aroma and taste',
              ]}
            />
          </section>

          <section className="organic-modal-card organic-modal-compare">
            <h3>Organic vs Refined Oils</h3>
            <div className="organic-modal-compare-grid">
              <article>
                <span className="organic-modal-pill organic">Organic</span>
                <p>Cold-pressed, chemical-free, and closer to nature.</p>
              </article>
              <article>
                <span className="organic-modal-pill refined">Refined</span>
                <p>Processed, chemical-treated, and more likely to lose nutrients.</p>
              </article>
            </div>
          </section>
        </div>

        <div className="organic-modal-footer">
          <label className="organic-modal-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
            />
            <span>Don&apos;t show again</span>
          </label>

          <button type="button" className="primary-button" onClick={handleClose}>
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}
