// Temporary E2E checks for phone registration + phone sign-in.
// Usage: node tmp-phone-e2e.mjs
import fs from "node:fs";

const base = "http://localhost:3000";
const stamp = Date.now();
const phone = `0912${String(stamp).slice(-7)}`;
const otherPhone = `0935${String(stamp + 1).slice(-7)}`;
const email = `phone-${stamp}@lumens.test`;
const password = "Lumens#12345";

const jar = new Map();
const results = [];

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)})`);
}

function store(response) {
  const list = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  for (const cookie of list) {
    const [pair] = cookie.split(";");
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    redirect: "manual",
    headers: { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "), ...(options.headers ?? {}) },
  });
  store(response);
  return response;
}

async function signup(payload) {
  const response = await request("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

// 1) Sign up with a valid Iranian mobile number
const created = await signup({ fullName: "Phone Tester", email, phone, password, role: "student" });
check("signup status", created.status, 201);
check("stored phone", created.body?.user?.phone, phone);
check("sms skipped (disabled)", created.body?.sms, { sent: false, skipped: true });
check("email skipped (disabled)", created.body?.email, { sent: false, skipped: true });

// 2) Invalid Iranian mobile numbers are rejected
const badPhone = await signup({ fullName: "Bad Phone", email: `bad-${email}`, phone: "0812345678", password, role: "student" });
check("invalid phone status", badPhone.status, 400);

const shortPhone = await signup({ fullName: "Short Phone", email: `short-${email}`, phone: "0912345678", password, role: "student" });
check("short phone status", shortPhone.status, 400);

// 3) Duplicate phone is rejected even with a new e-mail
const dupPhone = await signup({ fullName: "Dup Phone", email: `dup-${email}`, phone, password, role: "student" });
check("duplicate phone status", dupPhone.status, 409);
check("duplicate phone message", /شماره موبایل/.test(dupPhone.body?.error ?? ""), true);

// 4) Duplicate e-mail is still rejected
const dupEmail = await signup({ fullName: "Dup Email", email, phone: otherPhone, password, role: "student" });
check("duplicate email status", dupEmail.status, 409);

// 5) Persisted record carries the canonical phone
const stored = JSON.parse(fs.readFileSync(".data/users.json", "utf8")).find((user) => user.email === email);
check("users.json phone", stored?.phone, phone);
check("users.json hides password", "passwordHash" in stored && !("password" in stored), true);

// 6) Sign in with phone + password
const { csrfToken } = await (await request("/api/auth/csrf")).json();
const phoneLogin = await request("/api/auth/callback/credentials", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ csrfToken, identifier: phone, password, callbackUrl: `${base}/dashboard`, json: "true" }).toString(),
});
check("phone+password login status", phoneLogin.status, 200);

const session = await (await request("/api/auth/session")).json();
check("session phone", session?.user?.phone, phone);
check("session email", session?.user?.email, email);

// 7) E-mail + password sign-in still works
const emailJar = new Map(jar);
jar.clear();
const emailCsrf = (await (await request("/api/auth/csrf")).json()).csrfToken;
const emailLogin = await request("/api/auth/callback/credentials", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ csrfToken: emailCsrf, identifier: email, password, callbackUrl: `${base}/dashboard`, json: "true" }).toString(),
});
check("email+password login status", emailLogin.status, 200);
const emailSession = await (await request("/api/auth/session")).json();
check("email login session", emailSession?.user?.email, email);

// restore phone session jar
jar.clear();
for (const [key, value] of emailJar) jar.set(key, value);

// 8) OTP request fails cleanly while SMS is not configured
const otpDisabled = await request("/api/auth/phone/request", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ phone }),
});
const otpDisabledBody = await otpDisabled.json().catch(() => null);
check("otp request without SMS config", otpDisabled.status, 503);
check("otp setup hint mentions SMS", /پیامک/.test(otpDisabledBody?.error ?? ""), true);

// 9) OTP request for an unknown number
const otpUnknown = await request("/api/auth/phone/request", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ phone: "09999999999" }),
});
check("otp request unknown number", otpUnknown.status, 404);

// 10) Phone normalisation accepts +98 and Persian digits
const national = `9${String(stamp).slice(-9)}`;
const intlPhone = `+98 ${national.slice(0, 3)} ${national.slice(3)}`;
const normalized = await signup({
  fullName: "Normalize Tester",
  email: `normalize-${stamp}@lumens.test`,
  phone: intlPhone,
  password,
  role: "student",
});
check("accepts +98 formatted phone", normalized.status, 201);
check("normalised to 09 form", normalized.body?.user?.phone, `0${national}`);

const toPersianDigits = (value) => value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
const persianNational = `9${String(stamp + 123).slice(-9)}`;
const persianSignup = await signup({
  fullName: "Persian Digits",
  email: `persian-${stamp}@lumens.test`,
  phone: toPersianDigits(`0${persianNational}`),
  password,
  role: "student",
});
check("accepts Persian digits phone", persianSignup.status, 201);
check("persian phone canonicalised", persianSignup.body?.user?.phone, `0${persianNational}`);

console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed`);
if (results.some((ok) => !ok)) process.exitCode = 1;
