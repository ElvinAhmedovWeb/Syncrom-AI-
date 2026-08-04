import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type ClipboardEvent, type DragEvent } from "react";
import { motion } from "framer-motion";
import { resizeImageFile } from "../lib/image";
import { translateTargetLabel, useT } from "../lib/i18n";
import type { ImageAspect } from "../lib/api";
import PlusMenu from "./PlusMenu";

// Pollinations piksel sayını məhdudlaşdırır (ölçüldü: 1024x1024 istəyəndə
// 768x768 qaytarır), amma NİSBƏTİ saxlayır — ona görə seçim ölçü yox, nisbətdir.
const ASPECTS: Array<{ id: ImageAspect; ratio: string; w: number; h: number }> = [
  { id: "square", ratio: "1:1", w: 12, h: 12 },
  { id: "landscape", ratio: "16:9", w: 14, h: 8 },
  { id: "portrait", ratio: "9:16", w: 8, h: 14 },
];

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
  pendingDocument?: { name: string; text: string } | null;
  onDocumentChange?: (doc: { name: string; text: string } | null) => void;
  micSupported: boolean;
  recording: boolean;
  onMicToggle: () => void;
  imageGenEnabled?: boolean;
  imageGenActive: boolean;
  onToggleImageGen: () => void;
  imageAspect: ImageAspect;
  onSelectImageAspect: (a: ImageAspect) => void;
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
  slideModeActive?: boolean;
  onToggleSlideMode?: () => void;
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
  pendingDocument,
  onDocumentChange,
  micSupported,
  recording,
  onMicToggle,
  imageGenEnabled,
  imageGenActive,
  onToggleImageGen,
  imageAspect,
  onSelectImageAspect,
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
  slideModeActive = false,
  onToggleSlideMode = () => {},
  hint,
  placeholder,
}: Props) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      const ext = file.name.split(".").pop()?.toLowerCase();
      const binaryExts = ["pdf", "docx", "doc", "xlsx", "xls"];
      let text = "";

      if (ext && binaryExts.includes(ext)) {
        const reader = new FileReader();
        text = await new Promise<string>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(",")[1];
              const res = await fetch("/api/parse-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: file.name, base64 })
              });
              if (!res.ok) throw new Error("Server xətası");
              const data = await res.json();
              resolve(data.text);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        text = await file.text();
      }
      onDocumentChange?.({ name: file.name, text });
    } catch (e) {
      console.error("Sənəd oxuna bilmədi:", e);
    }
  };

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  // Hündürlüyü YAZMA hadisəsinə yox, dəyərin ÖZÜNƏ bağlayırıq. Əvvəl yalnız
  // onChange-də hesablanırdı: mesaj göndəriləndə mətn valideyndən silinir,
  // onChange isə işə düşmür — nəticədə uzun promptdan sonra sahə hündür
  // qalırdı. Bu effekt həm göndərişi, həm də mətnin proqramla dəyişdiyi
  // halları (mikrofon, mesajı redaktə, davam sualı) əhatə edir.
  // useLayoutEffect — boyanmadan əvvəl işləsin ki, sıçrayış görünməsin.
  useLayoutEffect(autoGrow, [value, autoGrow]);

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        void handleFile(file);
      } else {
        void handleDocumentFile(file);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          void handleFile(file);
        }
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          void handleDocumentFile(file);
        }
      }
    }
  };

  return (
    <footer 
      className={`composer${isDragging ? " dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {(imageGenActive || deepThinkActive || agentModeActive || webSearchActive || translateActive || libraActive || slideModeActive) && (
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
          {imageGenActive && (
            <span className="aspect-group" role="group" aria-label={t("img.aspect")}>
              {ASPECTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`aspect-btn${imageAspect === a.id ? " active" : ""}`}
                  title={t(`img.${a.id}` as never)}
                  aria-pressed={imageAspect === a.id}
                  onClick={() => onSelectImageAspect(a.id)}
                >
                  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden>
                    <rect
                      x={(16 - a.w) / 2}
                      y={(16 - a.h) / 2}
                      width={a.w}
                      height={a.h}
                      rx="1.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                  {a.ratio}
                </button>
              ))}
            </span>
          )}
          {libraActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M7 21h10M3 7h18M6 7l-3 6h6zM18 7l-3 6h6z" />
              </svg>
              {t("libra.name")}
              <button type="button" onClick={onToggleLibra} aria-label={t("composer.turnOff")}>×</button>
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
          {slideModeActive && (
            <span className="mode-pill">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              {t("mode.slide")}
              <button type="button" onClick={onToggleSlideMode} aria-label={t("composer.turnOff")}>×</button>
            </span>
          )}
        </div>
      )}

      {(pendingImage || pendingDocument) && (
        <div className="image-preview">
          {pendingImage && (
            <>
              <img src={pendingImage} alt={t("composer.uploadedImage")} />
              <button type="button" className="image-remove-btn" onClick={() => onImageChange(null)}>
                ×
              </button>
            </>
          )}
          {pendingDocument && (
            <div className="doc-preview">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{pendingDocument.name}</span>
              <button type="button" className="image-remove-btn doc-remove-btn" onClick={() => onDocumentChange?.(null)}>
                ×
              </button>
            </div>
          )}
        </div>
      )}

      <div className="pill-bar" aria-label={hint}>
        <PlusMenu
          onUploadImage={() => fileInputRef.current?.click()}
          visionEnabled={visionEnabled}
          libraActive={libraActive}
          onToggleLibra={onToggleLibra}
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
          slideModeActive={slideModeActive}
          onToggleSlideMode={onToggleSlideMode}
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
          accept=".txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.json,.css,.html,.sql,.yml,.yaml,.csv,.sh,.pdf,.docx,.doc,.xlsx,.xls"
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
          onPaste={handlePaste}
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
          disabled={!busy && !value.trim() && !pendingImage && !pendingDocument}
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
