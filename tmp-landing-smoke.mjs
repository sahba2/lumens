/**
 * Temporary smoke test for the rescaled landing hero.
 * Verifies the server-rendered markup of `/` (the drop zone is a client island,
 * so its *idle* markup must already be in the SSR output).
 */
const base = process.env.SMOKE_BASE ?? "http://localhost:3111";

const response = await fetch(`${base}/`);
const html = await response.text();

const checks = {
  status: response.status,
  heroHeadline: html.includes("اسکچ را رها کنید"),
  heroSubline: html.includes("از طرح خام دستی تا رندر سینمایی"),
  dropZoneCopy: html.includes("طرح خام یا اسکچ را رها کنید"),
  idleStateAttribute: html.includes('data-state="idle"'),
  pickButton: html.includes("انتخاب فایل از سیستم"),
  sampleButton: html.includes("امتحان با اسکچ نمونه"),
  uploadAnchor: html.includes('id="upload"'),
  trustRow: html.includes("شیت متنی رایگان و نامحدود"),
  showcaseKept: html.includes('id="showcase"'),
  searchDockKept: html.includes('id="ai-search-title"'),
  oldPromiseListGone: !html.includes("رندر واریاسیون در ۸ ثانیه با پایپ‌لاین"),
  oldCtaGone: !html.includes("شروع رایگان با LUMENS"),
};

console.log(JSON.stringify(checks, null, 2));

const failed = Object.entries(checks).filter(([key, value]) =>
  key === "status" ? value !== 200 : value !== true,
);

if (failed.length > 0) {
  console.error("FAILED:", failed.map(([key]) => key).join(", "));
  process.exit(1);
}

console.log("ALL LANDING CHECKS PASSED");
