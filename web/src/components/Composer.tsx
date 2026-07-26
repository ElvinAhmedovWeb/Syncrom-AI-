import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { resizeImageFile } from "../lib/image";
import { translateTargetLabel, useT } from "../lib/i18n";
import PlusMenu from "./PlusMenu";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  modelPickerSlot?: ReactNode;
  visionEnabled: boolean;
  pendingImage: string | null;
  onImageChange: (dataUrl: string | null) => void;
  micSupported: boolean;
  recording: boolean;
  onMicToggle: () => void;
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
  translateActive: boolean;
  onToggleTranslate: () => void;
  translateTo: string;
  onSelectTranslateTo: (code: string) => void;
  hint: string;
  placeholder: string;
}

export default function Composer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  modelPickerSlot,
  visionEnabled,
  pendingImage,
  onImageChange,
  micSupported,
  recording,
  onMicToggle,
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
  translateActive,
  onToggleTranslate,
  translateTo,
  onSelectTranslateTo,
  hint,
  placeholder,
}: Props) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await resizeImageFile(file);
      onImageChange(dataUrl);
    } catch (e) {
      console.error("Şəkil emal edilmədi:", e);
    }
  };

  const handleDocumentFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const fenced = `\`\`\`\n// ${file.name}\n${text.slice(0, 12000)}\n\`\`\`\n\n`;
      onChange(fenced + value);
    } catch (e) {
      console.error("Sənəd oxuna bilmədi:", e);
    }
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  return (
    <footer className="composer">
      {(imageGenActive || deepThinkActive || agentModeActive || webSearchActive || translateActive) && (
        <div className="mode-pills">
          {imageGenActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
              </svg>
              {t("mode.imageGen")}
              <button type="button" onClick={onToggleImageGen} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
          {translateActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h9M8.5 5v2c0 3.5-2 6.5-4.5 8" />
                <path d="M6 12.5c0 2 2.5 4 6 4.5" />
                <path d="M13 20l4-10 4 10M14.6 17h4.8" />
              </svg>
              {t("mode.translate", { lang: translateTargetLabel(translateTo) })}
              <button type="button" onClick={onToggleTranslate} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
          {webSearchActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="3.4" y1="9" x2="20.6" y2="9" />
                <line x1="3.4" y1="15" x2="20.6" y2="15" />
                <path d="M12 3a14 14 0 0 0 0 18M12 3a14 14 0 0 1 0 18" />
              </svg>
              {t("mode.webSearch")}
              <button type="button" onClick={onToggleWebSearch} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
          {deepThinkActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
              {t("mode.deepThink")}
              <button type="button" onClick={onToggleDeepThink} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
          {agentModeActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              {t("mode.agent")}
              <button type="button" onClick={onToggleAgentMode} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
        </div>
      )}

      {pendingImage && (
        <div className="image-preview">
          <img src={pendingImage} alt={t("composer.uploadedImage")} />
          <button type="button" className="image-remove-btn" onClick={() => onImageChange(null)}>
            ×
          </button>
        </div>
      )}

      <div className="pill-bar" aria-label={hint}>
        <PlusMenu
          onUploadImage={() => fileInputRef.current?.click()}
          visionEnabled={visionEnabled}
          imageGenEnabled={imageGenEnabled}
          imageGenActive={imageGenActive}
          onToggleImageGen={onToggleImageGen}
          deepThinkActive={deepThinkActive}
          onToggleDeepThink={onToggleDeepThink}
          agentToolsEnabled={agentToolsEnabled}
          agentModeActive={agentModeActive}
          onToggleAgentMode={onToggleAgentMode}
          webSearchActive={webSearchActive}
          onToggleWebSearch={onToggleWebSearch}
          translateActive={translateActive}
          onToggleTranslate={onToggleTranslate}
          translateTo={translateTo}
          onSelectTranslateTo={onSelectTranslateTo}
          onUploadDocument={() => documentInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.json,.css,.html,.sql,.yml,.yaml,.csv,.sh"
          className="hidden"
          onChange={(e) => {
            void handleDocumentFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoGrow();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        {micSupported && (
          <motion.button
            type="button"
            className={`pill-icon${recording ? " recording" : ""}`}
            title={t("composer.mic")}
            onClick={onMicToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <span className="mic-rings" aria-hidden="true" />
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </motion.button>
        )}

        <motion.button
          type="button"
          className={`pill-send${busy ? " stop" : ""}`}
          title={busy ? t("composer.stop") : t("composer.send")}
          disabled={!busy && !value.trim() && !pendingImage}
          onClick={busy ? onStop : onSend}
          whileHover={{ y: busy ? 0 : -2, scale: busy ? 1.08 : 1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          {busy ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </motion.button>
      </div>

      {modelPickerSlot && <div className="composer-footer">{modelPickerSlot}</div>}
    </footer>
  );
}
