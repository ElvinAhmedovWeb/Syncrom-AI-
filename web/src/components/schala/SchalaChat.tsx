import { useEffect, useRef, useState } from "react";
import { streamChat } from "../../lib/api";
import { renderMarkdown } from "../../lib/markdown";
import { loadConversations, saveConversation, relativeTime, type StoredConversation } from "../../lib/schalaHistory";
import {
  IconSchalaLogo,
  IconTest,
  IconChevronRight,
  IconAt,
  IconMic,
  IconSend,
  IconCheck,
  IconPlus,
  IconHistory,
  IconMore,
  IconClose,
  IconSparkles,
  IconMessageCircle,
  IconPaperclip,
  IconTrash,
  IconLightbulb,
  IconCodeBrackets,
  IconBug,
} from "./schalaIcons";
import type { ChatMessage } from "../../types";

interface OpenFile {
  path: string;
  content: string;
  dirty: boolean;
}

interface DisplayMessage extends ChatMessage {
  appliedFileName?: string;
}

interface Props {
  activeFile: OpenFile | null;
  onApplyEdit: (newContent: string) => void;
}

const QUICK_ACTIONS = [
  { Icon: IconLightbulb, label: "Explain this code", prompt: "Bu koda bax və nə etdiyini ətraflı izah et." },
  { Icon: IconCodeBrackets, label: "Refactor this function", prompt: "Bu funksiyanı refaktor et, təmiz və oxunaqlı et." },
  { Icon: IconBug, label: "Add error handling", prompt: "Bu koda xəta idarəetməsi (try-catch, validation) əlavə et." },
  { Icon: IconTest, label: "Create unit tests", prompt: "Bu kod üçün keçərli unit testlər yaz." },
];

const MODEL_NAME = "Syncrom Keyla 5.8";

const DEFAULT_DEMO_RECENTS: StoredConversation[] = [
  { id: "demo-1", title: "Add authentication middleware", messages: [], updatedAt: Date.now() - 3600 * 1000 * 2 },
  { id: "demo-2", title: "Fix loading state bug", messages: [], updatedAt: Date.now() - 3600 * 1000 * 24 },
  { id: "demo-3", title: "Optimize API requests", messages: [], updatedAt: Date.now() - 3600 * 1000 * 48 },
];

function extractFirstCodeBlock(text: string): string | null {
  const m = text.match(/```[\w-]*\n([\s\S]*?)```/);
  return m ? m[1].replace(/\n$/, "") : null;
}

function stripCodeBlocksForDisplay(raw: string): string {
  let text = raw.replace(/```[\w-]*\n[\s\S]*?```/g, "").trim();
  const parts = text.split("```");
  if (parts.length > 1) text = parts[0].trim();
  return text;
}

function isWritingCode(raw: string): boolean {
  const withoutClosed = raw.replace(/```[\w-]*\n[\s\S]*?```/g, "");
  return withoutClosed.includes("```");
}

