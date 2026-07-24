import { IconBranch } from "./schalaIcons";

interface Props {
  gitStatus: Record<string, string>;
  branch: string | null;
  onOpenFile: (path: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  modified: "Dəyişib",
  untracked: "İzlənmir",
  deleted: "Silinib",
};

export default function SchalaSourceControl({ gitStatus, branch, onOpenFile }: Props) {
  const entries = Object.entries(gitStatus);

  return (
    <div className="schala-sourcecontrol">
      <div className="schala-sc-branch">
        <span className="schala-sc-branch-icon"><IconBranch size={12} /></span>
        {branch || "git repo tapılmadı"}
      </div>
      {entries.length === 0 ? (
        <div className="schala-tree-empty">Dəyişiklik yoxdur</div>
      ) : (
        entries.map(([filePath, status]) => (
          <div key={filePath} className="schala-sc-row" onClick={() => onOpenFile(filePath)}>
            <span className={`schala-git-dot ${status}`} />
            <span className="schala-sc-path" title={filePath}>{filePath}</span>
            <span className="schala-sc-status">{STATUS_LABEL[status] || status}</span>
          </div>
        ))
      )}
    </div>
  );
}
