import { IconFolder, IconFile, IconGitClone, IconNewFile } from "./schalaIcons";
import type { RecentProject } from "../../lib/schalaRecent";

interface Props {
  onOpenFolder: () => void;
  onOpenFile: () => void;
  onNewFile: () => void;
  onCloneRepo: () => void;
  recentProjects: RecentProject[];
  onOpenRecent: (path: string) => void;
}

const CARDS = [
  { Icon: IconFolder, label: "Open Folder", desc: "Open a local folder in Schala", action: "folder" as const },
  { Icon: IconFile, label: "Open File", desc: "Open a file directly in the editor", action: "file" as const },
  { Icon: IconGitClone, label: "Clone Repository", desc: "Clone a remote repository", action: "clone" as const },
  { Icon: IconNewFile, label: "New File", desc: "Create a new file in the workspace", action: "new" as const },
];

export default function SchalaWelcome({ onOpenFolder, onOpenFile, onNewFile, onCloneRepo, recentProjects, onOpenRecent }: Props) {
  function handleCard(action: (typeof CARDS)[number]["action"]) {
    if (action === "folder") onOpenFolder();
    else if (action === "file") onOpenFile();
    else if (action === "new") onNewFile();
    else if (action === "clone") onCloneRepo();
  }

  return (
    <div className="schala-welcome-main">
      <img className="schala-welcome-main-logo" src="/Schala%20logo.png" alt="Schala" />
      <h1>Welcome to Schala</h1>
      <p className="schala-welcome-main-sub">Your AI pair programmer.</p>

      <div className="schala-welcome-cards">
        {CARDS.map(({ Icon, label, desc, action }) => (
          <button key={label} type="button" className="schala-welcome-card" onClick={() => handleCard(action)}>
            <span className="schala-welcome-card-icon"><Icon /></span>
            <span className="schala-welcome-card-label">{label}</span>
            <span className="schala-welcome-card-desc">{desc}</span>
          </button>
        ))}
      </div>

      <div className="schala-welcome-recent">
        <div className="schala-welcome-recent-label">Recent Projects</div>
        {recentProjects.length === 0 ? (
          <div className="schala-welcome-recent-row empty">
            <span className="schala-welcome-recent-icon"><IconFolder size={16} /></span>
            <span>
              <b>No recent projects</b>
              <small>Open a folder to start coding</small>
            </span>
          </div>
        ) : (
          recentProjects.map((p) => (
            <button key={p.path} type="button" className="schala-welcome-recent-row" onClick={() => onOpenRecent(p.path)}>
              <span className="schala-welcome-recent-icon"><IconFolder size={16} /></span>
              <span>
                <b>{p.name}</b>
                <small>{p.path}</small>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
