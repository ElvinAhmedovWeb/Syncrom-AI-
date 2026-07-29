import { useMemo, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { renderMarkdown, type ArtifactKind } from "../lib/markdown";
import { EASE_OUT } from "../lib/motion";
import { useT, type TFunc, type TKey } from "../lib/i18n";
import type { AgentStep, VirgoResult } from "../lib/api";
import type { Artifact } from "./ArtifactPanel";
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
  onOpenArtifact?: (a: Artifact) => void;
  speakState?: "idle" | "loading" | "playing";
  /** Kod Köməkçisinin canlı alət addımları (yalnız axın gedərkən) */
  steps?: AgentStep[];
  followups?: string[];
  onFollowup?: (q: string) => void;
  /** Virgo auditi — yalnız yoxlanan mesajda dolu olur */
  virgo?: { state: "loading" | "done"; result?: VirgoResult };
  onVirgo?: () => void;
  onVirgoDismiss?: () => void;
  onVirgoApply?: () => void;
}

// Kod blokundaki düymələr markdown-dan XAM HTML kimi gəlir (React elementi
// deyil), ona görə kliklər qabarcığın üzərində bir dələgə ilə tutulur.
async function handleBubbleClick(
  e: MouseEvent<HTMLSpanElement>,
  t: TFunc,
  onOpenArtifact?: (a: Artifact) => void
) {
  const target = e.target as HTMLElement;

  const previewBtn = target.closest<HTMLButtonElement>(".code-preview-btn");
  if (previewBtn) {
    const encoded = previewBtn.dataset.code;
    const kind = previewBtn.dataset.kind as ArtifactKind | undefined;
    if (encoded && kind && onOpenArtifact) {
      onOpenArtifact({ kind, code: decodeURIComponent(encoded) });
    }
    return;
  }

  const btn = target.closest<HTMLButtonElement>(".code-copy-btn");
  if (!btn) return;
  const encoded = btn.dataset.code;
  if (!encoded) return;
  try {
    await navigator.clipboard.writeText(decodeURIComponent(encoded));
    const original = btn.textContent;
    btn.textContent = t("msg.copied");
    setTimeout(() => (btn.textContent = original), 1500);
  } catch {
    btn.textContent = t("msg.copyFailed");
  }
}

function StepList({ steps }: { steps: AgentStep[] }) {
  const t = useT();
  if (!steps.length) return null;
  return (
    <div className="agent-steps">
      {steps.map((s, i) => {
        const key = `step.${s.tool}` as TKey;
        const label = t(key);
        return (
          <div key={i} className={`agent-step ${s.status}`}>
            <span className="agent-step-icon" aria-hidden="true">
              {s.status === "running" ? (
                <span className="agent-spin" />
              ) : s.status === "failed" ? (
                "×"
              ) : (
                "✓"
              )}
            </span>
            <span className="agent-step-label">
              {/* Açar lüğətdə yoxdursa t() açarın özünü qaytarır — o halda alət adını göstər */}
              {label === key ? s.tool : label}
              {s.status === "failed" && ` — ${t("step.failed")}`}
            </span>
            {s.detail && <span className="agent-step-detail">{s.detail}</span>}
          </div>
        );
      })}
    </div>
  );
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
  onOpenArtifact,
  speakState = "idle",
  steps,
  followups,
  onFollowup,
  virgo,
  onVirgo,
  onVirgoDismiss,
  onVirgoApply,
}: Props) {
  const t = useT();
  const isUser = message.role === "user";
  const userAvatarStyle = accentColor ? { background: accentColor + "1f", color: accentColor } : undefined;

  // Markdown hər simvol axını ilə yenidən qurulur — etiketlər sabit olduğu
  // üçün onları memoladıq ki, hər render-də yeni obyekt yaranmasın.
  const mdLabels = useMemo(() => ({ copy: t("msg.copy"), preview: t("art.preview") }), [t]);

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
        {!isUser && steps && steps.length > 0 && <StepList steps={steps} />}
        <div className="bubble">
          {message.image && <img className="msg-image" src={message.image} alt={t("msg.sentImage")} />}
          {/* Şəkil üçün qurulan prompt — istifadəçi nəyin yaradıldığını görsün
              və növbəti dəfə sorğusunu dəqiqləşdirə bilsin */}
          {message.imagePrompt && (
            <details className="img-prompt">
              <summary>{t("img.usedPrompt")}</summary>
              <p>{message.imagePrompt}</p>
            </details>
          )}
          {isUser ? (
            message.content && <p>{message.content}</p>
          ) : (
            <span
              onClick={(e) => void handleBubbleClick(e, t, onOpenArtifact)}
              dangerouslySetInnerHTML={{
                __html:
                  renderMarkdown(message.content, mdLabels) +
                  (streaming ? '<span class="caret"></span>' : ""),
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
              {t("msg.edit")}
            </button>
          </div>
        )}
        {!isUser && message.content && (
          <div className="msg-actions">
            <button className={`action-btn${speakState !== "idle" ? " playing" : ""}`} onClick={onSpeak}>
              {speakState === "loading" && `… ${t("msg.loading")}`}
              {speakState === "playing" && (
                <>
                  <span className="eq">
                    <i /><i /><i /><i />
                  </span>{" "}
                  {t("msg.stopSpeak")}
                </>
              )}
              {speakState === "idle" && `▶ ${t("msg.speak")}`}
            </button>
            <CopyButton text={message.content} />
            {withRegen && (
              <button className="action-btn" onClick={onRegenerate}>
                ↻ {t("msg.regenerate")}
              </button>
            )}
            {onVirgo && (
              <button
                className={`action-btn virgo-btn${virgo ? " on" : ""}`}
                onClick={onVirgo}
                disabled={virgo?.state === "loading"}
                title={t("virgo.hint")}
              >
                {virgo?.state === "loading" ? `… ${t("virgo.checking")}` : `⌕ ${t("virgo.name")}`}
              </button>
            )}
          </div>
        )}
        {virgo?.state === "done" && virgo.result && (
          <motion.div
            className={`virgo-panel ${virgo.result.verdict}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <div className="virgo-head">
              <span className="virgo-badge">
                {virgo.result.verdict === "clean" ? "✓" : "!"}
              </span>
              <b>{virgo.result.verdict === "clean" ? t("virgo.clean") : t("virgo.issues")}</b>
              <button type="button" className="virgo-close" onClick={onVirgoDismiss} aria-label={t("art.close")}>
                ×
              </button>
            </div>
            <div
              className="virgo-findings"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(virgo.result.findings, mdLabels) }}
            />
            {virgo.result.corrected && onVirgoApply && (
              <button type="button" className="virgo-apply" onClick={onVirgoApply}>
                {t("virgo.apply")}
              </button>
            )}
          </motion.div>
        )}
        {!isUser && followups && followups.length > 0 && onFollowup && (
          <motion.div
            className="followups"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <span className="followups-label">{t("follow.label")}</span>
            {followups.map((q) => (
              <button key={q} type="button" className="followup-chip" onClick={() => onFollowup(q)}>
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const t = useT();
  return (
    <button
      className="action-btn"
      onClick={async (e) => {
        const btn = e.currentTarget;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = t("msg.copied");
        } catch {
          btn.textContent = t("msg.copyFailed");
        }
        setTimeout(() => (btn.textContent = t("msg.copy")), 1500);
      }}
    >
      {t("msg.copy")}
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
