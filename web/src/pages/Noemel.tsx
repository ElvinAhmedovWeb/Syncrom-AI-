import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent, type ClipboardEvent, type DragEvent } from "react";
import { useI18n, usePageTitle } from "../lib/i18n";
import { streamNoemelChat, fetchSpeech } from "../lib/api";
import { renderMarkdown, stripForSpeech } from "../lib/markdown";
import { useSpeechInput } from "../lib/useSpeechInput";
// removed downloadChat
import { watchAuth, logout, type User } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { ProjectsView, AgentsView, TemplatesView, DeploymentsView, HistoryView, FavoritesView } from "../components/NoemelViews";
import type { ChatMessage, Chat } from "../types";

const STORAGE_KEY = "noemel_chats_v1";

interface ArtifactState {
  code: string;
  kind: "html" | "svg";
}

interface CommandItem {
  cmd: string;
  label: string;
  desc: string;
  promptTemplate: string;
}

const COMMANDS: CommandItem[] = [
  { cmd: "/fix", label: "Fix Code / Debug", desc: "Koddakı xətaları tap və düzəlt", promptTemplate: "Aşağıdakı koddakı xətaları (bugs) tap və düzəldilmiş versiyasını təqdim et:\n\n" },
  { cmd: "/explain", label: "Explain Code", desc: "Kodu addım-addım təhlil et və izah ver", promptTemplate: "Aşağıdakı kodun necə işlədiyini addım-addım izah et:\n\n" },
  { cmd: "/test", label: "Write Unit Tests", desc: "Kod üçün unit testlər hazırla", promptTemplate: "Aşağıdakı kod üçün tam unit testlər yaz:\n\n" },
  { cmd: "/refactor", label: "Refactor Code", desc: "Kodu optimallaşdır və təmizlə", promptTemplate: "Aşağıdakı kodu clean code prinsiplərinə görə refaktor et:\n\n" },
  { cmd: "/api", label: "Design REST API", desc: "REST API və DB strukturu qur", promptTemplate: "Aşağıdakı tələblərə uyğun REST API və verilənlər bazası strukturu layihələndir:\n\n" },
  { cmd: "/clear", label: "Clear Chat", desc: "Çat tarixçəsini təmizlə", promptTemplate: "" },
];

/* Helper to extract generated HTML/CSS/JS code from assistant responses */
function extractWebCode(text: string): { code: string; type: "html" | "svg" | "code" } | null {
  if (!text) return null;

  const htmlMatch = text.match(/```(?:html|xml)\s*([\s\S]*?)```/i);
  if (htmlMatch && htmlMatch[1].trim()) {
    const code = htmlMatch[1].trim();
    if (code.toLowerCase().includes("<svg")) return { code, type: "svg" };
    return { code, type: "html" };
  }

  if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
    const start = text.search(/<!DOCTYPE html>|<html/i);
    const end = text.lastIndexOf("</html>");
    if (start !== -1 && end !== -1) {
      const code = text.slice(start, end + 7);
      return { code, type: "html" };
    }
  }

  const svgMatch = text.match(/```svg\s*([\s\S]*?)```/i);
  if (svgMatch && svgMatch[1].trim()) {
    return { code: svgMatch[1].trim(), type: "svg" };
  }

  const codeMatch = text.match(/```(?:js|javascript|ts|typescript|css)\s*([\s\S]*?)```/i);
  if (codeMatch && codeMatch[1].trim()) {
    return { code: codeMatch[1].trim(), type: "code" };
  }

  // Fallback: match any code block if the AI omitted the language tag
  const fallbackMatch = text.match(/```[a-z]*\n([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fallbackMatch && fallbackMatch[1].trim()) {
    return { code: fallbackMatch[1].trim(), type: "html" };
  }

  return null;
}

function stripCodeBlocksForChat(text: string): string {
  if (!text) return "";
  let stripped = text.replace(/```[\s\S]*?```/g, "");
  const lastBackticks = stripped.lastIndexOf("```");
  if (lastBackticks !== -1) {
    stripped = stripped.substring(0, lastBackticks);
  }
  return stripped.trim();
}

/* ---- Vector SVG Icons ---- */
const LeafIcon = () => (
  <img src="/NoEmEl.png" alt="NoEmEl Logo" className="noemel-animated-logo" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const MicIcon = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 3.8-10.82L2.5 8" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DesktopIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const TabletIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const MobileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FileCodeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m10 13-2 2 2 2" />
    <path d="m14 13 2 2-2 2" />
  </svg>
);

