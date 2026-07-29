import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { TRANSLATE_TARGETS, translateTargetLabel, useT } from "../lib/i18n";

interface Props {
  onUploadImage: () => void;
  visionEnabled: boolean;
  imageGenEnabled?: boolean;
  imageGenActive: boolean;
  onToggleImageGen: () => void;
  deepThinkActive: boolean;
  onToggleDeepThink: () => void;
  agentToolsEnabled?: boolean;
  agentModeActive: boolean;
  onToggleAgentMode: () => void;
  webSearchActive: boolean;
  onToggleWebSearch: () => void;
  libraActive: boolean;
  onToggleLibra: () => void;
  translateActive: boolean;
  onToggleTranslate: () => void;
  translateTo: string;
  onSelectTranslateTo: (code: string) => void;
  onUploadDocument: () => void;
}

export default function PlusMenu({
  onUploadImage,
  visionEnabled,
  imageGenEnabled,
  imageGenActive,
  onToggleImageGen,
  deepThinkActive,
  onToggleDeepThink,
  agentToolsEnabled,
  agentModeActive,
  onToggleAgentMode,
  webSearchActive,
  onToggleWebSearch,
  libraActive,
  onToggleLibra,
  translateActive,
  onToggleTranslate,
  translateTo,
  onSelectTranslateTo,
  onUploadDocument,
}: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [langsOpen, setLangsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLangsOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function closeAll() {
    setOpen(false);
    setLangsOpen(false);
  }

  // Dil seçimi: hədəf dili yazır və rejim sönülüdürsə onu da açır — belə
  // olanda dil seçmək bir kliklə işə düşür, ayrıca "aktivləşdir" lazım deyil.
  function pickLang(code: string) {
    onSelectTranslateTo(code);
    if (!translateActive) onToggleTranslate();
    closeAll();
  }

  return (
    <div className="plus-menu-wrap" ref={wrapRef}>
      <motion.button
        type="button"
        className={`pill-icon plus-btn${open ? " open" : ""}`}
        title={t("plus.add")}
        onClick={() => {
          setOpen((v) => !v);
          setLangsOpen(false);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </motion.button>

      {open && (
        <motion.div
          className="plus-menu"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {visionEnabled && (
            <button type="button" className="plus-menu-item" onClick={() => { onUploadImage(); closeAll(); }}>
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>{t("plus.image")}</b>
                <small>{t("plus.imageSub")}</small>
              </span>
            </button>
          )}

          {agentToolsEnabled && (
            <button type="button" className="plus-menu-item" onClick={() => { onUploadDocument(); closeAll(); }}>
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>{t("plus.doc")}</b>
                <small>{t("plus.docSub")}</small>
              </span>
            </button>
          )}

          {agentToolsEnabled && (
            <button
              type="button"
              className={`plus-menu-item${agentModeActive ? " active" : ""}`}
              onClick={() => { onToggleAgentMode(); closeAll(); }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>{t("plus.agent")}</b>
                <small>{t("plus.agentSub")}</small>
              </span>
              {agentModeActive && <span className="plus-menu-check">✓</span>}
            </button>
          )}

          {imageGenEnabled && (
            <button
              type="button"
              className={`plus-menu-item${imageGenActive ? " active" : ""}`}
              onClick={() => { onToggleImageGen(); closeAll(); }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>{t("plus.imageGen")}</b>
                <small>{t("plus.imageGenSub")}</small>
              </span>
              {imageGenActive && <span className="plus-menu-check">✓</span>}
            </button>
          )}

          <button
            type="button"
            className={`plus-menu-item${webSearchActive ? " active" : ""}`}
            onClick={() => { onToggleWebSearch(); closeAll(); }}
          >
            <span className="plus-menu-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="3.4" y1="9" x2="20.6" y2="9" />
                <line x1="3.4" y1="15" x2="20.6" y2="15" />
                <path d="M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18" />
              </svg>
            </span>
            <span className="plus-menu-text">
              <b>{t("plus.webSearch")}</b>
              <small>{t("plus.webSearchSub")}</small>
            </span>
            {webSearchActive && <span className="plus-menu-check">✓</span>}
          </button>

          <button
            type="button"
            className={`plus-menu-item${libraActive ? " active" : ""}`}
            onClick={() => {
              onToggleLibra();
              closeAll();
            }}
          >
            <span className="plus-menu-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M7 21h10M3 7h18M6 7l-3 6h6zM18 7l-3 6h6z" />
              </svg>
            </span>
            <span className="plus-menu-text">
              <b>{t("libra.name")}</b>
              <small>{t("libra.sub")}</small>
            </span>
            {libraActive && <span className="plus-menu-check">✓</span>}
          </button>

          <button
            type="button"
            className={`plus-menu-item${translateActive ? " active" : ""}${langsOpen ? " expanded" : ""}`}
            onClick={() => setLangsOpen((v) => !v)}
          >
            <span className="plus-menu-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8" />
                <path d="M6 12.5c0 2 2.5 4 6 4.5" />
                <path d="M13 20l4-10 4 10M14.6 17h4.8" />
              </svg>
            </span>
            <span className="plus-menu-text">
              <b>{t("plus.translate")}</b>
              <small>{translateActive ? translateTargetLabel(translateTo) : t("plus.translateSub")}</small>
            </span>
            {translateActive && <span className="plus-menu-check">✓</span>}
            <span className={`plus-menu-chevron${langsOpen ? " open" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          {langsOpen && (
            <motion.div
              className="plus-submenu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.16, ease: EASE_OUT }}
            >
              <p className="plus-submenu-label">{t("plus.translateTarget")}</p>
              {TRANSLATE_TARGETS.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  className={`plus-submenu-item${translateActive && translateTo === l.code ? " active" : ""}`}
                  onClick={() => pickLang(l.code)}
                >
                  <span>{l.label}</span>
                  {translateActive && translateTo === l.code && <span className="plus-menu-check">✓</span>}
                </button>
              ))}
              {translateActive && (
                <button
                  type="button"
                  className="plus-submenu-item off"
                  onClick={() => { onToggleTranslate(); closeAll(); }}
                >
                  {t("composer.turnOff")}
                </button>
              )}
            </motion.div>
          )}

          <button
            type="button"
            className={`plus-menu-item${deepThinkActive ? " active" : ""}`}
            onClick={() => { onToggleDeepThink(); closeAll(); }}
          >
            <span className="plus-menu-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </span>
            <span className="plus-menu-text">
              <b>{t("plus.deepThink")}</b>
              <small>{t("plus.deepThinkSub")}</small>
            </span>
            {deepThinkActive && <span className="plus-menu-check">✓</span>}
          </button>
        </motion.div>
      )}
    </div>
  );
}
