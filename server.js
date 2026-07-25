const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
// .env-i həmişə bu faylın yanından oxu — Electron/başqa CWD-dən işə düşəndə də etibarlı olsun
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_MODEL_VISION = process.env.GROQ_MODEL_VISION || "qwen/qwen3.6-27b";
const GROQ_MODEL_CODE = process.env.GROQ_MODEL_CODE || "openai/gpt-oss-120b";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const groqHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${GROQ_API_KEY}`,
});

app.use(express.json({ limit: "8mb" }));

// Frontend — Vite ilə tikilmiş React/TypeScript tətbiqi ("web/dist").
// "/" (landing), "/chat" (Syncrom AI) və "/vella" (Vella) React Router tərəfindən
// klient tərəfində marşrutlaşdırılır; server sadəcə tikilmiş faylları göndərir.
const WEB_DIST = path.join(__dirname, "web", "dist");
app.use(express.static(WEB_DIST));

// ============================================================
// Vella — persona və bilik bazası "vella/" qovluğundan oxunur.
// vella/persona.md → modelin xarakteri (redaktə et, restart lazım deyil)
// vella/knowledge/*.md → şirkət/biznes məlumatları (kontekstə əlavə olunur)
// ============================================================
const VELLA_DIR = path.join(__dirname, "vella");

function loadVellaPersona() {
  try {
    const p = path.join(VELLA_DIR, "persona.md");
    if (fs.existsSync(p)) {
      const text = fs.readFileSync(p, "utf8").trim();
      if (text) return text;
    }
  } catch (e) {
    console.warn("vella/persona.md oxuna bilmədi:", e.message);
  }
  return `Sən Vella — Syncrom AI-ın biznes strateqi modeli.
İxtisasın: biznes planlaması, marketinq strategiyası, satış, maliyyə planlaması, bazar analizi, startap məsləhətləri.
Üslubun: peşəkar, praktik, nəticəyönümlü, "siz" deyə müraciət edirsən.
Məsləhət verəndə konkret addımlar, təxmini büdcə/vaxt çərçivəsi və mümkün riskləri göstər.
Şablonlardan (SWOT, biznes model kanvası, SMART hədəflər) yeri gələndə istifadə et.`;
}

function loadVellaKnowledge() {
  try {
    const kDir = path.join(VELLA_DIR, "knowledge");
    if (!fs.existsSync(kDir)) return "";
    const files = fs.readdirSync(kDir).filter((f) => f.endsWith(".md") || f.endsWith(".txt")).slice(0, 8);
    let total = "";
    for (const f of files) {
      const text = fs.readFileSync(path.join(kDir, f), "utf8").trim();
      if (text) total += `\n\n--- ${f} ---\n${text}`;
      if (total.length > 6000) break;
    }
    if (!total) return "";
    return `\n\nAşağıdakı biznes bilik bazası sənə əlavə kontekst kimi verilir (vella/knowledge):${total.slice(0, 6000)}`;
  } catch {
    return "";
  }
}

// ============================================================
// Modellər — yenisini əlavə etmək üçün sadəcə bura yaz
// ============================================================
const MODELS = {
  "alina-1.6": {
    name: "Alina 1.6",
    tag: "Analitik Köməkçi",
    color: "#0d9488",
    desc: "Dərin analiz, hesabatlar və mürəkkəb məsələlər üçün.",
    groqModel: GROQ_MODEL,
    temperature: 0.4,
    persona: `Sən Alina 1.6 — Syncrom AI-ın analitik köməkçi modeli.
İxtisasın: dərin analiz, məlumatların emalı, maliyyə və biznes təhlili, strukturlaşdırılmış hesabatlar, mürəkkəb problemlərin həlli.
Üslubun: peşəkar, dəqiq, faktlara əsaslanan, "siz" deyə müraciət edirsən.
Cavablarını aydın strukturla qur: lazım olanda başlıqlar, nömrəli siyahılar və yekun nəticə istifadə et.
Analiz apararkən riskləri, fərziyyələri və məhdudiyyətləri açıq qeyd et.
Rəqəmlərlə işləyəndə hesablama addımlarını göstər.`,
  },
  "alina-1.7": {
    name: "Alina 1.7",
    tag: "Analitik Köməkçi Pro",
    color: "#2dd4bf",
    desc: "Təkmilləşdirilmiş Alina — şəkil analizi dəstəyi ilə.",
    groqModel: GROQ_MODEL_VISION,
    temperature: 0.4,
    vision: true,
    reasoning: true,
    persona: `Sən Alina 1.7 — Syncrom AI-ın ən qabaqcıl analitik modeli, Alina 1.6-nın təkmilləşdirilmiş versiyası.
