/** Mock image backends: HF (binary png) + fal (JSON url) on :4124. */
import { createServer } from "node:http";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

const server = createServer((request, response) => {
  console.log(`${request.method} ${request.url} auth=${request.headers.authorization ?? "none"}`);

  if (request.url?.startsWith("/fake.png")) {
    response.writeHead(200, { "content-type": "image/png", "content-length": PNG.length });
    response.end(PNG);
    return;
  }

  // Hugging Face style: raw image bytes.
  if (request.url?.startsWith("/hf/")) {
    response.writeHead(200, { "content-type": "image/png", "content-length": PNG.length });
    response.end(PNG);
    return;
  }

  // fal style: JSON with an image url.
  if (request.url?.startsWith("/fal/")) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ images: [{ url: "http://localhost:4124/fake.png" }] }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not-found" }));
});

server.listen(4124, () => console.log("generation mock listening on 4124"));
