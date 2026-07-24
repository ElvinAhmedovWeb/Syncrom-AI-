import type { ReactNode } from "react";

interface Props {
  onMenuClick: () => void;
  busy: boolean;
  statusText: string;
  actions?: ReactNode;
  linkTo?: { href: string; label: string };
}

export default function Topbar({ onMenuClick, busy, statusText, actions, linkTo }: Props) {
  return (
    <header className="topbar">
      <button type="button" className="menu-btn" title="Menyu" onClick={onMenuClick}>
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="topbar-title">
        <span className={`status-dot${busy ? " busy" : ""}`} />
        <span>{statusText}</span>
      </div>
      <div className="topbar-actions">{actions}</div>
      {linkTo && (
        <a className="link-btn" href={linkTo.href}>
          {linkTo.label}
        </a>
      )}
    </header>
  );
}
