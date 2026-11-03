import { readFileSync } from "node:fs";

const toText = (file) => {
  const html = readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const blender = toText("tmp-blender.html");
const sketchup = toText("tmp-sketchup.html");

const checks = [
  ["blender filter page shows blender course", blender.includes("بلندر")],
  ["blender filter page shows Cycles/Eevee lesson", blender.includes("Eevee")],
  ["blender filter page shows LUMENS instructor", blender.includes("تیم تخصصی لومنز")],
  ["sketchup filter page shows sketchup course", sketchup.includes("SketchUp Masterclass")],
  ["sketchup filter page shows Scenes lesson", sketchup.includes("Scenes")],
  ["sketchup filter page shows LUMENS instructor", sketchup.includes("تیم تخصصی لومنز")],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
}

console.log(failed === 0 ? "FILTER_CHECKS_PASSED" : `${failed} FILTER CHECK(S) FAILED`);

const at = blender.indexOf("بلندر");
console.log("blender context:", at >= 0 ? blender.slice(Math.max(0, at - 120), at + 200) : "n/a");
