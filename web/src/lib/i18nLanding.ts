// ============================================================
// Landing (açılış) səhifəsinin mətnləri — i18n.tsx-dəki əsas lüğətə
// qarışdırılır. Ayrı fayldadır ki, marketinq mətnləri tətbiqin
// interfeys mətnlərini boğmasın.
//
// Model kartlarının etiketi/təsviri BURADA DEYİL — onlar /api/models-dən
// gəlir (server.js → MODEL_I18N), belə olanda yeni model əlavə edəndə
// landing özü yenilənir.
// ============================================================

export const landingAz = {
  // ---------- Naviqasiya ----------
  "l.nav.models": "Modellər",
  "l.nav.schala": "Schala",
  "l.nav.download": "Yüklə",
  "l.nav.features": "Xüsusiyyətlər",
  "l.nav.faq": "FAQ",
  "l.nav.start": "Başla",
  "l.nav.noemel": "Noemel",
  "l.noemel.tag": "Bulud İş sahəsi & Dashboard",
  "l.noemel.desc": "Noemel - layihələrinizi idarə etmək, işə salmaq və buludda yerləşdirmək üçün Rocket Replit tipli developer dashboardıdır.",
  "l.noemel.button": "Dashboard-a keç",

  // ---------- Hero ----------
  "l.hero.pill": "Azərbaycan dilində süni zəka",
  "l.hero.h1": "Süni zəka ilə düşüncə tərzinizi genişləndirin",
  "l.hero.lead":
    "Syncrom AI analiz, kodlaşdırma, satış, tərcümə və təhsil üçün ixtisaslaşmış zəka modellərini bir platformada təqdim edir — brauzerdə və ya masaüstündə.",
  "l.hero.try": "İndi yoxlayın",
  "l.hero.desktop": "Masaüstü tətbiqlər",

  // ---------- Statistika ----------
  "l.stats.models": "İxtisaslaşmış zəka modeli",
  "l.stats.apps": "Masaüstü tətbiq — Vella & Schala",
  "l.stats.langs": "İnterfeys dili — AZ, EN, RU, TR",
  "l.stats.price": "Başlamaq üçün — login belə tələb olunmur",

  // ---------- Nümunə söhbətlər ----------
  "l.demo.alinaQ": "Bu maliyyə cədvəlini analiz edib əsas riskləri qeyd edə bilərsən?",
  "l.demo.alinaA": "Bəli, təqdim etdiyiniz cədvələ əsasən 3 əsas risk müəyyən edilmişdir:",
  "l.demo.alinaR1": "Əməliyyat xərclərinin 12% artımı.",
  "l.demo.alinaR2": "İnflyasiya təzyiqi.",
  "l.demo.alinaR3": "Likvidlik nisbətinin azalması.",
  "l.demo.alinaDesc":
    "Mürəkkəb məlumatları emal etmək, dərin analizlər aparmaq və peşəkar hesabatlar hazırlamaq üçün optimallaşdırılmışdır.",
  "l.demo.trilaQ": "Trila, fotosintez nədir? Başa düşmürəm.",
  "l.demo.trilaA":
    "Çox gözəl sualdır! Fotosintezi bir mətbəx kimi düşünək. Bitkilər günəş işığını aşpaz kimi istifadə edərək özlərinə yemək hazırlayırlar.",
  "l.demo.trilaDesc":
    "Şagirdlər və tələbələr üçün mövzuları sadə dildə izah edən, motivasiya verən öyrətmə yoldaşı.",

  // ---------- Bütün modellər ----------
  "l.models.head": "{n} model, bir platforma",
  "l.models.sub":
    "Hər model müəyyən bir iş üçün ixtisaslaşıb — ehtiyacına uyğun olanı seç, söhbət daxilində istənilən vaxt dəyiş.",
  "l.models.badgeVision": "Şəkil analizi",
  "l.models.badgeAgent": "Kod Köməkçisi",

  // ---------- Schala ----------
  "l.schala.badge": "Yeni · Masaüstü tətbiq",
  "l.schala.titlePre": "Tanış olun: ",
  "l.schala.desc":
    "Öz layihənizi açın, Schala fayllarınızı oxusun, dəyişiklik istəyəndə icazə soruşmadan birbaşa koda yazsın. Fayl ağacı, real Monaco redaktoru, terminal və çoxfayllı \"Composer\" rejimi — hamısı bir pəncərədə.",
  "l.schala.p1": "Faylı birbaşa redaktə edir, dəyişiklikləri həmişə geri ala bilərsiniz",
  "l.schala.p2": "Composer bir neçə faylı eyni anda yeniləyir",
  "l.schala.p3": "Daxili terminal, git statusu, sürətli fayl axtarışı (Ctrl+P)",
  "l.schala.dl": "Schala-nı yüklə",
  "l.schala.demo": "Demoya bax",
  "l.schala.shotAlt": "Schala kod redaktoru interfeysi",

  // ---------- Demo ----------
  "l.vid.tag": "Demo",
  "l.vid.head": "İş başında görün",
  "l.vid.sub":
    "Schala real layihədə necə işləyir — fayl oxuyur, kod yazır və dəyişiklikləri birbaşa tətbiq edir.",
  "l.vid.play": "Demonu izləyin",
  "l.vid.unavailable": "Demo videosu tezliklə əlavə olunacaq",
  "l.vid.aria": "Demo videosunu oynat",

  // ---------- Üç addım ----------
  "l.how.head": "Üç addımda başla",
  "l.how.sub": "Qeydiyyat, quraşdırma, gözləmə yoxdur — brauzerdə aç və dərhal işə başla.",
  "l.how.s1t": "Modelini seç",
  "l.how.s1d": "Alina, Keyla, Vella, Trila və ya Schala — işinə uyğun olanı bir kliklə seç.",
  "l.how.s2t": "Sualını yaz və ya danış",
  "l.how.s2d": "Mətn yaz, mikrofonla danış, hətta şəkil əlavə et — model səni öz dilində anlayır.",
  "l.how.s3t": "Nəticəni al",
  "l.how.s3d": "Analiz, kod, dərs izahı və ya səsli cavab — saniyələr içində. Söhbətlərin saxlanılır.",

  // ---------- Yüklə ----------
  "l.dl.head": "Masaüstünə yükləyin",
  "l.dl.sub":
    "Syncrom Vella və Schala müstəqil masaüstü tətbiqlər kimi mövcuddur — brauzer olmadan, birbaşa kompüterinizdə işləyir.",
  "l.dl.notice":
    "Quraşdırma paketi hazırlanır — tezliklə əlçatan olacaq. Bu arada Syncrom AI-ı brauzerdə istifadə edə bilərsiniz.",
  "l.dl.win": "Windows üçün yüklə",
  "l.dl.vellaLogoAlt": "Syncrom Vella loqosu",
  "l.dl.vellaDesc":
    "Satış komandaları üçün ayrıca masaüstü tətbiq. Lead qiymətləndirməsi (BANT), korporativ analitika və müştəri ünsiyyəti — hamısı fokuslanmış, tək-model interfeysdə.",
  "l.dl.vellaP1": "Login tələb olunmur — söhbətlər lokal saxlanılır",
  "l.dl.vellaP2": "BANT lead-scoring & satış e-poçt şablonları",
  "l.dl.vellaP3": "Korporativ tünd dizayn, offline işləyir",
  "l.dl.vellaMeta": "Windows 10/11 · NSIS installer",
  "l.dl.schalaLogoAlt": "Schala loqosu",
  "l.dl.schalaTag": "AI Kod Redaktoru",
  "l.dl.schalaDesc":
    "Öz AI cüt-proqramçınız. Real fayl sisteminə çıxış, Monaco redaktoru, daxili terminal və çoxfayllı Composer — Keyla 5.8 modeli ilə gücləndirilib.",
  "l.dl.schalaP1": "Fayllarınızı oxuyur və birbaşa redaktə edir",
  "l.dl.schalaP2": "Git statusu, Ctrl+P sürətli axtarış, terminal",
  "l.dl.schalaP3": "Composer bir neçə faylı eyni anda dəyişir",
  "l.dl.schalaMeta": "Windows 10/11 · Electron",

  // ---------- Xüsusiyyətlər ----------
  "l.feat.head": "Etibarlı, sürətli və dilinizə uyğun",
  "l.feat.sub":
    "Syncrom AI modelləri Azərbaycan dilinin incəliklərini başa düşmək və təbii ünsiyyət qurmaq üçün hazırlanmışdır.",
  "l.feat.securityT": "Məlumat Təhlükəsizliyi",
  "l.feat.securityD":
    "Bütün sorğularınız və məlumatlarınız ən yüksək səviyyəli şifrələmə standartları ilə qorunur.",
  "l.feat.speedT": "Sürətli Emal",
  "l.feat.speedD":
    "Saniyələr içində uzun mətnləri analiz edir və strukturlaşdırılmış nəticələri təqdim edirik.",
  "l.feat.langT": "Dil Dəstəyi",
  "l.feat.langD":
    "İnterfeys 4 dildə (AZ, EN, RU, TR), modellər isə yazdığınız dildə cavab verir.",
  "l.feat.visionT": "Şəkil Analizi",
  "l.feat.visionD":
    "Alina göndərilən şəkilləri analiz edib təsvir edə və suallarınıza cavab verə bilir.",
  "l.feat.imgGenT": "Şəkil yaratma (pulsuz)",
  "l.feat.imgGenD":
    "İstədiyini təsvir et, saniyələr içində pulsuz şəkil yaradılsın — API açarı, ödəniş tələb olunmur.",
  "l.feat.agentT": "Kod Köməkçisi",
  "l.feat.agentD":
    "Keyla lazım gələndə kodu icra edir, internetdə axtarış edir — cavabı güman etmir, yoxlayır.",
  "l.feat.deepT": "Deep Think",
  "l.feat.deepD":
    "Sualdan açar söz çıxarır, araşdırma aparır, addım-addım əsaslandırılmış, mənbəli cavab qurur.",
  "l.feat.webT": "Veb axtarış",
  "l.feat.webD":
    "Aktual məlumat lazım olanda internetdən canlı nəticə çəkir və mənbə linklərini göstərir.",
  "l.feat.translateT": "Tərcümə rejimi",
  "l.feat.translateD":
    "Mətni 10 dilə çevirir — cavab yerinə təbii səslənən tərcümə alırsınız.",

  // ---------- FAQ ----------
  "l.faq.head": "Tez-tez verilən suallar",
  "l.faq.sub": "Ağlına gələn ilk suallar — qısa və aydın cavablarla.",
  "l.faq.q1": "Syncrom AI pulsuzdur?",
  "l.faq.a1":
    "Bəli — brauzerdə istifadə pulsuzdur və başlamaq üçün qeydiyyat belə tələb olunmur. Şəkil yaratma da daxil olmaqla əsas funksiyalar pulsuzdur.",
  "l.faq.q2": "Qeydiyyat olmadan istifadə edə bilərəm?",
  "l.faq.a2":
    "Bəli. Qonaq rejimində dərhal başlaya bilərsən — söhbətlərin cihazında lokal saxlanılır. Hesab açsan, söhbətlərin bütün cihazlarında sinxronlaşır.",
  "l.faq.q3": "Məlumatlarım təhlükəsizdirmi?",
  "l.faq.a3":
    "Sorğuların şifrələnmiş bağlantı ilə ötürülür. Qonaq rejimində söhbətlər yalnız sənin brauzerində qalır, serverdə saxlanılmır.",
  "l.faq.q4": "Hansı dilləri dəstəkləyir?",
  "l.faq.a4":
    "İnterfeys Azərbaycan, ingilis, rus və türk dillərindədir. Modellər yazdığın dildə cavab verir, tərcümə rejimi isə 10 dili dəstəkləyir.",
  "l.faq.q5": "Hansı model nə üçündür?",
  "l.faq.a5":
    "Alina — analiz və hesabatlar; Keyla — proqramlaşdırma; Vella — satış və CRM; Trila — təhsil; Lira — yaradıcı mətn; Zeyra — tərcümə və redaktə; Milla — sürətli qısa cavablar; Schala — masaüstü AI kod redaktoru. Söhbət içində istənilən vaxt dəyişə bilərsən.",
  "l.faq.q6": "Masaüstü tətbiqlərini haradan yükləyim?",
  "l.faq.a6":
    "«Yüklə» bölməsindən Syncrom Vella və Schala üçün Windows quraşdırıcılarını endirə bilərsən. Brauzer versiyası da tam işləkdir.",

  // ---------- CTA və altlıq ----------
  "l.cta.head": "Gələcəyi bu gün kəşf edin",
  "l.cta.sub":
    "Syncrom AI modelləri ilə tanış olun — sizin və komandanız üçün hazır süni zəka köməkçiləri.",
  "l.cta.account": "Hesab yaradın",
  "l.cta.contact": "Bizimlə əlaqə",
  "l.foot.address":
    "Bakı, Azərbaycan. Bütün hüquqlar qorunur. Syncrom AI zəka modelləri tərəfindən idarə olunur.",
  "l.foot.product": "Məhsul",
  "l.foot.download": "Yüklə",
  "l.foot.company": "Şirkət",
  "l.foot.howTo": "Necə başlamalı",
  "l.foot.contact": "Əlaqə",
};

