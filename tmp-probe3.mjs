import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("tmp-courses.html", "utf8");

// Drop the RSC flight payload scripts and keep only the visible markup.
const visibleMarkup = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");

const text = visibleMarkup
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ")
  .trim();

writeFileSync("tmp-courses-text.txt", text, "utf8");

const probes = ["بلندر", "Masterclass", "اسکچ‌اپ", "لومیون", "تومان", "رایگان"];
for (const probe of probes) {
  console.log(probe, "=>", text.includes(probe), "count:", text.split(probe).length - 1);
}
console.log("text length:", text.length);
const at = text.indexOf("بلندر");
console.log("context:", at >= 0 ? text.slice(Math.max(0, at - 160), at + 160) : "n/a");
