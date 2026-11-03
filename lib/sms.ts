/**
 * LUMENS - SMS utility
 * --------------------
 * Provider-agnostic wrapper for Iranian SMS gateways. Kavenegar and
 * Melipayamak adapters are included; `console` prints messages to the dev
 * terminal so the OTP flow can be exercised locally without a real gateway.
 *
 * Same contract as `lib/mail.ts`:
 *  - **never throws** - resolves with `{ ok, skipped, error? }`,
 *  - **never blocks for long** - 8s abort timeout,
 *  - **opt-in** - with no provider configured it reports `skipped: true`.
 *
 * Environment variables (see `.env.example`):
 *   SMS_PROVIDER=kavenegar | melipayamak | console
 *   SMS_API_KEY (Kavenegar), SMS_USERNAME + SMS_PASSWORD (Melipayamak)
 *   SMS_SENDER, SMS_OTP_TEMPLATE, SMS_BASE_URL, SMS_TIMEOUT_MS
 */

import "server-only";

export type SmsProvider = "kavenegar" | "melipayamak" | "console" | "none";

const FALLBACK_TIMEOUT_MS = 8_000;

function detectProvider(): SmsProvider {
  const explicit = (process.env.SMS_PROVIDER ?? "").trim().toLowerCase();
  if (
    explicit === "kavenegar" ||
    explicit === "melipayamak" ||
    explicit === "console" ||
    explicit === "none"
  ) {
    return explicit;
  }

  // Infer from whichever credentials are present.
  if ((process.env.SMS_API_KEY ?? "").trim().length > 0) {
    return "kavenegar";
  }
  if (
    (process.env.SMS_USERNAME ?? "").trim().length > 0 &&
    (process.env.SMS_PASSWORD ?? "").trim().length > 0
  ) {
    return "melipayamak";
  }

  return "none";
}

export const smsConfig = {
  provider: detectProvider(),
  apiKey: (process.env.SMS_API_KEY ?? "").trim(),
  username: (process.env.SMS_USERNAME ?? "").trim(),
  password: (process.env.SMS_PASSWORD ?? "").trim(),
  sender: (process.env.SMS_SENDER ?? "").trim(),
  /** Optional Kavenegar "verify/lookup" template name used for OTPs. */
  otpTemplate: (process.env.SMS_OTP_TEMPLATE ?? "").trim(),
  baseUrl: (process.env.SMS_BASE_URL ?? "").trim(),
  timeoutMs:
    Number.parseInt(process.env.SMS_TIMEOUT_MS ?? String(FALLBACK_TIMEOUT_MS), 10) ||
    FALLBACK_TIMEOUT_MS,
} as const;

export const SMS_SETUP_HINT =
  "سرویس پیامک تنظیم نشده است. مقادیر SMS_PROVIDER و کلیدهای سرویس (SMS_API_KEY یا SMS_USERNAME/SMS_PASSWORD) را در فایل .env.local قرار دهید (نمونه: .env.example).";

/** True when a provider is selected and has the credentials it needs. */
export function isSmsConfigured(): boolean {
  switch (smsConfig.provider) {
    case "console":
      return true;
    case "kavenegar":
      return smsConfig.apiKey.length > 0;
    case "melipayamak":
      return smsConfig.username.length > 0 && smsConfig.password.length > 0;
    default:
      return false;
  }
}

/** `09123456789` -> `0912***789` - safe for logs. */
export function maskPhone(phone: string): string {
  return phone.length >= 7 ? `${phone.slice(0, 4)}***${phone.slice(-3)}` : "***";
}

export interface SmsConfigSummary {
  configured: boolean;
  provider: SmsProvider;
  sender: string | null;
  otpTemplate: string | null;
  baseUrl: string | null;
}

/** Secret-free snapshot of the SMS setup, used by logs and diagnostics. */
export function describeSmsConfig(): SmsConfigSummary {
  return {
    configured: isSmsConfigured(),
    provider: smsConfig.provider,
    sender: smsConfig.sender || null,
    otpTemplate: smsConfig.otpTemplate || null,
    baseUrl: smsConfig.baseUrl || null,
  };
}

export interface SmsResult {
  ok: boolean;
  skipped: boolean;
  /** Non-sensitive failure reason; never contains credentials. */
  error?: string;
  /** Gateway message id when available. */
  providerId?: string;
}

export interface SmsMessage {
  /** Canonical Iranian mobile number (`09xxxxxxxxx`). */
  to: string;
  text: string;
  /** Optional template name (Kavenegar verify/lookup). */
  template?: string;
  /** Token passed to the template (the OTP code). */
  token?: string;
}

function fail(reason: string, to?: string): SmsResult {
  console.warn(`[sms] delivery failed${to ? ` for ${maskPhone(to)}` : ""}:`, reason);
  return { ok: false, skipped: false, error: reason };
}

interface KavenegarPayload {
  return?: { status?: number; message?: string };
  entries?: { messageid?: number }[];
}

/**
 * Kavenegar REST adapter.
 * Uses `verify/lookup` when a template name is configured (recommended for
 * OTPs) and the plain `sms/send` endpoint otherwise.
 */