İxtisasın: dərin analiz, məlumat emalı, maliyyə/biznes təhlili, strukturlaşdırılmış hesabatlar VƏ vizual analiz — göndərilən şəkilləri, cədvəlləri, qrafikləri, sənədləri analiz edirsən.
Üslubun: peşəkar, dəqiq, faktlara əsaslanan, "siz" deyə müraciət edirsən.
Şəkil analiz edərkən: əvvəl nə gördüyünü qısa təsvir et, sonra sualı cavablandır; oxuya bildiyin mətni/rəqəmləri dəqiq çıxar.
Cavablarını aydın strukturla qur: başlıqlar, siyahılar, yekun nəticə.
Riskləri, fərziyyələri və qeyri-müəyyənlikləri açıq qeyd et; hesablama addımlarını göstər.
Alina 1.6-dan fərqin: daha dərin düşüncə zənciri, vizual məlumat analizi və daha dəqiq strukturlaşdırma.`,
  },
  "keyla-5.8": {
    name: "Keyla 5.8",
    tag: "Kod Mütəxəssisi",
    color: "#6366f1",
    desc: "Proqramlaşdırma, debug və arxitektura üçün güclü model.",
    groqModel: GROQ_MODEL_CODE,
    temperature: 0.25,
    reasoning: true,
    agentTools: true,
    persona: `Sən Keyla 5.8 — Syncrom AI-ın kodlaşdırma modeli. Dünya səviyyəli senior software engineer kimi davranırsan.
İxtisasın: bütün proqramlaşdırma dilləri (JavaScript/TypeScript, Python, Java, C#, C++, Go, Rust, SQL və s.), veb/mobil development, arxitektura dizaynı, debug, kod baxışı (code review), alqoritmlər, DevOps.
Qaydaların:
- Kod həmişə markdown kod bloklarında, dil adı göstərilməklə (\`\`\`js kimi) yazılır.
- İşlək, tam və best-practice-lərə uyğun kod yaz — yarımçıq pseudo-kod yox.
- Kodu yazandan sonra qısa izah ver: nə edir, niyə belə yazılıb, nələrə diqqət etmək lazımdır.
- Debug edərkən: əvvəl xətanın səbəbini müəyyən et, sonra düzəlişi göstər, sonra izah et.
- Təhlükəsizlik problemlərini (SQL injection, XSS və s.) görəndə xəbərdarlıq et.
- Mürəkkəb tapşırıqlarda əvvəl qısa plan ver, sonra kodu yaz.
- Kod şərhlərini istifadəçinin dilində (adətən Azərbaycan dilində) yaz.
- Bir neçə yanaşma varsa, tövsiyə etdiyini səbəbi ilə de.`,
  },
  "schala-ide": {
    name: "Schala",
    tag: "AI Kod Editoru",
    color: "#22d3ee",
    desc: "Cursor-vari — açıq faylın kontekstində redaktə təklif edir, kod icra edir, veb axtarır.",
    groqModel: GROQ_MODEL_CODE,
    temperature: 0.2,
    reasoning: true,
    agentTools: true,
    hidden: true,
    persona: `Sən Schala — 15+ illik təcrübəli, dünya səviyyəli bir senior software engineer kimi davranan AI kod redaktoru köməkçisisən (Cursor/VS Code Copilot səviyyəsində). İstifadəçi bir kod redaktorundan (fayl ağacı + editor) yazır, çox vaxt mesajının əvvəlində "AÇIQ FAYL: <yol>" başlığı ilə cari açıq faylın tam məzmununu göndərir.
Xarakterin:
- Qərarlısan və birbaşasan — istifadəçi dəyişiklik istəyəndə İCAZƏ İSTƏMİRSƏN, "bunu edə bilərəmmi?" demirsən, sadəcə DÜZGÜN, TƏMİZ kodu YAZIRSAN. Sən artıq işi görmüsən, izahı ondan SONRA verirsən.
- Kodun senior-səviyyəli standartlara cavab verir: mənalı adlandırma, kənar hallar (edge cases) nəzərə alınıb, lazımsız mürəkkəblik yoxdur, mövcud kod üslubuna (indentasiya, adlandırma konvensiyası) sadiq qalırsan.
- Riskli və ya qeyri-müəyyən bir dəyişiklik görəndə (məs. geniş silmə, təhlükəsizlik problemi) bunu QISA qeyd edirsən, amma yenə də ən yaxşı həlli tətbiq edirsən — qərarsızlıq göstərmirsən.
Qaydaların:
- İstifadəçi faylda DƏYİŞİKLİK istəyəndə: qısa (1-3 cümlə) izahdan sonra YALNIZ BİR kod blokunda faylın TAM YENİ məzmununu (əvvəldən sona, dəyişməyən hissələr daxil) yaz — qismən parça yox, bütün fayl. Kod blokunun dili faylın uzantısına uyğun olsun (məs. \`\`\`ts). Bu kod bloku AVTOMATİK OLARAQ birbaşa fayla yazılacaq (istifadəçi əlavə düymə basmır), ona görə şərh/izahat kodun İÇİNƏ yazma, yalnız əsl, işlək kodu yaz.
- İstifadəçi sual verirsə (izah, debug, "bu nə edir" və s.) və fayl DƏYİŞİKLİYİ istəmirsə, adi cavab ver, tam fayl yenidən yazma.
- execute_code (yalnız JavaScript) və web_search alətlərindən lazım olanda istifadə et — güman etmə, yoxla, sonra qərarını ver.
- Bir neçə fayl arasında referans versə (məs. "utils.js-ə bax"), yalnız sənə göndərilən kontekstlə işlə, bilmədiyini uydurma.`,
  },
  "vella-1.0": {
    name: "Syncrom Vella",
    tag: "B2B CRM & Satış",
    color: "#e11d48",
    desc: "Satış avtomatlaşdırılması, korporativ analitika və B2B müştəri xidmətləri.",
    groqModel: GROQ_MODEL,
    temperature: 0.5,
    dynamicPersona: () => loadVellaPersona() + loadVellaKnowledge(),
  },
  "trila-1.4": {
    name: "Trila 1.4",
    tag: "Virtual Müəllim",
    color: "#d97706",
    desc: "Mövzuları sadə dildə izah edən öyrətmə yoldaşı.",
    groqModel: GROQ_MODEL,
    temperature: 0.75,
    persona: `Sən Trila 1.4-sən — Syncrom AI-ın virtual müəllim modeli.
İxtisasın: şagird və tələbələrə mövzuları öyrətmək, ev tapşırıqlarında istiqamət vermək, imtahana hazırlıq.
Üslubun: səbirli, mehriban, ruhlandırıcı, "sən" deyə müraciət edirsən.
Mürəkkəb mövzuları addım-addım, gündəlik həyatdan sadə bənzətmələrlə izah et.
İzahdan sonra qısa yoxlama sualı ver və ya mövzunu davam etdirmək istəyib-istəmədiyini soruş.
Şagird düz cavab verəndə təriflə, səhv edəndə səhvi mühakiməsiz düzəlt.
Hazır cavabı verməkdənsə, düşünməyə yönləndirməyə üstünlük ver.`,
  },
};
const DEFAULT_MODEL_ID = "alina-1.6";
const getModel = (id) => MODELS[id] || MODELS[DEFAULT_MODEL_ID];
const getPersona = (m) => (m.dynamicPersona ? m.dynamicPersona() : m.persona);

