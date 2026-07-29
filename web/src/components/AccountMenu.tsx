import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { LANGS, useI18n } from "../lib/i18n";
import { MAX_MEMORIES } from "../lib/memory";
import {
  forgetKeyRecord,
  issueKey,
  loadKeyRecords,
  NotSignedInError,
  type ApiKeyRecord,
  type IssuedKey,
} from "../lib/apikeys";
import type { ShellFooterApi } from "./ChatShell";

interface Props {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isGuest: boolean;
  /** Hesabdan çıxış (qonaq rejimində: qonaqlığı bitirib giriş ekranına qaytarır) */
  onSignOut: () => void;
  api: ShellFooterApi;
}

const chevron = (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function AccountMenu({ displayName, email, photoURL, isGuest, onSignOut, api }: Props) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [langsOpen, setLangsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function closeMenu() {
    setOpen(false);
    setLangsOpen(false);
    setConfirmClear(false);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  }

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeMenu();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  }, []);

  // Bütün söhbətləri silmək geri qaytarıla bilməz — ikinci klik təsdiqdir,
  // 3 saniyə içində basılmasa təsdiq özü ləğv olunur.
  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    void api.clearAllChats();
    closeMenu();
  }

  const currentLangLabel = LANGS.find((l) => l.code === lang)?.short || lang.toUpperCase();

  return (
    <>
      <div className="user-card" ref={wrapRef}>
        <button
          type="button"
          className="user-card-trigger"
          onClick={() => (open ? closeMenu() : setOpen(true))}
        >
          <div className="user-avatar">
            {photoURL ? (
              <img src={photoURL} alt="" referrerPolicy="no-referrer" />
            ) : isGuest ? (
              t("acct.guest")[0]
            ) : (
              displayName?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div className="user-info">
            <p className="user-name">{isGuest ? t("acct.guest") : displayName || t("acct.user")}</p>
            <p className="user-mail">{isGuest ? t("acct.guestMode") : email || ""}</p>
          </div>
          <svg
            className={`user-card-chevron${open ? " open" : ""}`}
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <motion.div
            className="user-card-menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
          >
            {/* ---------- Dil ---------- */}
            <button type="button" onClick={() => setLangsOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="3.4" y1="9" x2="20.6" y2="9" />
                <line x1="3.4" y1="15" x2="20.6" y2="15" />
                <path d="M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18" />
              </svg>
              <span className="uc-item-label">{t("acct.language")}</span>
              <span className="uc-item-value">{currentLangLabel}</span>
              <span className={`uc-chevron${langsOpen ? " open" : ""}`}>{chevron}</span>
            </button>

            {langsOpen && (
              <motion.div
                className="uc-sub"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
              >
                {LANGS.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    className={l.code === lang ? "active" : undefined}
                    onClick={() => {
                      setLang(l.code);
                      setLangsOpen(false);
                    }}
                  >
                    <span className="uc-item-label">{l.label}</span>
                    {l.code === lang && <span className="plus-menu-check">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ---------- Görünüş ---------- */}
            {api.onToggleDarkMode && (
              <button type="button" onClick={api.onToggleDarkMode}>
                {api.darkMode ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span className="uc-item-label">{t("acct.theme")}</span>
                <span className="uc-item-value">
                  {api.darkMode ? t("sidebar.darkMode") : t("sidebar.lightMode")}
                </span>
              </button>
            )}

            {/* ---------- Yaddaş ---------- */}
            <button
              type="button"
              onClick={() => {
                setMemoryOpen(true);
                closeMenu();
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
              <span className="uc-item-label">{t("acct.memory")}</span>
              <span className="uc-item-value">
                {api.memory.enabled ? api.memory.facts.length : "—"}
              </span>
            </button>

            {/* ---------- API açarları (yalnız hesabla) ---------- */}
            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  setKeysOpen(true);
                  closeMenu();
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7.5" cy="15.5" r="4.5" />
                  <path d="M10.7 12.3 21 2M18 5l2 2M15 8l2 2" />
                </svg>
                <span className="uc-item-label">{t("key.title")}</span>
              </button>
            )}

            {/* ---------- Söhbəti ixrac et ---------- */}
            <button
              type="button"
              disabled={!api.hasMessages}
              onClick={() => {
                api.exportChat();
                closeMenu();
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="uc-item-label">{t("acct.export")}</span>
            </button>

            {/* ---------- Haqqında ---------- */}
            {/* Kiçik pəncərə əvəzinə tam səhifəyə aparır (/about) — orada
                modellər, bacarıqlar, texnologiya və məxfilik detallı yazılıb. */}
            <a href="/about" onClick={closeMenu}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="11" x2="12" y2="16" />
                <line x1="12" y1="8" x2="12" y2="8" />
              </svg>
              <span className="uc-item-label">{t("acct.about")}</span>
            </a>

            <div className="uc-sep" />

            {/* ---------- Bütün söhbətləri sil ---------- */}
            {api.hasChats && (
              <button type="button" className="uc-danger" onClick={handleClearAll}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                <span className="uc-item-label">
                  {confirmClear ? t("acct.clearAllConfirm") : t("acct.clearAll")}
                </span>
              </button>
            )}

            {/* ---------- Çıxış ---------- */}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onSignOut();
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="uc-item-label">{isGuest ? t("acct.signIn") : t("acct.logout")}</span>
            </button>
          </motion.div>
        )}
      </div>
      {memoryOpen && <MemoryDialog memory={api.memory} onClose={() => setMemoryOpen(false)} />}
      {keysOpen && <ApiKeysDialog onClose={() => setKeysOpen(false)} />}
    </>
  );
}

function ApiKeysDialog({ onClose }: { onClose: () => void }) {
  const { t, locale } = useI18n();
  const [records, setRecords] = useState<ApiKeyRecord[]>(() => loadKeyRecords());
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<IssuedKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function create() {
    const clean = name.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError("");
    try {
      const issued = await issueKey(clean);
      setFresh(issued);
      setRecords(loadKeyRecords());
      setName("");
    } catch (e) {
      setError(e instanceof NotSignedInError ? t("key.needAccount") : t("key.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function copyKey() {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("msg.copyFailed"));
    }
  }

  const fmt = (ts: number) => new Date(ts).toLocaleDateString(locale);

  return (
    <motion.div
      className="about-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="about-dialog key-dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        role="dialog"
        aria-modal="true"
      >
        <h3>{t("key.title")}</h3>
        <p className="mem-sub">{t("key.sub")}</p>

        {/* Yeni açar YALNIZ bir dəfə görünür — server onu saxlamır */}
        {fresh && (
          <div className="key-fresh">
            <p className="key-fresh-warn">{t("key.onceWarning")}</p>
            <code className="key-value">{fresh.key}</code>
            <button type="button" className="key-copy" onClick={copyKey}>
              {copied ? t("msg.copied") : t("msg.copy")}
            </button>
          </div>
        )}

        <div className="mem-add">
          <input
            type="text"
            value={name}
            maxLength={60}
            placeholder={t("key.namePlaceholder")}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void create();
            }}
          />
          <button type="button" onClick={() => void create()} disabled={busy || !name.trim()}>
            {busy ? t("key.creating") : t("key.create")}
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {records.length === 0 ? (
          <p className="mem-empty">{t("key.empty")}</p>
        ) : (
          <ul className="mem-list">
            {records.map((k) => (
              <li key={k.keyId} className="mem-item">
                <span className="mem-item-text">
                  <b>{k.name}</b>
                  <small className="key-meta">
                    {k.keyId} · {fmt(k.createdAt)} → {fmt(k.expiresAt)}
                  </small>
                </span>
                <button
                  type="button"
                  className="mem-item-del"
                  title={t("key.forget")}
                  aria-label={t("key.forget")}
                  onClick={() => setRecords(forgetKeyRecord(k.keyId))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <details className="key-docs">
          <summary>{t("key.howTo")}</summary>
          <pre>
            <code>{`curl ${location.origin}/api/v1/chat \\
  -H "Authorization: Bearer ${fresh ? fresh.key.slice(0, 24) + "..." : "sk-syncrom...."}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"alina-1.7","messages":[{"role":"user","content":"Salam"}]}'`}</code>
          </pre>
        </details>

        <p className="cap-note">{t("key.revokeNote")}</p>

        <button type="button" className="about-close" onClick={onClose}>
          {t("about.close")}
        </button>
      </motion.div>
    </motion.div>
  );
}

function MemoryDialog({
  memory,
  onClose,
}: {
  memory: ShellFooterApi["memory"];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const wipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(
    () => () => {
      if (wipeTimer.current) clearTimeout(wipeTimer.current);
    },
    []
  );

  function handleWipe() {
    if (!confirmWipe) {
      setConfirmWipe(true);
      if (wipeTimer.current) clearTimeout(wipeTimer.current);
      wipeTimer.current = setTimeout(() => setConfirmWipe(false), 3000);
      return;
    }
    memory.clear();
    setConfirmWipe(false);
  }

  function submitDraft() {
    const clean = draft.trim();
    if (!clean) return;
    memory.add(clean);
    setDraft("");
  }

  const full = memory.facts.length >= MAX_MEMORIES;

  return (
    <motion.div
      className="about-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="about-dialog mem-dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        role="dialog"
        aria-modal="true"
      >
        <h3>{t("mem.title")}</h3>
        <p className="mem-sub">{t("mem.sub")}</p>

        <button
          type="button"
          className={`mem-switch${memory.enabled ? " on" : ""}`}
          onClick={memory.toggle}
          aria-pressed={memory.enabled}
        >
          <span className="mem-switch-track">
            <span className="mem-switch-knob" />
          </span>
          <span>{memory.enabled ? t("mem.enabled") : t("mem.disabled")}</span>
        </button>

        {memory.facts.length === 0 ? (
          <p className="mem-empty">{t("mem.empty")}</p>
        ) : (
          <ul className="mem-list">
            {memory.facts.map((f) => (
              <li key={f.id} className="mem-item">
                <span className="mem-item-text">{f.text}</span>
                <button
                  type="button"
                  className="mem-item-del"
                  title={t("mem.delete")}
                  aria-label={t("mem.delete")}
                  onClick={() => memory.remove(f.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mem-add">
          <input
            type="text"
            value={draft}
            maxLength={300}
            disabled={full}
            placeholder={t("mem.addPlaceholder")}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitDraft();
            }}
          />
          <button type="button" onClick={submitDraft} disabled={full || !draft.trim()}>
            {t("mem.add")}
          </button>
        </div>

        <p className="mem-count">{t("mem.count", { n: memory.facts.length, max: MAX_MEMORIES })}</p>

        {memory.facts.length > 0 && (
          <button type="button" className="mem-wipe" onClick={handleWipe}>
            {confirmWipe ? t("mem.clearConfirm") : t("mem.clear")}
          </button>
        )}

        <button type="button" className="about-close" onClick={onClose}>
          {t("about.close")}
        </button>
      </motion.div>
    </motion.div>
  );
}
