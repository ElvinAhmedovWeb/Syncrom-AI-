import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ModelPicker from "./ModelPicker";
import MessageBubble, { TypingIndicator } from "./MessageBubble";
import Composer from "./Composer";
import ArtifactPanel, { type Artifact } from "./ArtifactPanel";
import { useChatController } from "../hooks/useChatController";
import { useSpeechInput } from "../lib/useSpeechInput";
import { EASE_OUT } from "../lib/motion";
import { downloadChat } from "../lib/export";
import { useT } from "../lib/i18n";
import type { MemoryFact, MemoryStore } from "../lib/memory";
import type { ProjectStore } from "../lib/projects";
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

// Yan panelin altlığı (profil kartı) söhbət idarəçisinin bəzi
// əməliyyatlarına ehtiyac duyur (ixrac, hamısını silmə, tünd rejim), amma
// altlıq səhifə tərəfindən verilir. Ona görə ReactNode-dan başqa funksiya
// da qəbul edirik — funksiya bu API-ni alır.
export interface ShellFooterApi {
  exportChat: () => void;
  clearAllChats: () => Promise<void>;
  hasMessages: boolean;
  hasChats: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  memory: {
    facts: MemoryFact[];
    enabled: boolean;
    add: (text: string) => void;
    remove: (id: string) => void;
    clear: () => void;
    toggle: () => void;
  };
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
  memoryStore?: MemoryStore;
  projectStore?: ProjectStore;
  userName?: string | null;
  storageKeyForModel?: string;
  sidebarFooter?: ReactNode | ((api: ShellFooterApi) => ReactNode);
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
  memoryStore,
  projectStore,
  userName,
  storageKeyForModel,
  sidebarFooter,
  linkTo,
  inputPlaceholder,
  hint,
  imageGenEnabled,
}: Props) {
  const t = useT();
  const ctrl = useChatController({ storage, fixedModelId, userName, storageKeyForModel, memoryStore, projectStore });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingDocument, setPendingDocument] = useState<{name: string, text: string} | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
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
  // Alətlər (execute_code / web_search / read_url) artıq bütün modellərdə
  // işləyir — əvvəl yalnız agentTools bayrağı olan modellərdə (Keyla) idi.
  // Vella kimi tək-model səthlərində interfeys sadə qalır.
  const agentToolsEnabled = !fixedModelId && ctrl.models.length > 0;

  function doSend(text?: string) {
    let value = (text ?? input).trim();
    if (pendingDocument) {
      value = `\`\`\`\n// ${pendingDocument.name}\n${pendingDocument.text.slice(0, 15000)}\n\`\`\`\n\n${value}`;
    }
    if (!value && !pendingImage) return;
    ctrl.sendMessage(value, pendingImage);
    setInput("");
    setPendingImage(null);
    setPendingDocument(null);
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

  const exportChat = () => ctrl.currentChat && downloadChat(ctrl.currentChat);

  const footerNode =
    typeof sidebarFooter === "function"
      ? sidebarFooter({
          exportChat,
          clearAllChats: ctrl.clearAllChats,
          hasMessages: messages.length > 0,
          hasChats: ctrl.chats.length > 0,
          darkMode: theme === "syncrom" ? darkMode : undefined,
          onToggleDarkMode: theme === "syncrom" ? toggleDarkMode : undefined,
          memory: {
            facts: ctrl.memories,
            enabled: ctrl.memoryOn,
            add: ctrl.addMemory,
            remove: ctrl.deleteMemory,
            clear: ctrl.clearMemories,
            toggle: ctrl.toggleMemory,
          },
        })
      : sidebarFooter;

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
        capricorn={{
          projects: ctrl.projects,
          activeProject: ctrl.activeProject,
          select: ctrl.selectProject,
          create: ctrl.createProject,
          update: ctrl.updateProject,
          remove: ctrl.deleteProject,
        }}
        onDeleteChat={ctrl.deleteChat}
        onRenameChat={ctrl.renameChat}
        footer={footerNode}
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
                  title={t("top.exportTitle")}
                  onClick={exportChat}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{t("top.export")}</span>
                </motion.button>
              )}
              <motion.button
                type="button"
                className={`toggle-btn${ctrl.autoSpeak ? " active" : ""}`}
                title={t("top.autoSpeakTitle")}
                onClick={ctrl.toggleAutoSpeak}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>{t("top.autoSpeak")}</span>
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
                  {t("welcome.activeModel")}: <b>{activeModel.name}</b> — {activeModel.tag}
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
                    onOpenArtifact={setArtifact}
                    speakState={ctrl.speaking?.key === key ? ctrl.speaking.state : "idle"}
                    // Addımlar və davam sualları yalnız SON cavaba aiddir
                    steps={isLastAssistant ? ctrl.agentSteps : undefined}
                    followups={isLastAssistant && !ctrl.busy ? ctrl.followups : undefined}
                    onFollowup={(q) => doSend(q)}
                    virgo={ctrl.virgo?.index === i ? ctrl.virgo : undefined}
                    onVirgo={m.role === "assistant" && !ctrl.busy ? () => void ctrl.runVirgo(i) : undefined}
                    onVirgoDismiss={ctrl.dismissVirgo}
                    onVirgoApply={ctrl.applyVirgoFix}
                  />
                );
              })}
              {ctrl.streamDraft !== null &&
                (ctrl.streamDraft === "" ? (
                  <>
                    {ctrl.agentSteps.length > 0 && (
                      <MessageBubble
                        message={{ role: "assistant", content: "" }}
                        logoSrc={logoSrc}
                        steps={ctrl.agentSteps}
                      />
                    )}
                    <TypingIndicator logoSrc={logoSrc} />
                  </>
                ) : (
                  <MessageBubble
                    message={{ role: "assistant", content: ctrl.streamDraft }}
                    logoSrc={logoSrc}
                    steps={ctrl.agentSteps}
                    onOpenArtifact={setArtifact}
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
          pendingDocument={pendingDocument}
          onDocumentChange={setPendingDocument}
          micSupported={speechInput.supported}
          recording={speechInput.recording}
          onMicToggle={speechInput.toggle}
          imageGenEnabled={imageGenEnabled}
          imageGenActive={ctrl.imageGenMode}
          onToggleImageGen={ctrl.toggleImageGen}
          imageAspect={ctrl.imageAspect}
          onSelectImageAspect={ctrl.selectImageAspect}
          deepThinkActive={ctrl.deepThink}
          onToggleDeepThink={ctrl.toggleDeepThink}
          agentToolsEnabled={agentToolsEnabled}
          agentModeActive={ctrl.agentMode}
          onToggleAgentMode={ctrl.toggleAgentMode}
          webSearchActive={ctrl.webSearchMode}
          libraActive={ctrl.libraMode}
          onToggleLibra={ctrl.toggleLibra}
          onToggleWebSearch={ctrl.toggleWebSearch}
          translateActive={ctrl.translateMode}
          onToggleTranslate={ctrl.toggleTranslate}
          translateTo={ctrl.translateTo}
          onSelectTranslateTo={ctrl.selectTranslateTo}
          hint={
            ctrl.translateMode
              ? t("composer.hintTranslate")
              : ctrl.imageGenMode
                ? t("composer.hintImageGen")
                : hint
          }
          placeholder={
            ctrl.translateMode
              ? t("composer.placeholderTranslate")
              : ctrl.imageGenMode
                ? t("composer.placeholderImageGen")
                : inputPlaceholder
          }
        />
      </motion.div>

      {/* Yaddaşa nə yazıldığını istifadəçi görməlidir — arxada sükutla
          profil yığmaq yox, hər dəfə açıq bildiriş. */}
      {ctrl.memorySaved && (
        <motion.div
          className="mem-toast"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          role="status"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
          </svg>
          <span className="mem-toast-text">
            <b>{t("mem.saved")}</b>
            <small>{ctrl.memorySaved}</small>
          </span>
          <button type="button" onClick={ctrl.dismissMemoryToast} aria-label={t("art.close")}>
            ×
          </button>
        </motion.div>
      )}

      {artifact && <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />}
    </div>
  );
}
