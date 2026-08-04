import { useI18n } from "../lib/i18n";
import type { Chat } from "../types";

interface ViewProps {
  sessions: Chat[];
  onSelectSession: (id: string) => void;
  onCreateNew: () => void;
}

export function ProjectsView({ sessions, onSelectSession, onCreateNew }: ViewProps) {
  const { lang } = useI18n();

  return (
    <div className="noemel-view-container">
      <div className="noemel-view-header">
        <div>
          <h2 className="noemel-view-title">{lang === "az" ? "Layihələr" : "Projects"}</h2>
          <p className="noemel-view-subtitle">{lang === "az" ? "Bütün yaratdığınız veb tətbiqlər buradadır." : "All your generated web applications are here."}</p>
        </div>
        <button className="noemel-view-btn primary" onClick={onCreateNew}>{lang === "az" ? "+ Yeni Layihə" : "+ New Project"}</button>
      </div>
      
      <div className="noemel-grid projects-grid">
        {sessions.length === 0 && (
          <div style={{color: 'var(--subtext)'}}>
            {lang === "az" ? "Hələ layihə yoxdur." : "No projects yet."}
          </div>
        )}
        {sessions.map(s => (
          <div key={s.id} className="noemel-card" onClick={() => onSelectSession(s.id!)} style={{cursor: 'pointer'}}>
            <div className="noemel-card-thumb bw-thumb">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3}}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            </div>
            <div className="noemel-card-content">
              <h4>{s.title || "Adsız Layihə"}</h4>
              <p>ID: {s.id?.slice(0,8)}</p>
              <div className="noemel-card-footer">
                <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                <button className="noemel-card-action" onClick={(e) => { e.stopPropagation(); onSelectSession(s.id!); }}>{lang === "az" ? "Aç" : "Open"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentsView() {
  const { lang } = useI18n();
  const agents = [
    { id: 1, name: "UI/UX Designer", desc: lang === "az" ? "Mükəmməl və müasir istifadəçi interfeysləri yaradır." : "Creates perfect and modern user interfaces." },
    { id: 2, name: "Frontend Expert", desc: lang === "az" ? "React, Vue və performans optimizasiyası üzrə mütəxəssis." : "Expert in React, Vue and performance optimization." },
    { id: 3, name: "Backend Architect", desc: lang === "az" ? "Təhlükəsiz və miqyaslana bilən API-lər dizayn edir." : "Designs secure and scalable APIs." },
    { id: 4, name: "Copywriter AI", desc: lang === "az" ? "Saytınız üçün cəlbedici və satışyönümlü mətnlər yazır." : "Writes engaging and sales-driven copy for your site." },
  ];

  return (
    <div className="noemel-view-container">
      <div className="noemel-view-header">
        <div>
          <h2 className="noemel-view-title">{lang === "az" ? "Süni İntellekt Agentləri" : "AI Agents"}</h2>
          <p className="noemel-view-subtitle">{lang === "az" ? "İxtisaslaşmış agentlərlə işinizi sürətləndirin." : "Accelerate your workflow with specialized agents."}</p>
        </div>
      </div>
      
      <div className="noemel-grid agents-grid">
        {agents.map(a => (
          <div key={a.id} className="noemel-agent-card">
            <div className="noemel-agent-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
            </div>
            <div className="noemel-agent-info">
              <h4>{a.name}</h4>
              <p>{a.desc}</p>
            </div>
            <button className="noemel-view-btn outline">{lang === "az" ? "Söhbətə Başla" : "Start Chat"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplatesView() {
  const { lang } = useI18n();
  const templates = [
    { id: 1, name: "SaaS Dashboard Pro", category: "Dashboard", price: "Free" },
    { id: 2, name: "Minimal Portfolio", category: "Portfolio", price: "Free" },
    { id: 3, name: "Startup Landing", category: "Landing Page", price: "Free" },
    { id: 4, name: "E-Commerce Modern", category: "Store", price: "Premium" },
    { id: 5, name: "Blog / Magazine", category: "Blog", price: "Free" },
    { id: 6, name: "Admin Panel UI", category: "Dashboard", price: "Premium" },
  ];

  return (
    <div className="noemel-view-container">
      <div className="noemel-view-header">
        <div>
          <h2 className="noemel-view-title">{lang === "az" ? "Şablonlar" : "Templates"}</h2>
          <p className="noemel-view-subtitle">{lang === "az" ? "Hazır layihə şablonları ilə dərhal başlayın." : "Start instantly with ready-made project templates."}</p>
        </div>
        <div className="noemel-search-bar-inline">
          <input type="text" placeholder={lang === "az" ? "Şablon axtar..." : "Search templates..."} />
        </div>
      </div>
      
      <div className="noemel-grid templates-grid">
        {templates.map(t => (
          <div key={t.id} className="noemel-card template">
            <div className="noemel-card-thumb bw-thumb">
              <span className={`noemel-badge ${t.price === "Premium" ? "premium" : "free"}`}>{t.price}</span>
            </div>
            <div className="noemel-card-content">
              <h4>{t.name}</h4>
              <p>{t.category}</p>
              <button className="noemel-view-btn secondary" style={{width: '100%', marginTop: '16px'}}>
                {lang === "az" ? "İstifadə Et" : "Use Template"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeploymentsView() {
  const { lang } = useI18n();
  const deployments = [
    { id: 1, project: "SaaS Landing Page", url: "saas-landing-v1.vercel.app", status: "Live", date: "2026-08-03" },
    { id: 2, project: "Admin Dashboard", url: "admin-dash-prod.vercel.app", status: "Building", date: "2026-08-03" },
    { id: 3, project: "Portfolio Website", url: "my-portfolio.netlify.app", status: "Live", date: "2026-07-28" },
    { id: 4, project: "E-Commerce Store", url: "ecommerce-test.vercel.app", status: "Failed", date: "2026-07-25" },
  ];

  return (
    <div className="noemel-view-container">
      <div className="noemel-view-header">
        <div>
          <h2 className="noemel-view-title">{lang === "az" ? "Yerləşdirmələr" : "Deployments"}</h2>
          <p className="noemel-view-subtitle">{lang === "az" ? "Canlı layihələrinizin statusu və server bağlantıları." : "Status and server links for your live projects."}</p>
        </div>
      </div>
      
      <div className="noemel-table-container">
        <table className="noemel-table">
          <thead>
            <tr>
              <th>{lang === "az" ? "Layihə" : "Project"}</th>
              <th>{lang === "az" ? "Domen (URL)" : "Domain (URL)"}</th>
              <th>Status</th>
              <th>{lang === "az" ? "Tarix" : "Date"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deployments.map(d => (
              <tr key={d.id}>
                <td><strong>{d.project}</strong></td>
                <td><a href={`https://${d.url}`} target="_blank" className="noemel-link">{d.url}</a></td>
                <td>
                  <span className={`noemel-status-badge ${d.status.toLowerCase()}`}>
                    {d.status === "Live" && "[ LIVE ]"}
                    {d.status === "Building" && "[ BUILDING ]"}
                    {d.status === "Failed" && "[ FAILED ]"}
                  </span>
                </td>
                <td style={{color: "var(--subtext)"}}>{d.date}</td>
                <td><button className="noemel-icon-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HistoryView({ sessions, onSelectSession }: { sessions: Chat[], onSelectSession: (id: string) => void }) {
  const { lang } = useI18n();

  return (
    <div className="noemel-view-container">
      <div className="noemel-view-header">
        <div>
          <h2 className="noemel-view-title">{lang === "az" ? "Söhbət Tarixçəsi" : "Chat History"}</h2>
          <p className="noemel-view-subtitle">{lang === "az" ? "Əvvəlki müzakirələr və kod generasiyaları." : "Previous discussions and code generations."}</p>
        </div>
      </div>
      
      <div className="noemel-history-list">
        {sessions.length === 0 && (
          <div style={{color: 'var(--subtext)'}}>
            {lang === "az" ? "Söhbət tarixçəsi boşdur." : "Chat history is empty."}
          </div>
        )}
        {sessions.map(s => (
          <div key={s.id} className="noemel-history-item" onClick={() => onSelectSession(s.id!)}>
            <div className="noemel-history-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="noemel-history-content">
              <h4>{s.title || "Adsız Söhbət"}</h4>
              <span>{new Date(s.updatedAt).toLocaleString()} • {s.messages.length} mesaj</span>
            </div>
            <button className="noemel-view-btn outline small" onClick={(e) => { e.stopPropagation(); onSelectSession(s.id!); }}>{lang === "az" ? "Bax" : "View"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoritesView() {
  const { lang } = useI18n();
  
  return (
    <div className="noemel-view-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7}}>
      <div style={{marginBottom: '16px'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      </div>
      <h2 style={{fontSize: '24px', color: 'var(--text)', marginBottom: '8px'}}>
        {lang === "az" ? "Sevimlilər Boşdur" : "Favorites is Empty"}
      </h2>
      <p style={{color: 'var(--subtext)'}}>
        {lang === "az" ? "Layihələri və ya şablonları sevimlilərə əlavə edərək burada tapa bilərsiniz." : "Add projects or templates to favorites to see them here."}
      </p>
    </div>
  );
}
