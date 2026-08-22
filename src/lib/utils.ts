/**
 * Utility functions for Indonesian locale formatting
 */

/**
 * Format a number to Indonesian thousand separator (e.g. 1547 -> "1.547")
 */
export function formatNumberID(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format a decimal number with Indonesian comma separator (e.g. 1.16 -> "1,16%")
 */
export function formatPercentID(num: number, decimals: number = 2): string {
  if (isNaN(num) || num === null || num === undefined || !isFinite(num)) return '0%';
  return (
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num) + '%'
  );
}

/**
 * Format average decimal with Indonesian comma (e.g. 15.4 -> "15,4")
 */
export function formatDecimalID(num: number, decimals: number = 1): string {
  if (isNaN(num) || num === null || num === undefined || !isFinite(num)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}
