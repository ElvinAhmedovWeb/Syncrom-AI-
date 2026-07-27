import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { LANGS, useI18n } from "../lib/i18n";
import { fetchModels } from "../lib/api";
import type { ModelInfo } from "../types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const HERO_CHIPS = [
  { label: "Alina", tagClass: "l-tag-alina" },
  { label: "Keyla", tagClass: "l-tag-keyla" },
  { label: "Vella", tagClass: "l-tag-vella" },
  { label: "Trila", tagClass: "l-tag-trila" },
  { label: "Schala", tagClass: "l-tag-schala" },
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
  const { t, lang, setLang } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [demoUnavailable, setDemoUnavailable] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("download") === "pending") {
      setDownloadPending(true);
    }
  }, []);

  // Model kartları serverdən gəlir — yeni model əlavə edildikdə landing
  // özü yenilənir, siyahını iki yerdə saxlamağa ehtiyac qalmır.
  useEffect(() => {
    fetchModels(lang).then((data) => data && setModels(data.models));
  }, [lang]);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => setPlaying(true)).catch(() => setDemoUnavailable(true));
    }
  }

  const FEATURES = [
    { title: t("l.feat.securityT"), desc: t("l.feat.securityD"), icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
    { title: t("l.feat.speedT"), desc: t("l.feat.speedD"), icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { title: t("l.feat.langT"), desc: t("l.feat.langD"), icon: <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" /> },
    { title: t("l.feat.visionT"), desc: t("l.feat.visionD"), icon: <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /> },
    { title: t("l.feat.imgGenT"), desc: t("l.feat.imgGenD"), icon: <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" /> },
    { title: t("l.feat.agentT"), desc: t("l.feat.agentD"), icon: <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" /> },
    { title: t("l.feat.deepT"), desc: t("l.feat.deepD"), icon: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /> },
    { title: t("l.feat.webT"), desc: t("l.feat.webD"), icon: <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM3.4 9h17.2M3.4 15h17.2M12 3a14 14 0 000 18M12 3a14 14 0 010 18" /> },
    { title: t("l.feat.translateT"), desc: t("l.feat.translateD"), icon: <path d="M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8M6 12.5c0 2 2.5 4 6 4.5M13 20l4-10 4 10M14.6 17h4.8" /> },
  ];

  const STATS = [
    { num: String(models.length || 8), label: t("l.stats.models") },
    { num: "2", label: t("l.stats.apps") },
    { num: "4", label: t("l.stats.langs") },
    { num: "0 ₼", label: t("l.stats.price") },
  ];

  const STEPS = [
    { title: t("l.how.s1t"), desc: t("l.how.s1d") },
    { title: t("l.how.s2t"), desc: t("l.how.s2d") },
    { title: t("l.how.s3t"), desc: t("l.how.s3d") },
  ];

  const FAQ = [
    { q: t("l.faq.q1"), a: t("l.faq.a1") },
    { q: t("l.faq.q2"), a: t("l.faq.a2") },
    { q: t("l.faq.q3"), a: t("l.faq.a3") },
    { q: t("l.faq.q4"), a: t("l.faq.a4") },
    { q: t("l.faq.q5"), a: t("l.faq.a5") },
    { q: t("l.faq.q6"), a: t("l.faq.a6") },
  ];

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
            <a href="#models">{t("l.nav.models")}</a>
            <a href="#schala">{t("l.nav.schala")}</a>
            <a href="#download">{t("l.nav.download")}</a>
            <a href="#features">{t("l.nav.features")}</a>
            <a href="#faq">{t("l.nav.faq")}</a>
            <a href="/about">{t("a.nav.link")}</a>
          </div>
          <div className="l-nav-right">
            <div className="l-langs" role="group" aria-label={t("acct.language")}>
              {LANGS.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  className={`l-lang${l.code === lang ? " active" : ""}`}
                  title={l.label}
                  aria-pressed={l.code === lang}
                  onClick={() => setLang(l.code)}
                >
                  {l.short}
                </button>
              ))}
            </div>
            <a href="/chat" className="l-btn l-btn-primary">
              {t("l.nav.start")}
            </a>
          </div>
        </div>
      </nav>

      <section className="l-hero">
        <div className="l-container">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="l-pill">
              <span className="l-dot" /> {t("l.hero.pill")}
            </div>
          </motion.div>
          <motion.h1
            className="l-h1"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.08 }}
          >
            {t("l.hero.h1")}
          </motion.h1>
          <motion.p
            className="l-lead"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.16 }}
          >
            {t("l.hero.lead")}
          </motion.p>
          <motion.div
            className="l-actions"
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.24 }}
          >
            <a href="/chat" className="l-btn l-btn-primary">
              {t("l.hero.try")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a href="#download" className="l-btn l-btn-ghost">
              <DownloadIcon />
              {t("l.hero.desktop")}
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

      <section className="l-stats">
        <div className="l-container">
          <motion.div
            className="l-stats-row"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
          >
            {STATS.map((s) => (
              <motion.div key={s.label} className="l-stat" variants={fadeUp}>
                <span className="l-stat-num">{s.num}</span>
                <span className="l-stat-label">{s.label}</span>
              </motion.div>
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
                <span className="l-dot" /> {models.find((m) => m.id === "alina-1.6")?.tag || "Alina"}
              </div>
              <h2>Alina 1.6</h2>
              <p className="l-desc">{t("l.demo.alinaDesc")}</p>
              <div className="l-mockchat">
                <div className="l-mmsg">
                  <div className="l-mavatar l-mavatar-alina">A</div>
                  <div className="l-mbubble in">{t("l.demo.alinaQ")}</div>
                </div>
                <div className="l-mmsg out">
                  <div className="l-mavatar l-mavatar-bot">
                    <i />
                  </div>
                  <div className="l-mbubble out">
                    {t("l.demo.alinaA")}
                    <ol>
                      <li>{t("l.demo.alinaR1")}</li>
                      <li>{t("l.demo.alinaR2")}</li>
                      <li>{t("l.demo.alinaR3")}</li>
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
                <span className="l-dot" /> {models.find((m) => m.id === "trila-1.4")?.tag || "Trila"}
              </div>
              <h2>Trila 1.4</h2>
              <p className="l-desc">{t("l.demo.trilaDesc")}</p>
              <div className="l-mockchat">
                <div className="l-mmsg">
                  <div className="l-mavatar l-mavatar-trila">T</div>
                  <div className="l-mbubble in">{t("l.demo.trilaQ")}</div>
                </div>
                <div className="l-mmsg out">
                  <div className="l-mavatar l-mavatar-bot">
                    <i />
                  </div>
                  <div className="l-mbubble out l-italic">{t("l.demo.trilaA")}</div>
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
            <h2>{t("l.models.head", { n: models.length || 8 })}</h2>
            <p>{t("l.models.sub")}</p>
          </motion.div>
          <motion.div
            className="l-model-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {models.map((m) => (
              <motion.a
                key={m.id}
                href="/chat"
                className="l-model-card"
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,.08)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="l-tag" style={{ color: m.color }}>
                  <span className="l-dot" style={{ background: m.color }} /> {m.tag}
                </div>
                <h3>
                  {m.name}{" "}
                  {m.vision && <span className="l-badge">{t("l.models.badgeVision")}</span>}
                  {m.agentTools && <span className="l-badge">{t("l.models.badgeAgent")}</span>}
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
              <span className="l-dot" /> {t("l.schala.badge")}
            </div>
            <h2>
              {t("l.schala.titlePre")}
              <strong>Schala</strong>
            </h2>
            <p className="l-desc">{t("l.schala.desc")}</p>
            <ul className="l-schala-points">
              <li>{t("l.schala.p1")}</li>
              <li>{t("l.schala.p2")}</li>
              <li>{t("l.schala.p3")}</li>
            </ul>
            <div className="l-schala-actions">
              <a href="#download" className="l-btn l-btn-primary">
                <DownloadIcon />
                {t("l.schala.dl")}
              </a>
              <a href="#demo" className="l-btn l-btn-ghost">
                {t("l.schala.demo")}
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
              <img src="/schala-preview.png" alt={t("l.schala.shotAlt")} loading="lazy" />
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
              <span className="l-dot" /> {t("l.vid.tag")}
            </div>
            <h2>{t("l.vid.head")}</h2>
            <p>{t("l.vid.sub")}</p>
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
              <button type="button" className="l-demo-play" onClick={handlePlay} aria-label={t("l.vid.aria")}>
                <span className="l-demo-play-btn">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="l-demo-play-label">
                  {demoUnavailable ? t("l.vid.unavailable") : t("l.vid.play")}
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section id="how" className="l-how">
        <div className="l-container">
          <motion.div
            className="l-section-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>{t("l.how.head")}</h2>
            <p>{t("l.how.sub")}</p>
          </motion.div>
          <motion.div
            className="l-how-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {STEPS.map((s, i) => (
              <motion.div key={s.title} className="l-how-step" variants={fadeUp}>
                <span className="l-how-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
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
            <h2>{t("l.dl.head")}</h2>
            <p>{t("l.dl.sub")}</p>
          </motion.div>

          {downloadPending && (
            <div className="l-download-notice" role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {t("l.dl.notice")}
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
                  <img src="/vella-logo.png" alt={t("l.dl.vellaLogoAlt")} />
                </div>
                <div className="l-tag l-tag-vella">
                  <span className="l-dot" /> {models.find((m) => m.id === "vella-1.0")?.tag || "B2B CRM"}
                </div>
              </div>
              <h3>Syncrom Vella</h3>
              <p>{t("l.dl.vellaDesc")}</p>
              <ul className="l-dl-points">
                <li>{t("l.dl.vellaP1")}</li>
                <li>{t("l.dl.vellaP2")}</li>
                <li>{t("l.dl.vellaP3")}</li>
              </ul>
              <a href="/downloads/Syncrom-Vella-Setup.exe" className="l-btn l-dl-btn l-dl-btn-vella" download>
                <WindowsIcon />
                {t("l.dl.win")}
              </a>
              <p className="l-dl-meta">{t("l.dl.vellaMeta")}</p>
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
                  <img src="/schala-logo.png" alt={t("l.dl.schalaLogoAlt")} />
                </div>
                <div className="l-tag l-tag-schala">
                  <span className="l-dot" /> {t("l.dl.schalaTag")}
                </div>
              </div>
              <h3>Schala</h3>
              <p>{t("l.dl.schalaDesc")}</p>
              <ul className="l-dl-points">
                <li>{t("l.dl.schalaP1")}</li>
                <li>{t("l.dl.schalaP2")}</li>
                <li>{t("l.dl.schalaP3")}</li>
              </ul>
              <a href="/downloads/Schala-Setup.exe" className="l-btn l-dl-btn l-dl-btn-schala" download>
                <WindowsIcon />
                {t("l.dl.win")}
              </a>
              <p className="l-dl-meta">{t("l.dl.schalaMeta")}</p>
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
            <h2>{t("l.feat.head")}</h2>
            <p>{t("l.feat.sub")}</p>
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

      <section id="faq" className="l-faq">
        <div className="l-container">
          <motion.div
            className="l-section-head"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h2>{t("l.faq.head")}</h2>
            <p>{t("l.faq.sub")}</p>
          </motion.div>
          <motion.div
            className="l-faq-list"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {FAQ.map((f) => (
              <motion.details key={f.q} className="l-faq-item" variants={fadeUp}>
                <summary>
                  {f.q}
                  <span className="l-faq-icon" />
                </summary>
                <p>{f.a}</p>
              </motion.details>
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
            <h2>{t("l.cta.head")}</h2>
            <p>{t("l.cta.sub")}</p>
            <div className="l-cta-actions">
              <a href="/chat" className="l-btn-light">
                {t("l.cta.account")}
              </a>
              <a href="mailto:syncromai@gmail.com" className="l-btn-outline-light">
                {t("l.cta.contact")}
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
            <p>{t("l.foot.address")}</p>
          </div>
          <div className="l-foot-cols">
            <div>
              <h4>{t("l.foot.product")}</h4>
              <a href="#models">Alina 1.6 / 1.7</a>
              <a href="#all-models">Keyla 5.8</a>
              <a href="#all-models">Syncrom Vella</a>
              <a href="#models">Trila 1.4</a>
              <a href="#schala">Schala</a>
            </div>
            <div>
              <h4>{t("l.foot.download")}</h4>
              <a href="#download">Syncrom Vella</a>
              <a href="#download">Schala</a>
              <a href="#demo">{t("l.vid.tag")}</a>
            </div>
            <div>
              <h4>{t("l.foot.company")}</h4>
              <a href="/about">{t("a.nav.link")}</a>
              <a href="#how">{t("l.foot.howTo")}</a>
              <a href="#faq">{t("l.nav.faq")}</a>
              <a href="mailto:syncromai@gmail.com">{t("l.foot.contact")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
