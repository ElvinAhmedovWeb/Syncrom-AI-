import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { landingAz, landingEn, landingRu, landingTr } from "./i18nLanding";
import { aboutAz, aboutEn, aboutRu, aboutTr } from "./i18nAbout";

// ============================================================
// Çoxdillilik (i18n) — Azərbaycan, ingilis, rus, türk.
//
// Yeni dil əlavə etmək: LANGS-a bir sətir yaz, sonra aşağıda "az"
// lüğətinin eynisini yeni dil üçün doldur. Dict tipi "az"-dan çıxarılır,
// ona görə açar buraxsan TypeScript build zamanı xəta verəcək.
// ============================================================

export const LANGS = [
  { code: "az", label: "Azərbaycanca", short: "AZ", locale: "az-AZ" },
  { code: "en", label: "English", short: "EN", locale: "en-US" },
  { code: "ru", label: "Русский", short: "RU", locale: "ru-RU" },
  { code: "tr", label: "Türkçe", short: "TR", locale: "tr-TR" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

// Tərcümə rejiminin hədəf dilləri. Adlar öz dilində yazılıb — belə olanda
// tərcümə etmək lazım gəlmir və istifadəçi öz dilini həmişə tanıyır.
// Kodlar server.js-dəki TRANSLATE_LANGS ilə eyni olmalıdır.
export const TRANSLATE_TARGETS = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "tr", label: "Türkçe" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "zh", label: "中文" },
] as const;

export function translateTargetLabel(code: string): string {
  return TRANSLATE_TARGETS.find((l) => l.code === code)?.label || code.toUpperCase();
}

const STORAGE_KEY = "syncrom_lang";
const DEFAULT_LANG: Lang = "az";