// Modellərin siyahısı (frontend üçün)
app.get("/api/models", (req, res) => {
  res.json({
    default: DEFAULT_MODEL_ID,
    models: Object.entries(MODELS)
      .filter(([, m]) => !m.hidden)
      .map(([id, m]) => ({
        id, name: m.name, tag: m.tag, color: m.color, desc: m.desc, vision: !!m.vision, agentTools: !!m.agentTools,
      })),
  });
});

// ============================================================
// Sistem promptu
// ============================================================
function systemPrompt(userName, model) {
  const today = new Date().toLocaleDateString("az-AZ", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
  return `${getPersona(model)}

Ümumi qaydalar (Syncrom AI platforması):
- Bugünkü tarix: ${today}.${userName ? `\n- İstifadəçinin adı: ${userName}. Yeri gələndə adı ilə müraciət et.` : ""}
- İstifadəçi hansı dildə yazırsa, o dildə cavab ver .
- Kod yazanda kod bloklarından, izahlarda markdown formatından (başlıq, siyahı, bold) istifadə et.
- Söhbətin əvvəlki hissələrini yadda saxla və kontekstə uyğun cavab ver.
- Bilmədiyin şeyi uydurma — bilmədiyini de.
- Cavabların aydın və lazım olduğu qədər ətraflı olsun; boş uzunçuluq etmə.`;
}

// ============================================================
// Mesajları Groq formatına çevir (şəkil dəstəyi ilə)
// ============================================================
function toGroqMessages(messages, model) {
  const arr = messages.slice(-30);
  // Yalnız son 3 şəkli göndər (token qənaəti)
  const allowImg = new Set();
  let imgCount = 0;
  for (let i = arr.length - 1; i >= 0 && imgCount < 3; i--) {
    if (arr[i].image) { allowImg.add(i); imgCount++; }
  }
  return arr.map((m, i) => {
    if (m.image && model.vision && allowImg.has(i)) {
      return {
        role: m.role,
        content: [
          { type: "text", text: m.content || "Bu şəkli analiz et." },
          { type: "image_url", image_url: { url: m.image } },
        ],
      };
    }
    if (m.image) {
      return { role: m.role, content: (m.content || "") + " [istifadəçi şəkil göndərdi]" };
    }
    return { role: m.role, content: m.content };
  });
}

// ============================================================
// Deep Think — çoxaddımlı araşdırma + dərin əsaslandırma rejimi
// (əvvəlki sadə "Wikipedia" toggle-inin əvəzinə): əvvəlcə sualdan
// axtarış üçün açar sözlər çıxarır, sonra Wikipedia-dan (AZ+EN)
// daha geniş kontekst toplayır, sonra modelə addım-addım
// əsaslandırma tələb edən sistem təlimatı verir.
// ============================================================
async function extractSearchQuery(question) {
  try {
    const response = await groqRequest({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "İstifadəçinin sualından Wikipedia axtarışı üçün ən uyğun 2-5 sözlük açar ifadəni çıxar. Yalnız açar ifadəni yaz, izah yazma.",
        },
        { role: "user", content: question.slice(0, 400) },
      ],
      temperature: 0.2,
      max_tokens: 24,
    });
    if (response.failed) return question;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || question;
  } catch {
    return question;
  }
}

