import { useEffect, useRef, useState } from "react";
import AuthScreen from "../components/AuthScreen";
import ChatShell from "../components/ChatShell";
import { isFirebaseReady, watchAuth, logout, type User } from "../lib/firebase";
import { createFirestoreChatStorage, createLocalChatStorage } from "../lib/storage";

const GUEST_KEY = "syncrom_guest";
const GUEST_CHATS_KEY = "syncrom_guest_chats";

const iconProps = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const SUGGESTIONS = [
  {
    label: "Sən kimsən?",
    q: "Sən kimsən və nə edə bilirsən?",
    icon: <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    label: "Maraqlı fakt",
    q: "Mənə maraqlı bir fakt danış",
    icon: <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
  {
    label: "Motivasiya",
    q: "Bu gün nə edə bilərəm? Motivasiya ver",
    icon: <svg {...iconProps}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>,
  },
  {
    label: "Şeir yaz",
    q: "Mənə qısa bir şeir yaz",
    icon: <svg {...iconProps}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  },
];

export default function ChatPage() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!isFirebaseReady()) {
      setIsGuest(true);
      localStorage.setItem(GUEST_KEY, "1");
      setResolved(true);
      setBooting(false);
      return;
    }
    let first = true;
    const unsub = watchAuth((u) => {
      if (u) {
        setUser(u);
        setIsGuest(false);
        localStorage.removeItem(GUEST_KEY);
      } else if (localStorage.getItem(GUEST_KEY) === "1") {
        setUser(null);
        setIsGuest(true);
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setResolved(true);
      if (first) {
        first = false;
        setBooting(false);
      }
    });
    return unsub;
  }, []);

  if (booting || !resolved) {
    return (
      <div className="boot">
        <img src="/favicon.png" alt="Syncrom AI" />
        <div className="boot-bar">
          <i />
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <AuthScreen
        logoSrc="/favicon.png"
        onGuest={() => {
          localStorage.setItem(GUEST_KEY, "1");
          setIsGuest(true);
        }}
      />
    );
  }

  const storage = user ? createFirestoreChatStorage(user.uid) : createLocalChatStorage(GUEST_CHATS_KEY);
  const displayName = user?.displayName || user?.email?.split("@")[0] || null;

  return (
    <ChatShell
      key={user?.uid || "guest"}
      theme="syncrom"
      logoSrc="/favicon.png"
      brandName={
        <>
          SYNCROM<span style={{ color: "var(--accent)" }}>AI</span>
        </>
      }
      brandSub=""
      welcomeTitle={
        <>
          Salam{displayName ? `, ${displayName.split(" ")[0]}` : ""}, mən <strong>Syncrom AI</strong>
        </>
      }
      welcomeText="Sualını yaz, mikrofonla danış və ya aşağıdakılardan birini seç."
      suggestions={SUGGESTIONS}
      storage={storage}
      userName={displayName}
      storageKeyForModel="syncrom_model"
      inputPlaceholder="Syncrom AI-a yaz..."
      hint="Syncrom AI — Groq & ElevenLabs texnologiyası ilə"
      imageGenEnabled
      sidebarFooter={
        <div className="user-card" ref={accountMenuRef}>
          <button
            type="button"
            className="user-card-trigger"
            onClick={() => setAccountMenuOpen((v) => !v)}
          >
            <div className="user-avatar">
              {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : (isGuest ? "Q" : displayName?.[0]?.toUpperCase() || "?")}
            </div>
            <div className="user-info">
              <p className="user-name">{isGuest ? "Qonaq" : displayName || "İstifadəçi"}</p>
              <p className="user-mail">{isGuest ? "Lokal rejim" : user?.email || ""}</p>
            </div>
            <svg
              className={`user-card-chevron${accountMenuOpen ? " open" : ""}`}
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
          {accountMenuOpen && (
            <div className="user-card-menu">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  if (isGuest) {
                    localStorage.removeItem(GUEST_KEY);
                    setIsGuest(false);
                  } else {
                    void logout();
                  }
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Çıxış</span>
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
