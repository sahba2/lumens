// Temporary E2E checks for welcome SMS + phone OTP login / recovery.
// Requires SMS_PROVIDER=kavenegar with SMS_BASE_URL pointing at tmp-sms-gateway.
// Usage: node tmp-otp-e2e.mjs
import fs from "node:fs";

const base = "http://localhost:3000";
const stamp = Date.now();
const password = "Lumens#12345";
const captureFile = "tmp-sms-capture.jsonl";

const phone = `0912${String(stamp).slice(-7)}`;
const email = `otp-${stamp}@lumens.test`;
const lockPhone = `0936${String(stamp + 7).slice(-7)}`;
const lockEmail = `otp-lock-${stamp}@lumens.test`;

const results = [];
const jar = new Map();

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
  return { status: response.status, body: await response.json().catch(() => null) };
}

async function requestOtp(targetPhone) {
  const response = await request("/api/auth/phone/request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: targetPhone }),
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

function readCaptures() {
  if (!fs.existsSync(captureFile)) return [];
  return fs
    .readFileSync(captureFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findSms(phone, matcher) {
  return readCaptures()
    .filter((entry) => entry.receptor === phone || entry.to === phone)
    .filter((entry) => matcher(entry.message ?? entry.text ?? ""))
    .at(-1);
}

async function loginWithOtp(targetPhone, code) {
  const { csrfToken } = await (await request("/api/auth/csrf")).json();
  const response = await request("/api/auth/callback/phone-otp", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, phone: targetPhone, code, callbackUrl: `${base}/dashboard`, json: "true" }).toString(),
  });
  const body = await response.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";
  const error = url.includes("error=") ? new URL(url).searchParams.get("error") : null;

  return { status: response.status, url, error };
}

// 1) Sign-up triggers the welcome SMS through the Kavenegar adapter
const created = await signup({ fullName: "Otp Tester", email, phone, password, role: "student" });
check("signup status", created.status, 201);
check("welcome sms sent", created.body?.sms, { sent: true, skipped: false });

const welcomeSms = findSms(phone, (text) => text.includes("خوش") || text.includes("حساب شما"));
check("welcome sms captured", Boolean(welcomeSms), true);
check("welcome sms greets the user", /Otp/.test(welcomeSms?.message ?? ""), true);
check("welcome sms links the dashboard", /\/dashboard$/.test((welcomeSms?.message ?? "").trim()), true);

// 2) Request a login / recovery code
const requested = await requestOtp(phone);
check("otp request status", requested.status, 200);
check("otp expires in 5 minutes", requested.body?.expiresInSeconds, 300);
check("otp cooldown 60s", requested.body?.retryAfterSeconds, 60);

const otpSms = findSms(phone, (text) => /کد ورود/.test(text));
const code = /(\d{6})/.exec(otpSms?.message ?? "")?.[1] ?? "";
check("otp sms carries a 6 digit code", /^\d{6}$/.test(code), true);

// 3) The code signs the user in (no password)
const login = await loginWithOtp(phone, code);
check("otp login has no error", login.error, null);
check("otp login redirects to dashboard", login.url.endsWith("/dashboard"), true);

const session = await (await request("/api/auth/session")).json();
check("otp session phone", session?.user?.phone, phone);
check("otp session email", session?.user?.email, email);

// 4) The code is single use
const replay = await loginWithOtp(phone, code);
check("otp code is single use", replay.error, "CredentialsSignin");

// 5) Immediate re-request hits the cooldown
const cooldown = await requestOtp(phone);
check("otp resend cooldown", cooldown.status, 429);
check("cooldown exposes retry seconds", typeof cooldown.body?.retryAfterSeconds, "number");

// 6) Too many wrong codes lock the code out
const lockUser = await signup({ fullName: "Lock Tester", email: lockEmail, phone: lockPhone, password, role: "student" });
check("second signup status", lockUser.status, 201);
const lockRequest = await requestOtp(lockPhone);
check("second otp request", lockRequest.status, 200);

const lockSms = findSms(lockPhone, (text) => /کد ورود/.test(text));
const lockCode = /(\d{6})/.exec(lockSms?.message ?? "")?.[1] ?? "";

for (let attempt = 1; attempt <= 5; attempt += 1) {
  const wrong = await loginWithOtp(lockPhone, "000000" === lockCode ? "111111" : "000000");
  check(`wrong code attempt ${attempt} rejected`, wrong.error, "CredentialsSignin");
}

const lockedCorrect = await loginWithOtp(lockPhone, lockCode);
check("correct code rejected after 5 failures", lockedCorrect.error, "CredentialsSignin");

console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed`);
if (results.some((ok) => !ok)) process.exitCode = 1;
