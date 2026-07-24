import ChatShell from "../components/ChatShell";
import { createLocalChatStorage } from "../lib/storage";

const VELLA_CHATS_KEY = "vella_chats";
const VELLA_MODEL_ID = "vella-1.0";

const iconProps = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const SUGGESTIONS = [
  {
    label: "Lead prioritetləşdirmə",
    q: "Potensial müştəriləri necə prioritetləşdirim?",
    icon: <svg {...iconProps}><path d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m6-4.13a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" /></svg>,
  },
  {
    label: "Satış e-poçtu",
    q: "Mənə qısa bir satış e-poçtu şablonu yaz",
    icon: <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
  },
  {
    label: "SWOT analizi",
    q: "Kiçik biznes üçün SWOT analizi necə edilir?",
    icon: <svg {...iconProps}><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-4" /></svg>,
  },
  {
    label: "Müştəri şikayəti",
    q: "B2B müştəri narazılığına necə cavab verim?",
    icon: <svg {...iconProps}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
  },
];

const storage = createLocalChatStorage(VELLA_CHATS_KEY);

export default function VellaPage() {
  return (
    <ChatShell
      theme="vella"
      logoSrc="/vella-logo.png"
      brandName={
        <>
          SYNCROM<span style={{ color: "var(--accent)" }}>VELLA</span>
        </>
      }
      brandSub="B2B CRM & Satış Köməkçisi"
      welcomeTitle={
        <>
          Syncrom <span style={{ color: "var(--accent)" }}>Vella</span>
        </>
      }
      welcomeText="Satış, lead qiymətləndirməsi, korporativ analitika və B2B müştəri xidmətləri üçün köməkçiniz."
      suggestions={SUGGESTIONS}
      fixedModelId={VELLA_MODEL_ID}
      storage={storage}
      inputPlaceholder="Vella-ya yaz..."
      hint="Syncrom Vella — B2B CRM modeli"
      linkTo={{ href: "/chat", label: "Bütün modellər →" }}
    />
  );
}
