import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ModelPicker from "./ModelPicker";
import MessageBubble, { TypingIndicator } from "./MessageBubble";
import Composer from "./Composer";
import { useChatController } from "../hooks/useChatController";
import { useSpeechInput } from "../lib/useSpeechInput";
import { EASE_OUT } from "../lib/motion";
import { downloadChat } from "../lib/export";
import type { ChatStorage } from "../lib/storage";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

interface Suggestion {
  label: string;
  q: string;
  icon?: ReactNode;
}

interface Props {
  theme: "syncrom" | "vella";
  logoSrc: string;
  brandName: ReactNode;
  brandSub: string;
  welcomeTitle: ReactNode;
  welcomeText: string;
  suggestions: Suggestion[];
  fixedModelId?: string;
  storage: ChatStorage;
  userName?: string | null;
  storageKeyForModel?: string;
  sidebarFooter?: ReactNode;
  linkTo?: { href: string; label: string };
  inputPlaceholder: string;
  hint: string;
  imageGenEnabled?: boolean;
}

export default function ChatShell({
  theme,
  logoSrc,
  brandName,
  brandSub,
  welcomeTitle,
  welcomeText,
  suggestions,
  fixedModelId,
  storage,
  userName,
  storageKeyForModel,
  sidebarFooter,
  linkTo,
  inputPlaceholder,
  hint,
  imageGenEnabled,
}: Props) {
  const ctrl = useChatController({ storage, fixedModelId, userName, storageKeyForModel });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => theme === "syncrom" && localStorage.getItem("syncrom_dark") === "1");

  const effectiveTheme = theme === "syncrom" && darkMode ? "syncrom-dark" : theme;

  function toggleDarkMode() {
    setDarkMode((v) => {
      const next = !v;
      localStorage.setItem("syncrom_dark", next ? "1" : "0");
      return next;
    });
  }

  const speechInput = useSpeechInput(
    (text) => setInput(text),
    () => {
      setInput((current) => {
        if (current.trim()) doSend(current);
        return current;
      });
    }
  );

  const activeModel = ctrl.models.find((m) => m.id === ctrl.currentModelId);
  const visionEnabled = fixedModelId ? false : !!activeModel?.vision;
  const agentToolsEnabled = fixedModelId ? false : !!activeModel?.agentTools;

  function doSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value && !pendingImage) return;
    ctrl.sendMessage(value, pendingImage);
    setInput("");
    setPendingImage(null);
  }

  function handleEdit(index: number) {
    const msg = ctrl.currentChat?.messages[index];
    if (!msg || msg.role !== "user") return;
    ctrl.editMessage(index);
    setInput(msg.content);
    setPendingImage(msg.image ?? null);
  }

  const messages = ctrl.currentChat?.messages ?? [];
  const showWelcome = messages.length === 0 && ctrl.streamDraft === null;

  return (
    <div className="app-shell" data-theme={effectiveTheme}>
      <AnimatedBackground variant={effectiveTheme === "syncrom" ? "none" : "grid"} />

      <Sidebar
        logoSrc={logoSrc}
        brandName={brandName}
        brandSub={brandSub}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={ctrl.chats}
        currentChatId={ctrl.currentChat?.id ?? null}
        models={ctrl.models}
        onNewChat={() => {
          ctrl.newChat();
          setSidebarOpen(false);
        }}
        onOpenChat={(id) => {
          ctrl.openChat(id);
          setSidebarOpen(false);
        }}
        onDeleteChat={ctrl.deleteChat}
        onRenameChat={ctrl.renameChat}
        footer={sidebarFooter}
        darkMode={theme === "syncrom" ? darkMode : undefined}
        onToggleDarkMode={theme === "syncrom" ? toggleDarkMode : undefined}
      />

      <motion.div
        className="main"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
      >
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          busy={ctrl.busy}
          statusText={ctrl.statusText}
          linkTo={linkTo}
          actions={
            <>
              {messages.length > 0 && (
                <motion.button
                  type="button"
                  className="toggle-btn"
                  title="Söhbəti ixrac et (.md)"
                  onClick={() => ctrl.currentChat && downloadChat(ctrl.currentChat)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>İxrac et</span>
                </motion.button>
              )}
              <motion.button
                type="button"
                className={`toggle-btn${ctrl.autoSpeak ? " active" : ""}`}
                title="Avtomatik səsləndirmə"
                onClick={ctrl.toggleAutoSpeak}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>Avto səs</span>
              </motion.button>
            </>
          }
        />

        <main className="chat-scroll">
          {showWelcome ? (
            <motion.div className="welcome" initial="hidden" animate="show" variants={stagger}>
              <motion.div className="welcome-badge" variants={fadeUp}>
                <img src={logoSrc} alt="" />
              </motion.div>
              <motion.h2 variants={fadeUp}>{welcomeTitle}</motion.h2>
              <motion.p variants={fadeUp}>{welcomeText}</motion.p>
              {activeModel && (
                <motion.p className="model-pill-note" variants={fadeUp}>
                  <span className="m-dot" style={{ background: activeModel.color, color: activeModel.color }} />
                  Aktiv model: <b>{activeModel.name}</b> — {activeModel.tag}
                </motion.p>
              )}
              <motion.div className="suggestions" variants={stagger}>
                {suggestions.map((s) => (
                  <motion.button
                    key={s.q}
                    type="button"
                    className="chip"
                    variants={fadeUp}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => doSend(s.q)}
                  >
                    {s.icon && <span className="chip-icon">{s.icon}</span>}
                    <span>{s.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isLastAssistant = m.role === "assistant" && i === messages.length - 1 && ctrl.streamDraft === null;
                const key = String(i);
                return (
                  <MessageBubble
                    key={i}
                    message={m}
                    logoSrc={logoSrc}
                    accentColor={activeModel?.color}
                    withRegen={isLastAssistant && !ctrl.busy && !m.image}
                    onSpeak={() => ctrl.speak(m.content, key)}
                    onRegenerate={ctrl.regenerate}
                    onEdit={m.role === "user" && !ctrl.busy ? () => handleEdit(i) : undefined}
                    speakState={ctrl.speaking?.key === key ? ctrl.speaking.state : "idle"}
                  />
                );
              })}
              {ctrl.streamDraft !== null &&
                (ctrl.streamDraft === "" ? (
                  <TypingIndicator logoSrc={logoSrc} />
                ) : (
                  <MessageBubble
                    message={{ role: "assistant", content: ctrl.streamDraft }}
                    logoSrc={logoSrc}
                    streaming
                  />
                ))}
            </>
          )}
        </main>

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => doSend()}
          onStop={ctrl.stop}
          busy={ctrl.busy}
          modelPickerSlot={
            !fixedModelId && ctrl.models.length > 0 ? (
              <ModelPicker models={ctrl.models} currentId={ctrl.currentModelId} onSelect={ctrl.selectModel} />
            ) : undefined
          }
          visionEnabled={visionEnabled}
          pendingImage={pendingImage}
          onImageChange={setPendingImage}
          micSupported={speechInput.supported}
          recording={speechInput.recording}
          onMicToggle={speechInput.toggle}
          imageGenEnabled={imageGenEnabled}
          imageGenActive={ctrl.imageGenMode}
          onToggleImageGen={ctrl.toggleImageGen}
          deepThinkActive={ctrl.deepThink}
          onToggleDeepThink={ctrl.toggleDeepThink}
          agentToolsEnabled={agentToolsEnabled}
          agentModeActive={ctrl.agentMode}
          onToggleAgentMode={ctrl.toggleAgentMode}
          hint={ctrl.imageGenMode ? "Şəkil yaratma rejimi aktivdir — nə istədiyini təsvir et" : hint}
          placeholder={ctrl.imageGenMode ? "Hansı şəkli yaratmaq istəyirsən? (məs: gün batımında dağlar)" : inputPlaceholder}
        />
      </motion.div>
    </div>
  );
}
