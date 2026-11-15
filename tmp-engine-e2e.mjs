/**
 * LUMENS - temporary E2E check for the AI architecture engine.
 * Run against a server started with IMAGE_GEN_PROVIDER=demo:
 *   node tmp-engine-e2e.mjs
 */

const BASE = process.env.LUMENS_BASE_URL ?? "http://localhost:3100";

const results = [];
const check = (label, ok) => results.push({ label, ok: Boolean(ok) });

/* -------------------------------------------------------- tiny cookie jar */
const jar = new Map();

function cookieHeader() {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function storeCookies(response) {
  const list =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

  for (const raw of list) {
    for (const part of raw.split(/,(?=[^;]+=)/)) {
      const pair = part.split(";")[0];
      const index = pair.indexOf("=");
      if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }
}

async function request(method, path, body, { form = false } = {}) {
  const headers = {};
  const cookies = cookieHeader();
  if (cookies) headers.cookie = cookies;

  let payload;
  if (body !== undefined) {
    if (form) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      payload = new URLSearchParams(body).toString();
    } else {
      headers["content-type"] = "application/json; charset=utf-8";
      payload = JSON.stringify(body);
    }
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: payload,
    redirect: "manual",
  });
  storeCookies(response);

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { status: response.status, text, json };
}

const main = async () => {
  const password = "Lumens#2026";
  const email = `engine.${Math.random().toString(36).slice(2, 10)}@lumens.test`;
  const phone = `09${Math.floor(100000000 + Math.random() * 899999999)}`;

  /* ------------------------------------------------------------ sign-up */
  const signup = await request("POST", "/api/auth/signup", {
    fullName: "Engine Tester",
    email,
    phone,
    password,
    role: "student",
  });
  check("signup -> 201", signup.status === 201);

  /* -------------------------------------------------------- guest quota */
  const guestQuota = await request("GET", "/api/render/quota");
  check("guest quota 200", guestQuota.status === 200);
  check("guest quota authenticated=false", guestQuota.json?.authenticated === false);
  check("guest quota limit=3", guestQuota.json?.limit === 3);
  check("guest quota remaining=0", guestQuota.json?.remainingCredits === 0);
  check("provider ready (demo)", guestQuota.json?.providerReady === true);

  /* ------------------------------------------------------- guest render */
  const guestRender = await request("POST", "/api/render/generate", {
    prompt: "A long enough architectural prompt for the guest rejection check.",
    aspectRatio: "16:9",
  });
  check("guest render -> 401", guestRender.status === 401);
  check("guest render code=unauthenticated", guestRender.json?.code === "unauthenticated");
  check("guest render success=false", guestRender.json?.success === false);
  check("guest render Persian message", (guestRender.json?.error ?? "").length > 10);
  check("guest render authenticated=false", guestRender.json?.authenticated === false);

  /* ------------------------------------------------- 5-phase sheet (free) */
  const brief =
    "research center with a sunken courtyard in Isfahan, exposed concrete and structural glass";
  const sheetRes = await request("POST", "/api/engine/sheet", { brief });
  const sheet = sheetRes.json?.sheet;

  check("sheet -> 200", sheetRes.status === 200);
  check("sheet success=true", sheetRes.json?.success === true);
  check("sheet free=true", sheetRes.json?.free === true);
  check("sheet has 3 render prompts", sheet?.prompts?.length === 3);
  check("zoning has 3 tiers", sheet?.concept?.zoning?.length === 3);
  check("zoning public=25", sheet?.concept?.zoning?.[0]?.share === 25);
  check("zoning semi=35", sheet?.concept?.zoning?.[1]?.share === 35);
  check("zoning specialized=40", sheet?.concept?.zoning?.[2]?.share === 40);

  const zoningSum = (sheet?.concept?.zoning ?? []).reduce((sum, tier) => sum + tier.area, 0);
  check("zoning areas sum to gross", zoningSum === sheet?.metadata?.area);
  check("typology detected research", sheet?.typology?.id === "research");
  check("location detected Isfahan", sheet?.location?.id === "isfahan");
  check("location detected flag", sheet?.location?.detected === true);

  const exterior = sheet?.prompts?.find((item) => item.id === "exterior-hero");
  const interior = sheet?.prompts?.find((item) => item.id === "interior-atrium");
  const axonometric = sheet?.prompts?.find((item) => item.id === "axonometric");

  check("exterior prompt golden hour", /golden hour/i.test(exterior?.prompt ?? ""));
  check("exterior prompt tie-rod holes", /tie-rod holes/i.test(exterior?.prompt ?? ""));
  check("exterior prompt aspect 16:9", exterior?.aspectRatio === "16:9");
  check("interior prompt diffuse daylight", /diffuse daylight/i.test(interior?.prompt ?? ""));
  check("interior prompt 4:3", interior?.aspectRatio === "4:3");
  check("axonometric exploded", /exploded axonometric/i.test(axonometric?.prompt ?? ""));
  check("axonometric 1:1", axonometric?.aspectRatio === "1:1");
  check("prompts stay English", !/[\u0600-\u06FF]/.test(exterior?.prompt ?? "x"));
  check(
    "technical stormwater gutter detail",
    (sheet?.technical?.details ?? []).some((detail) =>
      /Linear Stormwater Gutter/i.test(detail.titleEn),
    ),
  );
  check(
    "technical recessed glass joint",
    (sheet?.technical?.details ?? []).some((detail) =>
      /Recessed Frameless Glass/i.test(detail.titleEn),
    ),
  );
  check("technical transitions = 3", sheet?.technical?.transitions?.length === 3);
  check(
    "bilingual presentation statement",
    (sheet?.presentation?.statementFa ?? "").length > 40 &&
      (sheet?.presentation?.statementEn ?? "").length > 40,
  );
  check("metadata zoning percentages", (sheet?.metadata?.zoning ?? []).length === 3);
  check("sheet id prefix", (sheet?.id ?? "").startsWith("sheet-"));

  /* ------------------------------------------------------ invalid brief */
  const badSheet = await request("POST", "/api/engine/sheet", { brief: "a" });
  check("short brief -> 400", badSheet.status === 400);
  check("short brief code=invalid-request", badSheet.json?.code === "invalid-request");

  /* ---------------------------------------------------- sign-in (cookie) */
  const csrf = await request("GET", "/api/auth/csrf");
  const login = await request(
    "POST",
    "/api/auth/callback/credentials",
    {
      csrfToken: csrf.json?.csrfToken ?? "",
      email,
      password,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    },
    { form: true },
  );
  check("credentials sign-in responds", login.status === 200 || login.status === 302);

  const session = await request("GET", "/api/auth/session");
  check("signed-in session exists", Boolean(session.json?.user));
  check("session email matches", session.json?.user?.email === email);

  /* --------------------------------------------------- authenticated quota */
  const quota = await request("GET", "/api/render/quota");
  check("auth quota authenticated", quota.json?.authenticated === true);
  check("auth quota remaining=3", quota.json?.remainingCredits === 3);

  /* --------------------------------------------------- renders + credits */
  const renderBody = {
    prompt: exterior?.prompt,
    negativePrompt: exterior?.negativePrompt,
    aspectRatio: "16:9",
    projectId: sheet?.id,
  };

  const render1 = await request("POST", "/api/render/generate", renderBody);
  check("render #1 -> 200", render1.status === 200);
  check("render #1 success", render1.json?.success === true);
  check("render #1 remaining=2", render1.json?.remainingCredits === 2);
  check("render #1 provider=demo", render1.json?.provider === "demo");
  check("render #1 imageUrl local", /^\/(ai-engine|renders)\//.test(render1.json?.imageUrl ?? ""));
  check("render #1 downloadUrl", (render1.json?.downloadUrl ?? "").length > 5);
  check("render #1 no key leak", !render1.text.includes("IMAGE_GEN_API_KEY"));

  const render2 = await request("POST", "/api/render/generate", renderBody);
  check("render #2 remaining=1", render2.json?.remainingCredits === 1);

  const render3 = await request("POST", "/api/render/generate", renderBody);
  check("render #3 remaining=0", render3.json?.remainingCredits === 0);

  const render4 = await request("POST", "/api/render/generate", renderBody);
  check("render #4 -> 402", render4.status === 402);
  check("render #4 code=quota-exhausted", render4.json?.code === "quota-exhausted");
  check("render #4 remaining=0", render4.json?.remainingCredits === 0);
  check("render #4 authenticated", render4.json?.authenticated === true);

  /* -------------------------------------------------------------- proxy */
  const blocked = await request(
    "GET",
    `/api/render/proxy?url=${encodeURIComponent("https://example.com/a.png")}`,
  );
  check("proxy blocks unknown host -> 403", blocked.status === 403);

  const invalid = await request("GET", "/api/render/proxy?url=not-a-url");
  check("proxy invalid url -> 400", invalid.status === 400);

  const missing = await request("GET", "/api/render/proxy");
  check("proxy missing url -> 400", missing.status === 400);

  /* ---------------------------------------------------- credits on disk */
  const { readFile } = await import("node:fs/promises");
  try {
    const raw = await readFile(new URL("./.data/render-credits.json", import.meta.url), "utf8");
    const records = JSON.parse(raw);
    const mine = records.find((record) => record.userId === session.json?.user?.id);
    check("credit record persisted", Boolean(mine));
    check("credit record used=3", mine?.used === 3);
  } catch (error) {
    check("credit record persisted", false);
    check("credit record used=3", false);
    console.log(`credits file read failed: ${error.message}`);
  }

  console.log("--- diagnostics");
  console.log("guest quota:", guestQuota.status, guestQuota.text.slice(0, 240));
  console.log("render #1:", render1.status, render1.text.slice(0, 300));
  console.log("render #4:", render4.status, render4.text.slice(0, 300));

  const failed = results.filter((result) => !result.ok);
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
  }
  console.log("---");
  console.log(`account=${email}`);
  console.log(
    failed.length === 0
      ? "ALL_ENGINE_E2E_CHECKS_PASSED"
      : `${failed.length} ENGINE E2E CHECK(S) FAILED`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error("E2E crashed:", error);
  process.exit(2);
});
