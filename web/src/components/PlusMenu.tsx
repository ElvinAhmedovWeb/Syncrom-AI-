import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";

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
  onUploadDocument,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (!visionEnabled && !imageGenEnabled) {
    // Yalnız Deep Think qalıbsa belə "+" menyusu faydalıdır — həmişə göstər.
  }

  return (
    <div className="plus-menu-wrap" ref={wrapRef}>
      <motion.button
        type="button"
        className={`pill-icon plus-btn${open ? " open" : ""}`}
        title="Əlavə et"
        onClick={() => setOpen((v) => !v)}
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
            <button
              type="button"
              className="plus-menu-item"
              onClick={() => {
                onUploadImage();
                setOpen(false);
              }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>Şəkil əlavə et</b>
                <small>Yüklə, analiz etsin</small>
              </span>
            </button>
          )}

          {agentToolsEnabled && (
            <button
              type="button"
              className="plus-menu-item"
              onClick={() => {
                onUploadDocument();
                setOpen(false);
              }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>Sənəd əlavə et</b>
                <small>Kod/mətn faylını yüklə</small>
              </span>
            </button>
          )}

          {agentToolsEnabled && (
            <button
              type="button"
              className={`plus-menu-item${agentModeActive ? " active" : ""}`}
              onClick={() => {
                onToggleAgentMode();
                setOpen(false);
              }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>Kod Köməkçisi</b>
                <small>Kodu icra edir, veb axtarır</small>
              </span>
              {agentModeActive && <span className="plus-menu-check">✓</span>}
            </button>
          )}

          {imageGenEnabled && (
            <button
              type="button"
              className={`plus-menu-item${imageGenActive ? " active" : ""}`}
              onClick={() => {
                onToggleImageGen();
                setOpen(false);
              }}
            >
              <span className="plus-menu-icon">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
                </svg>
              </span>
              <span className="plus-menu-text">
                <b>Şəkil yarat</b>
                <small>Mətndən şəkil (pulsuz)</small>
              </span>
              {imageGenActive && <span className="plus-menu-check">✓</span>}
            </button>
          )}

          <button
            type="button"
            className={`plus-menu-item${deepThinkActive ? " active" : ""}`}
            onClick={() => {
              onToggleDeepThink();
              setOpen(false);
            }}
          >
            <span className="plus-menu-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </span>
            <span className="plus-menu-text">
              <b>Deep Think</b>
              <small>Araşdırıb dərin düşünür</small>
            </span>
            {deepThinkActive && <span className="plus-menu-check">✓</span>}
          </button>
        </motion.div>
      )}
    </div>
  );
}
