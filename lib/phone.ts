/**
 * LUMENS - Iranian mobile number helpers
 * --------------------------------------
 * Pure (no Node/server dependencies) so the same rules run in the browser form
 * and in the API routes.
 *
 * Canonical storage format: `09xxxxxxxxx` (11 ASCII digits).
 * Accepted input: `0912 345 6789`, `9123456789`, `+989123456789`,
 * `00989123456789`, `989123456789` and Persian/Arabic-Indic digits.
 */

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits -> ASCII digits. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

/**
 * Normalises any supported representation of an Iranian mobile number to the
 * canonical `09xxxxxxxxx` form. Returns `null` when the input is not a valid
 * Iranian mobile number.
 */
export function normalizeIranianPhone(input: string | null | undefined): string | null {
  if (typeof input !== "string") {
    return null;
  }

  // Keep digits (and a leading "+") only, so spaces, dashes and parentheses
  // are all tolerated.
  let value = toLatinDigits(input).replace(/[^\d+]/g, "");

  if (value.startsWith("+98")) {
    value = value.slice(3);
  } else if (value.startsWith("0098")) {
    value = value.slice(4);
  } else if (value.startsWith("98") && value.length === 12) {
    value = value.slice(2);
  }

  // Drop the trunk prefix so both 0912… and 912… converge on 9xxxxxxxxx.
  if (value.startsWith("0")) {
    value = value.slice(1);
  }

  if (value.length !== 10 || !value.startsWith("9")) {
    return null;
  }

  const canonical = `0${value}`;
  return /^09\d{9}$/.test(canonical) ? canonical : null;
}

/** True when the value can be normalised to a valid Iranian mobile number. */
export function isValidIranianPhone(input: string | null | undefined): boolean {
  return normalizeIranianPhone(input) !== null;
}

/** Human friendly rendering: `09123456789` -> `0912 345 6789`. */
export function formatIranianPhone(phone: string): string {
  const canonical = normalizeIranianPhone(phone);
  if (!canonical) {
    return phone;
  }

  return `${canonical.slice(0, 4)} ${canonical.slice(4, 7)} ${canonical.slice(7)}`;
}

/** Shared validation copy so form and API messages stay identical. */
export const IRANIAN_PHONE_ERROR =
  "شماره موبایل معتبر نیست؛ باید با ۰۹ شروع شود و ۱۱ رقم باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";
