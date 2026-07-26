import { useEffect, useMemo, useState } from "react";
import AuthScreen from "../components/AuthScreen";
import ChatShell from "../components/ChatShell";
import AccountMenu from "../components/AccountMenu";
import { isFirebaseReady, watchAuth, logout, type User } from "../lib/firebase";
import { createFirestoreChatStorage, createLocalChatStorage } from "../lib/storage";
import { createFirestoreMemoryStore, createLocalMemoryStore } from "../lib/memory";
import { useT } from "../lib/i18n";

const GUEST_KEY = "syncrom_guest";
const GUEST_CHATS_KEY = "syncrom_guest_chats";

const iconProps = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function ChatPage() {
  const t = useT();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [resolved, setResolved] = useState(false);

  const uid = user?.uid ?? null;

  // Anbarlar hər render-də yenidən yaranmamalıdır — yaddaş anbarı
  // useChatController-də effekt asılılığıdır, yeni obyekt sonsuz
  // yükləmə dövrəsi yaradar.
  const storage = useMemo(
    () => (uid ? createFirestoreChatStorage(uid) : createLocalChatStorage(GUEST_CHATS_KEY)),
    [uid]
  );
  const memoryStore = useMemo(
    () => (uid ? createFirestoreMemoryStore(uid) : createLocalMemoryStore()),
    [uid]
  );

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

  const displayName = user?.displayName || user?.email?.split("@")[0] || null;

  const suggestions = [
    {
      label: t("sug.who"),
      q: t("sug.whoQ"),
      icon: <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    },
    {
      label: t("sug.fact"),
      q: t("sug.factQ"),
      icon: <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    },
    {
      label: t("sug.motivation"),
      q: t("sug.motivationQ"),
      icon: <svg {...iconProps}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>,
    },
    {
      label: t("sug.poem"),
      q: t("sug.poemQ"),
      icon: <svg {...iconProps}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    },
  ];

  const firstName = displayName?.split(" ")[0];
  // Salamlama tərcümədə "Syncrom AI" hissəsini qalın göstərmək üçün açar
  // mətni iki hissəyə bölünür — {name} yerinə düşən ad, brend isə <strong>.
  const greeting = firstName
    ? t("welcome.greetingNamed", { name: firstName })
    : t("welcome.greeting");
  const [beforeBrand, afterBrand] = greeting.split("Syncrom AI");

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
          {beforeBrand}
          <strong>Syncrom AI</strong>
          {afterBrand ?? ""}
        </>
      }
      welcomeText={t("welcome.text")}
      suggestions={suggestions}
      storage={storage}
      memoryStore={memoryStore}
      userName={displayName}
      storageKeyForModel="syncrom_model"
      inputPlaceholder={t("composer.placeholder")}
      hint={t("composer.hint")}
      imageGenEnabled
      sidebarFooter={(api) => (
        <AccountMenu
          displayName={displayName}
          email={user?.email ?? null}
          photoURL={user?.photoURL ?? null}
          isGuest={isGuest}
          onSignOut={() => {
            if (isGuest) {
              localStorage.removeItem(GUEST_KEY);
              setIsGuest(false);
            } else {
              void logout();
            }
          }}
          api={api}
        />
      )}
    />
  );
}
