import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { useT } from "../lib/i18n";
import type { ArtifactKind } from "../lib/markdown";

export interface Artifact {
  kind: ArtifactKind;
  code: string;
}

interface Props {
  artifact: Artifact;
  onClose: () => void;
}

/**
 * Modelin yazdığı HTML/SVG-ni canlı göstərir.
 *
 * TƏHLÜKƏSİZLİK: kod <iframe srcdoc> içində, sandbox="allow-scripts" ilə
 * icra olunur. "allow-same-origin" QƏSDƏN VERİLMİR — bu ikisi birlikdə
 * olsa iframe sandbox-dan çıxıb əsas səhifəyə (və istifadəçinin
 * localStorage-dakı məlumatlarına) müdaxilə edə bilər. Bu quruluşda
 * iframe unikal, "opaque" mənbədə işləyir: nə parent-ə, nə cookie/storage-a,
 * nə də Firebase sessiyasına çıxışı yoxdur.
 */
function buildDocument(artifact: Artifact): string {
  if (artifact.kind === "svg") {
    return `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;height:100%;display:grid;place-items:center;background:#fff}
  svg{max-width:100%;max-height:100vh;height:auto}
</style></head><body>${artifact.code}</body></html>`;
  }

  // Tam sənəd göndərilibsə olduğu kimi işlədirik; fraqment isə minimal
  // qabıqla bükülür ki, şrift/fon normal görünsün.
  const isFullDoc = /^\s*(<!doctype\s+html|<html[\s>])/i.test(artifact.code);
  if (isFullDoc) return artifact.code;

  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:16px;background:#fff;color:#111;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
  img,svg,video,canvas{max-width:100%;height:auto}
</style></head><body>${artifact.code}</body></html>`;
}

export default function ArtifactPanel({ artifact, onClose }: Props) {
  const t = useT();
  const [tab, setTab] = useState<"result" | "code">("result");
  const doc = useMemo(() => buildDocument(artifact), [artifact]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Yeni pəncərədə açmaq / endirmək üçün Blob URL — sənəd yalnız açılan
  // müddətdə lazımdır, ona görə komponent söküləndə azad edilir.
  const blobUrl = useMemo(() => URL.createObjectURL(new Blob([doc], { type: "text/html" })), [doc]);
  useEffect(() => () => URL.revokeObjectURL(blobUrl), [blobUrl]);

  return (
    <motion.div
      className="art-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="art-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
        role="dialog"
        aria-modal="true"
        aria-label={t("art.title")}
      >
        <div className="art-head">
          <div className="art-tabs">
            <button
              type="button"
              className={`art-tab${tab === "result" ? " active" : ""}`}
              onClick={() => setTab("result")}
            >
              {t("art.result")}
            </button>
            <button
              type="button"
              className={`art-tab${tab === "code" ? " active" : ""}`}
              onClick={() => setTab("code")}
            >
              {t("art.code")}
            </button>
          </div>

          <div className="art-actions">
            <a
              className="art-icon-btn"
              href={blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={t("art.openTab")}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <a
              className="art-icon-btn"
              href={blobUrl}
              download={artifact.kind === "svg" ? "artifact.svg" : "artifact.html"}
              title={t("art.download")}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
            <button type="button" className="art-icon-btn" onClick={onClose} title={t("art.close")}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="art-body">
          {tab === "result" ? (
            <iframe
              className="art-frame"
              title={t("art.title")}
              srcDoc={doc}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
            />
          ) : (
            <pre className="art-code">
              <code>{artifact.code}</code>
            </pre>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
