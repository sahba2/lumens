// Temporary: inspect the captured welcome e-mail + SMS payloads.
import fs from "node:fs";

const phone = process.argv[2] ?? "";
const mail = fs.existsSync("tmp-mail-capture.txt") ? fs.readFileSync("tmp-mail-capture.txt", "utf8") : "";
const smsRows = fs.existsSync("tmp-sms-capture.jsonl")
  ? fs
      .readFileSync("tmp-sms-capture.jsonl", "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((row) => (row.receptor ?? row.to) === phone)
  : [];
const lastSms = smsRows.at(-1);

console.log(`MAIL bytes: ${mail.length}`);
console.log(`MAIL has LUMENS wordmark: ${mail.includes("LUMENS")}`);
console.log(`MAIL has html part: ${/Content-Type: text\/html/i.test(mail)}`);
console.log(`MAIL has RTL marker: ${mail.includes('dir="rtl"') || mail.includes('dir=3D"rtl"')}`);
console.log(`MAIL has subject header: ${/^Subject:/m.test(mail)}`);
console.log(`SMS rows for ${phone}: ${smsRows.length}`);
console.log(`SMS text: ${JSON.stringify(lastSms?.message ?? lastSms?.text ?? "")}`);
console.log(`SMS has dashboard link: ${/\/dashboard$/.test((lastSms?.message ?? lastSms?.text ?? "").trim())}`);
