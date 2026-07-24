import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Chat, ModelInfo } from "../types";

interface Props {
  logoSrc: string;
  brandName: ReactNode;
  brandSub: string;
  open: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  models?: ModelInfo[];
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  footer?: ReactNode;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "indi";
  if (mins < 60) return `${mins} dəq əvvəl`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 saat əvvəl" : `${hours} saat əvvəl`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Dünən";
  if (days < 7) return `${days} gün əvvəl`;
  return new Date(ts).toLocaleDateString("az-AZ");
}

export default function Sidebar({
  logoSrc,
  brandName,
  brandSub,
  open,
  onClose,
  chats,
  currentChatId,
  models,
  onNewChat,
  onOpenChat,
  onDeleteChat,
  onRenameChat,
  footer,
  darkMode,
  onToggleDarkMode,
}: Props) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSearching = query.trim().length > 0;
  const filteredChats = isSearching
    ? chats.filter((c) => (c.title || "").toLowerCase().includes(query.trim().toLowerCase()))
    : chats;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function startRename(c: Chat) {
    if (!c.id) return;
    setEditingId(c.id);
    setEditingTitle(c.title || "");
  }

  function commitRename() {
    if (editingId) onRenameChat(editingId, editingTitle);
    setEditingId(null);
  }

  function handleDeleteClick(id: string) {
    if (confirmDeleteId === id) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmDeleteId(null);
      onDeleteChat(id);
      return;
    }
    setConfirmDeleteId(id);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 3000);
  }

  function modelColor(modelId?: string): string | undefined {
    return modelId ? models?.find((m) => m.id === modelId)?.color : undefined;
  }

  function renderChatItem(c: Chat) {
    const color = modelColor(c.modelId);
    const confirming = confirmDeleteId === c.id;
    return (
      <motion.div
        key={c.id}
        className={`chat-item${c.id === currentChatId ? " active" : ""}`}
        onClick={() => c.id && editingId !== c.id && onOpenChat(c.id)}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="chat-item-dot" style={color ? { background: color } : undefined} />
        {editingId === c.id ? (
          <input
            autoFocus
            className="chat-rename-input"
            value={editingTitle}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          <>
            <span className="chat-item-title">{c.title || "Yeni söhbət"}</span>
            <span className="chat-item-time">{relativeTime(c.updatedAt)}</span>
          </>
        )}
        <button
          type="button"
          className="chat-rename"
          title="Adını dəyiş"
          onClick={(e) => {
            e.stopPropagation();
            startRename(c);
          }}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
        <button
          type="button"
          className={`chat-del${confirming ? " confirm" : ""}`}
          title={confirming ? "Silinsin?" : "Sil"}
          onClick={(e) => {
            e.stopPropagation();
            if (c.id) handleDeleteClick(c.id);
          }}
        >
          {confirming ? (
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            "×"
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.aside
        className={`sidebar${open ? " open" : ""}`}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sidebar-brand">
          <span className="brand-mark">
            <img src={logoSrc} alt="" />
          </span>
          <div className="brand-text">
            <h1>{brandName}</h1>
            <p>{brandSub}</p>
          </div>
          <button type="button" className="sidebar-collapse-btn" title="Paneli bağla" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <motion.button
          type="button"
          className="new-chat-btn"
          onClick={onNewChat}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Yeni söhbət</span>
        </motion.button>

        {chats.length > 0 && (
          <div className="chat-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Söhbətlərdə axtar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </div>
        )}

        <div className="chat-list">
          {chats.length === 0 ? (
            <>
              <p className="section-label">Söhbətlər</p>
              <div className="chat-empty">Hələ söhbət yoxdur</div>
            </>
          ) : isSearching ? (
            filteredChats.length === 0 ? (
              <div className="chat-empty">Uyğun söhbət tapılmadı</div>
            ) : (
              filteredChats.map((c) => renderChatItem(c))
            )
          ) : (
            <>
              <p className="section-label">Söhbətlər</p>
              {filteredChats.map((c) => renderChatItem(c))}
            </>
          )}
        </div>

        {footer}

        {onToggleDarkMode && (
          <button type="button" className={`foot-toggle${darkMode ? " active" : ""}`} onClick={onToggleDarkMode}>
            {darkMode ? (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        )}
      </motion.aside>
      {open && (
        <motion.div
          className="sidebar-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  );
}
