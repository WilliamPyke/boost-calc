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

export const parseNumber = (str: string): number => {
  // Remove commas and convert to float
  const cleanStr = str.replace(/,/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

// Helper to constrain boost between 1 and 5
export const clampBoost = (val: number) => Math.min(5, Math.max(1, val));