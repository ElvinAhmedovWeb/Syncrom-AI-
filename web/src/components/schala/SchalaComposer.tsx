import { useRef, useState } from "react";
import { streamChat } from "../../lib/api";
import { renderMarkdown } from "../../lib/markdown";
import { IconSchalaLogo, IconSparkles, IconCheck, IconSend, IconTrash } from "./schalaIcons";
import type { ChatMessage } from "../../types";

interface OpenFile {
  path: string;
  content: string;
  dirty: boolean;
}

interface DisplayMessage extends ChatMessage {
  appliedFiles?: string[];
}

interface Props {
  openFiles: OpenFile[];
  onApplyMultiEdit: (path: string, newContent: string) => void;
}

function extractFileEdits(text: string): { path: string; code: string }[] {
  const edits: { path: string; code: string }[] = [];
  const re = /FAYL:\s*([^\n`]+)\n```[\w-]*\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    edits.push({ path: m[1].trim(), code: m[2].replace(/\n$/, "") });
  }
  return edits;
}

// Çatda XAM kodu göstərmirik — "FAYL:" işarəli bütün kod bloklarını (tamamlanmış
// və ya hələ yazılan) silib yalnız AI-ın izahını göstəririk.
function stripCodeBlocksForDisplay(raw: string): string {
  let text = raw.replace(/FAYL:\s*[^\n`]+\n```[\w-]*\n[\s\S]*?```/g, "").replace(/```[\w-]*\n[\s\S]*?```/g, "").trim();
  const parts = text.split("```");
  if (parts.length > 1) text = parts[0].trim();
  return text;
}

export default function SchalaComposer({ openFiles, onApplyMultiEdit }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamDraft, setStreamDraft] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: DisplayMessage = { role: "user", content: text };
    const nextDisplay = [...messages, userMsg];
    setMessages(nextDisplay);
    setInput("");
    setBusy(true);
    setStreamDraft("");

    const filesBlock = openFiles
      .map((f) => `--- ${f.path} ---\n\`\`\`\n${f.content.slice(0, 8000)}\n\`\`\``)
      .join("\n\n");
    const contextPrefix = openFiles.length
      ? `KOMPOZER REJİMİ: bir neçə açıq fayl üzərində birdən dəyişiklik edə bilərsən. Hər dəyişmək istədiyin fayl üçün "FAYL: <tam yol>" sətrini yaz, elə həmin sətirdən sonra TƏK kod blokunda o faylın TAM yeni məzmununu ver (bir neçə fayl dəyişəcəksənsə, hər biri üçün ayrıca FAYL: + kod bloku). Açıq fayllar:\n\n${filesBlock}\n\n`
      : "";
    const apiMessages: ChatMessage[] = [
      ...nextDisplay.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: contextPrefix + text },
    ];

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = "";
    try {
      await streamChat({
        messages: apiMessages,
        modelId: "schala-ide",
        agentMode: true,
        signal: ctrl.signal,
        onChunk: (chunk) => {
          acc += chunk;
          setStreamDraft(acc);
        },
      });
      const edits = extractFileEdits(acc);
      for (const e of edits) onApplyMultiEdit(e.path, e.code);
      setMessages([
        ...nextDisplay,
        { role: "assistant", content: acc || "Bağışla, cavab ala bilmədim.", appliedFiles: edits.map((e) => e.path) },
      ]);
    } catch {
      setMessages([...nextDisplay, { role: "assistant", content: "Bağışla, əlaqə xətası baş verdi." }]);
    } finally {
      setStreamDraft(null);
      setBusy(false);
      abortRef.current = null;
    }
  }

  function clear() {
    setMessages([]);
  }

  const isWelcomeView = messages.length === 0 && streamDraft === null;

  return (
    <div className="schala-chat">
      <div className="schala-chat-subnav">
        <div className="schala-chat-subnav-left">
          <span className="schala-chat-subnav-badge">{openFiles.length} fayl kontekstdə</span>
        </div>
        <div className="schala-chat-subnav-right">
          <button type="button" className="schala-subnav-btn" title="Təmizlə" onClick={clear}>
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      {isWelcomeView ? (
        <div className="schala-chat-welcome schala-anim-stagger-container">
          <div className="schala-welcome-hero schala-anim-item">
            <div className="schala-logo-wrapper">
              <IconSchalaLogo size={40} className="schala-hero-logo" />
            </div>
            <h2 className="schala-welcome-title">Composer</h2>
            <p className="schala-welcome-sub">Bir neçə faylı eyni anda redaktə et.</p>
          </div>

          <div className="schala-context-card schala-anim-item">
            <div className="schala-context-card-header">
              <IconSparkles size={15} className="schala-context-info-icon" />
              <span>{openFiles.length > 0 ? `${openFiles.length} açıq fayl kontekstdə` : "Açıq fayl yoxdur"}</span>
            </div>
            <p className="schala-context-card-text">
              {openFiles.length > 0
                ? openFiles.map((f) => f.path).join(", ")
                : "Composer bir neçə faylı birdən dəyişə bilir — əvvəlcə redaktorda bir neçə fayl aç."}
            </p>
          </div>
        </div>
      ) : (
        <div className="schala-chat-messages schala-anim-fade-in">
          {messages.map((m, i) => (
            <div key={i} className={`schala-msg ${m.role} schala-anim-msg-entry`}>
              {m.role === "user" ? <p>{m.content}</p> : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(stripCodeBlocksForDisplay(m.content)) }} />}
              {m.appliedFiles && m.appliedFiles.length > 0 && (
                <div className="schala-applied-note">
                  <IconCheck size={12} /> {m.appliedFiles.length} fayl yeniləndi: {m.appliedFiles.join(", ")}
                </div>
              )}
            </div>
          ))}
          {streamDraft !== null && (
            <div className="schala-msg assistant schala-msg-streaming">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(stripCodeBlocksForDisplay(streamDraft) || "…") }} />
            </div>
          )}
        </div>
      )}

      <div className="schala-input-card-container schala-anim-input-entry">
        <textarea
          rows={1}
          className="schala-chat-textarea"
          placeholder="Bir neçə faylı birdən dəyişdirməyi istə..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <div className="schala-input-card-bottom">
          <div className="schala-input-left-buttons" />
          <div className="schala-input-right-buttons">
            <button type="button" className={`schala-send-btn ${input.trim() ? "active" : ""}`} disabled={busy || !input.trim()} onClick={() => void send()}>
              <IconSend size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