export type LandingDict = Record<keyof typeof landingAz, string>;

export const landingEn: LandingDict = {
  "l.nav.models": "Models",
  "l.nav.schala": "Schala",
  "l.nav.download": "Download",
  "l.nav.features": "Features",
  "l.nav.faq": "FAQ",
  "l.nav.start": "Get started",
  "l.nav.noemel": "Noemel",
  "l.noemel.tag": "Cloud Workspace & Dashboard",
  "l.noemel.desc": "Noemel is a Rocket Replit-like developer dashboard for managing, running, and deploying your projects in the cloud.",
  "l.noemel.button": "Go to Dashboard",

  "l.hero.pill": "AI that speaks your language",
  "l.hero.h1": "Expand how you think, with AI",
  "l.hero.lead":
    "Syncrom AI brings specialised models for analysis, coding, sales, translation and teaching together on one platform — in the browser or on your desktop.",
  "l.hero.try": "Try it now",
  "l.hero.desktop": "Desktop apps",

  "l.stats.models": "Specialised AI models",
  "l.stats.apps": "Desktop apps — Vella & Schala",
  "l.stats.langs": "Interface languages — AZ, EN, RU, TR",
  "l.stats.price": "To get started — no login required",

  "l.demo.alinaQ": "Can you analyse this financial table and flag the main risks?",
  "l.demo.alinaA": "Yes — based on the table you shared, three main risks stand out:",
  "l.demo.alinaR1": "Operating costs up 12%.",
  "l.demo.alinaR2": "Inflationary pressure.",
  "l.demo.alinaR3": "Declining liquidity ratio.",
  "l.demo.alinaDesc":
    "Optimised for processing complex data, running deep analysis and producing professional reports.",
  "l.demo.trilaQ": "Trila, what is photosynthesis? I don't get it.",
  "l.demo.trilaA":
    "Great question! Think of photosynthesis as a kitchen. Plants use sunlight like a chef to cook their own food.",
  "l.demo.trilaDesc":
    "A study companion for pupils and students that explains topics in plain language and keeps them motivated.",

  "l.models.head": "{n} models, one platform",
  "l.models.sub":
    "Each model specialises in one kind of work — pick the one you need and switch any time mid-conversation.",
  "l.models.badgeVision": "Image analysis",
  "l.models.badgeAgent": "Code Assistant",

  "l.schala.badge": "New · Desktop app",
  "l.schala.titlePre": "Meet ",
  "l.schala.desc":
    "Open your own project and let Schala read your files and write straight into the code without asking permission. File tree, a real Monaco editor, a terminal and a multi-file \"Composer\" mode — all in one window.",
  "l.schala.p1": "Edits files directly, and you can always undo the changes",
  "l.schala.p2": "Composer updates several files at once",
  "l.schala.p3": "Built-in terminal, git status, quick file search (Ctrl+P)",
  "l.schala.dl": "Download Schala",
  "l.schala.demo": "Watch the demo",
  "l.schala.shotAlt": "The Schala code editor interface",

  "l.vid.tag": "Demo",
  "l.vid.head": "See it at work",
  "l.vid.sub":
    "How Schala works on a real project — reading files, writing code and applying changes directly.",
  "l.vid.play": "Watch the demo",
  "l.vid.unavailable": "The demo video is coming soon",
  "l.vid.aria": "Play the demo video",

  "l.how.head": "Start in three steps",
  "l.how.sub": "No sign-up, no install, no waiting — open it in your browser and get to work.",
  "l.how.s1t": "Pick your model",
  "l.how.s1d": "Alina, Keyla, Vella, Trila or Schala — choose the right one in a single click.",
  "l.how.s2t": "Type or speak your question",
  "l.how.s2d": "Write text, talk into the microphone, even attach an image — the model understands your language.",
  "l.how.s3t": "Get your answer",
  "l.how.s3d": "Analysis, code, a lesson or a spoken reply — in seconds. Your chats are saved.",

  "l.dl.head": "Get it on your desktop",
  "l.dl.sub":
    "Syncrom Vella and Schala are available as standalone desktop apps — running directly on your computer, no browser needed.",
  "l.dl.notice":
    "The installer is being prepared and will be available shortly. In the meantime you can use Syncrom AI in your browser.",
  "l.dl.win": "Download for Windows",
  "l.dl.vellaLogoAlt": "Syncrom Vella logo",
  "l.dl.vellaDesc":
    "A dedicated desktop app for sales teams. Lead scoring (BANT), corporate analytics and customer communication — all in one focused, single-model interface.",
  "l.dl.vellaP1": "No login required — chats are stored locally",
  "l.dl.vellaP2": "BANT lead scoring & sales email templates",
  "l.dl.vellaP3": "Corporate dark design, works offline",
  "l.dl.vellaMeta": "Windows 10/11 · NSIS installer",
  "l.dl.schalaLogoAlt": "Schala logo",
  "l.dl.schalaTag": "AI code editor",
  "l.dl.schalaDesc":
    "Your own AI pair programmer. Real file-system access, the Monaco editor, a built-in terminal and multi-file Composer — powered by the Keyla 5.8 model.",
  "l.dl.schalaP1": "Reads your files and edits them directly",
  "l.dl.schalaP2": "Git status, Ctrl+P quick search, terminal",
  "l.dl.schalaP3": "Composer changes several files at once",
  "l.dl.schalaMeta": "Windows 10/11 · Electron",

  "l.feat.head": "Reliable, fast and fluent in your language",
  "l.feat.sub":
    "Syncrom AI models are built to grasp the nuances of Azerbaijani and hold a natural conversation.",
  "l.feat.securityT": "Data security",
  "l.feat.securityD": "Every request and everything you send is protected by top-tier encryption standards.",
  "l.feat.speedT": "Fast processing",
  "l.feat.speedD": "Long texts analysed in seconds, with structured results returned to you.",
  "l.feat.langT": "Language support",
  "l.feat.langD": "The interface comes in 4 languages (AZ, EN, RU, TR), and models reply in whichever language you write in.",
  "l.feat.visionT": "Image analysis",
  "l.feat.visionD": "Alina can analyse and describe the images you send, and answer questions about them.",
  "l.feat.imgGenT": "Image generation (free)",
  "l.feat.imgGenD":
    "Describe what you want and get an image in seconds, free — no API key, no payment.",
  "l.feat.agentT": "Code Assistant",
  "l.feat.agentD":
    "When it matters, Keyla runs the code and searches the web — it verifies the answer instead of guessing.",
  "l.feat.deepT": "Deep Think",
  "l.feat.deepD":
    "Pulls keywords from your question, researches them, and builds a step-by-step answer with sources.",
  "l.feat.webT": "Web search",
  "l.feat.webD":
    "When you need current information it pulls live results from the internet and shows the source links.",
  "l.feat.translateT": "Translation mode",
  "l.feat.translateD":
    "Translates text into 10 languages — you get a natural-sounding translation instead of a reply.",

  "l.faq.head": "Frequently asked questions",
  "l.faq.sub": "The first questions that come to mind — with short, clear answers.",
  "l.faq.q1": "Is Syncrom AI free?",
  "l.faq.a1":
    "Yes — using it in the browser is free, and you don't even need to register to start. The core features, image generation included, are free.",
  "l.faq.q2": "Can I use it without registering?",
  "l.faq.a2":
    "Yes. You can start straight away in guest mode — your chats are stored locally on your device. Create an account and they sync across all your devices.",
  "l.faq.q3": "Is my data safe?",
  "l.faq.a3":
    "Your requests travel over an encrypted connection. In guest mode chats stay in your browser only and are never stored on the server.",
  "l.faq.q4": "Which languages does it support?",
  "l.faq.a4":
    "The interface is available in Azerbaijani, English, Russian and Turkish. Models reply in whichever language you write in, and translation mode supports 10 languages.",
  "l.faq.q5": "Which model is for what?",
  "l.faq.a5":
    "Alina — analysis and reports; Keyla — programming; Vella — sales and CRM; Trila — education; Lira — creative writing; Zeyra — translation and editing; Milla — fast short answers; Schala — the desktop AI code editor. You can switch any time mid-conversation.",
  "l.faq.q6": "Where do I download the desktop apps?",
  "l.faq.a6":
    "The \"Download\" section has the Windows installers for Syncrom Vella and Schala. The browser version is fully functional too.",

  "l.cta.head": "Discover the future today",
  "l.cta.sub":
    "Get to know the Syncrom AI models — AI assistants ready for you and your team.",
  "l.cta.account": "Create an account",
  "l.cta.contact": "Get in touch",
  "l.foot.address":
    "Baku, Azerbaijan. All rights reserved. Syncrom AI is powered by its own family of AI models.",
  "l.foot.product": "Product",
  "l.foot.download": "Download",
  "l.foot.company": "Company",
  "l.foot.howTo": "How to start",
  "l.foot.contact": "Contact",
};

