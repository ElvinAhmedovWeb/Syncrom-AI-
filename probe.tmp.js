require("dotenv").config({ path: ".env" });
const zlib = require("zlib");
const K = process.env.GROQ_API_KEY;

// Etibarlı PNG qurucusu (kitabxana olmadan) — solid rəngli kvadrat
function makePng(size, [r, g, b]) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  let table = null;
  function crc32(buf) {
    if (!table) {
      table = [];
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
      }
    }
    let c = 0xffffffff;
    for (const byte of buf) c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "execute_code",
      description: "Runs JavaScript and returns console.log output.",
      parameters: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
    },
  },
];

async function call(body) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + K },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  let j = {};
  try { j = JSON.parse(txt); } catch {}
  return { ok: r.ok, status: r.status, j, txt };
}

(async () => {
  const M = "qwen/qwen3.6-27b";
  const png = makePng(64, [220, 30, 40]); // 64x64 qirmizi
  const url = "data:image/png;base64," + png.toString("base64");
  console.log("PNG hazir:", png.length, "bayt");

  console.log("\n--- Sekil TEK (aletsiz) ---");
  const v = await call({
    model: M,
    messages: [{ role: "user", content: [{ type: "text", text: "Bu sekilde hansi reng var? Bir soz." }, { type: "image_url", image_url: { url } }] }],
    max_tokens: 900,
  });
  console.log(v.ok ? "  cavab: " + JSON.stringify((v.j.choices?.[0]?.message?.content || "").slice(0, 100)) : "  XETA " + v.status + " " + v.txt.slice(0, 200));

  console.log("\n--- Sekil + ALET birlikde ---");
  const b = await call({
    model: M,
    messages: [{ role: "user", content: [{ type: "text", text: "Bu sekildeki rengi de, sonra 12*7-ni execute_code ile hesabla." }, { type: "image_url", image_url: { url } }] }],
    tools: TOOLS,
    tool_choice: "auto",
    max_tokens: 1200,
  });
  if (!b.ok) console.log("  XETA " + b.status + " " + b.txt.slice(0, 300));
  else {
    const msg = b.j.choices?.[0]?.message;
    console.log("  tool_calls:", msg?.tool_calls ? msg.tool_calls.map((c) => c.function.name).join(",") : "YOX");
    console.log("  content:", JSON.stringify((msg?.content || "").slice(0, 160)));
  }
})();
