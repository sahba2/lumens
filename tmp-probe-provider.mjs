/**
 * Verifies a real provider adapter (huggingface | fal) against a local mock.
 * Usage: EXPECT_PROVIDER=huggingface node tmp-probe-provider.mjs
 */
const BASE = process.env.LUMENS_BASE_URL ?? "http://localhost:3100";
const EXPECT = process.env.EXPECT_PROVIDER ?? "huggingface";
const jar = new Map();

const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
function store(response) {
  for (const raw of response.headers.getSetCookie?.() ?? []) {
    const pair = raw.split(";")[0];
    const index = pair.indexOf("=");
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

async function call(method, path, body, form = false) {
  const headers = {};
  const cookies = cookieHeader();
  if (cookies) headers.cookie = cookies;
  let payload;
  if (body) {
    headers["content-type"] = form
      ? "application/x-www-form-urlencoded"
      : "application/json; charset=utf-8";
    payload = form ? new URLSearchParams(body).toString() : JSON.stringify(body);
  }
  const response = await fetch(`${BASE}${path}`, { method, headers, body: payload, redirect: "manual" });
  store(response);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, json, headers: response.headers, bytes: Buffer.byteLength(text) };
}

const checks = [];
const check = (label, ok) => {
  checks.push({ label, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};

const email = `prov.${Math.random().toString(36).slice(2, 8)}@lumens.test`;
const phone = `09${Math.floor(100000000 + Math.random() * 899999999)}`;

check("signup 201", (await call("POST", "/api/auth/signup", {
  fullName: "Provider Probe",
  email,
  phone,
  password: "Lumens#2026",
  role: "student",
})).status === 201);

const csrf = await call("GET", "/api/auth/csrf");
await call(
  "POST",
  "/api/auth/callback/credentials",
  { csrfToken: csrf.json?.csrfToken, email, password: "Lumens#2026", callbackUrl: `${BASE}/`, json: "true" },
  true,
);

const quota = await call("GET", "/api/render/quota");
check("provider ready", quota.json?.providerReady === true);

const render = await call("POST", "/api/render/generate", {
  prompt: "Photorealistic monolithic concrete villa with sunken courtyard, golden hour, 24mm.",
  aspectRatio: "16:9",
});
check("render 200", render.status === 200);
check(`provider=${EXPECT}`, render.json?.provider === EXPECT);
check("credits decremented", render.json?.remainingCredits === 2);

if (EXPECT === "huggingface") {
  check(
    "HF binary response converted to a data URL",
    /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(render.json?.imageUrl ?? ""),
  );
} else {
  check(
    "fal image URL proxied through our origin",
    (render.json?.imageUrl ?? "").startsWith("/api/render/proxy?url="),
  );

  const proxied = await call("GET", render.json?.imageUrl ?? "/api/render/proxy");
  check("proxy streams the fal image", proxied.status === 200);
  check(
    "proxy returns image content-type",
    (proxied.headers.get("content-type") ?? "").startsWith("image/"),
  );
}

const failed = checks.filter((item) => !item.ok).length;
console.log(failed === 0 ? `PROVIDER_${EXPECT.toUpperCase()}_OK` : `${failed} PROVIDER CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
