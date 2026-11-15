/** Slow OpenAI-compatible mock (3s) so the loading state is observable. */
import { createServer } from "node:http";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

const server = createServer((request, response) => {
  if (request.url?.startsWith("/fake.png")) {
    response.writeHead(200, { "content-type": "image/png", "content-length": PNG.length });
    response.end(PNG);
    return;
  }

  if (request.url?.startsWith("/v1/images/generations")) {
    console.log("generation start", new Date().toISOString());
    setTimeout(() => {
      console.log("generation done", new Date().toISOString());
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ data: [{ url: "http://localhost:4123/fake.png" }] }));
    }, 3000);
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not-found" }));
});

server.listen(4123, () => console.log("slow mock provider listening on 4123"));
