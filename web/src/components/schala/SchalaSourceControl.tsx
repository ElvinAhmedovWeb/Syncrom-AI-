import { useState } from "react";
import { IconBranch } from "./schalaIcons";
import { getSchalaAPI } from "../../lib/schala";

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
  const [commitMsg, setCommitMsg] = useState("");
  const [generating, setGenerating] = useState(false);
  const api = getSchalaAPI();

  async function handleGenerate() {
    if (!api) return;
    setGenerating(true);
    try {
      const diff = await api.gitDiff();
      if (!diff.trim()) {
        setCommitMsg("Dəyişiklik yoxdur.");
        setGenerating(false);
        return;
      }
      const prompt = `Aşağıdakı git diff-ə əsasən qısa, aydın və peşəkar bir commit mesajı yaz. Yalnız commit mesajını qaytar.\n\nDiff:\n${diff}`;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          system: "Sən peşəkar proqramçısan. Yalnız 1 cümləlik commit mesajı yaz, əlavə izah vermə.",
          model: "llama-3.3-70b-versatile",
          temperature: 0.3
        })
      });
      const data = await res.json();
      setCommitMsg(data.message?.trim() || "Mesaj yaradıla bilmədi");
    } catch {
      setCommitMsg("Xəta baş verdi");
    }
    setGenerating(false);
  }

  return (
    <div className="schala-sourcecontrol">
      <div className="schala-sc-branch">
        <span className="schala-sc-branch-icon"><IconBranch size={12} /></span>
        {branch || "git repo tapılmadı"}
      </div>
      
      {entries.length > 0 && (
        <div style={{ padding: "10px", borderBottom: "1px solid #333" }}>
          <textarea
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit mesajı..."
            style={{ width: "100%", height: "60px", background: "#252526", color: "#ccc", border: "1px solid #3c3c3c", padding: "5px", fontSize: "12px", outline: "none", resize: "vertical" }}
          />
          <button 
            type="button" 
            onClick={() => void handleGenerate()}
            disabled={generating}
            style={{ width: "100%", marginTop: "5px", background: "#0e639c", color: "#fff", border: "none", padding: "4px", fontSize: "12px", cursor: "pointer" }}
          >
            {generating ? "Yaradılır..." : "✨ AI ilə Mesaj Yarat"}
          </button>
        </div>
      )}

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