const azCore = {
  // ---------- Status ----------
  "status.ready": "Hazır",
  "status.thinking": "Düşünür...",
  "status.writing": "Yazır...",
  "status.deepThinking": "Dərin düşünürəm, araşdırıram...",
  "status.agentWorking": "Kod icra edir, araşdırır...",
  "status.searchingWeb": "İnternetdə axtarır...",
  "status.translating": "Tərcümə edir...",
  "status.generatingImage": "Şəkil yaradılır...",
  "status.stopped": "Dayandırıldı",
  "status.offline": "Oflayn",
  "status.error": "Xəta",
  "status.preparingVoice": "Səs hazırlanır...",
  "status.speaking": "Danışır...",
  "status.voiceError": "Səs xətası",

  // ---------- Cavab mətnləri ----------
  "reply.noAnswer": "Bağışla, cavab ala bilmədim.",
  "reply.noConnection": "Serverlə əlaqə qurulmadı. Serverin işlədiyinə əmin ol.",
  "reply.imageHere": "Budur, sizin üçün yaratdığım şəkil:",
  "reply.imageStopped": "Şəkil yaratma dayandırıldı.",
  "reply.imageFailed": "Şəkli yarada bilmədim. Yenidən cəhd et.",

  // ---------- Yan panel ----------
  "sidebar.newChat": "Yeni söhbət",
  "sidebar.search": "Söhbətlərdə axtar...",
  "sidebar.chats": "Söhbətlər",
  "sidebar.empty": "Hələ söhbət yoxdur",
  "sidebar.noMatch": "Uyğun söhbət tapılmadı",
  "sidebar.rename": "Adını dəyiş",
  "sidebar.delete": "Sil",
  "sidebar.deleteConfirm": "Silinsin?",
  "sidebar.close": "Paneli bağla",
  "sidebar.menu": "Menyu",
  "sidebar.darkMode": "Tünd rejim",
  "sidebar.lightMode": "İşıqlı rejim",

  // ---------- Vaxt ----------
  "time.now": "indi",
  "time.minsAgo": "{n} dəq əvvəl",
  "time.hourAgo": "1 saat əvvəl",
  "time.hoursAgo": "{n} saat əvvəl",
  "time.yesterday": "Dünən",
  "time.daysAgo": "{n} gün əvvəl",

  // ---------- Yazı sahəsi ----------
  "composer.placeholder": "Syncrom AI-a yaz...",
  "composer.placeholderImageGen": "Hansı şəkli yaratmaq istəyirsən? (məs: gün batımında dağlar)",
  "composer.placeholderTranslate": "Tərcümə edilməli mətni yaz...",
  "composer.hint": "Syncrom AI — Groq & ElevenLabs texnologiyası ilə",
  "composer.hintImageGen": "Şəkil yaratma rejimi aktivdir — nə istədiyini təsvir et",
  "composer.hintTranslate": "Tərcümə rejimi aktivdir — mətni yaz, cavab yerinə tərcümə alacaqsan",
  "composer.send": "Göndər",
  "composer.stop": "Dayandır",
  "composer.mic": "Səslə yaz",
  "composer.uploadedImage": "Yüklənən şəkil",
  "composer.turnOff": "Söndür",

  // ---------- "+" menyusu ----------
  "plus.add": "Əlavə et",
  "plus.image": "Şəkil əlavə et",
  "plus.imageSub": "Yüklə, analiz etsin",
  "plus.doc": "Sənəd əlavə et",
  "plus.docSub": "Kod/mətn faylını yüklə",
  "plus.agent": "Kod Köməkçisi",
  "plus.agentSub": "Kodu icra edir, veb axtarır",
  "plus.imageGen": "Şəkil yarat",
  "plus.imageGenSub": "Mətndən şəkil (pulsuz)",
  "plus.deepThink": "Deep Think",
  "plus.deepThinkSub": "Araşdırıb dərin düşünür",
  "plus.webSearch": "Veb axtarış",
  "plus.webSearchSub": "İnternetdən aktual məlumat",
  "plus.translate": "Tərcümə rejimi",
  "plus.translateSub": "Mətni seçdiyin dilə çevirir",
  "plus.translateTarget": "Hədəf dil",

  // ---------- Rejim etiketləri ----------
  "mode.imageGen": "Şəkil yaratma",
  "mode.deepThink": "Deep Think",
  "mode.agent": "Kod Köməkçisi",
  "mode.webSearch": "Veb axtarış",
  "mode.translate": "Tərcümə → {lang}",

  // ---------- Mesaj ----------
  "msg.edit": "Redaktə et",
  "msg.copy": "Kopyala",
  "msg.copied": "✓ Kopyalandı",
  "msg.copyFailed": "Alınmadı",
  "msg.speak": "Səsləndir",
  "msg.loading": "Yüklənir",
  "msg.stopSpeak": "Dayandır",
  "msg.regenerate": "Yenidən",
  "msg.sentImage": "Göndərilən şəkil",

  // ---------- Yuxarı panel ----------
  "top.export": "İxrac et",
  "top.exportTitle": "Söhbəti ixrac et (.md)",
  "top.autoSpeak": "Avto səs",
  "top.autoSpeakTitle": "Avtomatik səsləndirmə",

  // ---------- Xoş gəldin ----------
  "welcome.greeting": "Salam, mən Syncrom AI",
  "welcome.greetingNamed": "Salam, {name}, mən Syncrom AI",
  "welcome.text": "Sualını yaz, mikrofonla danış və ya aşağıdakılardan birini seç.",
  "welcome.activeModel": "Aktiv model",

  // ---------- Təkliflər ----------
  "sug.who": "Sən kimsən?",
  "sug.whoQ": "Sən kimsən və nə edə bilirsən?",
  "sug.fact": "Maraqlı fakt",
  "sug.factQ": "Mənə maraqlı bir fakt danış",
  "sug.motivation": "Motivasiya",
  "sug.motivationQ": "Bu gün nə edə bilərəm? Motivasiya ver",
  "sug.poem": "Şeir yaz",
  "sug.poemQ": "Mənə qısa bir şeir yaz",

  // ---------- Giriş ----------
  "auth.sub": "Davam etmək üçün hesabına daxil ol",
  "auth.login": "Daxil ol",
  "auth.register": "Qeydiyyat",
  "auth.registerSubmit": "Qeydiyyatdan keç",
  "auth.name": "Adın",
  "auth.email": "E-poçt",
  "auth.pass": "Şifrə (ən azı 6 simvol)",
  "auth.weakPass": "Şifrə çox zəifdir (ən azı 6 simvol).",
  "auth.badEmail": "E-poçt ünvanı düzgün deyil.",
  "auth.or": "və ya",
  "auth.google": "Google ilə davam et",
  "auth.guest": "Qonaq kimi davam et →",

  // ---------- Profil menyusu ----------
  "acct.guest": "Qonaq",
  "acct.guestMode": "Lokal rejim",
  "acct.user": "İstifadəçi",
  "acct.language": "Dil",
  "acct.theme": "Görünüş",
  "acct.export": "Söhbəti ixrac et",
  "acct.clearAll": "Bütün söhbətləri sil",
  "acct.clearAllConfirm": "Əminsən? Bir daha bas",
  "acct.about": "Syncrom AI haqqında",
  "acct.logout": "Çıxış",
  "acct.signIn": "Hesaba daxil ol",

  // ---------- Haqqında ----------
  "about.title": "Syncrom AI haqqında",
  "about.founder": "Qurucu və rəhbər",
  "about.founderName": "Elvin Əhmədov",
  "about.tech": "Texnologiya",
  "about.techValue": "Groq (LLM), ElevenLabs (səs), Firebase (hesab)",
  "about.models": "Modellər",
  "about.close": "Bağla",

  // ---------- Artefakt (canlı önizləmə) ----------
  "art.preview": "Önizləmə",
  "art.title": "Artefakt",
  "art.result": "Nəticə",
  "art.code": "Kod",
  "art.openTab": "Yeni pəncərədə aç",
  "art.download": "Endir",
  "art.close": "Bağla",

  // ---------- Alət addımları ----------
  "step.web_search": "İnternetdə axtarır",
  "step.read_url": "Səhifə oxunur",
  "step.execute_code": "Kod icra olunur",
  "step.failed": "alınmadı",

  // ---------- Davam sualları ----------
  "follow.label": "Davamı",

  // ---------- Yaddaş ----------
  "acct.memory": "Yaddaş",
  "mem.title": "Yaddaş",
  "mem.sub": "Syncrom AI bunları səninlə bağlı yadda saxlayıb və hər söhbətdə nəzərə alır.",
  "mem.empty": "Hələ heç nə yadda saxlanmayıb. Söhbət etdikcə özü yığılacaq.",
  "mem.delete": "Sil",
  "mem.clear": "Yaddaşı tamamilə təmizlə",
  "mem.clearConfirm": "Əminsən? Bir daha bas",
  "mem.enabled": "Yaddaş aktivdir",
  "mem.disabled": "Yaddaş söndürülüb",
  "mem.saved": "Yaddaşa yazıldı",
  "mem.addPlaceholder": "Özün fakt əlavə et...",
  "mem.add": "Əlavə et",
  "mem.count": "{n} / {max} fakt",

  // ---------- Sənəd başlığı / SEO ----------
  "doc.title": "Syncrom AI — Alina, Keyla, Vella, Trila və Schala",
  "doc.desc": "Syncrom AI — analiz, kod, satış, tərcümə və təhsil üçün 8 ixtisaslaşmış süni zəka modeli.",
} as const;

