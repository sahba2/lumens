/**
 * LUMENS - mail utility
 * ---------------------
 * Single, reusable SMTP transport built on `nodemailer`.
 *
 * Design rules:
 *  - **never throws**: every helper resolves with a result object, so e-mail
 *    problems can never break a user flow (sign-up, password reset, ...),
 *  - **never blocks for long**: connection/greeting/socket timeouts keep a dead
 *    SMTP host from stalling a request,
 *  - **opt-in**: with `SMTP_HOST` empty the transport reports `skipped: true`
 *    and the app keeps working exactly as before,
 *  - server-only: import it from Route Handlers / Server Actions only.
 *
 * Environment variables (see `.env.example`):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
 *   MAIL_FROM, MAIL_REPLY_TO, SMTP_TLS_REJECT_UNAUTHORIZED
 */

import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import { buildWelcomeEmail, type WelcomeRole } from "./emails/welcome-email";

/** Timeouts (ms) so a misconfigured SMTP host cannot hang a request. */
const CONNECTION_TIMEOUT = 8_000;
const GREETING_TIMEOUT = 8_000;
const SOCKET_TIMEOUT = 12_000;

export const mailConfig = {
  host: (process.env.SMTP_HOST ?? "").trim(),
  port: Number.parseInt(process.env.SMTP_PORT ?? "587", 10) || 587,
  /**
   * Implicit TLS. Defaults to `true` for the SMTPS port (465) and `false`
   * otherwise, so STARTTLS on 587/25 works without extra configuration.
   */
  secure:
    (process.env.SMTP_SECURE ?? "").trim().length > 0
      ? (process.env.SMTP_SECURE ?? "").trim().toLowerCase() === "true"
      : (Number.parseInt(process.env.SMTP_PORT ?? "587", 10) || 587) === 465,
  user: (process.env.SMTP_USER ?? "").trim(),
  pass: process.env.SMTP_PASS ?? "",
  from: (process.env.MAIL_FROM ?? "").trim(),
  replyTo: (process.env.MAIL_REPLY_TO ?? "").trim(),
  /** Only disable for self-signed certificates in local development. */
  rejectUnauthorized:
    (process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? "true").trim().toLowerCase() !== "false",
} as const;

const DEFAULT_FROM = "LUMENS <no-reply@lumens.archi>";

export interface MailResult {
  /** `true` only when the SMTP server accepted the message. */
  ok: boolean;
  /** `true` when SMTP is not configured and nothing was attempted. */
  skipped: boolean;
  /** Non-sensitive reason for a failed/skipped send (never contains credentials). */
  error?: string;
  messageId?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** True when at least `SMTP_HOST` and `MAIL_FROM` are provided. */
export function isMailConfigured(): boolean {
  return mailConfig.host.length > 0 && mailConfig.from.length > 0;
}

/** `sara.ahmadi@gmail.com` -> `s***@gmail.com` - safe for logs. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) {
    return "***";
  }

  return `${local.slice(0, 1)}***@${domain}`;
}

export interface MailConfigSummary {
  configured: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  from: string;
  replyTo: string | null;
}

/** Secret-free snapshot of the SMTP setup, used by logs and diagnostics. */
export function describeMailConfig(): MailConfigSummary {
  return {
    configured: isMailConfigured(),
    host: mailConfig.host || null,
    port: mailConfig.port,
    secure: mailConfig.secure,
    from: mailConfig.from,
    replyTo: mailConfig.replyTo || null,
  };
}

/**
 * Keeps one transport per process. Cached on `globalThis` so Next.js' dev
 * hot-reload does not open a new connection pool on every recompile.
 */
const globalForMail = globalThis as unknown as { __lumensMailer?: Transporter };

function getTransporter(): Transporter {
  if (globalForMail.__lumensMailer) {
    return globalForMail.__lumensMailer;
  }

  const options: SMTPTransport.Options = {
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    tls: { rejectUnauthorized: mailConfig.rejectUnauthorized },
    connectionTimeout: CONNECTION_TIMEOUT,
    greetingTimeout: GREETING_TIMEOUT,
    socketTimeout: SOCKET_TIMEOUT,
  };

  // Open relays and local capture servers do not need (or accept) auth.
  if (mailConfig.user || mailConfig.pass) {
    options.auth = { user: mailConfig.user, pass: mailConfig.pass };
  }

  const transport = nodemailer.createTransport(options);

  globalForMail.__lumensMailer = transport;
  return transport;
}

/**
 * Sends a single message. Resolves with a result object and **never rejects**,
 * so callers can safely `await` it inside a registration flow.
 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!isMailConfigured()) {
    console.info(
      `[mail] skipped for ${maskEmail(message.to)} - SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM in .env.local)`,
    );
    return {
      ok: false,
      skipped: true,
      error: "smtp-not-configured",
    };
  }

  try {
    const info = await getTransporter().sendMail({
      from: mailConfig.from || DEFAULT_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo || mailConfig.replyTo
        ? { replyTo: message.replyTo || mailConfig.replyTo }
        : {}),
      // Helps some clients render the Persian body correctly.
      headers: { "Content-Language": "fa", "X-Entity-Ref-ID": "lumens-transactional" },
    });

    console.info(
      `[mail] sent "${message.subject}" to ${maskEmail(message.to)} (id: ${info.messageId})`,
    );

    return { ok: true, skipped: false, messageId: info.messageId };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    // Logged server-side only; the API response never exposes SMTP details.
    console.warn(`[mail] failed for ${maskEmail(message.to)} via ${mailConfig.host}:${mailConfig.port}: ${reason}`);
    return { ok: false, skipped: false, error: reason };
  }
}

/** Absolute site origin used for links inside e-mails. */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000";

  return configured.replace(/\/+$/, "");
}

export interface WelcomeEmailTarget {
  fullName: string;
  email: string;
  role: WelcomeRole;
  /** Canonical Iranian mobile number, shown in the e-mail account card. */
  phone?: string;
}

/**
 * Sends the Persian welcome / confirmation e-mail.
 * Fire-and-await safe: it resolves even when SMTP is down or unconfigured.
 */
export async function sendWelcomeEmail(user: WelcomeEmailTarget): Promise<MailResult> {
  const template = buildWelcomeEmail({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    siteUrl: getSiteUrl(),
  });

  return sendMail({
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