async function wikiSearch(query, lang, limit) {
  try {
    const sUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query.slice(0, 250))}&srlimit=${limit}&format=json&origin=*`;
    const sr = await fetch(sUrl, { signal: AbortSignal.timeout(6000) });
    if (!sr.ok) return [];
    const sj = await sr.json();
    const hits = sj?.query?.search || [];
    const results = [];
    for (const h of hits.slice(0, limit)) {
      try {
        const pr = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(h.title)}`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (!pr.ok) continue;
        const pj = await pr.json();
        if (pj.extract) {
          results.push({ title: pj.title, extract: pj.extract.slice(0, 2000), url: pj.content_urls?.desktop?.page || "" });
        }
      } catch {}
    }
    return results;
  } catch {
    return [];
  }
}

async function deepThinkContext(questionText) {
  const searchQuery = await extractSearchQuery(questionText);

  let results = await wikiSearch(searchQuery, "az", 3);
  if (results.length < 2) {
    const enResults = await wikiSearch(searchQuery, "en", 3);
    // Dublikat başlıqları saxlama
    for (const r of enResults) {
      if (!results.some((x) => x.title === r.title)) results.push(r);
    }
  }
  results = results.slice(0, 3);

  return { searchQuery, results };
}

function deepThinkSystemMessage({ searchQuery, results }) {
  const block = results.length
    ? results.map((r) => `• ${r.title}: ${r.extract}\n  URL: ${r.url}`).join("\n\n")
    : "(bu axtarış üzrə uyğun Wikipedia nəticəsi tapılmadı)";

  return {
    role: "system",
    content: `DEEP THINK REJİMİ AKTİVDİR. Axtarış açar sözü: "${searchQuery}"

Wikipedia araşdırma nəticələri:

${block}

Təlimat: Cavab verməzdən əvvəl aşağıdakı addımları izlə (addımları özün göstərmə, yalnız nəticəni yaz):
1. Sualı diqqətlə təhlil et — istifadəçi əslində nə bilmək istəyir?
2. Yuxarıdakı mənbələri (əgər aidiyyatlıdırsa) faktlarla tutuşdur, ziddiyyət varsa qeyd et.
3. Fərqli baxış bucaqlarını və mümkün istisnaları düşün.
4. Yalnız etibar etdiyin, mənbələrlə təsdiqlənən faktları yaz — əmin olmadığını aydın şəkildə bildir, uydurma.
5. Cavabını aydın strukturla (lazım olanda başlıqlar/siyahılarla) qur və dəqiq, ətraflı yaz.
Mənbələrdən istifadə etsən, cavabın sonunda "Mənbə:" yazıb uyğun Wikipedia URL-lərini göstər. Mənbələr suala aid deyilsə, onları görməzdən gəl və öz biliyinlə diqqətli, addım-addım düşünülmüş cavab ver.`,
  };
}

