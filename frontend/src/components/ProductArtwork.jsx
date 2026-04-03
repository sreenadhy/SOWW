import { useId } from 'react';
import '../styles/product-artwork.css';

const ART_THEMES = {
  default: {
    background:
      'linear-gradient(145deg, rgba(255, 244, 224, 0.95), rgba(235, 245, 237, 0.95))',
    bottle: '#c79a45',
    cap: '#254b38',
    accent: '#f6d490',
    ingredient: '#dfc6a0',
    leaf: '#70926f',
  },
  coconut: {
    background:
      'linear-gradient(145deg, rgba(255, 246, 231, 0.95), rgba(235, 245, 236, 0.95))',
    bottle: '#d3a55a',
    cap: '#2f5d47',
    accent: '#fbedd2',
    ingredient: '#fff8ec',
    leaf: '#7aa076',
  },
  groundnut: {
    background:
      'linear-gradient(145deg, rgba(251, 239, 219, 0.95), rgba(245, 232, 210, 0.95))',
    bottle: '#b67d3a',
    cap: '#5a3a23',
    accent: '#f1c285',
    ingredient: '#d7a46b',
    leaf: '#9e8454',
  },
  sesame: {
    background:
      'linear-gradient(145deg, rgba(251, 241, 225, 0.95), rgba(244, 237, 221, 0.95))',
    bottle: '#a56f3a',
    cap: '#3a3229',
    accent: '#f3ca8a',
    ingredient: '#ead4b1',
    leaf: '#8d8659',
  },
  sunflower: {
    background:
      'linear-gradient(145deg, rgba(255, 247, 210, 0.95), rgba(245, 252, 228, 0.95))',
    bottle: '#d29021',
    cap: '#416c2f',
    accent: '#f8d84e',
    ingredient: '#ffd760',
    leaf: '#78a046',
  },
  mustard: {
    background:
      'linear-gradient(145deg, rgba(255, 240, 210, 0.95), rgba(248, 233, 214, 0.95))',
    bottle: '#bf7c24',
    cap: '#4a3522',
    accent: '#efbf55',
    ingredient: '#f3d184',
    leaf: '#8c8841',
  },
};

export function getProductArtworkVariant(name = '') {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('coconut')) {
    return 'coconut';
  }

  if (normalizedName.includes('groundnut') || normalizedName.includes('peanut')) {
    return 'groundnut';
  }

  if (normalizedName.includes('sesame') || normalizedName.includes('gingelly')) {
    return 'sesame';
  }

  if (normalizedName.includes('sunflower')) {
    return 'sunflower';
  }

  if (normalizedName.includes('mustard')) {
    return 'mustard';
  }

  return 'default';
}

export default function ProductArtwork({ name = '', variant, emphasis = 'card' }) {
  const gradientId = useId().replace(/:/g, '');
  const resolvedVariant = variant || getProductArtworkVariant(name);
  const theme = ART_THEMES[resolvedVariant] || ART_THEMES.default;

  return (
    <div
      className={`product-artwork product-artwork--${emphasis}`}
      style={{
        '--art-background': theme.background,
        '--art-bottle': theme.bottle,
        '--art-cap': theme.cap,
        '--art-accent': theme.accent,
        '--art-ingredient': theme.ingredient,
        '--art-leaf': theme.leaf,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 360 240" role="presentation">
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="var(--art-accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--art-bottle)" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <circle cx="80" cy="66" r="28" fill="var(--art-ingredient)" opacity="0.95" />
        <circle cx="285" cy="178" r="34" fill="var(--art-ingredient)" opacity="0.72" />
        <ellipse cx="290" cy="58" rx="42" ry="20" fill="var(--art-accent)" opacity="0.35" />
        <path
          d="M62 178c28-46 67-72 118-76 38-3 83 17 115 55"
          fill="none"
          stroke="var(--art-leaf)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M124 42c15 15 23 32 24 52-21-7-37-20-46-40 6-6 13-10 22-12z"
          fill="var(--art-leaf)"
          opacity="0.86"
        />
        <path
          d="M262 136c25 9 41 25 50 50-23 1-42-7-58-25 0-10 3-18 8-25z"
          fill="var(--art-leaf)"
          opacity="0.8"
        />
        <rect x="146" y="38" width="68" height="164" rx="28" fill="rgba(255,255,255,0.26)" />
        <rect x="163" y="18" width="34" height="28" rx="10" fill="var(--art-cap)" />
        <rect
          x="154"
          y="46"
          width="52"
          height="144"
          rx="20"
          fill={`url(#${gradientId})`}
        />
        <rect
          x="161"
          y="83"
          width="38"
          height="48"
          rx="14"
          fill="rgba(255, 252, 245, 0.76)"
        />
        <circle cx="180" cy="107" r="10" fill="var(--art-leaf)" opacity="0.7" />
        <path
          d="M116 164c13-21 29-31 49-31-5 20-18 35-39 45-6-3-10-7-10-14z"
          fill="var(--art-accent)"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