export const landingRu: LandingDict = {
  "l.nav.models": "Модели",
  "l.nav.schala": "Schala",
  "l.nav.download": "Скачать",
  "l.nav.features": "Возможности",
  "l.nav.faq": "Вопросы",
  "l.nav.start": "Начать",
  "l.nav.noemel": "Noemel",
  "l.noemel.tag": "Облачное пространство и Панель",
  "l.noemel.desc": "Noemel — это панель разработчика в стиле Rocket Replit для управления, запуска и развертывания проектов в облаке.",
  "l.noemel.button": "Перейти в Панель",

  "l.hero.pill": "Искусственный интеллект на вашем языке",
  "l.hero.h1": "Расширьте своё мышление с помощью ИИ",
  "l.hero.lead":
    "Syncrom AI объединяет на одной платформе специализированные модели для анализа, программирования, продаж, перевода и обучения — в браузере или на компьютере.",
  "l.hero.try": "Попробовать",
  "l.hero.desktop": "Приложения для ПК",

  "l.stats.models": "Специализированные модели ИИ",
  "l.stats.apps": "Приложения для ПК — Vella и Schala",
  "l.stats.langs": "Языка интерфейса — AZ, EN, RU, TR",
  "l.stats.price": "Чтобы начать — вход даже не требуется",

  "l.demo.alinaQ": "Можешь проанализировать эту финансовую таблицу и указать основные риски?",
  "l.demo.alinaA": "Да, по вашей таблице выделяются три основных риска:",
  "l.demo.alinaR1": "Рост операционных расходов на 12%.",
  "l.demo.alinaR2": "Инфляционное давление.",
  "l.demo.alinaR3": "Снижение коэффициента ликвидности.",
  "l.demo.alinaDesc":
    "Оптимизирована для обработки сложных данных, глубокого анализа и подготовки профессиональных отчётов.",
  "l.demo.trilaQ": "Trila, что такое фотосинтез? Я не понимаю.",
  "l.demo.trilaA":
    "Отличный вопрос! Представь фотосинтез как кухню. Растения используют солнечный свет как повар, чтобы приготовить себе еду.",
  "l.demo.trilaDesc":
    "Помощник в учёбе для школьников и студентов: объясняет темы простым языком и поддерживает мотивацию.",

  "l.models.head": "{n} моделей, одна платформа",
  "l.models.sub":
    "Каждая модель специализируется на своей задаче — выберите нужную и меняйте её в любой момент прямо в диалоге.",
  "l.models.badgeVision": "Анализ изображений",
  "l.models.badgeAgent": "Код-ассистент",

  "l.schala.badge": "Новое · Приложение для ПК",
  "l.schala.titlePre": "Знакомьтесь: ",
  "l.schala.desc":
    "Откройте свой проект — Schala прочитает файлы и, когда нужны правки, запишет их прямо в код, не спрашивая разрешения. Дерево файлов, настоящий редактор Monaco, терминал и многофайловый режим «Composer» — всё в одном окне.",
  "l.schala.p1": "Правит файлы напрямую, изменения всегда можно откатить",
  "l.schala.p2": "Composer обновляет несколько файлов сразу",
  "l.schala.p3": "Встроенный терминал, статус git, быстрый поиск файлов (Ctrl+P)",
  "l.schala.dl": "Скачать Schala",
  "l.schala.demo": "Смотреть демо",
  "l.schala.shotAlt": "Интерфейс редактора кода Schala",

  "l.vid.tag": "Демо",
  "l.vid.head": "Посмотрите в действии",
  "l.vid.sub":
    "Как Schala работает на реальном проекте — читает файлы, пишет код и сразу применяет изменения.",
  "l.vid.play": "Смотреть демо",
  "l.vid.unavailable": "Демо-видео появится скоро",
  "l.vid.aria": "Воспроизвести демо-видео",

  "l.how.head": "Начните за три шага",
  "l.how.sub": "Ни регистрации, ни установки, ни ожидания — откройте в браузере и приступайте.",
  "l.how.s1t": "Выберите модель",
  "l.how.s1d": "Alina, Keyla, Vella, Trila или Schala — нужную выбираете одним щелчком.",
  "l.how.s2t": "Напишите или скажите вопрос",
  "l.how.s2d": "Напишите текст, скажите в микрофон, даже приложите изображение — модель поймёт вас на вашем языке.",
  "l.how.s3t": "Получите результат",
  "l.how.s3d": "Анализ, код, объяснение урока или озвученный ответ — за секунды. Диалоги сохраняются.",

  "l.dl.head": "Установите на компьютер",
  "l.dl.sub":
    "Syncrom Vella и Schala доступны как отдельные приложения для ПК — работают прямо на компьютере, без браузера.",
  "l.dl.notice":
    "Установочный пакет готовится и скоро будет доступен. А пока вы можете пользоваться Syncrom AI в браузере.",
  "l.dl.win": "Скачать для Windows",
  "l.dl.vellaLogoAlt": "Логотип Syncrom Vella",
  "l.dl.vellaDesc":
    "Отдельное приложение для отделов продаж. Оценка лидов (BANT), корпоративная аналитика и общение с клиентами — в одном сфокусированном интерфейсе с одной моделью.",
  "l.dl.vellaP1": "Вход не требуется — диалоги хранятся локально",
  "l.dl.vellaP2": "BANT-оценка лидов и шаблоны продающих писем",
  "l.dl.vellaP3": "Корпоративная тёмная тема, работает офлайн",
  "l.dl.vellaMeta": "Windows 10/11 · установщик NSIS",
  "l.dl.schalaLogoAlt": "Логотип Schala",
  "l.dl.schalaTag": "ИИ-редактор кода",
  "l.dl.schalaDesc":
    "Ваш ИИ-напарник в программировании. Доступ к реальной файловой системе, редактор Monaco, встроенный терминал и многофайловый Composer — на модели Keyla 5.8.",
  "l.dl.schalaP1": "Читает ваши файлы и правит их напрямую",
  "l.dl.schalaP2": "Статус git, быстрый поиск Ctrl+P, терминал",
  "l.dl.schalaP3": "Composer меняет несколько файлов одновременно",
  "l.dl.schalaMeta": "Windows 10/11 · Electron",

  "l.feat.head": "Надёжно, быстро и на вашем языке",
  "l.feat.sub":
    "Модели Syncrom AI созданы, чтобы понимать тонкости азербайджанского языка и вести естественный диалог.",
  "l.feat.securityT": "Безопасность данных",
  "l.feat.securityD": "Все ваши запросы и данные защищены шифрованием высшего уровня.",
  "l.feat.speedT": "Быстрая обработка",
  "l.feat.speedD": "Анализируем длинные тексты за секунды и выдаём структурированный результат.",
  "l.feat.langT": "Поддержка языков",
  "l.feat.langD": "Интерфейс на 4 языках (AZ, EN, RU, TR), а модели отвечают на том языке, на котором вы пишете.",
  "l.feat.visionT": "Анализ изображений",
  "l.feat.visionD": "Alina умеет анализировать и описывать присланные изображения и отвечать на вопросы по ним.",
  "l.feat.imgGenT": "Генерация изображений (бесплатно)",
  "l.feat.imgGenD":
    "Опишите, что нужно, и получите изображение за секунды бесплатно — без API-ключа и оплаты.",
  "l.feat.agentT": "Код-ассистент",
  "l.feat.agentD":
    "Когда нужно, Keyla выполняет код и ищет в интернете — она не угадывает ответ, а проверяет его.",
  "l.feat.deepT": "Deep Think",
  "l.feat.deepD":
    "Извлекает ключевые слова из вопроса, изучает их и строит пошаговый ответ с указанием источников.",
  "l.feat.webT": "Поиск в интернете",
  "l.feat.webD":
    "Когда нужны актуальные данные, подтягивает live-результаты из сети и показывает ссылки на источники.",
  "l.feat.translateT": "Режим перевода",
  "l.feat.translateD":
    "Переводит текст на 10 языков — вместо ответа вы получаете естественно звучащий перевод.",

  "l.faq.head": "Частые вопросы",
  "l.faq.sub": "Первые вопросы, которые приходят в голову — с короткими и понятными ответами.",
  "l.faq.q1": "Syncrom AI бесплатный?",
  "l.faq.a1":
    "Да — в браузере пользоваться бесплатно, и для начала не нужна даже регистрация. Основные функции, включая генерацию изображений, бесплатны.",
  "l.faq.q2": "Можно пользоваться без регистрации?",
  "l.faq.a2":
    "Да. В гостевом режиме можно начать сразу — диалоги хранятся локально на вашем устройстве. Если создать аккаунт, они синхронизируются между всеми устройствами.",
  "l.faq.q3": "Мои данные в безопасности?",
  "l.faq.a3":
    "Запросы передаются по шифрованному соединению. В гостевом режиме диалоги остаются только в вашем браузере и на сервере не хранятся.",
  "l.faq.q4": "Какие языки поддерживаются?",
  "l.faq.a4":
    "Интерфейс доступен на азербайджанском, английском, русском и турецком. Модели отвечают на языке вашего сообщения, а режим перевода поддерживает 10 языков.",
  "l.faq.q5": "Какая модель для чего?",
  "l.faq.a5":
    "Alina — анализ и отчёты; Keyla — программирование; Vella — продажи и CRM; Trila — обучение; Lira — креативные тексты; Zeyra — перевод и редактура; Milla — быстрые короткие ответы; Schala — ИИ-редактор кода для ПК. Модель можно сменить в любой момент диалога.",
  "l.faq.q6": "Где скачать приложения для ПК?",
  "l.faq.a6":
    "В разделе «Скачать» есть установщики для Windows для Syncrom Vella и Schala. Браузерная версия тоже полностью работоспособна.",

  "l.cta.head": "Откройте будущее сегодня",
  "l.cta.sub":
    "Познакомьтесь с моделями Syncrom AI — ИИ-помощниками, готовыми для вас и вашей команды.",
  "l.cta.account": "Создать аккаунт",
  "l.cta.contact": "Связаться с нами",
  "l.foot.address":
    "Баку, Азербайджан. Все права защищены. Syncrom AI работает на собственном семействе моделей ИИ.",
  "l.foot.product": "Продукт",
  "l.foot.download": "Скачать",
  "l.foot.company": "Компания",
  "l.foot.howTo": "С чего начать",
  "l.foot.contact": "Контакты",
};