// Landing mətnləri ayrı fayldadır, burada birləşdirilir
const az = { ...azCore, ...landingAz, ...aboutAz };

type Dict = Record<keyof typeof az, string>;

const enCore = {
  "status.ready": "Ready",
  "status.thinking": "Thinking...",
  "status.writing": "Writing...",
  "status.deepThinking": "Thinking deeply, researching...",
  "status.agentWorking": "Running code, researching...",
  "status.searchingWeb": "Searching the web...",
  "status.translating": "Translating...",
  "status.generatingImage": "Generating image...",
  "status.stopped": "Stopped",
  "status.offline": "Offline",
  "status.error": "Error",
  "status.preparingVoice": "Preparing audio...",
  "status.speaking": "Speaking...",
  "status.voiceError": "Audio error",

  "reply.noAnswer": "Sorry, I couldn't get a response.",
  "reply.noConnection": "Couldn't reach the server. Make sure it's running.",
  "reply.imageHere": "Here's the image I made for you:",
  "reply.imageStopped": "Image generation stopped.",
  "reply.imageFailed": "I couldn't generate the image. Please try again.",

  "sidebar.newChat": "New chat",
  "sidebar.search": "Search chats...",
  "sidebar.chats": "Chats",
  "sidebar.empty": "No chats yet",
  "sidebar.noMatch": "No matching chats",
  "sidebar.rename": "Rename",
  "sidebar.delete": "Delete",
  "sidebar.deleteConfirm": "Delete?",
  "sidebar.close": "Close panel",
  "sidebar.menu": "Menu",
  "sidebar.darkMode": "Dark mode",
  "sidebar.lightMode": "Light mode",

  "time.now": "just now",
  "time.minsAgo": "{n} min ago",
  "time.hourAgo": "1 hour ago",
  "time.hoursAgo": "{n} hours ago",
  "time.yesterday": "Yesterday",
  "time.daysAgo": "{n} days ago",

  "composer.placeholder": "Message Syncrom AI...",
  "composer.placeholderImageGen": "What image should I create? (e.g. mountains at sunset)",
  "composer.placeholderTranslate": "Type the text to translate...",
  "composer.hint": "Syncrom AI — powered by Groq & ElevenLabs",
  "composer.hintImageGen": "Image generation is on — describe what you want",
  "composer.hintTranslate": "Translation mode is on — type text and you'll get a translation, not a reply",
  "composer.send": "Send",
  "composer.stop": "Stop",
  "composer.mic": "Voice input",
  "composer.uploadedImage": "Uploaded image",
  "composer.turnOff": "Turn off",

  "plus.add": "Add",
  "plus.image": "Add image",
  "plus.imageSub": "Upload it for analysis",
  "plus.doc": "Add document",
  "plus.docSub": "Upload a code/text file",
  "plus.agent": "Code Assistant",
  "plus.agentSub": "Runs code, searches the web",
  "plus.imageGen": "Generate image",
  "plus.imageGenSub": "Text to image (free)",
  "plus.deepThink": "Deep Think",
  "plus.deepThinkSub": "Researches and reasons deeply",
  "plus.webSearch": "Web search",
  "plus.webSearchSub": "Live info from the internet",
  "plus.translate": "Translation mode",
  "plus.translateSub": "Translates text into your chosen language",
  "plus.translateTarget": "Target language",

  "mode.imageGen": "Image generation",
  "mode.deepThink": "Deep Think",
  "mode.agent": "Code Assistant",
  "mode.webSearch": "Web search",
  "mode.translate": "Translate → {lang}",

  "msg.edit": "Edit",
  "msg.copy": "Copy",
  "msg.copied": "✓ Copied",
  "msg.copyFailed": "Failed",
  "msg.speak": "Play",
  "msg.loading": "Loading",
  "msg.stopSpeak": "Stop",
  "msg.regenerate": "Retry",
  "msg.sentImage": "Attached image",

  "top.export": "Export",
  "top.exportTitle": "Export chat (.md)",
  "top.autoSpeak": "Auto voice",
  "top.autoSpeakTitle": "Read replies aloud automatically",

  "welcome.greeting": "Hi, I'm Syncrom AI",
  "welcome.greetingNamed": "Hi {name}, I'm Syncrom AI",
  "welcome.text": "Type your question, use the microphone, or pick one below.",
  "welcome.activeModel": "Active model",

  "sug.who": "Who are you?",
  "sug.whoQ": "Who are you and what can you do?",
  "sug.fact": "Fun fact",
  "sug.factQ": "Tell me an interesting fact",
  "sug.motivation": "Motivation",
  "sug.motivationQ": "What could I do today? Give me some motivation",
  "sug.poem": "Write a poem",
  "sug.poemQ": "Write me a short poem",

  "auth.sub": "Sign in to your account to continue",
  "auth.login": "Sign in",
  "auth.register": "Sign up",
  "auth.registerSubmit": "Create account",
  "auth.name": "Your name",
  "auth.email": "Email",
  "auth.pass": "Password (at least 6 characters)",
  "auth.weakPass": "Password is too weak (at least 6 characters).",
  "auth.badEmail": "That email address isn't valid.",
  "auth.or": "or",
  "auth.google": "Continue with Google",
  "auth.guest": "Continue as guest →",

  "acct.guest": "Guest",
  "acct.guestMode": "Local mode",
  "acct.user": "User",
  "acct.language": "Language",
  "acct.theme": "Appearance",
  "acct.export": "Export chat",
  "acct.clearAll": "Delete all chats",
  "acct.clearAllConfirm": "Are you sure? Click again",
  "acct.about": "About Syncrom AI",
  "acct.logout": "Sign out",
  "acct.signIn": "Sign in",

  "about.title": "About Syncrom AI",
  "about.founder": "Founder and head",
  "about.founderName": "Elvin Əhmədov",
  "about.tech": "Technology",
  "about.techValue": "Groq (LLM), ElevenLabs (voice), Firebase (accounts)",
  "about.models": "Models",
  "about.close": "Close",

  "art.preview": "Preview",
  "art.title": "Artifact",
  "art.result": "Result",
  "art.code": "Code",
  "art.openTab": "Open in new tab",
  "art.download": "Download",
  "art.close": "Close",

  "step.web_search": "Searching the web",
  "step.read_url": "Reading page",
  "step.execute_code": "Running code",
  "step.failed": "failed",

  "follow.label": "Next",

  "acct.memory": "Memory",
  "mem.title": "Memory",
  "mem.sub": "Syncrom AI has remembered these things about you and takes them into account in every chat.",
  "mem.empty": "Nothing remembered yet. It builds up as you chat.",
  "mem.delete": "Delete",
  "mem.clear": "Clear all memory",
  "mem.clearConfirm": "Are you sure? Click again",
  "mem.enabled": "Memory is on",
  "mem.disabled": "Memory is off",
  "mem.saved": "Saved to memory",
  "mem.addPlaceholder": "Add a fact yourself...",
  "mem.add": "Add",
  "mem.count": "{n} / {max} facts",

  "doc.title": "Syncrom AI — Alina, Keyla, Vella, Trila and Schala",
  "doc.desc": "Syncrom AI — 8 specialised AI models for analysis, code, sales, translation and teaching.",
};

