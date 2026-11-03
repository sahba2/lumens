import { readFileSync } from "node:fs";

const html = readFileSync("tmp-courses.html", "utf8");

const count = (needle) => html.split(needle).length - 1;

console.log("length:", html.length);
console.log("Blender count:", count("Blender"), "SketchUp count:", count("SketchUp"));
console.log("Lumion count:", count("Lumion"));
console.log("filter label همه دسته‌ها:", count("همه دسته‌ها"));
console.log("tab همه:", count(">همه<"));
console.log("svg covers:", count("covers"));
console.log("__next_f pushes:", count("__next_f"));

const i = html.indexOf("SketchUp");
console.log("SketchUp context:", JSON.stringify(html.slice(Math.max(0, i - 260), i + 260)));
