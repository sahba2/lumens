/**
 * LUMENS - one-time password store
 * --------------------------------
 * Backs the SMS login / account-recovery flow.
 *
 * Codes are never stored in clear: only an HMAC-SHA256 digest of
 * `phone:code` is persisted. Each phone has at most one active code with a
 * 5 minute TTL, a 60 second resend cooldown and 5 verification attempts.
 *
 * Persistence mirrors `lib/user-store.ts` (JSON file + queued atomic writes),
 * so the flow works without a database. Swap `readRecords` / `writeRecords`
 * for a Redis/Prisma implementation in production.
 */

import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { toLatinDigits } from "./phone";

export const OTP_CODE_LENGTH = 6;
export const OTP_TTL_SECONDS = 5 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

interface OtpRecord {
  phone: string;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  lastSentAt: string;
  attempts: number;
  /** Set when the code was successfully used; kept for the resend cooldown. */
  consumedAt?: string;
}

export type IssueOtpResult =
  | { ok: true; code: string; expiresInSeconds: number; resendAfterSeconds: number }
  | { ok: false; reason: "cooldown"; retryAfterSeconds: number };

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "invalid" | "too-many-attempts" };

const dataDir = process.env.LUMENS_DATA_DIR ?? path.join(process.cwd(), ".data");
const otpFile = path.join(dataDir, "otp-codes.json");

/**
 * HMAC key. A dedicated `OTP_SECRET` is preferred; falling back to
 * `NEXTAUTH_SECRET` keeps the zero-config development experience.
 */
const otpSecret =
  process.env.OTP_SECRET ?? process.env.NEXTAUTH_SECRET ?? "lumens-local-otp-secret";

/**
 * How long a used/expired record is kept on disk. It carries `lastSentAt`, so
 * the resend cooldown still applies right after a successful login.
 */
const OTP_RETENTION_MS = 60 * 60 * 1000;

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function hashCode(phone: string, code: string): string {
  return createHmac("sha256", otpSecret).update(`${phone}:${code}`).digest("hex");
}

function safeHashEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
  } catch {
    return false;
  }
}

/** Accepts Persian/Arabic digits and stray separators. */
export function normalizeOtpCode(input: string): string | null {
  const digits = toLatinDigits(input).replace(/\D/g, "");
  return /^\d{4,8}$/.test(digits) ? digits : null;
}

function isOtpRecord(value: unknown): value is OtpRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.phone === "string" &&
    typeof candidate.codeHash === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.expiresAt === "string" &&
    typeof candidate.lastSentAt === "string" &&
    typeof candidate.attempts === "number" &&
    (candidate.consumedAt === undefined || typeof candidate.consumedAt === "string")
  );
}

async function readRecords(): Promise<OtpRecord[]> {
  try {
    // Strip a UTF-8 BOM: editors and Windows tools sometimes add one.
    const raw = (await fs.readFile(otpFile, "utf8")).replace(/^\uFEFF/, "");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isOtpRecord) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return [];
    }

    console.error("[otp-store] failed to read the OTP file", error);
    throw new Error("otp-store-unavailable");
  }
}

async function writeRecords(records: OtpRecord[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });

  const tempFile = `${otpFile}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, otpFile);
}

/**
 * Creates (or replaces) the active code for `phone`.
 * Returns a cooldown result while the previous code is younger than
 * `OTP_RESEND_COOLDOWN_SECONDS`.
 */
export function issueOtp(phone: string): Promise<IssueOtpResult> {
  return enqueue(async () => {
    const now = Date.now();
    const records = await readRecords();
    const existing = records.find((record) => record.phone === phone);

    if (existing) {
      const lastSent = Date.parse(existing.lastSentAt);
      if (Number.isFinite(lastSent)) {
        const elapsed = Math.floor((now - lastSent) / 1000);
        if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
          return {
            ok: false as const,
            reason: "cooldown" as const,
            retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS - Math.max(0, elapsed),
          };
        }
      }
    }

    const code = String(randomInt(0, 10 ** OTP_CODE_LENGTH)).padStart(OTP_CODE_LENGTH, "0");
    const record: OtpRecord = {
      phone,
      codeHash: hashCode(phone, code),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + OTP_TTL_SECONDS * 1000).toISOString(),
      lastSentAt: new Date(now).toISOString(),
      attempts: 0,
    };

    // Keep short-lived history (consumed / expired codes) so the resend
    // cooldown cannot be bypassed by simply using the code first.
    const next = records.filter(
      (item) => item.phone !== phone && now - Date.parse(item.lastSentAt) < OTP_RETENTION_MS,
    );
    next.push(record);
    await writeRecords(next);

    return {
      ok: true as const,
      code,
      expiresInSeconds: OTP_TTL_SECONDS,
      resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    };
  });
}

/** Verifies and, on success, consumes the code for `phone`. */
export function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  return enqueue(async () => {
    const normalized = normalizeOtpCode(code);
    if (!normalized) {
      return { ok: false as const, reason: "invalid" as const };
    }

    const now = Date.now();
    const records = await readRecords();
    const index = records.findIndex((record) => record.phone === phone);

    if (index === -1) {
      return { ok: false as const, reason: "missing" as const };
    }

    const record = records[index];

    // A used code stays on disk as a tombstone so the resend cooldown still
    // applies, but it can never authenticate again.
    if (record.consumedAt) {
      return { ok: false as const, reason: "expired" as const };
    }

    if (Date.parse(record.expiresAt) <= now) {
      return { ok: false as const, reason: "expired" as const };
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false as const, reason: "too-many-attempts" as const };
    }

    if (!safeHashEqual(record.codeHash, hashCode(phone, normalized))) {
      record.attempts += 1;
      await writeRecords(records);
      return {
        ok: false as const,
        reason:
          record.attempts >= OTP_MAX_ATTEMPTS
            ? ("too-many-attempts" as const)
            : ("invalid" as const),
      };
    }

    record.consumedAt = new Date(now).toISOString();
    record.codeHash = "";
    record.attempts = 0;
    await writeRecords(records);
    return { ok: true as const };
  });
}

