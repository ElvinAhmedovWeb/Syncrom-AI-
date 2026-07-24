import { IconBranch, IconSync } from "./schalaIcons";

interface Props {
  branch: string | null;
  changeCount: number;
  language: string;
  cursor: { line: number; col: number };
}

export default function SchalaStatusBar({ branch, changeCount, language, cursor }: Props) {
  return (
    <footer className="schala-statusbar">
      <div className="schala-statusbar-left">
        {branch && (
          <span className="schala-status-item">
            <IconBranch size={12} />
            {branch}
          </span>
        )}
        {changeCount > 0 && (
          <span className="schala-status-item">
            <IconSync size={11} /> {changeCount}
          </span>
        )}
      </div>
      <div className="schala-statusbar-right">
        <span className="schala-status-item">Ln {cursor.line}, Col {cursor.col}</span>
        <span className="schala-status-item">Spaces: 2</span>
        <span className="schala-status-item">UTF-8</span>
        <span className="schala-status-item">LF</span>
        <span className="schala-status-item">{language}</span>
      </div>
    </footer>
  );
}