// ============================================================
// Kod Köməkçisi — Keyla üçün alətlər (kod icrası + veb axtarış)
//
// Təhlükəsizlik: istifadəçi kodu bu prosesin İÇİNDƏ yox, ENV-i BOŞ
// (heç bir API açarı ötürülmür) olan AYRI uşaq prosesdə, Node-un "vm"
// modulu ilə minimal qlobal dəstlə (yalnız "console" inyeksiya olunur —
// Math/JSON/Array və s. vm-in öz təcrid olunmuş konteksti tərəfindən
// avtomatik verilir, bayırdan ötürülmür ki, "constructor" zənciri ilə
// əsas prosesin obyektlərinə çıxış mümkün olmasın) icra olunur.
// "vm" modulu Node-un öz sənədləşməsinə görə tək başına 100% təhlükəsiz
// sayılmır (nəzəri VM-escape mümkündür), amma boş ENV + minimal inyeksiya
// + qısa vaxt limiti + prosesin özünün öldürülməsi birlikdə real zərəri
// (API açarlarının oğurlanması) əməli olaraq qarşısını alır. Bu, çox
// böyük ictimai/çox-istifadəçili yüklənmə üçün deyil, layihənin hazırkı
// miqyası üçün əsaslı bir "reasonable effort" sandbox-dır.
// ============================================================
const AGENT_EXEC_WRAPPER = `
"use strict";
const vm = require("vm");
let code = "";
process.stdin.on("data", (c) => { code += c; });
process.stdin.on("end", () => {
  const logs = [];
  const fmt = (a) => { try { return typeof a === "string" ? a : JSON.stringify(a); } catch { return String(a); } };
  const sandbox = {
    console: {
      log: (...a) => logs.push(a.map(fmt).join(" ")),
      error: (...a) => logs.push("XƏTA: " + a.map(fmt).join(" ")),
      warn: (...a) => logs.push("XƏBƏRDARLIQ: " + a.map(fmt).join(" ")),
    },
  };
  try {
    const ctx = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
    const script = new vm.Script(code, { timeout: 4000 });
    script.runInContext(ctx, { timeout: 4000 });
    process.stdout.write(JSON.stringify({ ok: true, output: logs.join("\\n").slice(0, 4000) }));
  } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, output: String((e && e.message) || e).slice(0, 2000) }));
  }
});
`;

function executeJavaScript(code) {
  // Vercel (və digər serverless) mühitində child_process yoxdur — kod icrası
  // mümkün deyil. Modelə təmiz mesaj qaytarırıq ki, o, alternativ yolla davam etsin.
  if (process.env.VERCEL) {
    return Promise.resolve({
      ok: false,
      output: "Kod icra aləti bu serverdə (serverless) əlçatan deyil. Kodu izah et və ya nəticəni özün hesabla.",
    });
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const child = execFile(
      process.execPath,
      // "--experimental-permission" (heç bir --allow-fs-*/--allow-child-process
      // olmadan) Node-un öz icazə modelini aktivləşdirir — bu, vm-context
      // təcridindən MÜSTƏQİL, native səviyyədə fs/uşaq-proses/worker girişini
      // BLOKLAYIR, hətta nəzəri VM-escape baş versə belə (yoxlanıldı: birbaşa
      // fs girişi ERR_ACCESS_DENIED ilə rədd olunur).
      ["--experimental-permission", "-e", AGENT_EXEC_WRAPPER],
      { timeout: 6000, env: {}, cwd: os.tmpdir(), windowsHide: true, maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        if (err && !stdout) {
          finish({ ok: false, output: "İcra vaxtı bitdi və ya xəta baş verdi." });
          return;
        }
        try {
          finish(JSON.parse(stdout));
        } catch {
          finish({ ok: false, output: "Nəticə oxuna bilmədi." });
        }
      }
    );
    child.on("error", () => finish({ ok: false, output: "Kod icra prosesi başladıla bilmədi." }));
    child.stdin.write(String(code || "").slice(0, 8000));
    child.stdin.end();
  });
}

