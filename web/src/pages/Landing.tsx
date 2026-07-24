import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const MODELS = [
  { tagClass: "l-tag-alina", tag: "Analitik Köməkçi", name: "Alina 1.6", desc: "Dərin analiz, hesabatlar və mürəkkəb məsələlərin həlli üçün." },
  { tagClass: "l-tag-alina", tag: "Analitik Köməkçi Pro", name: "Alina 1.7", badge: "Şəkil analizi", desc: "Alina 1.6-nın təkmilləşdirilmiş versiyası — şəkil, cədvəl və qrafikləri oxuyub təhlil edir." },
  { tagClass: "l-tag-keyla", tag: "Kod Mütəxəssisi", name: "Keyla 5.8", badge: "Kod Köməkçisi", desc: "Proqramlaşdırma, debug, arxitektura — kodu təkcə yazmır, təhlükəsiz mühitdə İCRA edib nəticəni yoxlayır." },
  { tagClass: "l-tag-vella", tag: "B2B CRM & Satış", name: "Syncrom Vella", desc: "Satış avtomatlaşdırılması, lead qiymətləndirməsi, korporativ analitika və B2B müştəri xidmətləri." },
  { tagClass: "l-tag-trila", tag: "Virtual Müəllim", name: "Trila 1.4", desc: "Mövzuları sadə dildə izah edən, motivasiya verən öyrətmə yoldaşı." },
];

const HERO_CHIPS = [
  { label: "Alina", tagClass: "l-tag-alina" },
  { label: "Keyla", tagClass: "l-tag-keyla" },
  { label: "Vella", tagClass: "l-tag-vella" },
  { label: "Trila", tagClass: "l-tag-trila" },
  { label: "Schala", tagClass: "l-tag-schala" },
];

