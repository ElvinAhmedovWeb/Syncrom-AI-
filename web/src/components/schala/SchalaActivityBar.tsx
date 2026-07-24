export type SchalaView = "explorer" | "git";

interface Props {
  activeView: SchalaView;
  onChangeView: (v: SchalaView) => void;
  onSearchClick: () => void;
  changeCount: number;
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function SchalaActivityBar({ activeView, onChangeView, onSearchClick, changeCount }: Props) {
  return (
    <nav className="schala-activitybar">
      <div className="schala-activitybar-top">
        <button
          type="button"
          className={`schala-activity-btn${activeView === "explorer" ? " active" : ""}`}
          title="Explorer"
          onClick={() => onChangeView("explorer")}
        >
          <Icon path="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </button>
        <button type="button" className="schala-activity-btn" title="Search (Ctrl+P)" onClick={onSearchClick}>
          <Icon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />
        </button>
        <button
          type="button"
          className={`schala-activity-btn${activeView === "git" ? " active" : ""}`}
          title="Source Control"
          onClick={() => onChangeView("git")}
        >
          <Icon path="M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9" />
          {changeCount > 0 && <span className="schala-activity-badge">{changeCount}</span>}
        </button>
        <button type="button" className="schala-activity-btn disabled" title="Run & Debug (tezliklə)" disabled>
          <Icon path="M6 3l14 9-14 9V3z" />
        </button>
        <button type="button" className="schala-activity-btn disabled" title="Extensions (tezliklə)" disabled>
          <Icon path="M12 2l2.5 2.5L12 7 9.5 4.5 12 2zM4.5 9.5L7 12l-2.5 2.5L2 12l2.5-2.5zM19.5 9.5L22 12l-2.5 2.5L17 12l2.5-2.5zM12 17l2.5 2.5L12 22l-2.5-2.5L12 17z" />
        </button>
      </div>
      <div className="schala-activitybar-bottom">
        <button type="button" className="schala-activity-btn disabled" title="Ayarlar (tezliklə)" disabled>
          <Icon path="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </button>
        <button type="button" className="schala-activity-btn disabled" title="Hesab (tezliklə)" disabled>
          <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </button>
      </div>
    </nav>
  );
}