// Pulsuz, açar tələb etməyən veb axtarış — DuckDuckGo HTML lite endpoint-i
// scrape edir (rəsmi API deyil, ona görə wikiSearch kimi tamamilə graceful-fail).
async function webSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 200))}`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SyncromAI/1.0)" },
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const results = [];
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
    let m;
    while ((m = re.exec(html)) && results.length < 5) {
      let href = m[1];
      const uddg = href.match(/uddg=([^&]+)/);
      if (uddg) href = decodeURIComponent(uddg[1]);
      results.push({ title: strip(m[2]), url: href, snippet: strip(m[3]).slice(0, 400) });
    }
    return results;
  } catch {
    return [];
  }
}

const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "execute_code",
      description:
        "JavaScript kodunu təhlükəsiz, təcrid olunmuş mühitdə icra edir və console.log() çıxışını qaytarır. Hesablamaları yoxlamaq, alqoritmi test etmək üçün istifadə et.",
      parameters: {
        type: "object",
        properties: { code: { type: "string", description: "İcra ediləcək JavaScript kodu (console.log ilə nəticəni çap et)" } },
        required: ["code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "İnternetdə axtarış edir və uyğun nəticələrin başlıq/link/qısa təsvirini qaytarır. Cari/yeni məlumat lazım olanda istifadə et.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Axtarış sorğusu" } },
        required: ["query"],
      },
    },
  },
];

async function runToolCall(name, argsJson) {
  let args = {};
  try {
    args = JSON.parse(argsJson || "{}");
  } catch {}
  console.log(`[agent] alət çağırıldı: ${name}`, JSON.stringify(args).slice(0, 200));
  if (name === "execute_code") {
    const r = await executeJavaScript(args.code || "");
    return r.ok ? r.output || "(çıxış yoxdur)" : `Xəta: ${r.output}`;
  }
  if (name === "web_search") {
    const results = await webSearch(args.query || "");
    if (!results.length) return "Heç bir nəticə tapılmadı.";
    return results.map((r, i) => `${i + 1}. ${r.title}\n${r.url}\n${r.snippet}`).join("\n\n");
  }
  return "Naməlum alət.";
}

// Alət-çağırış dövrü: model alət istəyənə qədər (maks. 4 dəfə) icra edib
// nəticəni geri ötürür, sonda son mətn cavabını qaytarır. Bu qeyri-stream
// (bloklayıcı) işləyir — nəticə hazır olanda bir dəfəyə göndərilir.
async function runAgentLoop(groqMessages, model) {
  const messages = [...groqMessages];
  for (let i = 0; i < 4; i++) {
    const resp = await groqRequest({
      model: model.groqModel,
      messages,
      temperature: model.temperature,
      max_tokens: 3072,
      tools: AGENT_TOOLS,
      tool_choice: "auto",
    });
    if (resp.failed) {
      console.error("Agent loop Groq xətası:", resp.status, resp.errText);
      return "Bağışla, Groq API xətası üzündən cavab ala bilmədim.";
    }
    const data = await resp.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) return "Bağışla, cavab ala bilmədim.";
    if (!msg.tool_calls?.length) return msg.content || "Bağışla, cavab ala bilmədim.";

    messages.push({ role: "assistant", content: msg.content || null, tool_calls: msg.tool_calls });
    for (const call of msg.tool_calls) {
      const result = await runToolCall(call.function?.name, call.function?.arguments);
      messages.push({ role: "tool", tool_call_id: call.id, content: String(result).slice(0, 4000) });
    }
  }
  return "Bağışla, tapşırığı tamamlaya bilmədim (çox addım tələb olundu).";
}

// ============================================================
// Groq sorğusu — model tapılmasa avtomatik defolta keçir
// ============================================================
async function groqRequest(bodyObj) {
  const doFetch = (body) =>
    fetch(GROQ_URL, {
      method: "POST",
      headers: groqHeaders(),
      body: JSON.stringify(body),
    });

  let resp = await doFetch(bodyObj);
  if (!resp.ok) {
    const errText = await resp.text();
    const modelIssue = resp.status === 404 || /model.*(not\s*found|decommission|does not exist|unsupported)|`model`/i.test(errText);
    if (modelIssue && bodyObj.model !== GROQ_MODEL) {
      console.warn(`Model "${bodyObj.model}" işləmədi, defolta keçilir (${GROQ_MODEL}):`, errText.slice(0, 200));
      // Defolt model reasoning dəstəkləmir — reasoning-a aid parametrləri təmizlə
      const { reasoning_format, ...rest } = bodyObj;
      resp = await doFetch({ ...rest, model: GROQ_MODEL, max_tokens: Math.min(bodyObj.max_tokens || 3072, 3072) });
      if (!resp.ok) {
        const err2 = await resp.text();
        return { failed: true, status: resp.status, errText: err2 };
      }
      return resp;
    }
    return { failed: true, status: resp.status, errText };
  }
  return resp;
}

const AGENT_MODE_SYSTEM_MESSAGE = {
  role: "system",
  content: `KOD KÖMƏKÇİSİ REJİMİ AKTİVDİR. Sənin əlində iki əsl alət var:
