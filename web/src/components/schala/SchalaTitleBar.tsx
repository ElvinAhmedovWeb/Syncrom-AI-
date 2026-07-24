import { useEffect, useState } from "react";
import { getSchalaAPI } from "../../lib/schala";

interface Props {
  platform: string;
  rootPath: string | null;
  onOpenSearch: () => void;
  onOpenFolder: () => void;
}

export default function SchalaTitleBar({ platform, rootPath, onOpenSearch, onOpenFolder }: Props) {
  const isMac = platform === "darwin";
  const api = getSchalaAPI();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!api || isMac) return;
    void api.winIsMaximized().then(setMaximized);
    return api.onWinMaximizedChange(setMaximized);
  }, [api, isMac]);

  return (
    <header className={`schala-titlebar${isMac ? " mac" : " win"}`}>
      <div className="schala-titlebar-left">
        <img className="schala-brand-mark" src="/Schala%20logo.png" alt="Schala" />
        <span className="schala-brand">Schala</span>
        <button type="button" className="schala-nav-btn" disabled title="Geri">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button type="button" className="schala-nav-btn" disabled title="İrəli">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <button type="button" className="schala-titlebar-search" onClick={onOpenSearch}>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>{rootPath ? "Search in project" : "Qovluq aç..."}</span>
        <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <div className="schala-titlebar-right">
        <button type="button" className="schala-titlebar-icon" title="Qovluq aç" onClick={onOpenFolder}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
        </button>
        <button type="button" className="schala-titlebar-icon disabled" title="Ayarlar (tezliklə)" disabled>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {!isMac && (
          <div className="schala-winctrls">
            <button type="button" title="Kiçilt" onClick={() => void api?.winMinimize()}>
              <svg viewBox="0 0 12 12" width="11" height="11"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" /></svg>
            </button>
            <button type="button" title={maximized ? "Bərpa et" : "Böyüt"} onClick={() => void api?.winMaximize()}>
              {maximized ? (
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.1"><rect x="2.5" y="1" width="7" height="7" /><rect x="1" y="3.5" width="7" height="7" fill="var(--bg)" /></svg>
              ) : (
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="1.5" width="9" height="9" /></svg>
              )}
            </button>
            <button type="button" className="close" title="Bağla" onClick={() => void api?.winClose()}>
              <svg viewBox="0 0 12 12" width="11" height="11" stroke="currentColor" strokeWidth="1.2"><line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" /></svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
