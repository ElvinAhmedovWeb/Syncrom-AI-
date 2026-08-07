import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { getSchalaAPI } from "../../lib/schala";
import { IconTrash, IconSync } from "./schalaIcons";

// Qeyd: bu, "node-pty" tələb edən əsl PTY DEYİL — sadə spawn+pipe üzərində
// xterm.js render edir. Adi əmrlər (npm, git, node) normal işləyir, amma
// tam-ekranlı interaktiv proqramlar (vim, htop) düzgün render olunmaya bilər.
export default function SchalaTerminal() {
  const api = getSchalaAPI();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!api || !containerRef.current) return;
    const term = new Terminal({
      fontSize: 12,
      fontFamily: "Consolas, 'Cascadia Code', monospace",
      theme: { background: "#000000", foreground: "#f5f5f5", cursor: "#f5f5f5", selectionBackground: "#ffffff33" },
      convertEol: true,
      cursorBlink: true,
    });
    termRef.current = term;
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
        if (term.cols && term.rows) {
          void api.termResize(term.cols, term.rows);
        }
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    const unsubscribe = api.onTermData((data) => term.write(data));
    const dataDisposable = term.onData((data) => void api.termWrite(data));

    if (!startedRef.current) {
      startedRef.current = true;
      void api.termStart(term.cols, term.rows);
    }

    return () => {
      unsubscribe();
      dataDisposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClear() {
    termRef.current?.clear();
  }

  async function handleRestart() {
    if (!api) return;
    await api.termKill();
    startedRef.current = false;
    termRef.current?.reset();
    await api.termStart(termRef.current?.cols, termRef.current?.rows);
    startedRef.current = true;
  }

  return (
    <div className="schala-chat">
      <div className="schala-chat-subnav">
        <div className="schala-chat-subnav-left">
          <span className="schala-chat-subnav-badge">TERMINAL</span>
        </div>
        <div className="schala-chat-subnav-right">
          <button type="button" className="schala-subnav-btn" title="Təmizlə" onClick={handleClear}>
            <IconTrash size={13} />
          </button>
          <button type="button" className="schala-subnav-btn" title="Yenidən başlat" onClick={() => void handleRestart()}>
            <IconSync size={13} />
          </button>
        </div>
      </div>
      <div className="schala-terminal" ref={containerRef} />
    </div>
  );
}
