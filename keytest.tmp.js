// Açar imzalama/yoxlama məntiqinin təhlükəsizlik sınağı
process.env.SYNCROM_API_SECRET = "test-secret-aaaaaaaaaaaaaaaaaaaaaaaa";
const crypto = require("crypto");

const API_KEY_PREFIX = "sk-syncrom";
const API_SECRET = process.env.SYNCROM_API_SECRET;
const b64url = (b) => Buffer.from(b).toString("base64url");
const signPayload = (p) => crypto.createHmac("sha256", API_SECRET).update(p).digest("base64url");

function issueApiKey(uid, ttlMs = 365 * 864e5) {
  const now = Date.now();
  const payload = { u: uid, k: crypto.randomBytes(8).toString("hex"), i: now, e: now + ttlMs };
  const p = b64url(JSON.stringify(payload));
  return `${API_KEY_PREFIX}.${p}.${signPayload(p)}`;
}

function verifyApiKey(raw) {
  if (typeof raw !== "string") return null;
  const parts = raw.trim().split(".");
  if (parts.length !== 3 || parts[0] !== API_KEY_PREFIX) return null;
  const [, payloadB64, sig] = parts;
  const expected = signPayload(payloadB64);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!p.u || !p.k || !p.e || Date.now() > p.e) return null;
    return { uid: p.u, keyId: p.k };
  } catch {
    return null;
  }
}

const T = [];
const check = (name, cond) => T.push([name, cond]);

const good = issueApiKey("user-123");
check("düzgün açar qəbul olunur", verifyApiKey(good)?.uid === "user-123");
check("açar prefiksi var", good.startsWith("sk-syncrom."));

// Saxtakarlıq: payload dəyişdirilib, imza köhnə
const [, p0, s0] = good.split(".");
const fakePayload = b64url(JSON.stringify({ u: "admin", k: "x", i: 1, e: Date.now() + 1e9 }));
check("payload dəyişdirilmiş açar RƏDD olunur", verifyApiKey(`sk-syncrom.${fakePayload}.${s0}`) === null);

// İmza dəyişdirilib
const badSig = s0.slice(0, -1) + (s0.slice(-1) === "A" ? "B" : "A");
check("imza dəyişdirilmiş açar RƏDD olunur", verifyApiKey(`sk-syncrom.${p0}.${badSig}`) === null);

// Başqa sirrlə imzalanmış açar
const otherSig = crypto.createHmac("sha256", "basqa-sirr").update(p0).digest("base64url");
check("başqa sirrlə imzalanmış açar RƏDD olunur", verifyApiKey(`sk-syncrom.${p0}.${otherSig}`) === null);

// Müddəti bitmiş
check("müddəti bitmiş açar RƏDD olunur", verifyApiKey(issueApiKey("u", -1000)) === null);

// Formatsız girişlər
for (const bad of ["", "abc", "sk-syncrom.x", "sk-syncrom..", null, undefined, 42, "Bearer sk-syncrom.a.b"]) {
  check("zibil giriş rədd olunur: " + JSON.stringify(bad), verifyApiKey(bad) === null);
}

// Uzunluğu fərqli imza timingSafeEqual-ı çökdürməməlidir
let crashed = false;
try {
  verifyApiKey(`sk-syncrom.${p0}.qisa`);
} catch {
  crashed = true;
}
check("qısa imza çökmə yaratmır", !crashed);

// Hər açar unikaldır
check("açarlar unikaldır", issueApiKey("u") !== issueApiKey("u"));

let bad = 0;
for (const [name, ok] of T) {
  if (!ok) bad++;
  console.log((ok ? "OK   " : "XƏTA ") + name);
}
console.log(bad === 0 ? "\nHAMISI KEÇDI (" + T.length + " sınaq)" : `\n${bad} SINAQ UĞURSUZ`);
