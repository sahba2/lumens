import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

const home = read("tmp-home.html");
const courses = read("tmp-courses.html");
const login = read("tmp-login.html");

const checks = [
  ["/courses has Blender tab label", courses.includes("Blender")],
  ["/courses has SketchUp tab label", courses.includes("SketchUp")],
  ["/courses has Blender course title", courses.includes("دوره جامع بلندر در معماری")],
  ["/courses has SketchUp course title", courses.includes("SketchUp Masterclass")],
  ["/courses has shared instructor", courses.includes("تیم تخصصی لومنز")],
  ["/courses has blender lesson 5", courses.includes("Neural Rendering")],
  ["/courses has sketchup lesson 5", courses.includes("پلاگین‌های هوش مصنوعی")],
  ["/courses references cover course-15", courses.includes("course-15.svg")],
  ["/courses references cover course-16", courses.includes("course-16.svg")],
  ["nav: خانه", home.includes("خانه")],
  ["nav: موتور هوش مصنوعی", home.includes("موتور هوش مصنوعی")],
  ["nav: دوره‌های تخصصی", home.includes("دوره‌های تخصصی")],
  ["nav: آبجکت‌های سه‌بعدی", home.includes("آبجکت‌های سه‌بعدی")],
  ["nav: مقالات سئو", home.includes("مقالات سئو")],
  ["nav: login href", home.includes('href="/auth/login"')],
  ["nav: free idea CTA", home.includes("شروع ایده رایگان")],
  ["/auth/login rendered", login.includes("حساب کاربری LUMENS")],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
}

console.log(failed === 0 ? "ALL_CHECKS_PASSED" : `${failed} CHECK(S) FAILED`);
