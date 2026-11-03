// Temporary QA helper: capture a real screenshot of a hash target after the
// page's entrance animations and images have settled. Removed after review.
import fs from "node:fs";

const [, , url, out, widthArg, heightArg, selector] = process.argv;
const width = Number(widthArg ?? 1440);
const height = Number(heightArg ?? 1250);

const port = process.env.CDP_PORT ?? "9222";
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Chrome page target found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 640,
});
await send("Page.navigate", { url });
await new Promise((resolve) => setTimeout(resolve, 12000));

await send("Runtime.evaluate", {
  expression: "document.fonts.ready.then(() => true)",
  awaitPromise: true,
});

if (selector) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ behavior: "instant", block: "start" })`,
  });
  await new Promise((resolve) => setTimeout(resolve, 1800));
}

const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));

const meta = await send("Runtime.evaluate", {
  expression: `JSON.stringify({
    title: document.title,
    scrollY: Math.round(window.scrollY),
    sectionTop: Math.round(document.querySelector(${JSON.stringify(selector ?? "#engine")})?.getBoundingClientRect().top ?? -1),
    badges: [...document.querySelectorAll("#engine span")].map((node) => node.textContent?.trim()).filter((text) => text && /AFTER|BEFORE|MATERIAL|CONCRETE|GLASS/.test(text)).slice(0, 6),
    images: [...document.querySelectorAll("#engine img")].map((img) => ({ src: img.currentSrc.split("/").pop(), done: img.complete, w: img.naturalWidth })),
  })`,
  returnByValue: true,
});

console.log(meta.result.value);
socket.close();
