# Syncrom AI 🤖

Groq (süni intellekt söhbəti), Puter.js (səsləndirmə) və Firebase (giriş + tarixçə) ilə işləyən AI platforması. 5 ixtisaslaşmış model, şəkil analizi, Wikipedia mənbələri. Frontend **React + TypeScript** (Vite), backend **Express** (yalnız API).

## Arxitektura

```
server.js        — Express API (/api/chat, /api/models, /api/tts...) + React build-i xidmət edir
web/              — React + TypeScript frontend (Vite, React Router, Framer Motion)
  src/pages/      — Landing, Chat (Syncrom AI), Vella, Schala
  src/components/ — ChatShell, Sidebar, Composer, MessageBubble, ModelPicker və s. (hər iki tema paylaşır)
  src/components/schala/ — SchalaFileTree, SchalaChat (Schala-ya xas)
  src/hooks/      — useChatController (bütün söhbət məntiqi)
  src/lib/        — api, firebase, storage, markdown, image, speech, schala
vella/            — Vella-nın persona.md + knowledge/ (server bunu oxuyur)
electron/         — Masaüstü tətbiq giriş faylları (main, vella-main, schala-main + schala-preload)
```

## Quraşdırma

```bash
npm install
npm --prefix web install
```

## İşə salmaq

**İnkişaf (hot-reload, iki server paralel):**

```bash
npm run dev
```

**İstehsalat (React build + Express bir portda):**

```bash
npm start
```

- **http://localhost:3000/** — tanıtım (landing) səhifəsi
- **http://localhost:3000/chat** — Syncrom AI çat tətbiqi
- **http://localhost:3000/vella** — Syncrom Vella (tək-modelli, ayrı görünüş)

`npm start` avtomatik `web/dist`-i tikir, sonra Express-i başladır. Yalnız frontend-i yenidən tikmək üçün: `npm run build:web`.

## Masaüstü tətbiq (Electron)

```bash
npm run electron          # bütün Syncrom AI (Alina/Keyla/Vella/Trila seçici ilə)
npm run electron:vella    # yalnız Syncrom Vella, ayrı pəncərə
npm run electron:schala   # Schala — AI kod editoru (aşağıya bax)
```

Hər iki əmr əvvəlcə React tətbiqini tikir, sonra Electron pəncərəsini açır. Quraşdırma faylı (.exe) hazırlamaq üçün:

```bash
npm run dist:win          # Syncrom AI installer → dist/
npm run dist:vella:win    # Syncrom Vella installer → dist-vella/
```

### Schala — AI kod editoru (Cursor/VS Code-vari)

`npm run electron:schala` real bir qovluq açıb faylları redaktə edə bilən, Keyla-nın "Kod Köməkçisi" alətlərinə (kod icrası, veb axtarış) sahib ayrı bir masaüstü pəncərəsi açır — Cursor/VS Code-un IDE layoutunu, Syncrom AI-ın öz ağ-qara dizaynı ilə birləşdirir (öz loqosu, `public/Schala logo.png`, başlıqda və xoş-gəldin ekranında görünür):

- **Platformaya uyğun başlıq zolağı** — macOS-da nativ "traffic light" düymələri saxlanılır (`titleBarStyle:"hiddenInset"`), Windows/Linux-da tam öz-dizayn edilmiş çərçivəsiz pəncərə (minimize/maximize/close). Ortada axtarış zolağı (`Ctrl+K`/`Ctrl+P` sürətli fayl axtarışını açır).
- **Fəaliyyət zolağı (activity bar)** — Explorer, Search, Source Control funksionaldır; Run/Debug/Extensions/Ayarlar/Hesab hazırda vizual olaraq mövcuddur, amma "tezliklə" statusunda (bilərəkdən funksionallıq iddia edilmir).
- **Fayl ağacı** — rəngli fayl-tipi nişanları (TS/JS/JSON/CSS və s.), git statusu nöqtələri (`git status --porcelain`). Nöqtə ilə başlayan fayllar/`.env`, `node_modules`/`.git` TƏHLÜKƏSİZLİK ÜÇÜN ağacda göstərilmir. Heç bir qovluq açılmayıbsa, "NO FOLDER OPENED" vəziyyəti Open Folder/Open File/Clone Repository düymələrini göstərir.
- **Source Control paneli** — cari branch + dəyişmiş/izlənməyən faylların siyahısı, klikləyib aç.
- **Xoş-gəldin ekranı** (heç fayl açıq olmayanda) — loqo, 4 əməl kartı (Open Folder / Open File / Clone Repository / New File) və "Recent Projects" (localStorage-da saxlanılır, klikləyib bir kliklə yenidən aç).
- **Monaco redaktoru** — əsl VS Code Dark+ teması (`vs-dark`), minimap daxil, breadcrumb, çoxfayllı tab-lar, `Ctrl+S` saxla, `Ctrl+W` tab bağla, `Ctrl+Tab` tab-lar arası keç, `Ctrl+P`/`Ctrl+K` sürətli fayl axtarışı.
- **Sağ panel — CHAT / COMPOSER / TERMINAL:**
  - **Chat** — "Welcome to Schala" ekranı, tez əməllər (izah et/refaktor et/error handling/testlər), son söhbətlər (localStorage-da saxlanılır). AI faylı dəyişəndə çatda XAM KOD GÖSTƏRİLMİR — yalnız nə etdiyinin izahı (prosesi) və "‹fayl adı› yeniləndi" qeydi görünür, kodun özü birbaşa diskə yazılır. Breadcrumb-dakı "Geri al" son dəyişikliyi geri qaytarır (bir-səviyyəli).
  - **Composer** — eyni anda açıq olan BİR NEÇƏ faylı birdən dəyişə bilir (AI cavabında hər fayl üçün "FAYL: yol" + kod bloku, avtomatik hamısı yazılır).
  - **Terminal** — xterm.js ilə render olunan sadələşdirilmiş terminal (spawn+pipe, **əsl PTY (node-pty) DEYİL** — adi əmrlər (npm/git/node) işləyir, tam-ekranlı interaktiv proqramlar (vim/htop) düzgün render olunmaya bilər).
