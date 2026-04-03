function normalizeBranding(text = '') {
  return String(text).replace(/essentional oil/gi, 'Organic Oil');
}

export function getOrganicProductContent(product) {
  const productName = normalizeBranding(product?.name || '');
  const normalizedName = productName.toLowerCase();

  if (normalizedName.includes('coconut')) {
    return {
      displayName: productName,
      category: 'Organic Oil Collection',
      description:
        'Cold-pressed coconut oil that keeps its natural aroma, gentle nutrients, and smooth finish for everyday cooking.',
      extractionLabel: 'Cold-pressed',
      benefitLabel: 'Naturally aromatic',
    };
  }

  if (normalizedName.includes('groundnut') || normalizedName.includes('peanut')) {
    return {
      displayName: productName,
      category: 'Organic Oil Collection',
      description:
        'Cold-pressed groundnut oil, rich in natural nutrients and ideal for healthier sauteing, frying, and daily meals.',
      extractionLabel: 'Cold-pressed',
      benefitLabel: 'Heart-friendly cooking',
    };
  }

  if (normalizedName.includes('sesame') || normalizedName.includes('gingelly')) {
    return {
      displayName: productName,
      category: 'Organic Oil Collection',
      description:
        'Cold-pressed sesame oil with a rich aroma, natural antioxidants, and balanced taste for traditional home cooking.',
      extractionLabel: 'Cold-pressed',
      benefitLabel: 'Rich aroma and taste',
    };
  }

  if (normalizedName.includes('sunflower')) {
    return {
      displayName: productName,
      category: 'Organic Oil Collection',
      description:
        'Light sunflower oil with a clean finish, made for everyday family cooking and a smooth, easy-to-use texture.',
      extractionLabel: 'Carefully refined',
      benefitLabel: 'Light everyday use',
    };
  }

  if (normalizedName.includes('mustard')) {
    return {
      displayName: productName,
      category: 'Organic Oil Collection',
      description:
        'Cold-pressed mustard oil with bold flavor, natural warmth, and nutrient-rich depth for regional recipes and marinades.',
      extractionLabel: 'Cold-pressed',
      benefitLabel: 'Bold traditional flavor',
    };
  }

  return {
    displayName: productName,
    category: 'Organic Oil Collection',
    description: normalizeBranding(product?.description || ''),
    extractionLabel: 'Traditionally processed',
    benefitLabel: 'Daily wellness',
  };
}

export function normalizeProductText(text = '') {
  return normalizeBranding(text);
}
