/** Verifies the default (no-key) sample provider returns a real Unsplash render. */
const BASE = process.env.LUMENS_BASE_URL ?? "http://localhost:3100";
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
  return { status: response.status, text, json, headers: response.headers };
}

const checks = [];
const check = (label, ok) => {
  checks.push({ label, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};

const email = `sample.${Math.random().toString(36).slice(2, 8)}@lumens.test`;
const phone = `09${Math.floor(100000000 + Math.random() * 899999999)}`;

check("signup 201", (await call("POST", "/api/auth/signup", {
  fullName: "Sample Probe",
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
check("sample mode is ready without a key", quota.json?.providerReady === true);
check("quota starts at 3", quota.json?.remainingCredits === 3);

const render = await call("POST", "/api/render/generate", {
  prompt: "Photorealistic concrete research pavilion with sunken courtyard, golden hour, 24mm tilt-shift.",
  aspectRatio: "16:9",
  projectId: "sheet-sample",
});
check("render 200", render.status === 200);
check("render provider=demo (sample)", render.json?.provider === "demo");
check(
  "sample render is a bundled real photo",
  /^\/renders\/samples\/sample-[a-z0-9-]+\.jpg$/.test(render.json?.imageUrl ?? ""),
);
check("remaining credits decremented", render.json?.remainingCredits === 2);

const sample = await call("GET", render.json?.imageUrl ?? "/renders/samples/sample-facade-16x9.jpg");
const contentType = sample.headers.get("content-type") ?? "";
check("sample image served 200", sample.status === 200);
check("sample image content-type", /^image\/(jpeg|webp|png|avif)/.test(contentType));
check(
  "sample image is high resolution (> 100KB)",
  Buffer.byteLength(sample.text, "utf8") > 100_000,
);

const aspect = await call("POST", "/api/render/generate", {
  prompt: "Monolithic concrete stair and shadow study, square crop, architectural photography.",
  aspectRatio: "1:1",
});
check(
  "square sample uses a square render",
  /^\/renders\/samples\/sample-square-/.test(aspect.json?.imageUrl ?? ""),
);

const failed = checks.filter((item) => !item.ok).length;
console.log(failed === 0 ? "SAMPLE_PROVIDER_OK" : `${failed} SAMPLE CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
