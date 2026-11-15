const target =
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&h=900&q=80";
const proxied = `http://localhost:3100/api/render/proxy?url=${encodeURIComponent(target)}`;

const response = await fetch(proxied);
const buffer = await response.arrayBuffer();
console.log("status:", response.status);
console.log("content-type:", response.headers.get("content-type"));
console.log("bytes:", buffer.byteLength);
console.log("body-preview:", Buffer.from(buffer).toString("utf8").slice(0, 200));
