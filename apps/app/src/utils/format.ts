/**
 * @file Formatting utilities for application user interface and privacy display.
 */

/**
 * @description Obfuscates/masks an email address for privacy display (e.g. "g***20@gmail.com").
 * Preserves the first character, adds asterisks, preserves the last two characters of the local part,
 * and maintains the domain name intact.
 * @param {string} email - Raw email address to mask.
 * @returns {string} Obfuscated email address suitable for display in UI notifications.
 * @example
 * ```ts
 * maskEmail('gbenlekamolideen2020@gmail.com'); // "g***20@gmail.com"
 * maskEmail('john.doe@example.com'); // "j***oe@example.com"
 * ```
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }

  const atIndex = email.indexOf('@');
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length === 1) {
    return `${localPart}***@${domain}`;
  }

  if (localPart.length === 2) {
    return `${localPart[0]}***${localPart[1]}@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChars = localPart.slice(-2);
  return `${firstChar}***${lastChars}@${domain}`;
}
