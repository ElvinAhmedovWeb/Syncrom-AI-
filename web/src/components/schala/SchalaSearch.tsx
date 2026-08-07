import { useState } from "react";
import { getSchalaAPI } from "../../lib/schala";
import SchalaFileIcon from "./SchalaFileIcon";

interface SearchResult {
  path: string;
  line: number;
  match: string;
}

export default function SchalaSearch({ onOpenFile }: { onOpenFile: (path: string, line?: number) => void }) {
  const api = getSchalaAPI();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!api || !query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await api.searchGlobal(query.trim());
      setResults(res);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  return (
    <div className="schala-sidebar-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <form onSubmit={handleSearch} style={{ padding: "10px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Axtarış..."
          style={{
            width: "100%",
            background: "#2d2d2d",
            color: "#ccc",
            border: "1px solid #3d3d3d",
            padding: "4px 8px",
            fontSize: "13px",
            outline: "none"
          }}
        />
      </form>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px 10px", fontSize: "13px", color: "#ccc" }}>
        {searching && <div>Axtarılır...</div>}
        {!searching && hasSearched && results.length === 0 && <div>Nəticə tapılmadı.</div>}
        {!searching && results.map((r, i) => (
          <div
            key={i}
            onClick={() => onOpenFile(r.path, r.line)}
            style={{
              padding: "4px 0",
              cursor: "pointer",
              borderBottom: "1px solid #333",
              wordBreak: "break-all"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e8e8e8" }}>
              <SchalaFileIcon name={r.path.split("/").pop() || ""} size={12} />
              <span>{r.path.split("/").pop()}</span>
              <span style={{ color: "#888", fontSize: "11px" }}>:{r.line}</span>
            </div>
            <div style={{ paddingLeft: "18px", color: "#999", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.match}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
