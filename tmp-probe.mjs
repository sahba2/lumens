import { readFileSync } from "node:fs";

const courses = readFileSync("tmp-courses.html", "utf8");

const probes = [
  ["c-15 id", courses.includes("c-15")],
  ["c-16 id", courses.includes("c-16")],
  ["course-15.svg", courses.includes("course-15.svg")],
  ["course-16.svg", courses.includes("course-16.svg")],
  ["persian blender word", courses.includes("بلندر")],
  ["escaped blender", courses.includes("\\u0628\\u0644\\u0646\\u062f\\u0631")],
  ["tamam", courses.includes("Masterclass")],
];

for (const [label, ok] of probes) console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);

const idx = courses.indexOf("course-15");
console.log("context:", JSON.stringify(courses.slice(Math.max(0, idx - 120), idx + 120)));
