/**
 * LUMENS - UI proof for the render click logic:
 *   1. click "رندر تصویر" -> GET /api/render/quota happens FIRST,
 *   2. only then POST /api/render/generate,
 *   3. a loading state is visible while the request runs,
 *   4. the returned image replaces the prompt text,
 *   5. with 0 credits left: no POST at all + Persian message.
 *
 * Requires: next server on :3100 (openai provider -> http://localhost:4123/v1),
 * IMAGE_PROXY_ALLOWED_HOSTS=localhost, and Chrome installed.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3100";
const CDP_PORT = 9222;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checks = [];
const check = (label, ok) => {
  checks.push({ label, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
};

/* --------------------------------------------------------- auth via REST */
const jar = new Map();
function storeCookies(response) {
  for (const raw of response.headers.getSetCookie?.() ?? []) {
    const pair = raw.split(";")[0];
    const index = pair.indexOf("=");
    if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

async function api(method, route, body, form = false) {
  const headers = {};
  const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  if (cookie) headers.cookie = cookie;
  let payload;
  if (body) {
    headers["content-type"] = form
      ? "application/x-www-form-urlencoded"
      : "application/json; charset=utf-8";
    payload = form ? new URLSearchParams(body).toString() : JSON.stringify(body);
  }
  const response = await fetch(`${BASE}${route}`, { method, headers, body: payload, redirect: "manual" });
  storeCookies(response);
  const text = await response.text();
  try {
    return { status: response.status, json: JSON.parse(text) };
  } catch {
    return { status: response.status, json: null };
  }
}

/* ------------------------------------------------------------- CDP glue */
let socket;
let nextId = 0;
const pending = new Map();
const requests = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result?.value;
}

const dialogText = `(() => {
  const dialog = document.querySelector('[role="dialog"]');
  return dialog ? dialog.textContent || "" : "";
})()`;

const hasRenderButton = `(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return false;
  return [...dialog.querySelectorAll("button")].some((node) => {
    const text = (node.textContent || "").trim();
    return text === "رندر تصویر" || text === "رندر مجدد";
  });
})()`;

const main = async () => {
  const password = "Lumens#2026";
  const email = `credit.${Math.random().toString(36).slice(2, 8)}@lumens.test`;
  const phone = `09${Math.floor(100000000 + Math.random() * 899999999)}`;

  const signup = await api("POST", "/api/auth/signup", {
    fullName: "Credit Gate Tester",
    email,
    phone,
    password,
    role: "student",
  });
  check("signup 201", signup.status === 201);

  const csrf = await api("GET", "/api/auth/csrf");
  await api(
    "POST",
    "/api/auth/callback/credentials",
    { csrfToken: csrf.json?.csrfToken, email, password, callbackUrl: `${BASE}/`, json: "true" },
    true,
  );

  const token = jar.get("next-auth.session-token");
  if (!token) throw new Error("no session cookie captured");

  const profile = path.join(os.tmpdir(), `lumens-cdp-${Date.now()}`);
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${profile}`,
      "--window-size=1440,1200",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    let version = null;
    for (let attempt = 0; attempt < 40 && !version; attempt += 1) {
      await sleep(500);
      try {
        version = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json();
      } catch {
        version = null;
      }
    }
    if (!version) throw new Error("chrome CDP did not start");

    const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const target = targets.find((item) => item.type === "page");
    if (!target) throw new Error("no page target");

    socket = new WebSocket(target.webSocketDebuggerUrl);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Network.requestWillBeSent") {
        requests.push(message.params.request.url);
        return;
      }
      if (!message.id || !pending.has(message.id)) return;
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    };
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Network.setCookie", {
      name: "next-auth.session-token",
      value: token,
      url: BASE,
      path: "/",
      httpOnly: true,
    });

    await send("Page.navigate", { url: `${BASE}/#engine` });
    await sleep(7000);

    const opened = await evaluate(`(() => {
      const button = [...document.querySelectorAll("button")].find((node) =>
        (node.textContent || "").includes("اجرای موتور ایده‌پرداز"),
      );
      if (!button) return "no-cta";
      button.click();
      return "opened";
    })()`);
    check("landing CTA opens the engine dialog", opened === "opened");

    let sheetReady = false;
    for (let attempt = 0; attempt < 30 && !sheetReady; attempt += 1) {
      await sleep(500);
      sheetReady = await evaluate(hasRenderButton);
    }
    check("sheet loaded and render button rendered", sheetReady === true);

    /* Throttle the CDP connection so the loading state is observable even when
       the sample provider answers instantly (product code is untouched). */
    await send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 700,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });

    /* --- 1. click render and observe the real request order --------------- */
    requests.length = 0;
    const clicked = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return "no-dialog";
      const button = [...dialog.querySelectorAll("button")].find(
        (node) => (node.textContent || "").trim() === "رندر تصویر",
      );
      if (!button) return "no-render-button";
      if (button.disabled) return "render-button-disabled";
      button.click();
      return "clicked";
    })()`);
    check("render button clicked", clicked === "clicked");

    /* loading state must appear before the image */
    let loadingSeen = false;
    let loadingText = "";
    for (let attempt = 0; attempt < 25 && !loadingSeen; attempt += 1) {
      await sleep(150);
      const text = await evaluate(dialogText);
      if (/بررسی سهمیه|در حال رندر/.test(text)) {
        loadingSeen = true;
        loadingText = /بررسی سهمیه/.test(text) ? "بررسی سهمیه…" : "در حال رندر…";
      }
    }
    check("loading state shown while rendering", loadingSeen);
    check("loading status text observed", loadingText.length > 0);
    await evaluate(`(() => { window.scrollTo(0, 0); return true; })()`);
    const loadingShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("qa-engine-loading.png", Buffer.from(loadingShot.data, "base64"));

    /* image must replace the prompt text */
    let image = null;
    for (let attempt = 0; attempt < 60 && !image; attempt += 1) {
      await sleep(500);
      image = await evaluate(`(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const img = [...dialog.querySelectorAll("img")].find((node) =>
          /\\/ai-engine\\/|\\/renders\\/|\\/api\\/render\\/proxy/.test(node.currentSrc || node.src),
        );
        if (!img) return null;
        return { src: img.currentSrc || img.src, width: img.naturalWidth, height: img.naturalHeight };
      })()`);
      if (image && image.width > 0) break;
    }
    check("generated image displayed", Boolean(image && image.width > 0));
    check(
      "image comes from the render API / proxy",
      Boolean(image && /\/api\/render\/proxy|\/ai-engine\/|\/renders\//.test(image.src)),
    );

    const quotaIndex = requests.findIndex((url) => url.includes("/api/render/quota"));
    const generateIndex = requests.findIndex((url) => url.includes("/api/render/generate"));
    check("quota request happened", quotaIndex >= 0);
    check("generate request happened", generateIndex >= 0);
    check("quota checked BEFORE generating", quotaIndex >= 0 && generateIndex >= 0 && quotaIndex < generateIndex);

    const summary = await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const text = dialog ? dialog.textContent || "" : "";
      return {
        hasGeneratedLabel: text.includes("تصویر واقعی تولیدشده"),
        creditsLine: (text.match(/[۰-۹0-9]+ رندر رایگان باقی مانده/) || [])[0] || "",
      };
    })()`);
    check("card shows the generated image label", summary?.hasGeneratedLabel === true);

    const finalShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("qa-engine-render.png", Buffer.from(finalShot.data, "base64"));

    // Back to full speed for the remaining assertions.
    await send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });

    /* --- 2. exhaust credits and prove the gate blocks the POST ----------- */
    const quota = await api("GET", "/api/render/quota");
    const remaining = quota.json?.remainingCredits ?? 0;
    for (let index = 0; index < remaining; index += 1) {
      await api("POST", "/api/render/generate", {
        prompt: "Exhausting credits with a valid architectural prompt for the gate test.",
        aspectRatio: "1:1",
      });
    }
    const afterExhaust = await api("GET", "/api/render/quota");
    check("credits exhausted via API", afterExhaust.json?.remainingCredits === 0);

    requests.length = 0;
    await evaluate(`(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const button = [...dialog.querySelectorAll("button")].find(
        (node) => (node.textContent || "").trim() === "رندر مجدد",
      );
      button?.click();
      return Boolean(button);
    })()`);
    await sleep(2500);

    const gateText = await evaluate(dialogText);
    const postAfterExhaust = requests.filter((url) => url.includes("/api/render/generate")).length;
    const quotaAfterExhaust = requests.filter((url) => url.includes("/api/render/quota")).length;

    check("with 0 credits the dialog shows the Persian quota message", gateText.includes("سهمیه رندر رایگان شما به پایان رسیده"));
    check("with 0 credits no POST reaches /api/render/generate", postAfterExhaust === 0);
    check("with 0 credits the quota endpoint was still checked", quotaAfterExhaust >= 1);

    const guardShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("qa-engine-quota-guard.png", Buffer.from(guardShot.data, "base64"));

    console.log(
      JSON.stringify(
        { image, requestsAfterClick: requests.slice(0, 3), gateTextLength: gateText.length },
        null,
        2,
      ),
    );
  } finally {
    try {
      await send("Browser.close");
    } catch {
      /* ignore */
    }
    socket?.close?.();
    chrome.kill();
  }

  const failed = checks.filter((item) => !item.ok);
  console.log(failed.length === 0 ? "UI_CREDIT_GATE_OK" : `${failed.length} UI CHECK(S) FAILED`);
  process.exit(failed.length === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error("UI check crashed:", error);
  process.exit(2);
});
