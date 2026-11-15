import { readFileSync, writeFileSync } from "node:fs";

const file = "app/globals.css";
let s = readFileSync(file, "utf8").replace(/\r\n/g, "\n");

function rep(from, to) {
  const count = s.split(from).length - 1;
  if (count !== 1) throw new Error("expected 1, found " + count + " :: " + from.slice(0, 80).replace(/\n/g, "\\n"));
  s = s.split(from).join(to);
}
function all(from, to) {
  const count = s.split(from).length - 1;
  s = s.split(from).join(to);
  console.log(count + " x " + from + " -> " + to);
}

rep(`    background:
      radial-gradient(90% 70% at 80% 0%, rgba(212, 175, 55, 0.2), transparent 60%),
      radial-gradient(80% 65% at 10% 20%, rgba(96, 116, 196, 0.16), transparent 64%),
      linear-gradient(180deg, #0a0a0a 0%, #0b0a09 48%, #070708 100%);
  }`, `    background:
      radial-gradient(78% 62% at 78% 0%, rgba(199, 168, 91, 0.18), transparent 62%),
      radial-gradient(70% 58% at 12% 18%, rgba(120, 130, 150, 0.12), transparent 66%),
      linear-gradient(180deg, #24272D 0%, #212429 46%, #1B1E23 100%);
  }

  /* Warm light bleeding from the bottom corner behind the hero copy. */
  .hero-aurora {
    position: absolute;
    inset: auto -12% -38% -12%;
    height: 72%;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(52% 62% at 20% 100%, rgba(199, 168, 91, 0.3), transparent 72%),
      radial-gradient(44% 56% at 86% 92%, rgba(199, 168, 91, 0.18), transparent 74%);
    filter: blur(48px);
    opacity: 0.95;
  }`);

rep(`    background:
      radial-gradient(62% 56% at 78% 20%, rgba(212, 175, 55, 0.26), transparent 64%),
      radial-gradient(55% 50% at 16% 70%, rgba(104, 116, 196, 0.2), transparent 66%),
      linear-gradient(180deg, #0b0a09 0%, #08080b 58%, #050507 100%);`, `    background:
      radial-gradient(62% 56% at 78% 20%, rgba(199, 168, 91, 0.26), transparent 64%),
      radial-gradient(55% 50% at 16% 70%, rgba(120, 130, 150, 0.16), transparent 66%),
      linear-gradient(180deg, #24272D 0%, #1E2126 58%, #171A1E 100%);`);

rep(`    background:
      radial-gradient(115% 80% at 50% 28%, transparent 34%, rgba(5, 5, 7, 0.74) 100%),
      linear-gradient(180deg, rgba(10, 10, 10, 0.68) 0%, transparent 24%, transparent 66%, #0a0a0a 100%);`, `    background:
      radial-gradient(115% 80% at 50% 28%, transparent 34%, rgba(23, 26, 30, 0.74) 100%),
      linear-gradient(180deg, rgba(27, 30, 35, 0.68) 0%, transparent 24%, transparent 66%, #212429 100%);`);

rep(`      background-color: rgba(13, 13, 18, 0.92);`, `      background-color: rgba(33, 36, 41, 0.94);`);

all("rgba(212, 175, 55,", "rgba(199, 168, 91,");
all("rgba(242, 226, 168,", "rgba(227, 205, 154,");
all("rgba(10, 10, 10,", "rgba(27, 30, 35,");
all("rgba(5, 5, 7,", "rgba(23, 26, 30,");
all("rgba(4, 4, 6,", "rgba(20, 23, 27,");
all("rgba(8, 8, 11,", "rgba(27, 30, 35,");
all("#0b0b0f", "#22262B");
all("#070709", "#1B1E23");
all("#08080b", "#1E2126");
all("#06060a", "#1A1D21");
all("#0b0a09", "#24272D");
all("#050507", "#171A1E");
all("#0c0c11", "#1E2126");
all("#08080a", "#1E2126");

const leftover = (s.match(/#0a0a0a/g) || []).length;
console.log("leftover #0a0a0a: " + leftover);

writeFileSync(file, s.replace(/\n/g, "\r\n"), "utf8");
console.log("globals.css pass 2b done");