const ruCore = {
  "status.ready": "Готов",
  "status.thinking": "Думает...",
  "status.writing": "Пишет...",
  "status.deepThinking": "Думаю глубоко, изучаю...",
  "status.agentWorking": "Выполняю код, изучаю...",
  "status.searchingWeb": "Ищу в интернете...",
  "status.translating": "Перевожу...",
  "status.generatingImage": "Создаю изображение...",
  "status.stopped": "Остановлено",
  "status.offline": "Нет связи",
  "status.error": "Ошибка",
  "status.preparingVoice": "Готовлю озвучку...",
  "status.speaking": "Говорит...",
  "status.voiceError": "Ошибка озвучки",

  "reply.noAnswer": "Извини, не удалось получить ответ.",
  "reply.noConnection": "Не удалось связаться с сервером. Убедись, что он запущен.",
  "reply.imageHere": "Вот изображение, которое я создал для вас:",
  "reply.imageStopped": "Создание изображения остановлено.",
  "reply.imageFailed": "Не удалось создать изображение. Попробуй ещё раз.",

  "sidebar.newChat": "Новый чат",
  "sidebar.search": "Поиск по чатам...",
  "sidebar.chats": "Чаты",
  "sidebar.empty": "Чатов пока нет",
  "sidebar.noMatch": "Ничего не найдено",
  "sidebar.rename": "Переименовать",
  "sidebar.delete": "Удалить",
  "sidebar.deleteConfirm": "Удалить?",
  "sidebar.close": "Закрыть панель",
  "sidebar.menu": "Меню",
  "sidebar.darkMode": "Тёмная тема",
  "sidebar.lightMode": "Светлая тема",

  "time.now": "только что",
  "time.minsAgo": "{n} мин назад",
  "time.hourAgo": "1 час назад",
  "time.hoursAgo": "{n} ч назад",
  "time.yesterday": "Вчера",
  "time.daysAgo": "{n} дн назад",

  "composer.placeholder": "Написать Syncrom AI...",
  "composer.placeholderImageGen": "Какое изображение создать? (напр. горы на закате)",
  "composer.placeholderTranslate": "Введите текст для перевода...",
  "composer.hint": "Syncrom AI — на технологиях Groq и ElevenLabs",
  "composer.hintImageGen": "Режим генерации изображений включён — опишите, что нужно",
  "composer.hintTranslate": "Режим перевода включён — напишите текст, и получите перевод, а не ответ",
  "composer.send": "Отправить",
  "composer.stop": "Стоп",
  "composer.mic": "Голосовой ввод",
  "composer.uploadedImage": "Загруженное изображение",
  "composer.turnOff": "Выключить",

  "plus.add": "Добавить",
  "plus.image": "Добавить изображение",
  "plus.imageSub": "Загрузите для анализа",
  "plus.doc": "Добавить документ",
  "plus.docSub": "Загрузите файл кода или текста",
  "plus.agent": "Код-ассистент",
  "plus.agentSub": "Выполняет код, ищет в сети",
  "plus.imageGen": "Создать изображение",
  "plus.imageGenSub": "Текст в изображение (бесплатно)",
  "plus.deepThink": "Deep Think",
  "plus.deepThinkSub": "Изучает и рассуждает глубоко",
  "plus.webSearch": "Поиск в интернете",
  "plus.webSearchSub": "Актуальные данные из сети",
  "plus.translate": "Режим перевода",
  "plus.translateSub": "Переводит текст на выбранный язык",
  "plus.translateTarget": "Язык перевода",

  "mode.imageGen": "Генерация изображений",
  "mode.deepThink": "Deep Think",
  "mode.agent": "Код-ассистент",
  "mode.webSearch": "Поиск в интернете",
  "mode.translate": "Перевод → {lang}",

  "msg.edit": "Изменить",
  "msg.copy": "Копировать",
  "msg.copied": "✓ Скопировано",
  "msg.copyFailed": "Не вышло",
  "msg.speak": "Озвучить",
  "msg.loading": "Загрузка",
  "msg.stopSpeak": "Стоп",
  "msg.regenerate": "Заново",
  "msg.sentImage": "Прикреплённое изображение",

  "top.export": "Экспорт",
  "top.exportTitle": "Экспорт чата (.md)",
  "top.autoSpeak": "Авто-озвучка",
  "top.autoSpeakTitle": "Автоматически читать ответы вслух",

  "welcome.greeting": "Привет, я Syncrom AI",
  "welcome.greetingNamed": "Привет, {name}, я Syncrom AI",
  "welcome.text": "Напишите вопрос, используйте микрофон или выберите один из вариантов ниже.",
  "welcome.activeModel": "Активная модель",

  "sug.who": "Кто ты?",
  "sug.whoQ": "Кто ты и что умеешь?",
  "sug.fact": "Интересный факт",
  "sug.factQ": "Расскажи мне интересный факт",
  "sug.motivation": "Мотивация",
  "sug.motivationQ": "Чем мне заняться сегодня? Мотивируй меня",
  "sug.poem": "Напиши стих",
  "sug.poemQ": "Напиши мне короткий стих",

  "auth.sub": "Войдите в аккаунт, чтобы продолжить",
  "auth.login": "Вход",
  "auth.register": "Регистрация",
  "auth.registerSubmit": "Создать аккаунт",
  "auth.name": "Ваше имя",
  "auth.email": "Эл. почта",
  "auth.pass": "Пароль (не менее 6 символов)",
  "auth.weakPass": "Пароль слишком слабый (не менее 6 символов).",
  "auth.badEmail": "Неверный адрес эл. почты.",
  "auth.or": "или",
  "auth.google": "Продолжить с Google",
  "auth.guest": "Продолжить как гость →",

  "acct.guest": "Гость",
  "acct.guestMode": "Локальный режим",
  "acct.user": "Пользователь",
  "acct.language": "Язык",
  "acct.theme": "Оформление",
  "acct.export": "Экспорт чата",
  "acct.clearAll": "Удалить все чаты",
  "acct.clearAllConfirm": "Уверены? Нажмите снова",
  "acct.about": "О Syncrom AI",
  "acct.logout": "Выйти",
  "acct.signIn": "Войти",

  "about.title": "О Syncrom AI",
  "about.founder": "Основатель и руководитель",
  "about.founderName": "Elvin Əhmədov",
  "about.tech": "Технологии",
  "about.techValue": "Groq (LLM), ElevenLabs (голос), Firebase (аккаунты)",
  "about.models": "Модели",
  "about.close": "Закрыть",

  "art.preview": "Просмотр",
  "art.title": "Артефакт",
  "art.result": "Результат",
  "art.code": "Код",
  "art.openTab": "Открыть в новой вкладке",
  "art.download": "Скачать",
  "art.close": "Закрыть",

  "step.web_search": "Поиск в интернете",
  "step.read_url": "Читаю страницу",
  "step.execute_code": "Выполняю код",
  "step.failed": "не удалось",

  "follow.label": "Далее",

  "acct.memory": "Память",
  "mem.title": "Память",
  "mem.sub": "Syncrom AI запомнил это о вас и учитывает в каждом диалоге.",
  "mem.empty": "Пока ничего не запомнено. Память пополняется по ходу общения.",
  "mem.delete": "Удалить",
  "mem.clear": "Очистить всю память",
  "mem.clearConfirm": "Уверены? Нажмите снова",
  "mem.enabled": "Память включена",
  "mem.disabled": "Память выключена",
  "mem.saved": "Сохранено в память",
  "mem.addPlaceholder": "Добавить факт самому...",
  "mem.add": "Добавить",
  "mem.count": "{n} / {max} фактов",

  "doc.title": "Syncrom AI — Alina, Keyla, Vella, Trila и Schala",
  "doc.desc": "Syncrom AI — 8 специализированных моделей ИИ для анализа, кода, продаж, перевода и обучения.",
};