export default function SchalaChat({ activeFile, onApplyEdit }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [convId, setConvId] = useState(() => "c" + Date.now());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streamDraft, setStreamDraft] = useState<string | null>(null);
  const [recent, setRecent] = useState<StoredConversation[]>(() => loadConversations());
  const [showContextNote, setShowContextNote] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const historyBtnRef = useRef<HTMLButtonElement | null>(null);
  const historyDrawerRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const morePopupRef = useRef<HTMLDivElement | null>(null);

  const displayRecents = recent.length > 0 ? recent.slice(0, 5) : DEFAULT_DEMO_RECENTS;

  // Tarixçə/Daha çox menyularını kənar klik və ya Escape ilə bağla —
  // quickOpen/cloneModal-ın artıq işlədiyi eyni davranış.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideHistory = historyBtnRef.current?.contains(target) || historyDrawerRef.current?.contains(target);
      if (!insideHistory) setShowHistoryDrawer(false);
      const insideMore = moreBtnRef.current?.contains(target) || morePopupRef.current?.contains(target);
      if (!insideMore) setShowMoreMenu(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowHistoryDrawer(false);
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function persist(nextMessages: DisplayMessage[]) {
    if (nextMessages.length === 0) return;
    const firstUser = nextMessages.find((m) => m.role === "user");
    const title = (firstUser?.content || "Söhbət").slice(0, 48);
    const conv: StoredConversation = { id: convId, title, messages: nextMessages, updatedAt: Date.now() };
    saveConversation(conv);
    setRecent(loadConversations());
  }

  function newConversation() {
    setMessages([]);
    setConvId("c" + Date.now());
  }

  function openConversation(c: StoredConversation) {
    if (c.messages && c.messages.length > 0) {
      setMessages(c.messages);
    } else {
      setMessages([
        { role: "user", content: c.title },
        { role: "assistant", content: `"${c.title}" mövzusu üzrə söhbət bərpa olundu.` },
      ]);
    }
    setConvId(c.id);
    setShowHistoryDrawer(false);
  }

  async function sendText(text: string) {
    if (!text.trim() || busy) return;
    const userMsg: DisplayMessage = { role: "user", content: text.trim() };
    const nextDisplay = [...messages, userMsg];
    setMessages(nextDisplay);
    setInput("");
    setBusy(true);
    setStreamDraft("");

    const contextPrefix = activeFile
      ? `AÇIQ FAYL: ${activeFile.path}\n\`\`\`\n${activeFile.content.slice(0, 20000)}\n\`\`\`\n\n`
      : "";
    const apiMessages: ChatMessage[] = [
      ...nextDisplay.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: contextPrefix + text.trim() },
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
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        },
      });
      const codeBlock = activeFile ? extractFirstCodeBlock(acc) : null;
      if (codeBlock) onApplyEdit(codeBlock);
      const finalMessages: DisplayMessage[] = [
        ...nextDisplay,
        {
          role: "assistant",
          content: acc || "Bağışla, cavab ala bilmədim.",
          appliedFileName: codeBlock && activeFile ? activeFile.path.split("/").pop() : undefined,
        },
      ];
      setMessages(finalMessages);
      persist(finalMessages);
    } catch {
      const finalMessages: DisplayMessage[] = [...nextDisplay, { role: "assistant", content: "Bağışla, əlaqə xətası baş verdi." }];
      setMessages(finalMessages);
    } finally {
      setStreamDraft(null);
      setBusy(false);
      abortRef.current = null;
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  const toggleHistory = () => setShowHistoryDrawer((v) => !v);

  const isWelcomeView = messages.length === 0 && streamDraft === null;

  return (
    <div className="schala-chat">
      {/* Dynamic Header Actions Bar if embedded */}
      <div className="schala-chat-subnav">
        <div className="schala-chat-subnav-left">
          <span className="schala-chat-subnav-badge">{MODEL_NAME}</span>
        </div>
        <div className="schala-chat-subnav-right">
          <button type="button" className="schala-subnav-btn" title="New Chat" onClick={newConversation}>
            <IconPlus size={14} />
          </button>
          <button ref={historyBtnRef} type="button" className={`schala-subnav-btn ${showHistoryDrawer ? "active" : ""}`} title="History" onClick={toggleHistory}>
            <IconHistory size={14} />
          </button>
          <button
            ref={moreBtnRef}
            type="button"
            className={`schala-subnav-btn ${showMoreMenu ? "active" : ""}`}
            title="More options"
            onClick={() => setShowMoreMenu((v) => !v)}
          >
            <IconMore size={14} />
          </button>
        </div>
      </div>

      {/* History Drawer Modal / Popup */}
      {showHistoryDrawer && (
        <div ref={historyDrawerRef} className="schala-history-drawer schala-anim-slide-down">
          <div className="schala-drawer-header">
            <span>Recent Conversations</span>
            <button type="button" className="schala-drawer-close" onClick={() => setShowHistoryDrawer(false)}>
              <IconClose size={14} />
            </button>
          </div>
          <div className="schala-drawer-content">
            {displayRecents.map((c) => (
              <button key={c.id} type="button" className="schala-drawer-item" onClick={() => openConversation(c)}>
                <span className="schala-drawer-item-icon"><IconMessageCircle size={13} /></span>
                <span className="schala-drawer-item-title">{c.title}</span>
                <span className="schala-drawer-item-time">{relativeTime(c.updatedAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* More Options Menu */}
      {showMoreMenu && (
        <div ref={morePopupRef} className="schala-more-popup schala-anim-fade-in" onClick={() => setShowMoreMenu(false)}>
          <div className="schala-more-item" onClick={newConversation}>
            <IconPlus size={14} /> New Chat
          </div>
          <div className="schala-more-item" onClick={toggleHistory}>
            <IconHistory size={14} /> View All History
          </div>
          <div className="schala-more-item schala-more-danger" onClick={() => setMessages([])}>
            <IconTrash size={14} /> Clear Messages
          </div>
        </div>
      )}

      {isWelcomeView ? (
        <div className="schala-chat-welcome schala-anim-stagger-container">
          {/* Top Diamond Logo + Title */}
          <div className="schala-welcome-hero schala-anim-item">
            <div className="schala-logo-wrapper">
              <IconSchalaLogo size={44} className="schala-hero-logo" />
            </div>
            <h2 className="schala-welcome-title">Welcome to Schala</h2>
            <p className="schala-welcome-sub">Your AI pair programmer.</p>
          </div>

          {/* Context Card Box */}
          <div className="schala-context-card schala-anim-item" onClick={() => setShowContextNote((v) => !v)}>
            <div className="schala-context-card-header">
              <IconSparkles size={15} className="schala-context-info-icon" />
              <span>Add context</span>
            </div>
            <p className="schala-context-card-text">
              Ask anything about your codebase. Schala can help you write, refactor, debug, and more.
            </p>
            {showContextNote && (
              <div className="schala-context-note-bubble schala-anim-fade-in">
                {activeFile ? `📄 Fayl avtomatik qoşulub: "${activeFile.path}"` : "💡 Kontekst üçün fayl redaktorda açıq olmalıdır."}
              </div>
            )}
          </div>

          {/* Suggested Prompts / Quick Actions Card Box */}
          <div className="schala-quick-actions-card schala-anim-item">
            {QUICK_ACTIONS.map(({ Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                className="schala-quick-action-row"
                onClick={() => void sendText(prompt)}
              >
                <span className="schala-qa-icon-wrapper">
                  <Icon size={15} />
                </span>
                <span className="schala-qa-label-text">{label}</span>
                <span className="schala-qa-chevron-icon">
                  <IconChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>

          {/* Recent Conversations Box */}
          <div className="schala-recent-section schala-anim-item">
            <div className="schala-recent-label">RECENT CONVERSATIONS</div>
            <div className="schala-recent-card">
              {displayRecents.map((c) => (
                <button key={c.id} type="button" className="schala-recent-row" onClick={() => openConversation(c)}>
                  <span className="schala-recent-row-icon"><IconMessageCircle size={14} /></span>
                  <span className="schala-recent-row-title">{c.title}</span>
                  <span className="schala-recent-row-time">{relativeTime(c.updatedAt)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="schala-chat-messages schala-anim-fade-in">
          {messages.map((m, i) => (
            <div key={i} className={`schala-msg ${m.role} schala-anim-msg-entry`}>
              {m.role === "user" ? (
                <p>{m.content}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(stripCodeBlocksForDisplay(m.content)) }} />
              )}
              {m.appliedFileName && (
                <div className="schala-applied-note schala-anim-bounce-in">
                  <IconCheck size={12} /> {m.appliedFileName} yeniləndi
                </div>
              )}
            </div>
          ))}
          {streamDraft !== null && (
            <div className="schala-msg assistant schala-msg-streaming">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(stripCodeBlocksForDisplay(streamDraft) || "…") }} />
              {isWritingCode(streamDraft) && (
                <div className="schala-writing-note">
                  <span className="schala-pulsing-dot" /> Kod tətbiq olunur…
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Bottom Floating Card Input Bar */}
      <ChatInputBar input={input} setInput={setInput} busy={busy} onSend={() => void sendText(input)} activeFile={activeFile} />
    </div>
  );
}

function ChatInputBar({
  input,
  setInput,
  busy,
  onSend,
  activeFile,
}: {
  input: string;
  setInput: (v: string) => void;
  busy: boolean;
  onSend: () => void;
  activeFile: OpenFile | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="schala-input-card-container schala-anim-input-entry">
      <textarea
        ref={textareaRef}
        rows={1}
        className="schala-chat-textarea"
        placeholder={activeFile ? `Ask about ${activeFile.path.split("/").pop()}...` : "Ask Schala anything..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />

      <div className="schala-input-card-bottom">
        <div className="schala-input-left-buttons">
          <button type="button" className="schala-input-action-btn" title="Fayl əlavə et (tezliklə)" disabled>
            <IconPaperclip size={14} />
          </button>
          <button
            type="button"
            className="schala-input-action-btn"
            title="Kontekst əlavə et (@)"
            onClick={() => {
              setInput(input + "@");
              textareaRef.current?.focus();
            }}
          >
            <IconAt size={14} />
          </button>
          <button type="button" className="schala-input-action-btn" title="Səsli giriş (tezliklə)" disabled>
            <IconMic size={14} />
          </button>
        </div>

        <div className="schala-input-right-buttons">
          <span className="schala-model-name">{MODEL_NAME}</span>
          <button
            type="button"
            className={`schala-send-btn ${input.trim() ? "active" : ""}`}
            disabled={busy || !input.trim()}
            onClick={onSend}
          >
            <IconSend size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
