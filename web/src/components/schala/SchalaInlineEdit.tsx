import { useState, useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

export default function SchalaInlineEdit({ onClose, onSubmit, loading }: Props) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: "absolute",
      top: "10%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "400px",
      background: "#252526",
      border: "1px solid #454545",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      borderRadius: "6px",
      padding: "10px",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }}>
      <div style={{ fontSize: "12px", color: "#ccc", display: "flex", justifyContent: "space-between" }}>
        <span>✨ Seçilmiş kodu AI ilə dəyiş (Ctrl+K)</span>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>×</button>
      </div>
      <input
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            e.preventDefault();
            onSubmit(prompt);
          }
        }}
        disabled={loading}
        placeholder="Məs: Kodu refaktor et, xətanı tap..."
        style={{ width: "100%", padding: "8px", background: "#1e1e1e", color: "#fff", border: "1px solid #3c3c3c", outline: "none" }}
      />
      {loading && <div style={{ fontSize: "11px", color: "#0e639c" }}>AI düşünür...</div>}
    </div>
  );
}