export const landingTr: LandingDict = {
  "l.nav.models": "Modeller",
  "l.nav.schala": "Schala",
  "l.nav.download": "İndir",
  "l.nav.features": "Özellikler",
  "l.nav.faq": "SSS",
  "l.nav.start": "Başla",
  "l.nav.noemel": "Noemel",
  "l.noemel.tag": "Bulut Çalışma Alanı & Panel",
  "l.noemel.desc": "Noemel, projelerinizi bulutta yönetmek, çalıştırmak ve dağıtmak için Rocket Replit benzeri bir geliştirici panelidir.",
  "l.noemel.button": "Panele Git",

  "l.hero.pill": "Kendi dilinizde yapay zekâ",
  "l.hero.h1": "Yapay zekâ ile düşünme biçiminizi genişletin",
  "l.hero.lead":
    "Syncrom AI; analiz, yazılım, satış, çeviri ve eğitim için uzmanlaşmış zekâ modellerini tek platformda sunar — tarayıcıda ya da masaüstünde.",
  "l.hero.try": "Hemen deneyin",
  "l.hero.desktop": "Masaüstü uygulamalar",

  "l.stats.models": "Uzmanlaşmış zekâ modeli",
  "l.stats.apps": "Masaüstü uygulama — Vella & Schala",
  "l.stats.langs": "Arayüz dili — AZ, EN, RU, TR",
  "l.stats.price": "Başlamak için — giriş bile gerekmiyor",

  "l.demo.alinaQ": "Bu finansal tabloyu analiz edip temel riskleri belirtebilir misin?",
  "l.demo.alinaA": "Evet, paylaştığınız tabloya göre üç temel risk öne çıkıyor:",
  "l.demo.alinaR1": "İşletme giderlerinde %12 artış.",
  "l.demo.alinaR2": "Enflasyon baskısı.",
  "l.demo.alinaR3": "Likidite oranındaki düşüş.",
  "l.demo.alinaDesc":
    "Karmaşık verileri işlemek, derin analiz yapmak ve profesyonel raporlar hazırlamak için optimize edilmiştir.",
  "l.demo.trilaQ": "Trila, fotosentez nedir? Anlamıyorum.",
  "l.demo.trilaA":
    "Çok güzel bir soru! Fotosentezi bir mutfak gibi düşün. Bitkiler güneş ışığını bir aşçı gibi kullanarak kendi yemeklerini hazırlar.",
  "l.demo.trilaDesc":
    "Öğrenciler için konuları sade dille anlatan, motive eden bir öğrenme arkadaşı.",

  "l.models.head": "{n} model, tek platform",
  "l.models.sub":
    "Her model belirli bir iş için uzmanlaşmıştır — ihtiyacınıza uygun olanı seçin, sohbet sırasında dilediğiniz an değiştirin.",
  "l.models.badgeVision": "Görsel analizi",
  "l.models.badgeAgent": "Kod Asistanı",

  "l.schala.badge": "Yeni · Masaüstü uygulama",
  "l.schala.titlePre": "Tanışın: ",
  "l.schala.desc":
    "Kendi projenizi açın; Schala dosyalarınızı okusun, değişiklik gerektiğinde izin istemeden doğrudan koda yazsın. Dosya ağacı, gerçek Monaco editörü, terminal ve çok dosyalı \"Composer\" modu — hepsi tek pencerede.",
  "l.schala.p1": "Dosyayı doğrudan düzenler, değişiklikleri her zaman geri alabilirsiniz",
  "l.schala.p2": "Composer birden fazla dosyayı aynı anda güncelller",
  "l.schala.p3": "Dahili terminal, git durumu, hızlı dosya arama (Ctrl+P)",
  "l.schala.dl": "Schala'yı indir",
  "l.schala.demo": "Demoyu izle",
  "l.schala.shotAlt": "Schala kod editörü arayüzü",

  "l.vid.tag": "Demo",
  "l.vid.head": "İş başında görün",
  "l.vid.sub":
    "Schala gerçek bir projede nasıl çalışıyor — dosya okuyor, kod yazıyor ve değişiklikleri doğrudan uyguluyor.",
  "l.vid.play": "Demoyu izleyin",
  "l.vid.unavailable": "Demo videosu çok yakında eklenecek",
  "l.vid.aria": "Demo videosunu oynat",

  "l.how.head": "Üç adımda başlayın",
  "l.how.sub": "Kayıt, kurulum, bekleme yok — tarayıcıda açın ve hemen çalışmaya başlayın.",
  "l.how.s1t": "Modelinizi seçin",
  "l.how.s1d": "Alina, Keyla, Vella, Trila ya da Schala — işinize uygun olanı tek tıkla seçin.",
  "l.how.s2t": "Sorunuzu yazın ya da söyleyin",
  "l.how.s2d": "Metin yazın, mikrofona konuşun, hatta görsel ekleyin — model sizi kendi dilinizde anlar.",
  "l.how.s3t": "Sonucu alın",
  "l.how.s3d": "Analiz, kod, ders anlatımı ya da sesli yanıt — saniyeler içinde. Sohbetleriniz saklanır.",

  "l.dl.head": "Masaüstüne kurun",
  "l.dl.sub":
    "Syncrom Vella ve Schala bağımsız masaüstü uygulamalar olarak mevcut — tarayıcı olmadan, doğrudan bilgisayarınızda çalışır.",
  "l.dl.notice":
    "Kurulum paketi hazırlanıyor, çok yakında erişilebilir olacak. Bu arada Syncrom AI'yı tarayıcıda kullanabilirsiniz.",
  "l.dl.win": "Windows için indir",
  "l.dl.vellaLogoAlt": "Syncrom Vella logosu",
  "l.dl.vellaDesc":
    "Satış ekipleri için ayrı bir masaüstü uygulaması. Müşteri adayı puanlama (BANT), kurumsal analitik ve müşteri iletişimi — hepsi odaklı, tek modelli bir arayüzde.",
  "l.dl.vellaP1": "Giriş gerekmez — sohbetler yerel olarak saklanır",
  "l.dl.vellaP2": "BANT puanlama ve satış e-postası şablonları",
  "l.dl.vellaP3": "Kurumsal koyu tasarım, çevrimdışı çalışır",
  "l.dl.vellaMeta": "Windows 10/11 · NSIS yükleyici",
  "l.dl.schalaLogoAlt": "Schala logosu",
  "l.dl.schalaTag": "Yapay zekâ kod editörü",
  "l.dl.schalaDesc":
    "Kendi yapay zekâ eş-programcınız. Gerçek dosya sistemi erişimi, Monaco editörü, dahili terminal ve çok dosyalı Composer — Keyla 5.8 modeliyle güçlendirilmiştir.",
  "l.dl.schalaP1": "Dosyalarınızı okur ve doğrudan düzenler",
  "l.dl.schalaP2": "Git durumu, Ctrl+P hızlı arama, terminal",
  "l.dl.schalaP3": "Composer birden fazla dosyayı aynı anda değiştirir",
  "l.dl.schalaMeta": "Windows 10/11 · Electron",

  "l.feat.head": "Güvenilir, hızlı ve dilinize uygun",
  "l.feat.sub":
    "Syncrom AI modelleri Azerbaycan dilinin inceliklerini anlamak ve doğal bir iletişim kurmak için hazırlanmıştır.",
  "l.feat.securityT": "Veri güvenliği",
  "l.feat.securityD": "Tüm istekleriniz ve verileriniz en üst düzey şifreleme standartlarıyla korunur.",
  "l.feat.speedT": "Hızlı işleme",
  "l.feat.speedD": "Uzun metinleri saniyeler içinde analiz edip yapılandırılmış sonuçlar sunuyoruz.",
  "l.feat.langT": "Dil desteği",
  "l.feat.langD": "Arayüz 4 dilde (AZ, EN, RU, TR), modeller ise yazdığınız dilde yanıt verir.",
  "l.feat.visionT": "Görsel analizi",
  "l.feat.visionD": "Alina gönderdiğiniz görselleri analiz edip tanımlayabilir ve sorularınızı yanıtlayabilir.",
  "l.feat.imgGenT": "Görsel oluşturma (ücretsiz)",
  "l.feat.imgGenD":
    "İstediğinizi anlatın, saniyeler içinde ücretsiz görsel oluşsun — API anahtarı ya da ödeme gerekmez.",
  "l.feat.agentT": "Kod Asistanı",
  "l.feat.agentD":
    "Gerektiğinde Keyla kodu çalıştırır, internette arama yapar — yanıtı tahmin etmez, doğrular.",
  "l.feat.deepT": "Deep Think",
  "l.feat.deepD":
    "Sorudan anahtar kelime çıkarır, araştırma yapar ve adım adım gerekçelendirilmiş, kaynaklı bir yanıt kurar.",
  "l.feat.webT": "Web araması",
  "l.feat.webD":
    "Güncel bilgi gerektiğinde internetten canlı sonuç çeker ve kaynak bağlantılarını gösterir.",
  "l.feat.translateT": "Çeviri modu",
  "l.feat.translateD":
    "Metni 10 dile çevirir — yanıt yerine doğal duran bir çeviri alırsınız.",

  "l.faq.head": "Sıkça sorulan sorular",
  "l.faq.sub": "Akla ilk gelen sorular — kısa ve net yanıtlarla.",
  "l.faq.q1": "Syncrom AI ücretsiz mi?",
  "l.faq.a1":
    "Evet — tarayıcıda kullanım ücretsiz ve başlamak için kayıt bile gerekmiyor. Görsel oluşturma dahil temel işlevler ücretsizdir.",
  "l.faq.q2": "Kayıt olmadan kullanabilir miyim?",
  "l.faq.a2":
    "Evet. Misafir modunda hemen başlayabilirsiniz — sohbetleriniz cihazınızda yerel olarak saklanır. Hesap açarsanız tüm cihazlarınız arasında senkronize olur.",
  "l.faq.q3": "Verilerim güvende mi?",
  "l.faq.a3":
    "İstekleriniz şifreli bağlantı üzerinden iletilir. Misafir modunda sohbetler yalnızca tarayıcınızda kalır, sunucuda saklanmaz.",
  "l.faq.q4": "Hangi dilleri destekliyor?",
  "l.faq.a4":
    "Arayüz Azerbaycan, İngilizce, Rusça ve Türkçe dillerinde. Modeller yazdığınız dilde yanıt verir, çeviri modu ise 10 dili destekler.",
  "l.faq.q5": "Hangi model ne için?",
  "l.faq.a5":
    "Alina — analiz ve raporlar; Keyla — programlama; Vella — satış ve CRM; Trila — eğitim; Lira — yaratıcı metin; Zeyra — çeviri ve editörlük; Milla — hızlı kısa yanıtlar; Schala — masaüstü yapay zekâ kod editörü. Sohbet sırasında dilediğiniz an değiştirebilirsiniz.",
  "l.faq.q6": "Masaüstü uygulamalarını nereden indirebilirim?",
  "l.faq.a6":
    "«İndir» bölümünden Syncrom Vella ve Schala için Windows yükleyicilerini indirebilirsiniz. Tarayıcı sürümü de tam işlevseldir.",

  "l.cta.head": "Geleceği bugün keşfedin",
  "l.cta.sub":
    "Syncrom AI modelleriyle tanışın — sizin ve ekibiniz için hazır yapay zekâ asistanları.",
  "l.cta.account": "Hesap oluşturun",
  "l.cta.contact": "Bize ulaşın",
  "l.foot.address":
    "Bakü, Azerbaycan. Tüm hakları saklıdır. Syncrom AI kendi zekâ modelleri tarafından çalıştırılır.",
  "l.foot.product": "Ürün",
  "l.foot.download": "İndir",
  "l.foot.company": "Şirket",
  "l.foot.howTo": "Nasıl başlanır",
  "l.foot.contact": "İletişim",
};
