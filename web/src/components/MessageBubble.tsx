import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { renderMarkdown } from "../lib/markdown";
import { EASE_OUT } from "../lib/motion";
import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
  logoSrc: string;
  accentColor?: string;
  streaming?: boolean;
  withRegen?: boolean;
  onSpeak?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  speakState?: "idle" | "loading" | "playing";
}

async function handleCodeCopyClick(e: MouseEvent<HTMLSpanElement>) {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".code-copy-btn");
  if (!btn) return;
  const encoded = btn.dataset.code;
  if (!encoded) return;
  try {
    await navigator.clipboard.writeText(decodeURIComponent(encoded));
    const original = btn.textContent;
    btn.textContent = "✓ Kopyalandı";
    setTimeout(() => (btn.textContent = original), 1500);
  } catch {
    btn.textContent = "Alınmadı";
  }
}

export default function MessageBubble({
  message,
  logoSrc,
  accentColor,
  streaming,
  withRegen,
  onSpeak,
  onRegenerate,
  onEdit,
  speakState = "idle",
}: Props) {
  const isUser = message.role === "user";
  const userAvatarStyle = accentColor ? { background: accentColor + "1f", color: accentColor } : undefined;

  return (
    <motion.div
      className={`msg-row ${isUser ? "user" : "ai"}`}
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      <div className="avatar" style={isUser ? userAvatarStyle : undefined}>
        {isUser ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <img src={logoSrc} alt="" />
        )}
      </div>
      <div className="bubble-col">
        <div className="bubble">
          {message.image && <img className="msg-image" src={message.image} alt="Göndərilən şəkil" />}
          {isUser ? (
            message.content && <p>{message.content}</p>
          ) : (
            <span
              onClick={handleCodeCopyClick}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content) + (streaming ? '<span class="caret"></span>' : ""),
              }}
            />
          )}
        </div>
        {isUser && onEdit && (
          <div className="msg-actions user-actions">
            <button className="action-btn" onClick={onEdit}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Redaktə et
            </button>
          </div>
        )}
        {!isUser && message.content && (
          <div className="msg-actions">
            <button className={`action-btn${speakState !== "idle" ? " playing" : ""}`} onClick={onSpeak}>
              {speakState === "loading" && "… Yüklənir"}
              {speakState === "playing" && (
                <>
                  <span className="eq">
                    <i /><i /><i /><i />
                  </span>{" "}
                  Dayandır
                </>
              )}
              {speakState === "idle" && "▶ Səsləndir"}
            </button>
            <CopyButton text={message.content} />
            {withRegen && (
              <button className="action-btn" onClick={onRegenerate}>
                ↻ Yenidən
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="action-btn"
      onClick={async (e) => {
        const btn = e.currentTarget;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "✓ Kopyalandı";
        } catch {
          btn.textContent = "Alınmadı";
        }
        setTimeout(() => (btn.textContent = "Kopyala"), 1500);
      }}
    >
      Kopyala
    </button>
  );
}

export function TypingIndicator({ logoSrc }: { logoSrc: string }) {
  return (
    <motion.div className="msg-row ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="avatar">
        <img src={logoSrc} alt="" />
      </div>
      <div className="bubble-col">
        <div className="bubble typing-dots">
          <span /><span /><span /><span /><span />
        </div>
      </div>
    </motion.div>
  );
}
