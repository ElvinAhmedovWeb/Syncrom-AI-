import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { LANGS, useI18n, usePageTitle } from "../lib/i18n";
import { fetchModels } from "../lib/api";
import type { ModelInfo } from "../types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const reveal = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-60px" },
};

const CONTACT_MAIL = "syncromai@gmail.com";

// SVG yolları — hər bacarıq kartının ikonu
const ICONS: Record<string, string> = {
  deep: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
  web: "M12 3a9 9 0 100 18 9 9 0 000-18zM3.4 9h17.2M3.4 15h17.2M12 3a14 14 0 000 18M12 3a14 14 0 010 18",
  agent: "M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14",
  trans: "M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8M6 12.5c0 2 2.5 4 6 4.5M13 20l4-10 4 10M14.6 17h4.8",
  mem: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z",
  art: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z",
  img: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z",
  vision:
    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z",
  voice: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
  follow: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  lock: "M5 11h14v10H5V11zm2 0V7a5 5 0 0110 0v4",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  cpu: "M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M6 6h12v12H6zM10 10h4v4h-4z",
};

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export default function About() {
  const { t, lang, setLang } = useI18n();
  const [models, setModels] = useState<ModelInfo[]>([]);

  // Model siyahısı serverdən gəlir — yeni model əlavə edəndə bu səhifə
  // də özü yenilənir, siyahını iki yerdə saxlamaq lazım deyil.
  useEffect(() => {
    fetchModels(lang).then((data) => data && setModels(data.models));
  }, [lang]);

  usePageTitle("a.title");

  const CAPS = [
    { icon: ICONS.deep, title: t("a.caps.deepT"), desc: t("a.caps.deepD") },
    { icon: ICONS.web, title: t("a.caps.webT"), desc: t("a.caps.webD") },
    { icon: ICONS.agent, title: t("a.caps.agentT"), desc: t("a.caps.agentD") },
    { icon: ICONS.trans, title: t("a.caps.transT"), desc: t("a.caps.transD") },
    { icon: ICONS.mem, title: t("a.caps.memT"), desc: t("a.caps.memD") },
    { icon: ICONS.art, title: t("a.caps.artT"), desc: t("a.caps.artD") },
    { icon: ICONS.img, title: t("a.caps.imgT"), desc: t("a.caps.imgD") },
    { icon: ICONS.vision, title: t("a.caps.visionT"), desc: t("a.caps.visionD") },
    { icon: ICONS.voice, title: t("a.caps.voiceT"), desc: t("a.caps.voiceD") },
    { icon: ICONS.follow, title: t("a.caps.followT"), desc: t("a.caps.followD") },
  ];

  const TECH = [
    { label: t("a.tech.llm"), value: t("a.tech.llmD"), icon: ICONS.cpu },
    { label: t("a.tech.voice"), value: t("a.tech.voiceD"), icon: ICONS.voice },
    { label: t("a.tech.img"), value: t("a.tech.imgD"), icon: ICONS.img },
    { label: t("a.tech.acc"), value: t("a.tech.accD"), icon: ICONS.lock },
    { label: t("a.tech.front"), value: t("a.tech.frontD"), icon: ICONS.box },
    { label: t("a.tech.back"), value: t("a.tech.backD"), icon: ICONS.agent },
  ];

  const PRIVACY = [
    { title: t("a.privacy.p1T"), desc: t("a.privacy.p1D") },
    { title: t("a.privacy.p2T"), desc: t("a.privacy.p2D") },
    { title: t("a.privacy.p3T"), desc: t("a.privacy.p3D") },
    { title: t("a.privacy.p4T"), desc: t("a.privacy.p4D") },
  ];

  return (
    <div className="landing-page about-page">
      <nav className="l-nav">
        <div className="l-container l-nav-inner">
          <a href="/" className="l-brand">
            <span className="l-logo">
              <i />
            </span>
            <span>Syncrom AI</span>
          </a>
          <div className="l-nav-links">
            <a href="#about-models">{t("a.models.head")}</a>
            <a href="#about-caps">{t("a.caps.head")}</a>
            <a href="#about-tech">{t("a.tech.head")}</a>
            <a href="#about-privacy">{t("a.privacy.head")}</a>
            <a href="#about-contact">{t("a.contact.head")}</a>
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

      {/* ---------- Başlıq ---------- */}
      <header className="a-hero">
        <div className="l-container">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.a href="/" className="a-back" variants={fadeUp}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t("a.nav.back")}
            </motion.a>
            <motion.div className="l-pill" variants={fadeUp}>
              <span className="l-dot" /> {t("a.pill")}
            </motion.div>
            <motion.h1 className="a-h1" variants={fadeUp}>
              {t("a.title")}
            </motion.h1>
            <motion.p className="a-lead" variants={fadeUp}>
              {t("a.lead")}
            </motion.p>
          </motion.div>
        </div>
      </header>

      {/* ---------- Missiya ---------- */}
      <section className="a-section">
        <div className="l-container a-narrow">
          <motion.h2 className="a-h2" variants={fadeUp} {...reveal}>
            {t("a.mission.head")}
          </motion.h2>
          <motion.div className="a-prose" variants={stagger} {...reveal}>
            <motion.p variants={fadeUp}>{t("a.mission.p1")}</motion.p>
            <motion.p variants={fadeUp}>{t("a.mission.p2")}</motion.p>
            <motion.p variants={fadeUp}>{t("a.mission.p3")}</motion.p>
          </motion.div>
        </div>
      </section>

      {/* ---------- Qurucu ---------- */}
      <section className="a-section">
        <div className="l-container a-narrow">
          <motion.h2 className="a-h2" variants={fadeUp} {...reveal}>
            {t("a.founder.head")}
          </motion.h2>
          <motion.div className="a-founder" variants={fadeUp} {...reveal}>
            <div className="a-founder-avatar" aria-hidden>
              EƏ
            </div>
            <div className="a-founder-body">
              <h3>{t("about.founderName")}</h3>
              <p className="a-founder-role">{t("a.founder.role")}</p>
              <p>{t("a.founder.bio")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Modellər ---------- */}
      <section id="about-models" className="a-section a-alt">
        <div className="l-container">
          <motion.div className="a-head" variants={fadeUp} {...reveal}>
            <h2 className="a-h2">{t("a.models.head")}</h2>
            <p className="a-sub">{t("a.models.sub")}</p>
          </motion.div>

          <motion.div className="a-model-grid" variants={stagger} {...reveal}>
            {models.map((m) => (
              <motion.article key={m.id} className="a-model" variants={fadeUp}>
                <div className="a-model-tag" style={{ color: m.color }}>
                  <span className="l-dot" style={{ background: m.color }} />
                  {m.tag}
                </div>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
                {(m.vision || m.agentTools) && (
                  <div className="a-model-badges">
                    {m.vision && <span className="l-badge">{t("a.models.vision")}</span>}
                    {m.agentTools && <span className="l-badge">{t("a.models.agent")}</span>}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>

          <motion.p className="a-note" variants={fadeUp} {...reveal}>
            {t("a.models.hidden")}
          </motion.p>
        </div>
      </section>

      {/* ---------- Bacarıqlar ---------- */}
      <section id="about-caps" className="a-section">
        <div className="l-container">
          <motion.div className="a-head" variants={fadeUp} {...reveal}>
            <h2 className="a-h2">{t("a.caps.head")}</h2>
            <p className="a-sub">{t("a.caps.sub")}</p>
          </motion.div>

          <motion.div className="a-cap-grid" variants={stagger} {...reveal}>
            {CAPS.map((c) => (
              <motion.article key={c.title} className="a-cap" variants={fadeUp}>
                <span className="a-cap-icon">
                  <Icon d={c.icon} />
                </span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- Məhsullar ---------- */}
      <section className="a-section a-alt">
        <div className="l-container">
          <motion.h2 className="a-h2 a-center" variants={fadeUp} {...reveal}>
            {t("a.products.head")}
          </motion.h2>

          <motion.div className="a-product-grid" variants={stagger} {...reveal}>
            <motion.article className="a-product" variants={fadeUp}>
              <h3>{t("a.products.webT")}</h3>
              <p>{t("a.products.webD")}</p>
              <a href="/chat" className="l-btn l-btn-primary">
                {t("a.products.webBtn")}
              </a>
            </motion.article>
            <motion.article className="a-product" variants={fadeUp}>
              <h3>{t("a.products.vellaT")}</h3>
              <p>{t("a.products.vellaD")}</p>
              <a href="/#download" className="l-btn l-btn-ghost">
                {t("a.products.download")}
              </a>
            </motion.article>
            <motion.article className="a-product" variants={fadeUp}>
              <h3>{t("a.products.schalaT")}</h3>
              <p>{t("a.products.schalaD")}</p>
              <a href="/#download" className="l-btn l-btn-ghost">
                {t("a.products.download")}
              </a>
            </motion.article>
          </motion.div>
        </div>
      </section>

      {/* ---------- Texnologiya ---------- */}
      <section id="about-tech" className="a-section">
        <div className="l-container">
          <motion.div className="a-head" variants={fadeUp} {...reveal}>
            <h2 className="a-h2">{t("a.tech.head")}</h2>
            <p className="a-sub">{t("a.tech.sub")}</p>
          </motion.div>

          <motion.dl className="a-tech-list" variants={stagger} {...reveal}>
            {TECH.map((row) => (
              <motion.div key={row.label} className="a-tech-row" variants={fadeUp}>
                <dt>
                  <span className="a-tech-icon">
                    <Icon d={row.icon} />
                  </span>
                  {row.label}
                </dt>
                <dd>{row.value}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ---------- Məxfilik ---------- */}
      <section id="about-privacy" className="a-section a-alt">
        <div className="l-container">
          <motion.h2 className="a-h2 a-center" variants={fadeUp} {...reveal}>
            {t("a.privacy.head")}
          </motion.h2>

          <motion.div className="a-privacy-grid" variants={stagger} {...reveal}>
            {PRIVACY.map((p) => (
              <motion.article key={p.title} className="a-privacy" variants={fadeUp}>
                <span className="a-cap-icon">
                  <Icon d={ICONS.shield} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- Əlaqə ---------- */}
      <section id="about-contact" className="a-section">
        <div className="l-container a-narrow">
          <motion.div className="a-contact" variants={fadeUp} {...reveal}>
            <h2 className="a-h2">{t("a.contact.head")}</h2>
            <p className="a-sub">{t("a.contact.sub")}</p>
            <dl className="a-contact-list">
              <div>
                <dt>{t("a.contact.mail")}</dt>
                <dd>
                  <a href={`mailto:${CONTACT_MAIL}`}>{CONTACT_MAIL}</a>
                </dd>
              </div>
              <div>
                <dt>{t("a.contact.loc")}</dt>
                <dd>{t("a.contact.locV")}</dd>
              </div>
            </dl>
            <a href={`mailto:${CONTACT_MAIL}`} className="l-btn l-btn-primary">
              {t("a.contact.btn")}
            </a>
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
        </div>
      </footer>
    </div>
  );
}
