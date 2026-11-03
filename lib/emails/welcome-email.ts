/**
 * LUMENS - welcome e-mail template
 * --------------------------------
 * Builds the Persian, RTL, dark-themed welcome / confirmation e-mail that is
 * sent right after a successful sign-up.
 *
 * Design notes (e-mail clients are not browsers):
 *  - every rule is inline, no <style> block, no flex/grid,
 *  - layout is table based (Outlook + Gmail friendly),
 *  - only `background-image` gradients are used as progressive enhancement,
 *    the solid gold/ink colours keep the design intact without them,
 *  - fonts fall back to Tahoma/Arial where Vazirmatn is unavailable.
 */

export type WelcomeRole = "student" | "instructor";

export interface WelcomeEmailInput {
  fullName: string;
  email: string;
  /** Canonical Iranian mobile number (`09xxxxxxxxx`), when the user has one. */
  phone?: string;
  role: WelcomeRole;
  /** Absolute site origin, e.g. https://lumens.archi */
  siteUrl: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Brand palette - mirrors `tailwind.config.ts` so e-mail and site match. */
const INK = "#0a0a0a";
const INK_CARD = "#111116";
const INK_LINE = "#26262e";
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f2e2a8";
const GOLD_DEEP = "#8a6b18";
const TEXT = "#f4f4f5";
const MUTED = "#a1a1aa";
const SAND = "#c8bda3";

const FONT_STACK = "'Vazirmatn','IRANSansX','IRANSans','Segoe UI',Tahoma,Arial,sans-serif";

/** Escapes user supplied values before they are interpolated into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface RoleCopy {
  label: string;
  intro: string;
  benefits: string[];
  ctaLabel: string;
  ctaPath: string;
}

const ROLE_COPY: Record<WelcomeRole, RoleCopy> = {
  student: {
    label: "دانشجو / معمار",
    intro:
      "حساب شما با نقش «دانشجو / معمار» ساخته شد. از این پس به دوره‌های تخصصی، کتابخانه آبجکت‌های سه‌بعدی و پرامپت‌های آماده معماری دسترسی دارید.",
    benefits: [
      "دسترسی کامل به دوره‌های هوش مصنوعی در معماری",
      "دانلود آبجکت‌های سه‌بعدی با لایسنس اختصاصی حساب شما",
      "ذخیره پرامپت‌های معماری در کتابخانه شخصی",
    ],
    ctaLabel: "ورود به داشبورد من",
    ctaPath: "/dashboard",
  },
  instructor: {
    label: "مدرس",
    intro:
      "حساب شما با نقش «مدرس» ساخته شد. از این پس می‌توانید دوره بسازید، تمرین‌های دانشجویان را بازبینی کنید و آبجکت یا پرامپت اختصاصی منتشر کنید.",
    benefits: [
      "ساخت دوره جدید و بارگذاری سرفصل‌ها",
      "بازبینی تمرین‌ها و پروژه‌های دانشجویان",
      "انتشار آبجکت و پرامپت اختصاصی برای اعضا",
    ],
    ctaLabel: "ورود به پنل مدرس",
    ctaPath: "/dashboard",
  },
};

export function buildWelcomeEmail(input: WelcomeEmailInput): RenderedEmail {
  const fullName = input.fullName.trim() || "همراه LUMENS";
  const siteUrl = input.siteUrl.replace(/\/+$/, "");
  const role = ROLE_COPY[input.role];
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(input.email);
  const safePhone = input.phone ? escapeHtml(input.phone) : "";
  const dashboardUrl = `${siteUrl}${role.ctaPath}`;
  const coursesUrl = `${siteUrl}/courses`;
  const objectsUrl = `${siteUrl}/objects`;
  const promptsUrl = `${siteUrl}/ai-prompts`;
  const homeUrl = `${siteUrl}/`;

  const subject = `${fullName} عزیز، به LUMENS خوش آمدید`;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fa" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body dir="rtl" style="margin:0;padding:0;background:${INK};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">
    حساب کاربری شما در LUMENS ساخته شد؛ اولین رندر سینمایی‌تان را امروز بسازید.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${INK_CARD};border:1px solid ${INK_LINE};border-radius:24px;overflow:hidden;font-family:${FONT_STACK};">

          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background:${GOLD};background-image:linear-gradient(90deg,${GOLD_DEEP},${GOLD},${GOLD_LIGHT},${GOLD},${GOLD_DEEP});">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" style="padding:36px 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="width:56px;height:56px;background:#1a1a20;border:1px solid ${GOLD};border-radius:16px;font-family:${FONT_STACK};font-size:24px;font-weight:900;color:${GOLD};line-height:56px;">
                    L
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:${FONT_STACK};font-size:22px;font-weight:800;letter-spacing:6px;color:${TEXT};">
                LUMENS
              </p>
              <p style="margin:6px 0 0;font-family:${FONT_STACK};font-size:10px;font-weight:700;letter-spacing:3px;color:${GOLD};">
                AI &times; ARCHITECTURE PLATFORM
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK_LINE};">
                <tr><td style="height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 12px;font-family:${FONT_STACK};font-size:11px;font-weight:700;letter-spacing:2px;color:${SAND};">
                خوش آمدید
              </p>
              <h1 style="margin:0;font-family:${FONT_STACK};font-size:26px;line-height:1.6;font-weight:900;color:${TEXT};">
                <span style="color:${GOLD};">${safeName}</span> عزیز،
                <br />
                به LUMENS خوش آمدید
              </h1>
              <p style="margin:14px 0 0;font-family:${FONT_STACK};font-size:14px;line-height:2;color:${MUTED};">
                ${role.intro}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#16161c;border:1px solid ${INK_LINE};border-radius:16px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-family:${FONT_STACK};font-size:11px;color:${MUTED};">
                      حساب کاربری شما
                    </p>
                    <p dir="ltr" style="margin:6px 0 0;text-align:right;font-family:${FONT_STACK};font-size:13px;font-weight:700;color:${TEXT};word-break:break-all;">
                      ${safeEmail}
                    </p>
                    ${
                      safePhone
                        ? `<p dir="ltr" style="margin:6px 0 0;text-align:right;font-family:${FONT_STACK};font-size:12px;color:#d4d4d8;word-break:break-all;">${safePhone}</p>`
                        : ""
                    }
                    <p style="margin:10px 0 0;font-family:${FONT_STACK};font-size:11px;color:${MUTED};">
                      نقش:
                      <span style="display:inline-block;margin-right:6px;padding:3px 10px;border:1px solid rgba(212,175,55,0.45);border-radius:999px;background:rgba(212,175,55,0.12);font-size:11px;font-weight:700;color:${GOLD_LIGHT};">
                        ${role.label}
                      </span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 0;">
              <p style="margin:0 0 12px;font-family:${FONT_STACK};font-size:13px;font-weight:800;color:${TEXT};">
                از همان روز اول به این موارد دسترسی دارید
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${role.benefits
                  .map(
                    (benefit) => `<tr>
                  <td valign="top" style="padding:6px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="width:22px;padding-top:2px;">
                          <span style="display:inline-block;width:18px;height:18px;border:1px solid rgba(212,175,55,0.5);border-radius:6px;background:rgba(212,175,55,0.14);color:${GOLD_LIGHT};font-family:${FONT_STACK};font-size:11px;font-weight:900;line-height:18px;text-align:center;">&#10003;</span>
                        </td>
                        <td valign="top" style="font-family:${FONT_STACK};font-size:13px;line-height:1.9;color:#d4d4d8;">
                          ${benefit}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`,
                  )
                  .join("\n                ")}
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:30px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="border-radius:999px;background:${GOLD};background-image:linear-gradient(90deg,${GOLD_DEEP},${GOLD} 45%,${GOLD_LIGHT});">
                    <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:${FONT_STACK};font-size:14px;font-weight:800;color:#141002;text-decoration:none;border-radius:999px;">
                      ${role.ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-family:${FONT_STACK};font-size:11px;color:#71717a;">
                یا از نشانی زیر وارد شوید:
                <a href="${dashboardUrl}" target="_blank" style="color:${GOLD_LIGHT};text-decoration:none;">${dashboardUrl}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK_LINE};">
                <tr><td style="height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0;">
              <p style="margin:0 0 12px;font-family:${FONT_STACK};font-size:12px;font-weight:700;color:${TEXT};">
                مسیرهای پیشنهادی برای شروع
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:4px;">
                    <a href="${coursesUrl}" target="_blank" style="display:block;padding:12px 10px;border:1px solid ${INK_LINE};border-radius:12px;background:#16161c;font-family:${FONT_STACK};font-size:12px;font-weight:700;color:${TEXT};text-decoration:none;">
                      دوره‌های تخصصی
                    </a>
                  </td>
                  <td align="center" style="padding:4px;">
                    <a href="${objectsUrl}" target="_blank" style="display:block;padding:12px 10px;border:1px solid ${INK_LINE};border-radius:12px;background:#16161c;font-family:${FONT_STACK};font-size:12px;font-weight:700;color:${TEXT};text-decoration:none;">
                      آبجکت‌های سه‌بعدی
                    </a>
                  </td>
                  <td align="center" style="padding:4px;">
                    <a href="${promptsUrl}" target="_blank" style="display:block;padding:12px 10px;border:1px solid ${INK_LINE};border-radius:12px;background:#16161c;font-family:${FONT_STACK};font-size:12px;font-weight:700;color:${TEXT};text-decoration:none;">
                      کتابخانه پرامپت
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 32px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d12;border:1px solid ${INK_LINE};border-radius:16px;">
                <tr>
                  <td align="center" style="padding:18px;">
                    <p style="margin:0;font-family:${FONT_STACK};font-size:11px;line-height:1.9;color:#71717a;">
                      این ایمیل به دلیل ساخت حساب کاربری در
                      <a href="${homeUrl}" target="_blank" style="color:${GOLD_LIGHT};text-decoration:none;">LUMENS</a>
                      به نشانی ${safeEmail} ارسال شده است.
                      <br />
                      اگر این ثبت‌نام توسط شما انجام نشده است، این پیام را نادیده بگیرید.
                    </p>
                    <p style="margin:10px 0 0;font-family:${FONT_STACK};font-size:10px;color:#52525b;">
                      &copy; ${new Date().getFullYear()} LUMENS Studio &middot; معماری، فراتر از تخیل با هوش مصنوعی
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${fullName} عزیز، به LUMENS خوش آمدید`,
    "",
    role.intro,
    "",
    `نقش حساب: ${role.label}`,
    `ایمیل: ${input.email}`,
    ...(input.phone ? [`شماره موبایل: ${input.phone}`] : []),
    "",
    "از همان روز اول به این موارد دسترسی دارید:",
    ...role.benefits.map((benefit) => `- ${benefit}`),
    "",
    `${role.ctaLabel}: ${dashboardUrl}`,
    "",
    `دوره‌های تخصصی: ${coursesUrl}`,
    `آبجکت‌های سه‌بعدی: ${objectsUrl}`,
    `کتابخانه پرامپت: ${promptsUrl}`,
    "",
    "این ایمیل به دلیل ساخت حساب کاربری در LUMENS ارسال شده است.",
    "اگر این ثبت‌نام توسط شما انجام نشده است، این پیام را نادیده بگیرید.",
    "",
    `© ${new Date().getFullYear()} LUMENS Studio`,
  ].join("\n");

  return { subject, html, text };
}
