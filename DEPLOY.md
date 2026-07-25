# Deploy — Hamısı Vercel-də (A yolu)

Bu layihə tam olaraq **Vercel**-də işləyir:

- **Frontend** (`web/`, React+Vite) → Vercel statik olaraq build edib verir.
- **Backend** (`server.js`, Express) → `api/index.js` **Serverless Function** kimi işləyir.

`vercel.json` bütün `/api/*` və `/downloads/*` sorğularını serverless funksiyaya
yönləndirir, qalan hər şey React tətbiqinə (SPA) gedir. Frontend kodu dəyişmir —
onsuz da nisbi `/api/...` çağırır.

---

## 1. Vercel-ə deploy et

1. Kodu GitHub repo-suna push et (`ElvinAhmedovWeb/Syncrom-AI-`).
2. [vercel.com](https://vercel.com) → **Add New** → **Project** → bu repo-nu seç.
3. Build tənzimləmələri `vercel.json`-dan avtomatik gəlir — əl ilə dəyişmək lazım deyil.
4. **Environment Variables** əlavə et (Vercel → Project → Settings → Environment Variables):
   - `GROQ_API_KEY` — **məcburi** (chat üçün)
   - `ELEVENLABS_API_KEY` — **məcburi** (səs üçün)
   - `ELEVENLABS_VOICE_ID` — **məcburi** (səs üçün)
   - `DOWNLOADS_BASE_URL` — installer linkləri üçün (aşağı, bölmə 3)
   - `GROQ_MODEL`, `GROQ_MODEL_VISION`, `GROQ_MODEL_CODE`, `ELEVENLABS_MODEL` — **istəyə görə** (default-ları var)
5. **Deploy**. Bitəndə Vercel URL-i saytın ünvanıdır.

> Bütün açarlar yalnız serverless funksiyada (server tərəfdə) qalır — brauzerə çıxmır.

---

## 2. Nə İŞLƏYİR / nə İŞLƏMİR (vacib)

| Funksiya | Vercel-də |
|---|---|
| Chat (`/api/chat`, `/api/chat/stream`) | ✅ işləyir |
| Səs — TTS (`/api/tts`) | ✅ işləyir |
| Şəkil (`/api/generate-image`) | ✅ işləyir |
| Başlıq (`/api/title`), model siyahısı (`/api/models`) | ✅ işləyir |
| Veb axtarış aləti | ✅ işləyir |
| **Schala kod-icra aləti** (`execute_code`) | ❌ **söndürülüb** (serverless-də `child_process` yoxdur) — model təmiz "əlçatan deyil" cavabı verir |
| **İnstaller (.exe) download** | ⚠️ GitHub Releases-ə yönləndirilir (bölmə 3) |

> Kod-icra aləti yalnız **masaüstü (Electron)** və ya lokal serverdə işləyir.
> Vercel versiyasında avtomatik söndürülür — sayt qırılmır, sadəcə həmin alət olmur.

---

## 3. İnstaller (.exe) faylları — GitHub Releases

`.exe`-lər git-ə daxil edilmir (çox böyük) və Vercel fayl saxlama üçün uyğun deyil.
Ona görə GitHub Releases-də saxla:

1. GitHub repo → **Releases** → **Create a new release** → hər iki `.exe`-ni asset kimi yüklə:
   `Schala-Setup.exe`, `Syncrom-Vella-Setup.exe`.
2. Vercel env dəyişəni `DOWNLOADS_BASE_URL`-ə release qovluğunun URL-ini yaz, məs:
   `https://github.com/ElvinAhmedovWeb/Syncrom-AI-/releases/latest/download`
3. `server.js` avtomatik oraya 302 yönləndirir — sayt düymələri (`/downloads/Schala-Setup.exe`)
   dəyişmədən işləyəcək.

Lokalda fayllar `downloads/` qovluğunda olduğu üçün lokal server onları birbaşa verir.

---

## Nələrə diqqət
- **Env dəyişənlərini əlavə etməsən** chat/səs 500 verər.
- **Serverless timeout:** Vercel Hobby-də funksiya `maxDuration` 60 san-dir (vercel.json-da
  təyin edilib). Çox uzun cavablarda kəsilmə olarsa, bu limitə görədir.
- **Streaming** (`/api/chat/stream`) Vercel Node runtime-da işləyir; ilk deploy-dan sonra
  canlı yoxla.
- `.exe` linkləri üçün mütləq **bölmə 3**-ü tamamla, yoxsa download işləməz.
