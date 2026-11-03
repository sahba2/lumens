/**
 * LUMENS - sign-up notification dispatcher
 * ----------------------------------------
 * Single entry point used by the sign-up route.
 *
 * Guarantees:
 *  - the welcome e-mail **and** the welcome SMS are always attempted, in
 *    parallel, even when one of them throws,
 *  - nothing here can fail or slow down registration beyond its own timeouts,
 *  - the terminal gets one clear configuration banner (once per process) and
 *    one outcome line per sign-up, with a warning when a channel fails.
 *
 * Result contract mirrors `lib/mail.ts` / `lib/sms.ts`:
 * `{ ok, skipped, error? }` - never throws.
 */

import "server-only";

import type { WelcomeRole } from "./emails/welcome-email";
import {
  describeMailConfig,
  getSiteUrl,
  isMailConfigured,
  maskEmail,
  sendWelcomeEmail,
  type MailResult,
} from "./mail";
import {
  SMS_SETUP_HINT,
  describeSmsConfig,
  isSmsConfigured,
  maskPhone,
  sendWelcomeSms,
  type SmsResult,
} from "./sms";

export interface SignupNotificationInput {
  fullName: string;
  email: string;
  phone?: string;
  role: WelcomeRole;
  /** Absolute site origin; falls back to NEXT_PUBLIC_SITE_URL / NEXTAUTH_URL. */
  siteUrl?: string;
}

export interface SignupNotificationSummary {
  email: MailResult;
  sms: SmsResult;
}

/** What the API returns to the browser (no SMTP/SMS internals). */
export interface SignupNotificationFlags {
  email: { sent: boolean; skipped: boolean };
  sms: { sent: boolean; skipped: boolean };
}

/**
 * Shared across route bundles: Next.js compiles one module instance per route
 * in dev, and a global flag keeps the banner to a single line per process.
 */
const globalForNotifications = globalThis as unknown as {
  __lumensNotificationBanner?: boolean;
};

/**
 * Prints a once-per-process banner so a missing configuration is impossible to
 * miss in the dev terminal. Never prints credentials.
 */
export function logNotificationConfigOnce(): void {
  if (globalForNotifications.__lumensNotificationBanner) {
    return;
  }
  globalForNotifications.__lumensNotificationBanner = true;

  const mail = describeMailConfig();
  const sms = describeSmsConfig();

  console.info(
    mail.configured
      ? `[notifications] e-mail: ENABLED (${mail.host}:${mail.port}, secure=${mail.secure}, from "${mail.from}")`
      : "[notifications] e-mail: DISABLED - set SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM in .env.local (see .env.example)",
  );

  console.info(
    sms.configured
      ? `[notifications] SMS: ENABLED (provider=${sms.provider}${sms.sender ? `, sender=${sms.sender}` : ""})`
      : "[notifications] SMS: DISABLED - set SMS_PROVIDER (+ credentials) in .env.local; use SMS_PROVIDER=console to print messages locally",
  );
}

/** Secret-free snapshot consumed by the diagnostics endpoint. */
export function describeNotificationConfig() {
  return {
    email: {
      ...describeMailConfig(),
      hint: isMailConfigured()
        ? null
        : "SMTP_HOST، SMTP_USER، SMTP_PASS و MAIL_FROM را در .env.local تنظیم کنید.",
    },
    sms: {
      ...describeSmsConfig(),
      hint: isSmsConfigured() ? null : SMS_SETUP_HINT,
    },
  };
}

function errorReason(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function mailOutcome(settled: PromiseSettledResult<MailResult>): MailResult {
  if (settled.status === "fulfilled") {
    return settled.value;
  }

  console.error("[notifications] welcome e-mail threw unexpectedly:", settled.reason);
  return { ok: false, skipped: false, error: errorReason(settled.reason) };
}

function smsOutcome(settled: PromiseSettledResult<SmsResult>): SmsResult {
  if (settled.status === "fulfilled") {
    return settled.value;
  }

  console.error("[notifications] welcome SMS threw unexpectedly:", settled.reason);
  return { ok: false, skipped: false, error: errorReason(settled.reason) };
}

function label(result: { ok: boolean; skipped: boolean; error?: string }): string {
  if (result.ok) {
    return "sent";
  }

  return result.skipped
    ? `skipped(${result.error ?? "not-configured"})`
    : `FAILED(${result.error ?? "unknown"})`;
}

/**
 * Fires the welcome e-mail + welcome SMS for a freshly created account.
 * Resolves with both results; registration is never blocked by a failure.
 */
export async function sendSignupNotifications(
  input: SignupNotificationInput,
): Promise<SignupNotificationSummary> {
  logNotificationConfigOnce();

  const siteUrl = input.siteUrl?.trim() || getSiteUrl();
  const phone = input.phone?.trim() || undefined;

  const [emailSettled, smsSettled] = await Promise.allSettled([
    sendWelcomeEmail({
      fullName: input.fullName,
      email: input.email,
      phone,
      role: input.role,
    }),
    phone
      ? sendWelcomeSms({ fullName: input.fullName, phone, siteUrl })
      : Promise.resolve<SmsResult>({ ok: false, skipped: true, error: "no-phone-number" }),
  ]);

  const email = mailOutcome(emailSettled);
  const sms = smsOutcome(smsSettled);

  const target = `${maskEmail(input.email)}${phone ? ` / ${maskPhone(phone)}` : ""}`;
  const line = `[notifications] signup ${target}: email=${label(email)} sms=${label(sms)}`;

  if (!email.ok && !email.skipped) {
    console.warn(`${line}  <= e-mail: ${email.error}`);
  } else if (!sms.ok && !sms.skipped) {
    console.warn(`${line}  <= sms: ${sms.error}`);
  } else {
    console.info(line);
  }

  return { email, sms };
}

/** Shapes the summary for the JSON response of `/api/auth/signup`. */
export function toNotificationFlags({
  email,
  sms,
}: SignupNotificationSummary): SignupNotificationFlags {
  return {
    email: { sent: email.ok, skipped: email.skipped },
    sms: { sent: sms.ok, skipped: sms.skipped },
  };
}
