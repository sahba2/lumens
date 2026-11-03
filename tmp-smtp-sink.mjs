// Temporary SMTP capture server used to verify the welcome e-mail end-to-end.
// Usage: node tmp-smtp-sink.mjs [port] [captureFile]
import net from "node:net";
import fs from "node:fs";

const port = Number(process.argv[2] ?? 2525);
const captureFile = process.argv[3] ?? "tmp-mail-capture.txt";
let messages = 0;

const reply = (socket, line) => socket.write(`${line}\r\n`);

const server = net.createServer((socket) => {
  let buffer = "";
  let inData = false;
  let current = "";

  socket.setEncoding("utf8");
  reply(socket, "220 fake-smtp LUMENS test sink");

  socket.on("data", (chunk) => {
    buffer += chunk;

    let index;
    while ((index = buffer.indexOf("\r\n")) !== -1) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);

      if (inData) {
        if (line === ".") {
          inData = false;
          messages += 1;
          fs.appendFileSync(captureFile, `\n===== MESSAGE ${messages} =====\n${current}\n`);
          current = "";
          reply(socket, "250 2.0.0 Ok: queued");
        } else {
          current += `${line}\r\n`;
        }
        continue;
      }

      const command = line.slice(0, 4).toUpperCase();

      if (command === "EHLO" || command === "HELO") {
        socket.write("250-fake-smtp\r\n250-SIZE 10485760\r\n250-8BITMIME\r\n250 HELP\r\n");
      } else if (command === "MAIL" || command === "RCPT" || command === "RSET" || command === "NOOP") {
        reply(socket, "250 2.1.0 Ok");
      } else if (command === "DATA") {
        inData = true;
        current = "";
        reply(socket, "354 End data with <CR><LF>.<CR><LF>");
      } else if (command === "QUIT") {
        reply(socket, "221 2.0.0 Bye");
        socket.end();
      } else {
        reply(socket, "250 2.0.0 Ok");
      }
    }
  });

  socket.on("error", () => {});
});

server.listen(port, "127.0.0.1", () => {
  console.log(`fake-smtp listening on 127.0.0.1:${port} -> ${captureFile}`);
});