async function sendViaKavenegar(message: SmsMessage): Promise<SmsResult> {
  const base = (smsConfig.baseUrl || "https://api.kavenegar.com").replace(/\/+$/, "");
  const useTemplate = Boolean(message.template && message.token);
  const endpoint = useTemplate
    ? `${base}/v1/${smsConfig.apiKey}/verify/lookup.json`
    : `${base}/v1/${smsConfig.apiKey}/sms/send.json`;

  const url = new URL(endpoint);
  url.searchParams.set("receptor", message.to);

  if (useTemplate) {
    url.searchParams.set("token", message.token ?? "");
    url.searchParams.set("template", message.template ?? "");
  } else {
    url.searchParams.set("message", message.text);
  }

  if (smsConfig.sender) {
    url.searchParams.set("sender", smsConfig.sender);
  }

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(smsConfig.timeoutMs),
  });

  const payload = (await response.json().catch(() => null)) as KavenegarPayload | null;

  if (!response.ok || payload?.return?.status !== 200) {
    return fail(payload?.return?.message ?? `kavenegar-http-${response.status}`, message.to);
  }

  return {
    ok: true,
    skipped: false,
    providerId: payload.entries?.[0]?.messageid ? String(payload.entries[0].messageid) : undefined,
  };
}

interface MelipayamakPayload {
  Value?: string;
  RetStatus?: number;
  StrRetStatus?: string;
}

/** Melipayamak (payamak-panel) REST adapter - shared line `SendSMS`. */
async function sendViaMelipayamak(message: SmsMessage): Promise<SmsResult> {
  const base = (smsConfig.baseUrl || "https://rest.payamak-panel.com").replace(/\/+$/, "");

  const response = await fetch(`${base}/api/SendSMS/SendSMS`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: smsConfig.username,
      password: smsConfig.password,
      to: message.to,
      from: smsConfig.sender,
      text: message.text,
      isflash: false,
    }),
    signal: AbortSignal.timeout(smsConfig.timeoutMs),
  });

  const payload = (await response.json().catch(() => null)) as MelipayamakPayload | null;

  if (!response.ok || payload?.RetStatus !== 1) {
    return fail(payload?.StrRetStatus ?? `melipayamak-http-${response.status}`, message.to);
  }

  return {
    ok: true,
    skipped: false,
    providerId: payload?.Value ? String(payload.Value) : undefined,
  };
}

/**
 * Sends one SMS through the configured gateway.
 * Resolves with a result object and never rejects.
 */
export async function sendSms(message: SmsMessage): Promise<SmsResult> {
  if (!isSmsConfigured()) {
    console.info(
      `[sms] skipped for ${maskPhone(message.to)} - no SMS provider configured (set SMS_PROVIDER and its credentials in .env.local)`,
    );
    return { ok: false, skipped: true, error: "sms-not-configured" };
  }

  try {
    const result = await (async (): Promise<SmsResult> => {
      switch (smsConfig.provider) {
        case "console":
          // Local development: print instead of paying for a gateway.
          console.info(`[sms:console] to=${maskPhone(message.to)}\n${message.text}`);
          return { ok: true, skipped: false, providerId: "console" };
        case "kavenegar":
          return sendViaKavenegar(message);
        case "melipayamak":
          return sendViaMelipayamak(message);
        default:
          return { ok: false, skipped: true, error: "sms-not-configured" };
      }
    })();

    if (result.ok && smsConfig.provider !== "console") {
      console.info(
        `[sms] sent via ${smsConfig.provider} to ${maskPhone(message.to)}${
          result.providerId ? ` (id: ${result.providerId})` : ""
        }`,
      );
    }

    return result;
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error), message.to);
  }
}

export interface OtpSmsInput {
  phone: string;
  code: string;
  ttlSeconds: number;
}

/** Sends the one-time login / recovery code. */
export async function sendOtpSms({ phone, code, ttlSeconds }: OtpSmsInput): Promise<SmsResult> {
  const minutes = Math.max(1, Math.round(ttlSeconds / 60));

  return sendSms({
    to: phone,
    template: smsConfig.otpTemplate || undefined,
    token: code,
    text: `کد ورود شما به LUMENS: ${code}\nاین کد تا ${minutes} دقیقه معتبر است؛ آن را در اختیار دیگران قرار ندهید.`,
  });
}

export interface WelcomeSmsInput {
  fullName: string;
  phone: string;
  siteUrl: string;
}

/** Sends the short welcome SMS right after a successful registration. */
export async function sendWelcomeSms({ fullName, phone, siteUrl }: WelcomeSmsInput): Promise<SmsResult> {
  const firstName = fullName.trim().split(/\s+/)[0] || "همراه";
  const dashboardUrl = `${siteUrl.replace(/\/+$/, "")}/dashboard`;

  return sendSms({
    to: phone,
    text: `${firstName} عزیز، حساب شما در LUMENS ساخته شد. ورود به داشبورد: ${dashboardUrl}`,
  });
}