- Brauzerdə (Electron olmadan) `/schala` marşrutu real fayl girişi olmadığı üçün sadə bir "yalnız masaüstündə işləyir" mesajı göstərir.

**Təhlükəsizlik:** fayl IPC-ləri (`readFile`/`writeFile`) main prosesdə "Qovluq aç"la seçilmiş kök qovluqla SKOPLANIR — renderer (və ya AI-ın təklif etdiyi yol) heç vaxt `../` ilə bu qovluqdan kənara çıxa bilmir. `contextIsolation`/`sandbox` aktivdir, preload skripti yalnız dar IPC funksiyalarını ötürür. AI-ın avtomatik yazma icazəsi olduğu üçün "Geri al" bir təhlükəsizlik toru kimi əlavə olunub.

`.env` faylı quraşdırma paketinin içinə qoşulur ki, tətbiq API açarları olmadan da işə düşsün — **bu o deməkdir ki, paylaşdığın .exe faylını açan hər kəs API açarlarına çata bilər**, ona görə hazır paketi kənar insanlarla paylaşmazdan əvvəl bunu nəzərə al.

## Modellər

| Model | İxtisas | Xüsusiyyət |
|---|---|---|
| **Alina 1.6** | Analitik köməkçi | Dərin analiz, hesabatlar |
| **Alina 1.7** | Analitik köməkçi Pro | + 📷 şəkil/cədvəl/qrafik analizi |
| **Keyla 5.8** | Kod mütəxəssisi | Debug, arxitektura, code review, **Kod Köməkçisi** rejimi (aşağıya bax) |
| **Syncrom Vella** | B2B CRM & Satış | Lead qiymətləndirmə (BANT), korporativ analitika, B2B müştəri xidmətləri |
| **Trila 1.4** | Virtual müəllim | Addım-addım izah, imtahana hazırlıq |

Yeni model əlavə etmək üçün [server.js](server.js)-də `MODELS` obyektinə yeni giriş yaz — ad, rəng, təsvir və persona promptu kifayətdir, frontend avtomatik `/api/models`-dən oxuyub göstərir.

### Vella-nı fərdiləşdirmək

[vella/persona.md](vella/persona.md) faylı Vella-nın xarakterini müəyyən edir — redaktə et, server yenidən başlamadan təsir edir. [vella/knowledge/](vella/knowledge/) qovluğuna `.md`/`.txt` faylları qoysan (məhsul siyahısı, qiymətlər, FAQ və s.), onlar avtomatik Vella-nın kontekstinə əlavə olunur.

## İmkanlar

