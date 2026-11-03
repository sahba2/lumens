const base = "http://localhost:3210";

const get = async (path) => {
  const res = await fetch(base + path);
  return { status: res.status, html: await res.text() };
};

const home = await get("/");
const login = await get("/auth/login");

const inputTags = [...login.html.matchAll(/<input\b[^>]*>/g)].map((m) => m[0]);
const blockedInputs = inputTags.filter((tag) => /(^|\s)(disabled|readonly)(\s|=|>)/i.test(tag));
const pointerBlockedInputs = inputTags.filter((tag) => tag.includes("pointer-events-none"));

const checks = [
  ["home 200", home.status === 200],
  ["login 200", login.status === 200],
  ["header login is a dialog trigger", home.html.includes('aria-haspopup="dialog"')],
  ["header login is not a page link", !home.html.includes('href="/auth/login"')],
  ["auth modal markup absent until opened", !home.html.includes('role="dialog"')],
  ["mobile drawer stays click-through when closed", home.html.includes("lg:hidden pointer-events-none")],
  ["login page renders inputs", inputTags.length >= 2],
  ["email input exists", inputTags.some((tag) => tag.includes('name="email"'))],
  ["password input exists", inputTags.some((tag) => tag.includes('name="password"'))],
  ["no disabled/readOnly inputs", blockedInputs.length === 0],
  ["no pointer-events-none inputs", pointerBlockedInputs.length === 0],
  ["login page uses .field class", inputTags.some((tag) => tag.includes("field"))],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
}

console.log("inputs found:", inputTags.length);
console.log(failed === 0 ? "AUTH_UI_CHECKS_PASSED" : `${failed} AUTH UI CHECK(S) FAILED`);
