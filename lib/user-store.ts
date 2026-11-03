/**
 * LUMENS - local JSON user store
 * ------------------------------
 * Server-only persistence layer used by NextAuth + `/api/auth/signup` until a
 * real database (Prisma / Supabase) is wired up.
 *
 * The file lives in `.data/users.json` (git-ignored, configurable through
 * `LUMENS_DATA_DIR`). Writes go through an in-process queue and are flushed
 * atomically (tmp file + rename) so two concurrent sign-ups can never truncate
 * the file. This is a development store: a serverless deployment has a
 * read-only / ephemeral filesystem, so swap `readUsers` / `writeUsers` for a
 * Prisma client before going to production.
 */

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeIranianPhone } from "./phone";

/** Roles a visitor may pick at sign-up (staff roles stay admin-managed). */
export type UserRole = "student" | "instructor";

/** Roles accepted by the sign-up API, also used for runtime validation. */
export const SIGN_UP_ROLES = ["student", "instructor"] as const satisfies readonly UserRole[];

/** Shape stored on disk (never returned to the browser as-is). */
export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  /**
   * Canonical Iranian mobile number (`09xxxxxxxxx`).
   * Optional because accounts created before phone support have none; new
   * sign-ups always store it.
   */
  phone?: string;
  /** bcrypt hash, never the plain password. */
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** User shape that is safe to send to the client. */
export type PublicUser = Omit<StoredUser, "passwordHash">;

/** Input accepted by `createUser` (the password is already hashed). */
export interface NewUserInput {
  fullName: string;
  email: string;
  /** Already normalised to `09xxxxxxxxx` by the sign-up route. */
  phone?: string;
  passwordHash: string;
  role: UserRole;
}

/** Which unique attribute collided with an existing account. */
export type DuplicateField = "email" | "phone";

/** Thrown when a sign-up tries to reuse an existing e-mail or phone number. */
export class DuplicateUserError extends Error {
  readonly field: DuplicateField;

  readonly value: string;

  constructor(field: DuplicateField, value: string) {
    super(`User with ${field} ${value} already exists`);
    this.name = "DuplicateUserError";
    this.field = field;
    this.value = value;
  }
}

const dataDir = process.env.LUMENS_DATA_DIR ?? path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");

/** Serialises read-modify-write cycles inside this process. */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  // Keep the chain alive even when a task rejects.
  writeQueue = run.catch(() => undefined);
  return run;
}

/** Public helper so API routes can normalise e-mails exactly like sign-in does. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Narrowing guard used by the sign-up route to validate the posted role. */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (SIGN_UP_ROLES as readonly string[]).includes(value);
}

/** Drops the password hash before the user leaves the server. */
export function toPublicUser({ passwordHash: _passwordHash, ...rest }: StoredUser): PublicUser {
  return rest;
}

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.fullName === "string" &&
    typeof candidate.email === "string" &&
    (candidate.phone === undefined || typeof candidate.phone === "string") &&
    typeof candidate.passwordHash === "string" &&
    isUserRole(candidate.role)
  );
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    // Strip a UTF-8 BOM so hand-edited files (Notepad) still parse.
    const raw = (await fs.readFile(usersFile, "utf8")).replace(/^\uFEFF/, "");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredUser);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return [];
    }

    console.error("[user-store] failed to read users file", error);
    throw new Error("user-store-unavailable");
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });

  // Write to a temp file first so a crash never leaves a half-written JSON.
  const tempFile = `${usersFile}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, usersFile);
}

/** Returns the user matching `email` (case-insensitive) or `null`. */
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email);
  const users = await readUsers();
  return users.find((user) => user.email === normalized) ?? null;
}

/**
 * Returns the user matching an Iranian mobile number or `null`.
 * Accepts any supported representation (`0912…`, `+98912…`, Persian digits).
 */
export async function findUserByPhone(phone: string): Promise<StoredUser | null> {
  const normalized = normalizeIranianPhone(phone);
  if (!normalized) {
    return null;
  }

  const users = await readUsers();
  return users.find((user) => user.phone === normalized) ?? null;
}

/** Returns the user matching `id` or `null`. */
export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

/**
 * Persists a new user. Throws `DuplicateUserError` when the e-mail is taken so
 * the route handler can answer with a 409 instead of overwriting an account.
 */
export function createUser(input: NewUserInput): Promise<StoredUser> {
  return enqueue(async () => {
    const users = await readUsers();
    const email = normalizeEmail(input.email);
    const phone = input.phone ? normalizeIranianPhone(input.phone) ?? undefined : undefined;

    if (users.some((user) => user.email === email)) {
      throw new DuplicateUserError("email", email);
    }

    if (phone && users.some((user) => user.phone === phone)) {
      throw new DuplicateUserError("phone", phone);
    }

    const now = new Date().toISOString();
    const user: StoredUser = {
      id: randomUUID(),
      fullName: input.fullName,
      email,
      ...(phone ? { phone } : {}),
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };

    users.push(user);
    await writeUsers(users);

    return user;
  });
}