const trCore = {
  "status.ready": "Hazır",
  "status.thinking": "Düşünüyor...",
  "status.writing": "Yazıyor...",
  "status.deepThinking": "Derinlemesine düşünüyor, araştırıyor...",
  "status.agentWorking": "Kod çalıştırıyor, araştırıyor...",
  "status.searchingWeb": "İnternette arıyor...",
  "status.translating": "Çeviriyor...",
  "status.generatingImage": "Görsel oluşturuluyor...",
  "status.stopped": "Durduruldu",
  "status.offline": "Çevrimdışı",
  "status.error": "Hata",
  "status.preparingVoice": "Ses hazırlanıyor...",
  "status.speaking": "Konuşuyor...",
  "status.voiceError": "Ses hatası",

  "reply.noAnswer": "Üzgünüm, yanıt alamadım.",
  "reply.noConnection": "Sunucuya ulaşılamadı. Çalıştığından emin ol.",
  "reply.imageHere": "İşte sizin için oluşturduğum görsel:",
  "reply.imageStopped": "Görsel oluşturma durduruldu.",
  "reply.imageFailed": "Görseli oluşturamadım. Tekrar dene.",

  "sidebar.newChat": "Yeni sohbet",
  "sidebar.search": "Sohbetlerde ara...",
  "sidebar.chats": "Sohbetler",
  "sidebar.empty": "Henüz sohbet yok",
  "sidebar.noMatch": "Eşleşen sohbet bulunamadı",
  "sidebar.rename": "Yeniden adlandır",
  "sidebar.delete": "Sil",
  "sidebar.deleteConfirm": "Silinsin mi?",
  "sidebar.close": "Paneli kapat",
  "sidebar.menu": "Menü",
  "sidebar.darkMode": "Koyu tema",
  "sidebar.lightMode": "Açık tema",

  "time.now": "şimdi",
  "time.minsAgo": "{n} dk önce",
  "time.hourAgo": "1 saat önce",
  "time.hoursAgo": "{n} saat önce",
  "time.yesterday": "Dün",
  "time.daysAgo": "{n} gün önce",

  "composer.placeholder": "Syncrom AI'ya yaz...",
  "composer.placeholderImageGen": "Hangi görseli oluşturayım? (örn. gün batımında dağlar)",
  "composer.placeholderTranslate": "Çevrilecek metni yaz...",
  "composer.hint": "Syncrom AI — Groq & ElevenLabs teknolojisiyle",
  "composer.hintImageGen": "Görsel oluşturma modu açık — ne istediğini anlat",
  "composer.hintTranslate": "Çeviri modu açık — metni yaz, yanıt yerine çeviri alacaksın",
  "composer.send": "Gönder",
  "composer.stop": "Durdur",
  "composer.mic": "Sesle yaz",
  "composer.uploadedImage": "Yüklenen görsel",
  "composer.turnOff": "Kapat",

  "plus.add": "Ekle",
  "plus.image": "Görsel ekle",
  "plus.imageSub": "Yükle, analiz etsin",
  "plus.doc": "Belge ekle",
  "plus.docSub": "Kod/metin dosyası yükle",
  "plus.agent": "Kod Asistanı",
  "plus.agentSub": "Kod çalıştırır, web'de arar",
  "plus.imageGen": "Görsel oluştur",
  "plus.imageGenSub": "Metinden görsel (ücretsiz)",
  "plus.deepThink": "Deep Think",
  "plus.deepThinkSub": "Araştırıp derinlemesine düşünür",
  "plus.webSearch": "Web araması",
  "plus.webSearchSub": "İnternetten güncel bilgi",
  "plus.translate": "Çeviri modu",
  "plus.translateSub": "Metni seçtiğin dile çevirir",
  "plus.translateTarget": "Hedef dil",

  "mode.imageGen": "Görsel oluşturma",
  "mode.deepThink": "Deep Think",
  "mode.agent": "Kod Asistanı",
  "mode.webSearch": "Web araması",
  "mode.translate": "Çeviri → {lang}",

  "msg.edit": "Düzenle",
  "msg.copy": "Kopyala",
  "msg.copied": "✓ Kopyalandı",
  "msg.copyFailed": "Olmadı",
  "msg.speak": "Sesli oku",
  "msg.loading": "Yükleniyor",
  "msg.stopSpeak": "Durdur",
  "msg.regenerate": "Yeniden",
  "msg.sentImage": "Gönderilen görsel",

  "top.export": "Dışa aktar",
  "top.exportTitle": "Sohbeti dışa aktar (.md)",
  "top.autoSpeak": "Oto ses",
  "top.autoSpeakTitle": "Yanıtları otomatik sesli oku",

  "welcome.greeting": "Merhaba, ben Syncrom AI",
  "welcome.greetingNamed": "Merhaba {name}, ben Syncrom AI",
  "welcome.text": "Sorunu yaz, mikrofonu kullan ya da aşağıdakilerden birini seç.",
  "welcome.activeModel": "Aktif model",

  "sug.who": "Sen kimsin?",
  "sug.whoQ": "Sen kimsin ve neler yapabilirsin?",
  "sug.fact": "İlginç bilgi",
  "sug.factQ": "Bana ilginç bir bilgi anlat",
  "sug.motivation": "Motivasyon",
  "sug.motivationQ": "Bugün ne yapabilirim? Bana motivasyon ver",
  "sug.poem": "Şiir yaz",
  "sug.poemQ": "Bana kısa bir şiir yaz",

  "auth.sub": "Devam etmek için hesabına giriş yap",
  "auth.login": "Giriş yap",
  "auth.register": "Kayıt ol",
  "auth.registerSubmit": "Hesap oluştur",
  "auth.name": "Adın",
  "auth.email": "E-posta",
  "auth.pass": "Şifre (en az 6 karakter)",
  "auth.weakPass": "Şifre çok zayıf (en az 6 karakter).",
  "auth.badEmail": "E-posta adresi geçersiz.",
  "auth.or": "veya",
  "auth.google": "Google ile devam et",
  "auth.guest": "Misafir olarak devam et →",

  "acct.guest": "Misafir",
  "acct.guestMode": "Yerel mod",
  "acct.user": "Kullanıcı",
  "acct.language": "Dil",
  "acct.theme": "Görünüm",
  "acct.export": "Sohbeti dışa aktar",
  "acct.clearAll": "Tüm sohbetleri sil",
  "acct.clearAllConfirm": "Emin misin? Tekrar bas",
  "acct.about": "Syncrom AI hakkında",
  "acct.logout": "Çıkış",
  "acct.signIn": "Giriş yap",

  "about.title": "Syncrom AI hakkında",
  "about.founder": "Kurucu ve yönetici",
  "about.founderName": "Elvin Əhmədov",
  "about.tech": "Teknoloji",
  "about.techValue": "Groq (LLM), ElevenLabs (ses), Firebase (hesap)",
  "about.models": "Modeller",
  "about.close": "Kapat",

  "art.preview": "Önizleme",
  "art.title": "Artifact",
  "art.result": "Sonuç",
  "art.code": "Kod",
  "art.openTab": "Yeni sekmede aç",
  "art.download": "İndir",
  "art.close": "Kapat",

  "step.web_search": "İnternette arıyor",
  "step.read_url": "Sayfa okunuyor",
  "step.execute_code": "Kod çalıştırılıyor",
  "step.failed": "başarısız",

  "follow.label": "Devamı",

  "acct.memory": "Hafıza",
  "mem.title": "Hafıza",
  "mem.sub": "Syncrom AI sizinle ilgili bunları hatırlıyor ve her sohbette dikkate alıyor.",
  "mem.empty": "Henüz bir şey hatırlanmadı. Sohbet ettikçe birikecek.",
  "mem.delete": "Sil",
  "mem.clear": "Tüm hafızayı temizle",
  "mem.clearConfirm": "Emin misin? Tekrar bas",
  "mem.enabled": "Hafıza açık",
  "mem.disabled": "Hafıza kapalı",
  "mem.saved": "Hafızaya kaydedildi",
  "mem.addPlaceholder": "Kendin bir bilgi ekle...",
  "mem.add": "Ekle",
  "mem.count": "{n} / {max} bilgi",

  "doc.title": "Syncrom AI — Alina, Keyla, Vella, Trila ve Schala",
  "doc.desc": "Syncrom AI — analiz, kod, satış, çeviri ve eğitim için 8 uzmanlaşmış yapay zekâ modeli.",
};

