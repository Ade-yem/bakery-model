/**
 * @file Formatting utilities for currency and operational metrics.
 */

/**
 * @description Formats numeric money values safely into USD representation.
 * @param {number} amount - Amount in currency units.
 * @returns {string} Formatted currency string (e.g. "$49" or "$49.50").
 * @example
 * ```ts
 * formatCurrency(49); // "$49"
 * formatCurrency(49.5); // "$49.50"
 * ```
 */
export function formatCurrency(amount: number): string {
  if (Number.isInteger(amount)) {
    return `$${amount}`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * @description Calculates integer percentage saved when choosing annual pricing versus monthly.
 * @param {number} monthlyPrice - Base price per month on monthly cycle.
 * @param {number} annualMonthlyPrice - Price per month billed annually.
 * @returns {number} Integer percentage discount (0-100).
 */
export function calculateAnnualSavings(monthlyPrice: number, annualMonthlyPrice: number): number {
  if (monthlyPrice <= 0 || annualMonthlyPrice >= monthlyPrice) {
    return 0;
  }
  const fullYearlyCost = monthlyPrice * 12;
  const annualYearlyCost = annualMonthlyPrice * 12;
  const savings = ((fullYearlyCost - annualYearlyCost) / fullYearlyCost) * 100;
  return Math.round(savings);
}