const FEATURES = [
  { title: "Məlumat Təhlükəsizliyi", desc: "Bütün sorğularınız və məlumatlarınız ən yüksək səviyyəli şifrələmə standartları ilə qorunur.", icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
  { title: "Sürətli Emal", desc: "Saniyələr içində uzun mətnləri analiz edir və strukturlaşdırılmış nəticələri təqdim edirik.", icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
  { title: "Dil Dəstəyi", desc: "Azərbaycan dili üzərində tam ixtisaslaşmış modellər ilə təbii ünsiyyət qurun.", icon: <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" /> },
  { title: "Şəkil Analizi", desc: "Alina göndərilən şəkilləri analiz edib təsvir edə və suallarınıza cavab verə bilir.", icon: <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /> },
  { title: "Şəkil yaratma (pulsuz)", desc: "İstədiyini təsvir et, saniyələr içində pulsuz şəkil yaradılsın — API açarı, ödəniş tələb olunmur.", icon: <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" /> },
  { title: "Kod Köməkçisi", desc: "Keyla lazım gələndə kodu icra edir, internetdə axtarış edir — cavabı güman etmir, yoxlayır.", icon: <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" /> },
  { title: "Deep Think", desc: "Sualdan açar söz çıxarır, araşdırma aparır, addım-addım əsaslandırılmış, mənbəli cavab qurur.", icon: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /> },
  { title: "Addım-addım izah", desc: "Trila çətin mövzuları kiçik hissələrə bölərək şagirdlərə öyrətməyə yönəlir.", icon: <path d="M4 6h16M4 12h16M4 18h7" /> },
  { title: "B2B satış & CRM", desc: "Vella lead-ləri qiymətləndirir, satış prosesini idarə edir və korporativ hesabatlar hazırlayır.", icon: <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" /> },
];

const WindowsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 5.5L10.5 4.4v7.1H3V5.5zm0 13L10.5 19.6v-7H3v6zm8.5 1.3L21 21V12.5h-9.5v7.3zM11.5 4.2L21 3v8.5h-9.5V4.2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
  </svg>
);

export default function Landing() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [demoUnavailable, setDemoUnavailable] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("download") === "pending") {
      setDownloadPending(true);
    }
  }, []);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => setPlaying(true)).catch(() => setDemoUnavailable(true));
    }
  }

  return (
    <div className="landing-page">
      <nav className="l-nav">
        <div className="l-container l-nav-inner">
          <a href="/" className="l-brand">
            <span className="l-logo">
              <i />
            </span>
            <span>Syncrom AI</span>
          </a>
          <div className="l-nav-links">
            <a href="#models">Modellər</a>
            <a href="#schala">Schala</a>
            <a href="#download">Yüklə</a>
            <a href="#features">Xüsusiyyətlər</a>
          </div>
          <a href="/chat" className="l-btn l-btn-primary">
            Başla
          </a>
        </div>
      </nav>

      <section className="l-hero">
        <div className="l-container">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="l-pill">
              <span className="l-dot" /> Azərbaycan dilində süni zəka
            </div>
          </motion.div>
          <motion.h1
            className="l-h1"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.08 }}
          >
            Süni zəka ilə düşüncə tərzinizi genişləndirin
          </motion.h1>
          <motion.p
            className="l-lead"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.16 }}
          >
            Syncrom AI analiz, kodlaşdırma, satış və təhsil üçün 5 ixtisaslaşmış zəka modelini bir
            platformada təqdim edir — brauzerdə və ya masaüstündə.
          </motion.p>
          <motion.div
            className="l-actions"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.24 }}
          >
            <a href="/chat" className="l-btn l-btn-primary">
              İndi yoxlayın
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a href="#download" className="l-btn l-btn-ghost">
              <DownloadIcon />
              Masaüstü tətbiqlər
            </a>
          </motion.div>
          <motion.div
            className="l-hero-chips"
            initial="hidden"
            animate="show"
            variants={stagger}
            transition={{ delayChildren: 0.32 }}
          >
            {HERO_CHIPS.map((c) => (
              <motion.span key={c.label} className={`l-hero-chip ${c.tagClass}`} variants={fadeUp}>
                <span className="l-dot" /> {c.label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="models" className="l-models">
        <div className="l-container">
          <div className="l-models-grid">
            <motion.article
              className="l-model"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <div className="l-tag l-tag-alina">
                <span className="l-dot" /> Analitik Köməkçi
              </div>
              <h2>Alina 1.6</h2>
              <p className="l-desc">
                Mürəkkəb məlumatları emal etmək, dərin analizlər aparmaq və peşəkar hesabatlar
                hazırlamaq üçün optimallaşdırılmışdır.
              </p>
              <div className="l-mockchat">
                <div className="l-mmsg">
                  <div className="l-mavatar l-mavatar-alina">A</div>
                  <div className="l-mbubble in">Bu maliyyə cədvəlini analiz edib əsas riskləri qeyd edə bilərsən?</div>
                </div>
                <div className="l-mmsg out">
                  <div className="l-mavatar l-mavatar-bot">
                    <i />
                  </div>
                  <div className="l-mbubble out">
                    Bəli, təqdim etdiyiniz cədvələ əsasən 3 əsas risk müəyyən edilmişdir:
                    <ol>
                      <li>Əməliyyat xərclərinin 12% artımı.</li>
                      <li>İnflyasiya təzyiqi.</li>
                      <li>Likvidlik nisbətinin azalması.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </motion.article>

            <motion.article
              className="l-model"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            >
              <div className="l-tag l-tag-trila">
                <span className="l-dot" /> Virtual Müəllim
              </div>
              <h2>Trila 1.4</h2>
              <p className="l-desc">
                Şagirdlər və tələbələr üçün mövzuları sadə dildə izah edən, motivasiya verən
                öyrətmə yoldaşı.
              </p>
              <div className="l-mockchat">
                <div className="l-mmsg">
                  <div className="l-mavatar l-mavatar-trila">T</div>
                  <div className="l-mbubble in">Trila, fotosintez nədir? Başa düşmürəm.</div>
                </div>
                <div className="l-mmsg out">
                  <div className="l-mavatar l-mavatar-bot">
                    <i />
                  </div>
                  <div className="l-mbubble out l-italic">
                    Çox gözəl sualdır! Fotosintezi bir mətbəx kimi düşünək. Bitkilər günəş
                    işığını aşpaz kimi istifadə edərək özlərinə yemək hazırlayırlar.
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section id="all-models" className="l-all-models">
        <div className="l-container">
          <motion.div
            className="l-section-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>5 model, bir platforma</h2>
            <p>Hər model müəyyən bir iş üçün ixtisaslaşıb — ehtiyacına uyğun olanı seç, söhbət daxilində istənilən vaxt dəyiş.</p>
          </motion.div>
          <motion.div
            className="l-model-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {MODELS.map((m) => (
              <motion.a
                key={m.name}
                href="/chat"
                className="l-model-card"
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,.08)" }}
                transition={{ duration: 0.2 }}
              >
                <div className={`l-tag ${m.tagClass}`}>
                  <span className="l-dot" /> {m.tag}
                </div>
                <h3>
                  {m.name} {m.badge && <span className="l-badge">{m.badge}</span>}
                </h3>
                <p>{m.desc}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="schala" className="l-schala">
        <div className="l-container l-schala-grid">
          <motion.div
            className="l-schala-copy"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="l-tag l-tag-schala">
              <span className="l-dot" /> Yeni · Masaüstü tətbiq
            </div>
            <h2>
              Tanış olun: <strong>Schala</strong>
            </h2>
            <p className="l-desc">
              Öz layihənizi açın, Schala fayllarınızı oxusun, dəyişiklik istəyəndə icazə soruşmadan
              birbaşa koda yazsın. Fayl ağacı, real Monaco redaktoru, terminal və çoxfayllı
              "Composer" rejimi — hamısı bir pəncərədə.
            </p>
            <ul className="l-schala-points">
              <li>Faylı birbaşa redaktə edir, dəyişiklikləri həmişə geri ala bilərsiniz</li>
              <li>Composer bir neçə faylı eyni anda yeniləyir</li>
              <li>Daxili terminal, git statusu, sürətli fayl axtarışı (Ctrl+P)</li>
            </ul>
            <div className="l-schala-actions">
              <a href="#download" className="l-btn l-btn-primary">
                <DownloadIcon />
                Schala-nı yüklə
              </a>
              <a href="#demo" className="l-btn l-btn-ghost">
                Demoya bax
              </a>
            </div>
          </motion.div>

          <motion.div
            className="l-schala-shot"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
          >
            <div className="l-shot-frame">
              <div className="l-shot-bar">
                <span className="l-schala-mockdot" />
                <span className="l-schala-mockdot" />
                <span className="l-schala-mockdot" />
                <span className="l-schala-mock-title">Schala — my-project</span>
              </div>
              <img src="/schala-preview.png" alt="Schala kod redaktoru interfeysi" loading="lazy" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="demo" className="l-demo">
        <div className="l-container">
          <motion.div
            className="l-section-head l-demo-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="l-tag l-tag-schala">
              <span className="l-dot" /> Demo
            </div>
            <h2>İş başında görün</h2>
            <p>Schala real layihədə necə işləyir — fayl oxuyur, kod yazır və dəyişiklikləri birbaşa tətbiq edir.</p>
          </motion.div>

          <motion.div
            className="l-demo-frame"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <video
              ref={videoRef}
              className="l-demo-video"
              poster="/schala-preview.png"
              preload="none"
              playsInline
              controls={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => {
                setPlaying(false);
                setDemoUnavailable(true);
              }}
            >
              <source src="/schala-demo.mp4" type="video/mp4" />
            </video>

            {!playing && (
              <button type="button" className="l-demo-play" onClick={handlePlay} aria-label="Demo videosunu oynat">
                <span className="l-demo-play-btn">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="l-demo-play-label">
                  {demoUnavailable ? "Demo videosu tezliklə əlavə olunacaq" : "Demonu izləyin"}
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section id="download" className="l-download">
        <div className="l-container">
          <motion.div
            className="l-section-head l-download-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>Masaüstünə yükləyin</h2>
            <p>Syncrom Vella və Schala müstəqil masaüstü tətbiqlər kimi mövcuddur — brauzer olmadan, birbaşa kompüterinizdə işləyir.</p>
          </motion.div>

          {downloadPending && (
            <div className="l-download-notice" role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              Quraşdırma paketi hazırlanır — tezliklə əlçatan olacaq. Bu arada Syncrom AI-ı brauzerdə istifadə edə bilərsiniz.
            </div>
          )}

          <div className="l-download-grid">
            <motion.div
              className="l-dl-card l-dl-vella"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <div className="l-dl-top">
                <div className="l-dl-logo l-dl-logo-light">
                  <img src="/vella-logo.png" alt="Syncrom Vella loqosu" />
                </div>
                <div className="l-tag l-tag-vella">
                  <span className="l-dot" /> B2B CRM & Satış
                </div>
              </div>
              <h3>Syncrom Vella</h3>
              <p>
                Satış komandaları üçün ayrıca masaüstü tətbiq. Lead qiymətləndirməsi (BANT),
                korporativ analitika və müştəri ünsiyyəti — hamısı fokuslanmış, tək-model interfeysdə.
              </p>
              <ul className="l-dl-points">
                <li>Login tələb olunmur — söhbətlər lokal saxlanılır</li>
                <li>BANT lead-scoring & satış e-poçt şablonları</li>
                <li>Korporativ tünd dizayn, offline işləyir</li>
              </ul>
              <a href="/downloads/Syncrom-Vella-Setup.exe" className="l-btn l-dl-btn l-dl-btn-vella" download>
                <WindowsIcon />
                Windows üçün yüklə
              </a>
              <p className="l-dl-meta">Windows 10/11 · NSIS installer</p>
            </motion.div>

            <motion.div
              className="l-dl-card l-dl-schala"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            >
              <div className="l-dl-top">
                <div className="l-dl-logo l-dl-logo-dark">
                  <img src="/schala-logo.png" alt="Schala loqosu" />
                </div>
                <div className="l-tag l-tag-schala">
                  <span className="l-dot" /> AI Kod Redaktoru
                </div>
              </div>
              <h3>Schala</h3>
              <p>
                Öz AI cüt-proqramçınız. Real fayl sisteminə çıxış, Monaco redaktoru, daxili terminal
                və çoxfayllı Composer — Keyla 5.8 modeli ilə gücləndirilib.
              </p>
              <ul className="l-dl-points">
                <li>Fayllarınızı oxuyur və birbaşa redaktə edir</li>
                <li>Git statusu, Ctrl+P sürətli axtarış, terminal</li>
                <li>Composer bir neçə faylı eyni anda dəyişir</li>
              </ul>
              <a href="/downloads/Schala-Setup.exe" className="l-btn l-dl-btn l-dl-btn-schala" download>
                <WindowsIcon />
                Windows üçün yüklə
              </a>
              <p className="l-dl-meta">Windows 10/11 · Electron</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="l-features">
        <div className="l-container">
          <motion.div
            className="l-section-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>Etibarlı, sürətli və dilimizə uyğun</h2>
            <p>Syncrom AI modelləri Azərbaycan dilinin incəliklərini başa düşmək və təbii ünsiyyət qurmaq üçün hazırlanmışdır.</p>
          </motion.div>
          <motion.div
            className="l-feature-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                className="l-feature"
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <div className="l-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="cta" className="l-cta">
        <div className="l-container">
          <motion.div
            className="l-cta-card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>Gələcəyi bu gün kəşf edin</h2>
            <p>Alina, Keyla, Vella və Trila ilə tanış olun — sizin və komandanız üçün hazır süni zəka köməkçiləri.</p>
            <div className="l-cta-actions">
              <a href="/chat" className="l-btn-light">
                Hesab yaradın
              </a>
              <a href="mailto:syncromai@gmail.com" className="l-btn-outline-light">
                Bizimlə əlaqə
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer>
        <div className="l-container l-foot">
          <div className="l-foot-brand">
            <div className="l-brand">
              <span className="l-logo" style={{ width: 20, height: 20 }}>
                <i style={{ width: 6, height: 6 }} />
              </span>
              <span>Syncrom AI</span>
            </div>
            <p>Bakı, Azərbaycan. Bütün hüquqlar qorunur. Syncrom AI zəka modelləri tərəfindən idarə olunur.</p>
          </div>
          <div className="l-foot-cols">
            <div>
              <h4>Məhsul</h4>
              <a href="#models">Alina 1.6 / 1.7</a>
              <a href="#all-models">Keyla 5.8</a>
              <a href="#all-models">Syncrom Vella</a>
              <a href="#models">Trila 1.4</a>
              <a href="#schala">Schala</a>
            </div>
            <div>
              <h4>Yüklə</h4>
              <a href="#download">Syncrom Vella</a>
              <a href="#download">Schala</a>
              <a href="#demo">Demo</a>
            </div>
            <div>
              <h4>Şirkət</h4>
              <a href="mailto:syncromai@gmail.com">Əlaqə</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
