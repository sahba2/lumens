// Temporary checks for the sign-up notification dispatcher.
// Writes results to tmp-notify-result.json so the output is easy to read.
import fs from "node:fs";

const base = "http://localhost:3000";
const stamp = Date.now();
const email = `notify-${stamp}@lumens.test`;
const phone = `0912${String(stamp).slice(-7)}`;
const results = [];

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ label, ok, actual, expected });
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)})`);
}

const status = await (await fetch(`${base}/api/notifications/status`)).json();
const signupResponse = await fetch(`${base}/api/auth/signup`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ fullName: "Notify Probe", email, phone, password: "Lumens#12345", role: "student" }),
});
const signup = await signupResponse.json();

check("signup status", signupResponse.status, 201);
check("status endpoint ok", status.ok, true);
check("email flag present", typeof signup.email?.sent, "boolean");
check("sms flag present", typeof signup.sms?.sent, "boolean");

const summary = {
  email,
  phone,
  statusConfig: { email: status.email, sms: status.sms, ready: status.ready },
  flags: { email: signup.email, sms: signup.sms },
  results,
};
fs.writeFileSync("tmp-notify-result.json", `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`\n${results.filter((entry) => entry.ok).length}/${results.length} checks passed`);
