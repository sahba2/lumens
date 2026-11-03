// Temporary fake SMS gateway (Kavenegar + Melipayamak REST shapes).
// Usage: node tmp-sms-gateway.mjs [port] [captureFile]
import http from "node:http";
import fs from "node:fs";

const port = Number(process.argv[2] ?? 2526);
const captureFile = process.argv[3] ?? "tmp-sms-capture.jsonl";

function record(entry) {
  fs.appendFileSync(captureFile, `${JSON.stringify({ ...entry, at: new Date().toISOString() })}\n`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  const isKavenegarSend = url.pathname.endsWith("/sms/send.json");
  const isKavenegarVerify = url.pathname.endsWith("/verify/lookup.json");

  if (req.method === "GET" && (isKavenegarSend || isKavenegarVerify)) {
    record({
      provider: "kavenegar",
      path: url.pathname,
      receptor: url.searchParams.get("receptor"),
      sender: url.searchParams.get("sender"),
      message: url.searchParams.get("message"),
      token: url.searchParams.get("token"),
      template: url.searchParams.get("template"),
    });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        return: { status: 200, message: "تایید شد" },
        entries: [{ messageid: 4200 + Math.floor(Math.random() * 900) }],
      }),
    );
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/SendSMS/SendSMS") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { raw };
      }
      record({ provider: "melipayamak", ...parsed });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ Value: "98765", RetStatus: 1, StrRetStatus: "Ok" }));
    });
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not-found" }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`fake sms gateway on 127.0.0.1:${port} -> ${captureFile}`);
});
