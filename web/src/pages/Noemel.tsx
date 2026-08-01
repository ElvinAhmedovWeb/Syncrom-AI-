import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useI18n, usePageTitle } from "../lib/i18n";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

/* ---- Leaf / Plant icon for Noemel brand ---- */
const LeafIcon = () => (
  <img src="./public/NoEmEl.png" style={{ width: "50px", height: "50px" }} />
);

/* ---- Search icon ---- */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ---- Plus icon ---- */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ---- Send arrow icon ---- */
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

/* ---- Hamburger / Menu icon ---- */
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

/* ---- User circle icon ---- */
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ---- Upload/Export icon ---- */
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ---- Chat bubble icon ---- */
const ChatBubbleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function NoemelPage() {
  const { lang } = useI18n();
  usePageTitle("l.nav.noemel");

  /* ---- State ---- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  /* ---- Auto-resize textarea ---- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  /* ---- Scroll to bottom of messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  /* ---- Helpers ---- */
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: lang === "az" ? "Yeni söhbət" : "New chat",
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputValue("");
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    let sessionId = activeSessionId;

    // If no active session, create one
    if (!sessionId) {
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 40) + (text.length > 40 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Update session title if first message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const isFirst = s.messages.length === 0;
          return {
            ...s,
            title: isFirst
              ? text.slice(0, 40) + (text.length > 40 ? "..." : "")
              : s.title,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInputValue("");

    // Simulate bot response
    setIsTyping(true);
    const capturedSessionId = sessionId;
    setTimeout(() => {
      const botResponses = [
        lang === "az"
          ? "Mən Noemel AI-yəm, sizin kodlaşdırma köməkçinizəm. Layihənizi qurmağa, debugging etməyə və yerləşdirməyə kömək edə bilərəm. Nə etmək istəyirsiniz?"
          : "I'm Noemel AI, your coding assistant. I can help you build projects, debug code, and deploy applications. What would you like to work on?",
        lang === "az"
          ? "Əla sual! Gəlin bu layihəni birlikdə quraq. İlk addım olaraq layihə strukturunu müəyyən edək."
          : "Great question! Let's build this project together. As a first step, let's define the project structure.",
        lang === "az"
          ? "Bunu etmək üçün bir neçə yanaşma var. Ən optimal həll yolunu sizə təklif edirəm."
          : "There are several approaches for this. Let me suggest the most optimal solution.",
        lang === "az"
          ? "Kodunuzu nəzərdən keçirdim. Bəzi optimallaşdırma təkliflərim var — istəyirsiniz göstərim?"
          : "I've reviewed your code. I have some optimization suggestions — would you like me to show them?",
      ];

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === capturedSessionId
            ? { ...s, messages: [...s.messages, botMsg] }
            : s
        )
      );
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = lang === "az"
    ? ["Yeni layihə qur", "Kodu debug et", "API yarat", "Deploy et"]
    : ["Build a new project", "Debug my code", "Create an API", "Deploy app"];

  /* ---- Render ---- */
  return (
    <div className="noemel-shell">
      {/* ========== SIDEBAR ========== */}
      <aside className={`noemel-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Brand row */}
        <div className="noemel-brand-row">
          <a href="/home" className="noemel-brand-left">
            <span className="noemel-brand-icon">
              <LeafIcon />
            </span>
            {!sidebarCollapsed && (
              <span className="noemel-brand-text">Noemel</span>
            )}
          </a>
          <button
            className="noemel-hamburger"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle sidebar"
          >
            <MenuIcon />
          </button>
        </div>

        {/* Search */}
        <div className="noemel-search-bar">
          <SearchIcon />
          {!sidebarCollapsed && (
            <input
              type="text"
              className="noemel-search-input"
              placeholder={lang === "az" ? "Axtar..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>

        {/* New chat button */}
        <button className="noemel-newchat-btn" onClick={createNewChat}>
          <PlusIcon />
          {!sidebarCollapsed && (
            <span className="noemel-newchat-text">
              {lang === "az" ? "Yeni söhbət" : "New chat"}
            </span>
          )}
        </button>

        {/* Chat list */}
        {!sidebarCollapsed && (
          <div className="noemel-chat-list">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                className={`noemel-chat-item ${session.id === activeSessionId ? "active" : ""}`}
                onClick={() => setActiveSessionId(session.id)}
              >
                <ChatBubbleIcon />
                <span className="noemel-chat-item-text">{session.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom user section */}
        <div className="noemel-sidebar-bottom">
          <div className="noemel-user-row">
            <div className="noemel-user-avatar">
              <UserIcon />
            </div>
            {!sidebarCollapsed && (
              <div className="noemel-user-details">
                <div className="noemel-user-name">Guest</div>
                <div className="noemel-user-email">guest@mail.com</div>
              </div>
            )}
            <button className="noemel-user-action" title="Upload / Settings">
              <UploadIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="noemel-main">
        {!activeSession || activeSession.messages.length === 0 ? (
          /* ---- Welcome State ---- */
          <>
            <h1 className="noemel-welcome-heading">
              {lang === "az" ? "Ideanı bölüş." : "Describe your idea."}
            </h1>

            <div className="noemel-composer-wrapper">
              <div className="noemel-composer">
                <textarea
                  ref={textareaRef}
                  className="noemel-composer-textarea"
                  placeholder={
                    lang === "az"
                      ? 'Kontekst üçün "@" və ya əmr üçün "/" yazın'
                      : 'Type "@" for context or "/" for command'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                />
                <div className="noemel-composer-bottom">
                  <button className="noemel-composer-plus" title="Attach file">
                    <PlusIcon />
                  </button>
                  <button
                    className={`noemel-composer-send ${!inputValue.trim() ? "disabled" : ""}`}
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="noemel-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="noemel-suggestion-chip"
                    onClick={() => {
                      setInputValue(s);
                      textareaRef.current?.focus();
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ---- Chat Conversation State ---- */
          <>
            <div className="noemel-messages-area">
              {activeSession.messages.map((msg) => (
                <div key={msg.id} className="noemel-msg">
                  <div className={`noemel-msg-avatar ${msg.role === "user" ? "user" : "bot"}`}>
                    {msg.role === "user" ? "U" : "N"}
                  </div>
                  <div className="noemel-msg-body">
                    <strong>{msg.role === "user" ? "You" : "Noemel"}</strong>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="noemel-msg">
                  <div className="noemel-msg-avatar bot">N</div>
                  <div className="noemel-msg-body">
                    <strong>Noemel</strong>
                    <p style={{ color: "#999" }}>
                      {lang === "az" ? "Yazır..." : "Typing..."}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom composer in chat mode */}
            <div className="noemel-bottom-composer">
              <div className="noemel-composer">
                <textarea
                  ref={textareaRef}
                  className="noemel-composer-textarea"
                  placeholder={
                    lang === "az"
                      ? 'Kontekst üçün "@" və ya əmr üçün "/" yazın'
                      : 'Type "@" for context or "/" for command'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <div className="noemel-composer-bottom">
                  <button className="noemel-composer-plus" title="Attach file">
                    <PlusIcon />
                  </button>
                  <button
                    className={`noemel-composer-send ${!inputValue.trim() ? "disabled" : ""}`}
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
