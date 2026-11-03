/**
 * LUMENS - password hashing helpers
 * ---------------------------------
 * Server-only wrappers around `bcryptjs`. Passwords are hashed with a per-user
 * random salt before they ever touch the users file and are compared with
 * `bcrypt.compare`, which is constant-time with respect to the hash.
 */

import bcrypt from "bcryptjs";

/** bcrypt cost factor: 10 keeps local sign-up fast while staying safe. */
export const PASSWORD_SALT_ROUNDS = 10;

/** Minimum password length enforced by both the API and the form. */
export const MIN_PASSWORD_LENGTH = 8;

/** Maximum accepted length; bcrypt silently truncates after 72 bytes. */
export const MAX_PASSWORD_LENGTH = 72;

/** Hashes a plain-text password into a bcrypt digest. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

/** Compares a plain-text password against a stored bcrypt digest. */
export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
