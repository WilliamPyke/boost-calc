export const formatNumber = (num: number | string): string => {
  if (num === '' || num === undefined || num === null) return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '';
  
  // Format with commas and up to 2 decimal places if needed
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatCompact = (num: number | string): string => {
  if (num === '' || num === undefined || num === null) return '';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '';
  
  const absNum = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  
  if (absNum >= 1_000_000_000) {
    const val = absNum / 1_000_000_000;
    return sign + (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '')) + 'B';
  }
  if (absNum >= 1_000_000) {
    const val = absNum / 1_000_000;
    return sign + (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '')) + 'M';
  }
  if (absNum >= 1_000) {
    const val = absNum / 1_000;
    return sign + (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '')) + 'K';
  }
  
  return formatNumber(n);
};

export const parseCompact = (str: string): number => {
  if (!str) return 0;
  const cleanStr = str.replace(/,/g, '').trim().toUpperCase();
  
  const match = cleanStr.match(/^(-?\d+\.?\d*)(B|M|K)?$/);
  if (!match) return parseNumber(str);
  
  const value = parseFloat(match[1]);
  const suffix = match[2];
  
  if (isNaN(value)) return 0;
  
  switch (suffix) {
    case 'B': return value * 1_000_000_000;
    case 'M': return value * 1_000_000;
    case 'K': return value * 1_000;
    default: return value;
  }
};

export const parseNumber = (str: string): number => {
  // Remove commas and convert to float
  const cleanStr = str.replace(/,/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

// Helper to constrain boost between 1 and 5
export const clampBoost = (val: number) => Math.min(5, Math.max(1, val));