/* Suggestion icons */
const PackageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CodeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const BrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BracesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
    <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
  </svg>
);

const PlaneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const FolderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
);
const ImageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const DatabaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);
const PlugIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>
);
const BotIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
);
const LayoutTemplateIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>
);
const RocketIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
);
const HistoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
);
const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

export default function NoemelPage() {
  const { lang, setLang } = useI18n();
  usePageTitle("l.nav.noemel");

  const navigate = useNavigate();
  const [bootingAuth, setBootingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  /* ---- View State ---- */
  const [activeView, setActiveView] = useState<"home" | "projects" | "agents" | "templates" | "deployments" | "history" | "favorites">("home");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  /* ---- Animated Placeholder ---- */
  const placeholders = [
    lang === "az" ? "Fitnes mərkəzləri üçün SaaS yarad və admin paneli əlavə et..." : "Build me a SaaS for gym owners with Stripe...",
    lang === "az" ? "CRM sistemi hazırlayın..." : "Create a CRM with dashboard...",
    lang === "az" ? "Süni intellekt startapı qur..." : "Build an AI startup...",
    lang === "az" ? "Gözəl bir landing page dizayn et..." : "Design a landing page...",
    lang === "az" ? "Airbnb klonunu yarat..." : "Clone Airbnb...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  /* ---- State ---- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessions, setSessions] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Lovable Workspace Builder State
  const [workspaceTab, setWorkspaceTab] = useState<"preview" | "code" | "files">("preview");
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Slash Command Menu state
  const [showCmdMenu, setShowCmdMenu] = useState(false);
  const [cmdSearchFilter, setCmdSearchFilter] = useState("");

  // Live Artifact Modal state
  const [previewArtifact, setPreviewArtifact] = useState<ArtifactState | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  // Attachments
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileText, setAttachedFileText] = useState<string | null>(null);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  // Streaming & Audio
  const [isStreaming, setIsStreaming] = useState(false);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auth checking
  useEffect(() => {
    let first = true;
    const unsub = watchAuth((u) => {
      setUser(u || null);
      setAuthResolved(true);
      if (first) {
        first = false;
        setBootingAuth(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!bootingAuth && authResolved && !user) {
      navigate("/login", { replace: true });
    }
  }, [bootingAuth, authResolved, user, navigate]);


  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  /* ---- LocalStorage Persistence ---- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  /* ---- Extract code automatically whenever active session messages change ---- */
  useEffect(() => {
    if (!activeSession || activeSession.messages.length === 0) {
      setGeneratedCode(null);
      return;
    }
    // Find the latest assistant message containing code
    for (let i = activeSession.messages.length - 1; i >= 0; i--) {
      const msg = activeSession.messages[i];
      if (msg.role === "assistant" && msg.content) {
        const extracted = extractWebCode(msg.content);
        if (extracted) {
          setGeneratedCode(extracted.code);
          break;
        }
      }
    }
  }, [activeSession]);

  /* ---- Auto-open Preview and Collapse Sidebar ---- */
  useEffect(() => {
    if (!isStreaming && generatedCode) {
      setShowPreviewPanel(true);
      setSidebarCollapsed(true);
    } else if (!generatedCode) {
      setShowPreviewPanel(false);
    }
  }, [isStreaming, generatedCode]);

  /* ---- Ctrl+K Search Shortcut ---- */
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else if (e.key === "Escape") {
        setShowSearchModal(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  /* ---- Speech Input Hook ---- */
  const { supported: speechSupported, recording: isRecording, toggle: toggleMic } = useSpeechInput(
    (text) => {
      setInputValue((prev) => (prev ? prev + " " + text : text));
    },
    () => { }
  );

  /* ---- Code Copy & Live Artifact Preview Button Listeners ---- */
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const copyBtn = target.closest(".code-copy-btn") as HTMLButtonElement | null;
      if (copyBtn) {
        const codeEncoded = copyBtn.getAttribute("data-code");
        if (codeEncoded) {
          const decoded = decodeURIComponent(codeEncoded);
          navigator.clipboard.writeText(decoded).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = lang === "az" ? "Kopyalandı!" : "Copied!";
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          });
        }
        return;
      }

      const previewBtn = target.closest(".code-preview-btn") as HTMLButtonElement | null;
      if (previewBtn) {
        const codeEncoded = previewBtn.getAttribute("data-code");
        const kind = previewBtn.getAttribute("data-kind") as "html" | "svg" | null;
        if (codeEncoded && kind) {
          const code = decodeURIComponent(codeEncoded);
          setPreviewArtifact({ code, kind });
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [lang]);

  /* ---- Auto-resize textarea & detect `/` commands ---- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
    }

    if (inputValue.startsWith("/")) {
      setShowCmdMenu(true);
      setCmdSearchFilter(inputValue.toLowerCase());
    } else {
      setShowCmdMenu(false);
    }
  }, [inputValue]);

  /* ---- Scroll to bottom ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isStreaming]);

  /* ---- Select Command from Palette ---- */
  const handleSelectCommand = (cmdItem: CommandItem) => {
    setShowCmdMenu(false);
    if (cmdItem.cmd === "/clear") {
      createNewChat();
      setInputValue("");
      return;
    }
    setInputValue(cmdItem.promptTemplate);
    textareaRef.current?.focus();
  };

  /* ---- File Reader Helper ---- */
  const processFile = async (file: File) => {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachedImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const binaryExts = ["pdf", "docx", "doc", "xlsx", "xls"];
      if (ext && binaryExts.includes(ext)) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const res = await fetch("/api/parse-document", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: file.name, base64 })
            });
            if (!res.ok) throw new Error("Server xətası");
            const data = await res.json();
            setAttachedFileName(file.name);
            setAttachedFileText(data.text);
          } catch (err) {
            console.error("Sənəd oxuna bilmədi:", err);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setAttachedFileName(file.name);
          setAttachedFileText(evt.target?.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  /* ---- Clipboard Paste Handler (Ctrl + V) ---- */
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
        }
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
        }
      }
    }
  };

  /* ---- Drag and Drop Handlers ---- */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  /* ---- Helpers ---- */
  const createNewChat = () => {
    const newSession: Chat = {
      id: `chat-${Date.now()}`,
      title: lang === "az" ? "Yeni söhbət" : "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInputValue("");
    setAttachedImage(null);
    setAttachedFileName(null);
    setAttachedFileText(null);
    setGeneratedCode(null);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  /* ---- Open Preview in New Window ---- */
  const handleOpenNewWindow = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  /* ---- Download Generated HTML File ---- */
  const handleDownloadApp = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---- TTS Audio playback ---- */
  const handlePlayTTS = async (text: string, msgIndex: number) => {
    if (playingMsgIndex === msgIndex) {
      setPlayingMsgIndex(null);
      return;
    }
    setPlayingMsgIndex(msgIndex);
    try {
      const clean = stripForSpeech(text);
      const blob = await fetchSpeech(clean);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setPlayingMsgIndex(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setPlayingMsgIndex(null);
      };
      audio.play();
    } catch {
      setPlayingMsgIndex(null);
    }
  };

  /* ---- Stop Streaming ---- */
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setWorkspaceTab("preview");
  };


  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && !attachedFileText && !attachedImage) return;
    if (isStreaming) return;

    let sessionId = activeSessionId;
    let currentSession = sessions.find((s) => s.id === sessionId);

    if (!sessionId || !currentSession) {
      const newSession: Chat = {
        id: `chat-${Date.now()}`,
        title: text
          ? text.slice(0, 30) + (text.length > 30 ? "..." : "")
          : (attachedFileName || (lang === "az" ? "Yeni söhbət" : "New chat")),
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      sessionId = newSession.id;
      currentSession = newSession;
      setActiveSessionId(sessionId);
    }

    let finalUserContent = text;
    if (attachedFileName && attachedFileText) {
      finalUserContent += `\n\n[Fayl: ${attachedFileName}]\n\`\`\`\n${attachedFileText}\n\`\`\``;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: finalUserContent,
      image: attachedImage || undefined,
    };

    const updatedMessages = [...currentSession.messages, userMsg];

    setInputValue("");
    setShowCmdMenu(false);
    setAttachedImage(null);
    setAttachedFileName(null);
    setAttachedFileText(null);

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, messages: updatedMessages, updatedAt: Date.now() } : s))
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const assistantPlaceholder: ChatMessage = {
      role: "assistant",
      content: "",
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...updatedMessages, assistantPlaceholder] } : s
      )
    );

    let accumulatedContent = "";

    try {
      await streamNoemelChat({
        messages: updatedMessages,
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulatedContent += chunk;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === sessionId) {
                const msgs = [...s.messages];
                msgs[msgs.length - 1] = {
                  role: "assistant",
                  content: accumulatedContent,
                };
                return { ...s, messages: msgs, updatedAt: Date.now() };
              }
              return s;
            })
          );

          // Real-time extract code as it streams to feed live preview
          const extracted = extractWebCode(accumulatedContent);
          if (extracted) {
            setGeneratedCode(extracted.code);
          }
        },
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorText = `\n\n❌ *${lang === "az" ? "Xəta baş verdi" : "Error"}: ${err.message || "NVIDIA API bağlantı xətası"}*`;
        accumulatedContent += errorText;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === sessionId) {
              const msgs = [...s.messages];
              msgs[msgs.length - 1] = {
                role: "assistant",
                content: accumulatedContent || errorText,
              };
              return { ...s, messages: msgs };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      setWorkspaceTab("preview");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommands = COMMANDS.filter(
    (c) =>
      c.cmd.startsWith(cmdSearchFilter) ||
      c.label.toLowerCase().includes(cmdSearchFilter.slice(1)) ||
      c.desc.toLowerCase().includes(cmdSearchFilter.slice(1))
  );

  const suggestionChips = [
    {
      label: lang === "az" ? "SaaS Landing Page qur" : "Build a SaaS Landing Page",
      icon: <PackageIcon />,
    },
    {
      label: lang === "az" ? "İnteraktiv Todo App yarat" : "Create a Todo App",
      icon: <CodeIcon />,
    },
    {
      label: lang === "az" ? "Portfolio veb saytı qur" : "Build a Portfolio Site",
      icon: <BracesIcon />,
    },
    {
      label: lang === "az" ? "Analitika Paneli (Dashboard)" : "Build an Analytics Dashboard",
      icon: <PlaneIcon />,
    },
  ];

  if (bootingAuth || !authResolved) {
    return (
      <div className="boot">
        <img src="/NoEmEl.png" alt="NoEmEl" />
        <div className="boot-bar">
          <i />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className={`noemel-shell ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        accept="image/*,.txt,.js,.ts,.py,.json,.md,.html,.css,.rs,.go"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="noemel-drop-overlay">
          <div className="noemel-drop-card">
            <UploadCloudIcon />
            <h3>{lang === "az" ? "Faylı və ya Şəkli buraya atın" : "Drop Files or Images Here"}</h3>
            <p>
              {lang === "az"
                ? "Şəkillər, sənədlər və kod faylları avtomatik qoşulacaq"
                : "Images, documents, and code files will be automatically attached"}
            </p>
          </div>
        </div>
      )}

      {/* Live Artifact Sandbox Modal (Overlay) */}
      {previewArtifact && (
        <div className="noemel-artifact-backdrop" onClick={() => setPreviewArtifact(null)}>
          <div className="noemel-artifact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="noemel-artifact-header">
              <div className="noemel-artifact-title">
                <SparklesIcon />
                <span>Canlı Baxış ({previewArtifact.kind.toUpperCase()})</span>
              </div>
              <button
                className="noemel-artifact-close"
                onClick={() => setPreviewArtifact(null)}
                title="Bağla"
              >
                ×
              </button>
            </div>
            <div className="noemel-artifact-body">
              {previewArtifact.kind === "svg" ? (
                <div
                  className="noemel-svg-container"
                  dangerouslySetInnerHTML={{ __html: previewArtifact.code }}
                />
              ) : (
                <iframe
                  title="Live Artifact Preview"
                  srcDoc={previewArtifact.code}
                  className="noemel-artifact-iframe"
                  sandbox="allow-scripts allow-modals"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== SIDEBAR ========== */}
      <aside className={`noemel-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Brand row */}
        <div className="noemel-brand-row">
          <a href="/home" className="noemel-brand-left" title="Home">
            <span className="noemel-brand-icon" style={{transform: "scale(1.2)"}}>
              <LeafIcon />
            </span>
            <span className="noemel-brand-text" style={{fontSize: "20px", fontWeight: "600"}}>Noemel</span>
          </a>
          <div className="noemel-brand-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!sidebarCollapsed && (
              <button
                className="noemel-hamburger"
                onClick={() => {
                  setShowSearchModal(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                title="Axtar (⌘K)"
              >
                <SearchIcon />
              </button>
            )}
            <button
              className="noemel-hamburger"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="noemel-sidebar-nav">
          <div className={`noemel-nav-item ${activeView === "home" ? "active" : ""}`} onClick={() => setActiveView("home")}>
            <HomeIcon />
            <span className="noemel-nav-text">Home</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "projects" ? "active" : ""}`} onClick={() => setActiveView("projects")}>
            <FolderIcon />
            <span className="noemel-nav-text">Projects</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "agents" ? "active" : ""}`} onClick={() => setActiveView("agents")}>
            <BotIcon />
            <span className="noemel-nav-text">Agents</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "templates" ? "active" : ""}`} onClick={() => setActiveView("templates")}>
            <LayoutTemplateIcon />
            <span className="noemel-nav-text">Templates</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "deployments" ? "active" : ""}`} onClick={() => setActiveView("deployments")}>
            <RocketIcon />
            <span className="noemel-nav-text">Deployments</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "history" ? "active" : ""}`} onClick={() => setActiveView("history")}>
            <HistoryIcon />
            <span className="noemel-nav-text">History</span>
          </div>
          <div className={`noemel-nav-item ${activeView === "favorites" ? "active" : ""}`} onClick={() => setActiveView("favorites")}>
            <StarIcon />
            <span className="noemel-nav-text">Favorites</span>
          </div>
        </nav>

        {/* New chat button */}
        <button className="noemel-newchat-btn" onClick={createNewChat}>
          <PlusIcon />
          <span className="noemel-newchat-text">
            {lang === "az" ? "Yeni layihə" : "New Project"}
          </span>
        </button>

        {/* Chat list */}
        <div className="noemel-sidebar-section-title">
          <span className="noemel-section-text">Recent</span>
        </div>
        <div className="noemel-chat-list">
            {filteredSessions.length === 0 ? (
              <>
                <div className="noemel-chat-item">
                  <ChatBubbleIcon />
                  <span className="noemel-chat-item-text">
                    Portfolio Website
                  </span>
                </div>
                <div className="noemel-chat-item">
                  <ChatBubbleIcon />
                  <span className="noemel-chat-item-text">
                    CRM Dashboard
                  </span>
                </div>
                <div className="noemel-chat-item">
                  <ChatBubbleIcon />
                  <span className="noemel-chat-item-text">
                    SaaS Landing
                  </span>
                </div>
                <div className="noemel-chat-item">
                  <ChatBubbleIcon />
                  <span className="noemel-chat-item-text">
                    AI Chatbot
                  </span>
                </div>
              </>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`noemel-chat-item ${session.id === activeSessionId ? "active" : ""}`}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <ChatBubbleIcon />
                  <span className="noemel-chat-item-text">{session.title || "Söhbət"}</span>
                  <button
                    className="noemel-chat-delete-btn"
                    onClick={(e) => deleteSession(session.id!, e)}
                    title="Sil"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>

        {/* Bottom User Profile section */}
        <div className="noemel-sidebar-bottom">


          <div 
            className="noemel-user-row" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div className="noemel-user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                <UserIcon />
              )}
            </div>
            <div className="noemel-user-details">
              <div className="noemel-user-name">{user?.displayName || user?.email?.split('@')[0] || "İstifadəçi"}</div>
              <div className="noemel-user-email">{user?.email || ""}</div>
            </div>
            
            {showProfileMenu && !sidebarCollapsed && (
               <div className="noemel-profile-dropdown">
                  <div className="noemel-dropdown-item" onClick={() => { setShowSettingsModal(true); setShowProfileMenu(false); }}><SettingsIcon /> <span>Settings</span></div>
                  <div className="noemel-dropdown-item" onClick={() => { logout(); setShowProfileMenu(false); }}><span>Log out</span></div>
               </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========== LOVABLE BUILDER SPLIT WORKSPACE ========== */}
      {activeView === "home" ? (
        <div className="noemel-builder-split">
          {/* Left Panel: Chat & Prompt Workspace */}
        <main className={`noemel-left-panel ${!showPreviewPanel ? "no-border" : ""}`}>
          <header className="noemel-top-bar" style={{justifyContent: 'flex-end'}}>
            <div className="noemel-live-indicator" style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '500', color: 'var(--subtext)'}}>
              <span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite'}}></span>
              {lang === "az" ? "AI Agentləri Hazırdır" : "AI Agents Ready"}
            </div>
          </header>

          {!activeSession || activeSession.messages.length === 0 ? (
            /* ---- Welcome State ---- */
            <div className="noemel-welcome-container">
              <h1 className="noemel-welcome-heading">
                Think. Build. Ship.
              </h1>
              <p className="noemel-welcome-sub">
                {lang === "az"
                  ? "İdeyadan canlı və işlək veb tətbiqə — süni intellektin gücü ilə."
                  : "From an idea to a production-ready application — powered by AI."}
              </p>

              <div className="noemel-composer-wrapper">
                {/* Attachment Previews */}
                {(attachedImage || attachedFileName) && (
                  <div className="noemel-attachment-preview">
                    {attachedImage && (
                      <img src={attachedImage} alt="Attachment" className="noemel-preview-thumb" />
                    )}
                    {attachedFileName && <span className="noemel-file-tag">📄 {attachedFileName}</span>}
                    <button
                      className="noemel-remove-attach"
                      onClick={() => {
                        setAttachedImage(null);
                        setAttachedFileName(null);
                        setAttachedFileText(null);
                      }}
                      title="Sil"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Slash Command Palette Popover */}
                {showCmdMenu && filteredCommands.length > 0 && (
                  <div className="noemel-command-menu">
                    {filteredCommands.map((c) => (
                      <div
                        key={c.cmd}
                        className="noemel-command-item"
                        onClick={() => handleSelectCommand(c)}
                      >
                        <div className="noemel-cmd-tag">{c.cmd}</div>
                        <div className="noemel-cmd-info">
                          <strong>{c.label}</strong>
                          <span>{c.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="noemel-composer">
                  <textarea
                    ref={textareaRef}
                    className="noemel-composer-textarea"
                    placeholder={placeholders[placeholderIndex]}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    rows={2}
                    style={{transition: "placeholder 0.5s ease-in-out"}}
                  />
                  <div className="noemel-composer-tools-row">
                    <div className="noemel-composer-tools-left">
                      <button onClick={() => fileInputRef.current?.click()} className="noemel-tool-btn">
                        <ImageIcon /> <span>Image</span>
                      </button>
                      {speechSupported && (
                        <button onClick={toggleMic} className={`noemel-tool-btn ${isRecording ? "recording" : ""}`}>
                          <MicIcon active={isRecording} /> <span>Voice</span>
                        </button>
                      )}
                      <button className="noemel-tool-btn"><DatabaseIcon /> <span>Database</span></button>
                      <button className="noemel-tool-btn"><PlugIcon /> <span>MCP</span></button>
                    </div>
                    <button
                      className={`noemel-composer-send-btn ${!inputValue.trim() && !attachedFileText && !attachedImage ? "disabled" : ""}`}
                      onClick={handleSend}
                      disabled={!inputValue.trim() && !attachedFileText && !attachedImage}
                    >
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>

                {/* Suggestion Chips */}
                <div className="noemel-suggestions">
                  {suggestionChips.map((chip, i) => (
                    <button
                      key={i}
                      className="noemel-suggestion-chip"
                      onClick={() => {
                        setInputValue(chip.label);
                        textareaRef.current?.focus();
                      }}
                    >
                      {chip.icon}
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ---- Chat Conversation State ---- */
            <div className="noemel-chat-container">
              <div className="noemel-messages-area">
                {activeSession.messages.map((msg, idx) => (
                  <div key={idx} className={`noemel-msg ${msg.role}`}>
                    <div className={`noemel-msg-avatar ${msg.role}`}>
                      {msg.role === "user" ? <UserIcon /> : <LeafIcon />}
                    </div>
                    <div className="noemel-msg-body">
                      <div className="noemel-msg-header">
                        <strong>{msg.role === "user" ? "You" : "Noemel"}</strong>
                        {msg.role === "assistant" && msg.content && (
                          <button
                            className={`noemel-tts-btn ${playingMsgIndex === idx ? "playing" : ""}`}
                            onClick={() => handlePlayTTS(msg.content, idx)}
                            title="Səsləndir"
                          >
                            <SpeakerIcon />
                          </button>
                        )}
                      </div>

                      {msg.image && (
                        <div className="noemel-msg-image-wrap">
                          <img src={msg.image} alt="Uploaded / Pasted" className="noemel-msg-image" />
                        </div>
                      )}

                      {msg.role === "assistant" ? (
                        <div className="noemel-msg-rendered">
                          {isStreaming && idx === activeSession.messages.length - 1 ? (
                            <div className="noemel-thinking">
                              <BrainIcon />
                              <span>Thinking...</span>
                              <ChevronRightIcon />
                            </div>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{ 
                                __html: stripCodeBlocksForChat(msg.content).trim()
                                  ? renderMarkdown(stripCodeBlocksForChat(msg.content))
                                  : "<p>✅ Veb sayt hazırlandı. Kodu sağ paneldə görə bilərsiniz.</p>"
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <p className="noemel-msg-text">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}



                <div ref={messagesEndRef} />
              </div>

              {/* Bottom composer in chat mode */}
              <div className="noemel-bottom-composer">
                <div className="noemel-composer-wrapper">
                  {(attachedImage || attachedFileName) && (
                  <div className="noemel-attachment-preview">
                    {attachedImage && (
                      <img src={attachedImage} alt="Attachment" className="noemel-preview-thumb" />
                    )}
                    {attachedFileName && <span className="noemel-file-tag">📄 {attachedFileName}</span>}
                    <button
                      className="noemel-remove-attach"
                      onClick={() => {
                        setAttachedImage(null);
                        setAttachedFileName(null);
                        setAttachedFileText(null);
                      }}
                      title="Sil"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Slash Command Palette Popover */}
                {showCmdMenu && filteredCommands.length > 0 && (
                  <div className="noemel-command-menu">
                    {filteredCommands.map((c) => (
                      <div
                        key={c.cmd}
                        className="noemel-command-item"
                        onClick={() => handleSelectCommand(c)}
                      >
                        <div className="noemel-cmd-tag">{c.cmd}</div>
                        <div className="noemel-cmd-info">
                          <strong>{c.label}</strong>
                          <span>{c.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="noemel-composer">
                  <textarea
                    ref={textareaRef}
                    className="noemel-composer-textarea"
                    placeholder={
                      lang === "az" ? "Tətbiqə dəyişiklik et..." : "Make changes to the app..."
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    rows={1}
                  />
                  <div className="noemel-composer-tools-row">
                    <div className="noemel-composer-tools-left">
                      <button onClick={() => fileInputRef.current?.click()} className="noemel-tool-btn">
                        <ImageIcon /> <span>Image</span>
                      </button>
                      {speechSupported && (
                        <button onClick={toggleMic} className={`noemel-tool-btn ${isRecording ? "recording" : ""}`}>
                          <MicIcon active={isRecording} /> <span>Voice</span>
                        </button>
                      )}
                      <button className="noemel-tool-btn"><DatabaseIcon /> <span>Database</span></button>
                      <button className="noemel-tool-btn"><PlugIcon /> <span>MCP</span></button>
                    </div>
                    {isStreaming ? (
                      <button
                        className="noemel-composer-stop"
                        onClick={handleStopStream}
                        title="Dayandır"
                      >
                        <StopIcon />
                      </button>
                    ) : (
                      <button
                        className={`noemel-composer-send-btn ${!inputValue.trim() && !attachedFileText && !attachedImage ? "disabled" : ""}`}
                        onClick={handleSend}
                        disabled={!inputValue.trim() && !attachedFileText && !attachedImage}
                      >
                        <ArrowUpIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </main>

        {/* Right Panel: Lovable.dev Live App Builder Preview & Code Viewer */}
        {showPreviewPanel && (
          <section className="noemel-right-panel">
            {/* Builder Workspace Top Toolbar */}
            <div className="noemel-builder-toolbar">
              <div className="noemel-workspace-tabs">
                <button
                  className={`noemel-tab-btn ${workspaceTab === "preview" ? "active" : ""}`}
                  onClick={() => setWorkspaceTab("preview")}
                >
                  <EyeIcon />
                  <span>Preview</span>
                </button>
                <button
                  className={`noemel-tab-btn ${workspaceTab === "code" ? "active" : ""}`}
                  onClick={() => setWorkspaceTab("code")}
                >
                  <FileCodeIcon />
                  <span>Code</span>
                </button>
              </div>

              {/* Viewport Resizer Mode Selector */}
              <div className="noemel-viewport-selector">
                <button
                  className={`noemel-viewport-btn ${viewportMode === "desktop" ? "active" : ""}`}
                  onClick={() => setViewportMode("desktop")}
                  title="Masaüstü Rejimi (100%)"
                >
                  <DesktopIcon />
                </button>
                <button
                  className={`noemel-viewport-btn ${viewportMode === "tablet" ? "active" : ""}`}
                  onClick={() => setViewportMode("tablet")}
                  title="Planşet Rejimi (768px)"
                >
                  <TabletIcon />
                </button>
                <button
                  className={`noemel-viewport-btn ${viewportMode === "mobile" ? "active" : ""}`}
                  onClick={() => setViewportMode("mobile")}
                  title="Mobil Rejimi (375px)"
                >
                  <MobileIcon />
                </button>
              </div>

              {/* Actions */}
              <div className="noemel-builder-actions">
                <button
                  className="noemel-tool-action-btn"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  title="Yenilə (Refresh)"
                >
                  <RefreshIcon />
                </button>
                {generatedCode && (
                  <>
                    <button
                      className="noemel-tool-action-btn"
                      onClick={handleOpenNewWindow}
                      title="Yeni Pəncərədə Aç"
                    >
                      <ExternalLinkIcon />
                    </button>
                    <button
                      className="noemel-tool-action-btn primary"
                      onClick={handleDownloadApp}
                      title="İxrac et (.html)"
                    >
                      <DownloadIcon />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Builder Workspace View Area */}
            <div className="noemel-builder-view-area">
              {workspaceTab === "preview" ? (
                <div className={`noemel-viewport-frame ${viewportMode}`}>
                  {generatedCode ? (
                    <iframe
                      key={iframeKey}
                      title="Lovable Live App Preview"
                      srcDoc={generatedCode}
                      className="noemel-builder-iframe"
                      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    />
                  ) : (
                    <div className="noemel-empty-builder-canvas">
                      <SparklesIcon />
                      <h3>{lang === "az" ? "Canlı Veb Tətbiq Qurucusu" : "Live Web App Builder"}</h3>
                      <p>
                        {lang === "az"
                          ? "Sol tərəfdən istədiyiniz saytı təsvir edin. Noemel avtomatik kodu yazacaq və dərhal burada canlı işlək göstərəcək."
                          : "Describe your web app on the left. Noemel will automatically generate code and render a live app here instantly."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="noemel-builder-code-view">
                  {generatedCode ? (
                    <pre className="noemel-code-preview-pre">
                      <code>{generatedCode}</code>
                    </pre>
                  ) : (
                    <div className="noemel-empty-builder-canvas">
                      <FileCodeIcon />
                      <h3>{lang === "az" ? "Kod Hələ Generasiya Olunmayıb" : "No Code Generated Yet"}</h3>
                      <p>{lang === "az" ? "Kodu görmək üçün bir sorğu göndərin." : "Send a prompt to view generated code."}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      ) : (
        <div className="noemel-builder-split" style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
          {activeView === "projects" && <ProjectsView sessions={sessions} onSelectSession={(id) => { setActiveSessionId(id); setActiveView("home"); }} onCreateNew={() => { createNewChat(); setActiveView("home"); }} />}
          {activeView === "agents" && <AgentsView />}
          {activeView === "templates" && <TemplatesView />}
          {activeView === "deployments" && <DeploymentsView />}
          {activeView === "history" && <HistoryView sessions={sessions} onSelectSession={(id) => { setActiveSessionId(id); setActiveView("home"); }} />}
          {activeView === "favorites" && <FavoritesView />}
        </div>
      )}

      {showSearchModal && (
        <div className="noemel-search-modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="noemel-search-modal-content" onClick={(e) => e.stopPropagation()}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={lang === "az" ? "Layihə və ya agent axtar..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <span className="noemel-shortcut-badge">ESC</span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="noemel-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="noemel-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="noemel-settings-header">
              <h3>{lang === "az" ? "Tənzimləmələr" : "Settings"}</h3>
              <button onClick={() => setShowSettingsModal(false)}>&times;</button>
            </div>
            <div className="noemel-settings-body">
              <div className="noemel-settings-group">
                <label>{lang === "az" ? "Hesab Məlumatları" : "Account Info"}</label>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", marginTop: "8px", color: "var(--text)" }}>
                  <div><strong style={{color: "var(--subtext)"}}>Name:</strong> {user?.displayName || "N/A"}</div>
                  <div style={{ marginTop: "6px" }}><strong style={{color: "var(--subtext)"}}>Email:</strong> {user?.email || "N/A"}</div>
                </div>
              </div>
              <div className="noemel-settings-group" style={{ marginTop: "24px" }}>
                <label>{lang === "az" ? "Dil (Language)" : "Language"}</label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as "en" | "az")} 
                  style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text)", outline: "none" }}
                >
                  <option value="az" style={{background: "var(--bg)", color: "var(--text)"}}>Azərbaycan</option>
                  <option value="en" style={{background: "var(--bg)", color: "var(--text)"}}>English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