const en: Dict = { ...enCore, ...landingEn, ...aboutEn };
const ru: Dict = { ...ruCore, ...landingRu, ...aboutRu };
const tr: Dict = { ...trCore, ...landingTr, ...aboutTr };

const DICTS: Record<Lang, Dict> = { az, en, ru, tr };

export type TKey = keyof typeof az;
export type TFunc = (key: TKey, vars?: Record<string, string | number>) => string;

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && LANGS.some((l) => l.code === v);
}

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // localStorage bloklanıbsa (gizli rejim) sadəcə brauzer dilinə keç
  }
  const nav = (navigator.languages?.[0] || navigator.language || "").slice(0, 2).toLowerCase();
  return isLang(nav) ? nav : DEFAULT_LANG;
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFunc;
  locale: string;
}

const LangContext = createContext<Ctx | null>(null);

// Ayrıca səhifənin "sahiblədiyi" başlıq açarı. Modul səviyyəsindədir ki,
// həm usePageTitle, həm də provider-in effekti eyni dəyəri görsün.
let pageTitleKey: TKey | null = null;

/** Səhifəyə öz <title>-ını verir; dil dəyişəndə də düzgün qalır. */
export function usePageTitle(key: TKey) {
  const { lang } = useI18n();
  useEffect(() => {
    pageTitleKey = key;
    document.title = `${DICTS[lang][key]} — Syncrom AI`;
    return () => {
      pageTitleKey = null;
      document.title = DICTS[lang]["doc.title"];
    };
  }, [key, lang]);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // yaddaş yoxdursa dil yalnız bu sessiya üçün dəyişir
    }
  }, []);

  // <html lang="...">, sənəd başlığı və meta təsvir — brauzerin orfoqrafiya
  // yoxlaması, ekran oxuyucuları və paylaşım önizləmələri üçün vacibdir.
  //
  // Ayrıca səhifə usePageTitle() ilə başlığı öz üzərinə götürübsə, onu
  // əzmirik: React-də uşaq effektləri valideyndən ƏVVƏL işləyir, ona görə
  // bayraq bu effekt işləyənə qədər artıq qoyulmuş olur.
  useEffect(() => {
    const dict = DICTS[lang];
    document.documentElement.lang = lang;
    document.title = pageTitleKey ? `${dict[pageTitleKey]} — Syncrom AI` : dict["doc.title"];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict["doc.desc"]);
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    const t: TFunc = (key, vars) => {
      // Tərcümə çatmırsa Azərbaycan variantına, o da yoxsa açarın özünə düş
      let s = dict[key] ?? az[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{${k}}`, String(v));
        }
      }
      return s;
    };
    const locale = LANGS.find((l) => l.code === lang)?.locale || "az-AZ";
    return { lang, setLang, t, locale };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n LanguageProvider-in içində çağırılmalıdır");
  return ctx;
}

// Yalnız t() lazım olan komponentlər üçün qısa yol
export function useT(): TFunc {
  return useI18n().t;
}