- 🔐 **Giriş sistemi** — Google ilə, e-poçt/şifrə ilə və ya qonaq rejimi (yalnız Syncrom AI; Vella login tələb etmir)
- 💾 **Söhbət tarixçəsi** — hesabla girəndə Firestore-da, qonaq/Vella rejimində brauzerdə saxlanılır
- 📑 **Çoxlu söhbət** — yan paneldə söhbətlər siyahısı, avtomatik başlıqlar, hər söhbət öz modelini yadda saxlayır
- ⚡ **Canlı axın (streaming)** — cavablar yazıldıqca ekranda görünür, "Dayandır" düyməsi ilə
- ↻ **Yenidən yarat** — son cavabı bəyənmədinsə yenidən istə
- ➕ **"+" menyusu** — composer-in solundakı "+" düyməsi şəkil əlavə et, şəkil yarat və Deep Think seçimlərini bir yerə toplayır
- 📷 **Şəkil analizi** — Alina 1.7 seçiləndə "+" menyusunda "Şəkil əlavə et" görünür (cədvəl, qrafik, sənəd, foto analiz edir)
- 🎨 **Şəkil yaratma (pulsuz)** — "+" menyusundan "Şəkil yarat"ı aktivləşdirib istədiyini təsvir et, Pollinations.ai ilə pulsuz şəkil yaradılır (Groq sorğunu avtomatik ingiliscəyə çevirir — Pollinations Azərbaycanca prompt-ları düzgün anlamır)
- 🧠 **Deep Think** — "+" menyusundan aktivləşdir: sualdan açar söz çıxarır, Wikipedia-da (AZ+EN) araşdırır, addım-addım əsaslandırma tələb edən sistem təlimatı ilə daha dərin, mənbəli cavab verir
- 💻 **Kod blokları** — highlight.js ilə əsl sintaksis rənglənməsi, dil etiketi və "Kopyala" düyməsi
- 🤖 **Kod Köməkçisi (Keyla)** — "+" menyusundan aktivləşdir: model əsl alətlərə malikdir — **kod icrası** (JavaScript-i təcrid olunmuş, təhlükəsiz mühitdə işlədib əsl nəticəni göstərir, sadəcə "güman etmir") və **veb axtarış** (cari məlumat üçün internetdən axtarır, mənbə göstərir). Eyni menyudan sənəd/kod faylı yükləyib AI-a kontekst kimi verə bilərsən
- ✎ **Mesajı redaktə et** — istənilən öz mesajını redaktə edib yenidən göndər, o nöqtədən sonrakı tarixçə silinir
- 🔎 **Söhbətlərdə axtarış və adını dəyiş** — yan paneldə söhbətləri başlığa görə axtar, qələm ikonu ilə adını dəyiş
- ⬇ **Söhbəti ixrac et** — cari söhbəti Markdown (.md) faylı kimi endir
- 📱 **Responsiv dizayn** — mobil/planşet ölçülərində sürüşən yan panel, uyğunlaşan composer və başlıqlar
- 🔊 **Səsləndirmə** — Puter.js ilə cavabları səsləndir, avto-səs rejimi, ekvalayzer animasiyası
- 🎤 **Səsli daxiletmə** — mikrofonla danışaraq yaz (Chrome/Edge)
- 🎬 **Animasiyalı interfeys** — Framer Motion ilə mesaj/keçid animasiyaları, hər iki temada (Syncrom qara-ağ, Vella lacivərd-qırmızı) ortaq komponentlər üzərindən

## Firebase quraşdırması (vacib!)

Giriş sisteminin işləməsi üçün [Firebase Console](https://console.firebase.google.com/project/syncromai)-da bunları aktiv et:

1. **Authentication → Sign-in method** bölməsində:
   - **Email/Password** provayderini aktiv et
   - **Google** provayderini aktiv et
2. **Firestore Database** yarat (əgər yoxdursa) və **Rules** bölməsinə bu qaydaları yaz:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Bu qaydalar hər istifadəçinin yalnız öz söhbətlərini görməsini təmin edir — bunsuz məlumatlar ya hamıya açıq olar, ya da heç yazılmaz.

> Qeyd: söhbətlərdə göndərilən şəkillər Firestore/localStorage-a saxlanmır (sənəd ölçüsü limitinə görə) — yalnız cari sessiyada görünür, tarixçəyə "şəkil əlavə edildi" qeydi düşür.

## Kod Köməkçisinin təhlükəsizliyi

Keyla-nın "Kod Köməkçisi" rejimindəki `execute_code` aləti istifadəçi kodunu **ayrıca, boş ENV-li (heç bir API açarı ötürülmür) uşaq prosesdə**, Node-un `vm` modulu + `--experimental-permission` bayrağı (fs/uşaq-proses/worker girişini blokla) ilə icra edir, vaxt limiti (4-6 saniyə) tətbiq olunur. Bu, layihənin miqyası üçün əsaslı bir sandbox-dır, lakin Docker/gVisor səviyyəsində tam təcrid deyil — genişmiqyaslı ictimai istifadə planlaşdırırsansa, konteyner-əsaslı təcrid tövsiyə olunur.

## Tənzimləmələr (.env)

| Dəyişən | Təsvir |
|---|---|
| `GROQ_API_KEY` | Groq API açarı |
| `GROQ_MODEL` | Ümumi söhbət modeli — Alina 1.6, Vella, Trila (default: `llama-3.3-70b-versatile`) |
| `GROQ_MODEL_VISION` | Şəkil analiz modeli — Alina 1.7 (default: `qwen/qwen3.6-27b`) |
| `GROQ_MODEL_CODE` | Kod modeli — Keyla 5.8 (default: `openai/gpt-oss-120b`) |
| `GROQ_MODEL_CODE` | Llama 3 70B modeli (kod üçün) |

> ⚠️ `.env` faylı `.gitignore`-a əlavə olunub — API açarlarını heç vaxt git-ə göndərmə.
> Firebase konfiqurasiyası (`web/src/lib/firebase.ts` içində) klient tərəfi üçün nəzərdə tutulub və gizli deyil — təhlükəsizlik Firestore qaydaları ilə təmin olunur.
> Groq-da mövcud modellər hesabdan hesaba fərqlənə bilər — `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"` ilə yoxla. Seçilən model əlçatmaz olsa, server avtomatik `GROQ_MODEL`-ə keçir.