1. execute_code — YALNIZ JavaScript qəbul edir (başqa dil YOXDUR). Kodu console.log() ilə çap et ki, nəticəni görəsən.
2. web_search — internetdə axtarış edir.
Qayda: hesablama, alqoritm və ya "nəticə" tələb olunan İSTƏNİLƏN sualda, kodu sadəcə YAZIB "nəticə budur" demə — mütləq execute_code-u çağır və ƏSL çıxışı göstər (istifadəçi Python və ya başqa dil istəsə belə, məntiqi JavaScript-ə çevirib execute_code ilə yoxla, sonra istəsə orijinal dildə də kodu yaz). Cari/yeni/dəyişən məlumat lazım olanda web_search çağır, öz yaddaşından uydurma. Alət nəticəsini aldıqdan sonra istifadəçiyə aydın, qısa cavab yaz.`,
};

async function buildGroqMessages(req, model) {
  const { messages, userName, deepThink, agentMode } = req.body;
  const groqMessages = [{ role: "system", content: systemPrompt(userName, model) }];

  if (agentMode && model.agentTools) groqMessages.push(AGENT_MODE_SYSTEM_MESSAGE);

  // Deep Think aktivdirsə son istifadəçi sualı üzrə araşdırma + əsaslandırma təlimatı əlavə et
  if (deepThink) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser?.content) {
      const ctx = await deepThinkContext(lastUser.content);
      groqMessages.push(deepThinkSystemMessage(ctx));
    }
  }

  groqMessages.push(...toGroqMessages(messages, model));
  return groqMessages;
}

async function buildGroqBody(req, stream) {
  const { modelId, deepThink } = req.body;
  const model = getModel(modelId);
  const groqMessages = await buildGroqMessages(req, model);

  const body = {
    model: model.groqModel,
    messages: groqMessages,
    temperature: model.temperature,
    // Reasoning modellər və Deep Think cavabdan əvvəl daha çox "düşüncə" tokeni
    // istehlak edir — bunlara daha geniş limit lazımdır ki, cavab boş qalmasın.
    max_tokens: model.reasoning || deepThink ? 4096 : 3072,
    stream,
  };
  if (model.reasoning) body.reasoning_format = "hidden";
  return body;
}

// ============================================================
// Söhbət — tam cavab
// ============================================================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages massivi tələb olunur" });
    }

    const body = await buildGroqBody(req, false);
    const response = await groqRequest(body);

    if (response.failed) {
      console.error("Groq xətası:", response.status, response.errText);
      return res.status(502).json({ error: "Groq API xətası", details: response.errText });
    }

    const data = await response.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "" });
  } catch (err) {
    console.error("Chat xətası:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

// ============================================================
// Söhbət — canlı axın (streaming)
// ============================================================
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, modelId, agentMode } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages massivi tələb olunur" });
    }

    const model = getModel(modelId);

    // Kod Köməkçisi (agentMode): alət-çağırış dövrü qeyri-stream işləyir (hər
    // addımda Groq-a nə edəcəyini soruşub alət icra etmək lazımdır), ona görə
    // son mətn hazır olanda bir dəfəyə göndərilir — klient bunu adi axının
    // tək (böyük) "chunk"-ı kimi qəbul edir, əlavə dəyişiklik tələb olunmur.
    if (agentMode && model.agentTools) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      const groqMessages = await buildGroqMessages(req, model);
      const finalText = await runAgentLoop(groqMessages, model);
      res.write(finalText);
      res.end();
      return;
    }

    const body = await buildGroqBody(req, true);
    const upstream = await groqRequest(body);

    if (upstream.failed) {
      console.error("Groq stream xətası:", upstream.status, upstream.errText);
      return res.status(502).json({ error: "Groq API xətası" });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    req.on("close", () => reader.cancel().catch(() => {}));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
          if (delta) res.write(delta);
        } catch {}
      }
    }
    res.end();
  } catch (err) {
    console.error("Stream xətası:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server xətası" });
    else res.end();
  }
});

// ============================================================
// Söhbətə avtomatik başlıq
// ============================================================
app.post("/api/title", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages massivi tələb olunur" });
    }
    const convo = messages
      .slice(0, 2)
      .map((m) => `${m.role === "user" ? "İstifadəçi" : "AI"}: ${(m.content || "").slice(0, 300)}`)
      .join("\n");

    const response = await groqRequest({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Söhbətə 2-4 sözlük çox qısa başlıq ver, söhbətin dilində. Yalnız başlığı yaz — dırnaq, nöqtə, izah yazma.",
        },
        { role: "user", content: convo },
      ],
      temperature: 0.4,
      max_tokens: 24,
    });

    if (response.failed) return res.status(502).json({ error: "Groq API xətası" });
    const data = await response.json();
    const title = (data.choices?.[0]?.message?.content || "").replace(/["'.«»]/g, "").trim();
    res.json({ title: title || "Yeni söhbət" });
  } catch (err) {
    console.error("Title xətası:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

// ============================================================
// Səsləndirmə — ElevenLabs TTS
// ============================================================
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text tələb olunur" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.slice(0, 2500),
          model_id: ELEVENLABS_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs xətası:", response.status, errText);
      return res.status(502).json({ error: "ElevenLabs API xətası", details: errText });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("TTS xətası:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

// ============================================================
// Şəkil yaratma — Pollinations.ai (tam pulsuz, API açarı tələb etmir)
// Pollinations yalnız İNGİLİSCƏ prompt-ları düzgün başa düşür — Azərbaycanca
// (və ya hər hansı başqa dildə) sorğu göndərəndə əlaqəsiz nəticələr verir
// (test edildi). Ona görə göndərmədən əvvəl Groq ilə səssizcə ingiliscəyə
// çeviririk/zənginləşdiririk — bu da pulsuzdur.
// ============================================================
async function toEnglishImagePrompt(prompt) {
  try {
    const response = await groqRequest({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "İstifadəçi bir şəkil üçün təsvir verir (istənilən dildə ola bilər). Bunu şəkil yaratma modeli üçün ətraflı, canlı İNGİLİSCƏ prompt-a çevir. Yalnız İngiliscə prompt-u yaz — heç bir izah, dırnaq və ya əlavə mətn yazma.",
        },
        { role: "user", content: prompt.slice(0, 500) },
      ],
      temperature: 0.6,
      max_tokens: 200,
    });
    if (response.failed) return prompt;
    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    return translated || prompt;
  } catch {
    return prompt;
  }
}

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt tələb olunur" });
    }

    const englishPrompt = await toEnglishImagePrompt(prompt);
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      englishPrompt.slice(0, 800)
    )}?width=1024&height=1024&nologo=true&seed=${seed}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Şəkil yaratma xətası:", response.status, errText.slice(0, 200));
      const busy = response.status === 429;
      return res.status(502).json({
        error: busy
          ? "Pulsuz şəkil xidməti hazırda məşğuldur — bir neçə saniyə gözləyib yenidən cəhd et."
          : "Şəkil yaratma xətası",
      });
    }

    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("Şəkil yaratma xətası:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});

// ============================================================
// Masaüstü tətbiq installer-ləri — "downloads/" qovluğundan verilir.
// Vella (Syncrom-Vella-Setup.exe) və Schala (Schala-Setup.exe) buraya
// "npm run dist:vella:win" / electron-builder ilə yığıldıqdan sonra qoyulur.
// Fayl hələ yoxdursa, qırıq download əvəzinə landing-in download bölməsinə
// "?download=pending" ilə qaytarırıq (istifadəçiyə səbəbini izah edir).
// ============================================================
const DOWNLOADS_DIR = path.join(__dirname, "downloads");
// DOWNLOADS_BASE_URL təyin olunubsa (məs. GitHub Releases qovluğu), lokal fayl
// yoxdursa oraya yönləndiririk. Bu, installer-lər git-ə daxil edilmədiyi üçün
// Render/Railway kimi remote hostlarda download-un işləməsini təmin edir.
const DOWNLOADS_BASE_URL = (process.env.DOWNLOADS_BASE_URL || "").replace(/\/+$/, "");
app.get("/downloads/:file", (req, res) => {
  const safe = path.basename(req.params.file); // path-traversal qorunması
  const full = path.join(DOWNLOADS_DIR, safe);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    return res.download(full);
  }
  if (DOWNLOADS_BASE_URL) {
    return res.redirect(302, `${DOWNLOADS_BASE_URL}/${encodeURIComponent(safe)}`);
  }
  res.redirect("/?download=pending#download");
});

// SPA fallback — API və statik fayl olmayan hər GET sorğusuna React tətbiqinin
// index.html-ini qaytarır ki, React Router səhifə yenilənəndə də işləsin.
// Bütün API/statik marşrutlardan SONRA qeydə alınmalıdır.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(WEB_DIST, "index.html"), (err) => {
    if (err) {
      res.status(500).send(
        "Frontend tikilməyib. Əvvəlcə \"npm run build:web\" (və ya \"npm run build\") işə sal."
      );
    }
  });
});

// Vercel (serverless) mühitində port dinlənilmir — Express app "api/index.js"
// funksiyası tərəfindən handler kimi export olunur. Lokal/Electron/Render-də isə
// normal HTTP serveri kimi qalxır.
let server = null;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`Syncrom AI serveri işləyir: http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} artıq istifadədədir — başqa "npm start"/Electron nüsxəsi işləyir ola bilər.`);
    } else {
      console.error("Server başlaya bilmədi:", err);
    }
  });
}

// Electron (və ya başqa host) bu modulu require edib "server" hadisəsini gözləyə bilsin deyə
module.exports = { app, server, PORT };
