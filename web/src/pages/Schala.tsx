import { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { DiffEditor } from "@monaco-editor/react";
import SchalaTitleBar from "../components/schala/SchalaTitleBar";
import SchalaActivityBar, { type SchalaView } from "../components/schala/SchalaActivityBar";
import SchalaFileTree from "../components/schala/SchalaFileTree";
import SchalaFileIcon from "../components/schala/SchalaFileIcon";
import SchalaSourceControl from "../components/schala/SchalaSourceControl";
import SchalaWelcome from "../components/schala/SchalaWelcome";
import SchalaChat from "../components/schala/SchalaChat";
import SchalaComposer from "../components/schala/SchalaComposer";
import SchalaTerminal from "../components/schala/SchalaTerminal";
import SchalaStatusBar from "../components/schala/SchalaStatusBar";
import SchalaSearch from "../components/schala/SchalaSearch";
import SchalaDummyPanel from "../components/schala/SchalaDummyPanel";
import { IconUndo, IconFolder, IconFile, IconGitClone } from "../components/schala/schalaIcons";
import { flattenFiles, getSchalaAPI, languageForPath, type SchalaFileNode, type SchalaOpenFolderResult } from "../lib/schala";
import { addRecentProject, loadRecentProjects, type RecentProject } from "../lib/schalaRecent";

interface OpenFile {
  path: string;
  content: string;
  dirty: boolean;
  previousContent?: string;
  isDiff?: boolean;
  originalContent?: string;
}

type RightTab = "chat" | "composer" | "terminal";

export default function SchalaPage() {
  const api = getSchalaAPI();
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [tree, setTree] = useState<SchalaFileNode[]>([]);
  const [gitStatus, setGitStatus] = useState<Record<string, string>>({});
  const [branch, setBranch] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [activityView, setActivityView] = useState<SchalaView>("explorer");
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  const [terminalOpened, setTerminalOpened] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [quickIndex, setQuickIndex] = useState(0);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(() => loadRecentProjects());
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneBusy, setCloneBusy] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

  const activeFile = openFiles.find((f) => f.path === activePath) || null;
  const allFiles = useMemo(() => flattenFiles(tree), [tree]);
  const filteredFiles = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    const list = q ? allFiles.filter((f) => f.path.toLowerCase().includes(q)) : allFiles;
    return list.slice(0, 50);
  }, [allFiles, quickQuery]);

  const openQuickOpen = useCallback(() => {
    setQuickOpen(true);
    setQuickQuery("");
    setQuickIndex(0);
  }, []);

  const refreshGitStatus = useCallback(async () => {
    if (!api) return;
    setGitStatus(await api.gitStatus());
  }, [api]);

  const applyOpenResult = useCallback((result: SchalaOpenFolderResult) => {
    setRootPath(result.rootPath);
    setTree(result.tree);
    setGitStatus(result.gitStatus);
    addRecentProject(result.rootPath);
    setRecentProjects(loadRecentProjects());
    if (result.openedFile) {
      setOpenFiles([{ path: result.openedFile.path, content: result.openedFile.content, dirty: false }]);
      setActivePath(result.openedFile.path);
    } else {
      setOpenFiles([]);
      setActivePath(null);
    }
  }, []);

  const handleOpenFolder = useCallback(async () => {
    if (!api) return;
    const result = await api.openFolder();
    if (!result) return;
    applyOpenResult(result);
    setBranch(await api.gitBranch());
  }, [api, applyOpenResult]);

  const handleOpenRecent = useCallback(
    async (path: string) => {
      if (!api) return;
      const result = await api.openFolderByPath(path);
      if (!result) return;
      applyOpenResult(result);
      setBranch(await api.gitBranch());
    },
    [api, applyOpenResult]
  );

  const handleOpenFileDialog = useCallback(async () => {
    if (!api) return;
    const result = await api.openFile();
    if (!result) return;
    applyOpenResult(result);
    setBranch(await api.gitBranch());
  }, [api, applyOpenResult]);

  const handleNewFile = useCallback(async () => {
    if (!api) return;
    const result = await api.newFile();
    if (!result) return;
    applyOpenResult(result);
    setBranch(await api.gitBranch());
  }, [api, applyOpenResult]);

  const handleCloneRepo = useCallback(async () => {
    if (!api || !cloneUrl.trim()) return;
    setCloneBusy(true);
    setCloneError(null);
    const result = await api.cloneRepo(cloneUrl.trim());
    setCloneBusy(false);
    if (!result) return;
    if (result.error) {
      setCloneError(result.error);
      return;
    }
    applyOpenResult(result);
    setBranch(await api.gitBranch());
    setCloneModalOpen(false);
    setCloneUrl("");
  }, [api, cloneUrl, applyOpenResult]);

  const handleOpenFile = useCallback(
    async (path: string, line?: number, isDiff?: boolean) => {
      if (!api) return;
      if (openFiles.some((f) => f.path === path)) {
        setActivePath(path);
        if (line) setCursor({ line, col: 1 });
        return;
      }
      try {
        const content = await api.readFile(path);
        let originalContent = undefined;
        if (isDiff) {
          originalContent = await api.gitShow(path);
        }
        setOpenFiles((prev) => [...prev, { path, content, dirty: false, isDiff, originalContent }]);
        setActivePath(path);
        if (line) setCursor({ line, col: 1 });
      } catch (e) {
        setErrorMsg(`"${path}" oxuna bilmədi: ${errorText(e)}`);
      }
    },
    [api, openFiles]
  );

  const closeTab = useCallback((path: string) => {
    setOpenFiles((prev) => {
      const remaining = prev.filter((f) => f.path !== path);
      setActivePath((cur) => (cur !== path ? cur : remaining.length ? remaining[remaining.length - 1].path : null));
      return remaining;
    });
  }, []);

  const cycleTab = useCallback(() => {
    setOpenFiles((files) => {
      if (files.length < 2) return files;
      setActivePath((cur) => {
        const idx = files.findIndex((f) => f.path === cur);
        return files[(idx + 1) % files.length].path;
      });
      return files;
    });
  }, []);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (!activePath) return;
      setOpenFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, content: value ?? "", dirty: true } : f)));
    },
    [activePath]
  );

  const handleSave = useCallback(async () => {
    if (!api || !activeFile) return;
    try {
      await api.writeFile(activeFile.path, activeFile.content);
      setOpenFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, dirty: false } : f)));
      void refreshGitStatus();
    } catch (e) {
      setErrorMsg(`"${activeFile.path}" saxlanıla bilmədi: ${errorText(e)}`);
    }
  }, [api, activeFile, refreshGitStatus]);

  const handleApplyEdit = useCallback(
    async (newContent: string) => {
      if (!api || !activePath) return;
      setOpenFiles((prev) =>
        prev.map((f) => (f.path === activePath ? { ...f, previousContent: f.content, content: newContent, dirty: true } : f))
      );
      try {
        await api.writeFile(activePath, newContent);
        setOpenFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, dirty: false } : f)));
        void refreshGitStatus();
      } catch (e) {
        setErrorMsg(`"${activePath}" fayla yazıla bilmədi: ${errorText(e)}`);
      }
    },
    [api, activePath, refreshGitStatus]
  );

  const handleApplyMultiEdit = useCallback(
    async (path: string, newContent: string) => {
      if (!api) return;
      setOpenFiles((prev) => {
        const exists = prev.some((f) => f.path === path);
        if (exists) {
          return prev.map((f) => (f.path === path ? { ...f, previousContent: f.content, content: newContent, dirty: true } : f));
        }
        return [...prev, { path, content: newContent, dirty: true, previousContent: undefined }];
      });
      try {
        await api.writeFile(path, newContent);
        setOpenFiles((prev) => prev.map((f) => (f.path === path ? { ...f, dirty: false } : f)));
        void refreshGitStatus();
      } catch (e) {
        setErrorMsg(`"${path}" fayla yazıla bilmədi: ${errorText(e)}`);
      }
    },
    [api, refreshGitStatus]
  );

  const handleUndo = useCallback(async () => {
    if (!api || !activeFile || activeFile.previousContent === undefined) return;
    const restored = activeFile.previousContent;
    setOpenFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, content: restored, previousContent: undefined, dirty: true } : f)));
    await api.writeFile(activePath!, restored);
    setOpenFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, dirty: false } : f)));
    void refreshGitStatus();
  }, [api, activeFile, activePath, refreshGitStatus]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      } else if (mod && (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "k")) {
        e.preventDefault();
        openQuickOpen();
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activePath) closeTab(activePath);
      } else if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        cycleTab();
      } else if (e.key === "Escape") {
        if (quickOpen) setQuickOpen(false);
        if (cloneModalOpen) setCloneModalOpen(false);
        if (errorMsg) setErrorMsg(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, activePath, closeTab, cycleTab, quickOpen, openQuickOpen, cloneModalOpen, errorMsg]);

  if (!api) {
    return (
      <div className="schala-unavailable">
        <h1>Schala</h1>
        <p>Bu, real fayllarınızı redaktə edən AI kod editorudur — yalnız masaüstü tətbiqində işləyir.</p>
        <code>npm run electron:schala</code>
      </div>
    );
  }

  const changeCount = Object.keys(gitStatus).length;

  return (
    <div className="schala-shell">
      <SchalaTitleBar platform={api.platform} rootPath={rootPath} onOpenSearch={openQuickOpen} onOpenFolder={() => void handleOpenFolder()} />

      {errorMsg && (
        <div className="schala-error-banner">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)}>×</button>
        </div>
      )}

      <div className="schala-body">
        <SchalaActivityBar activeView={activityView} onChangeView={setActivityView} onSearchClick={openQuickOpen} changeCount={changeCount} />

        <aside className="schala-sidebar">
          {rootPath ? (
            <>
              <div className="schala-sidebar-label">
                {activityView === "explorer"
                  ? rootPath.split(/[\\/]/).pop()
                  : activityView === "git"
                  ? "SOURCE CONTROL"
                  : activityView.toUpperCase()}
              </div>
              {activityView === "explorer" ? (
                <SchalaFileTree nodes={tree} activePath={activePath} onOpenFile={(p) => void handleOpenFile(p)} gitStatus={gitStatus} />
              ) : activityView === "git" ? (
                <SchalaSourceControl gitStatus={gitStatus} branch={branch} onOpenFile={(p) => void handleOpenFile(p, undefined, true)} />
              ) : activityView === "search" ? (
                <SchalaSearch onOpenFile={(p, l) => void handleOpenFile(p, l)} />
              ) : (
                <SchalaDummyPanel 
                  title={activityView.charAt(0).toUpperCase() + activityView.slice(1)} 
                  description="Bu bölmə üzərində iş gedir..." 
                />
              )}
            </>
          ) : (
            <div className="schala-nofolder">
              <div className="schala-sidebar-label">EXPLORER</div>
              <p className="schala-nofolder-title">NO FOLDER OPENED</p>
              <p className="schala-nofolder-desc">You have not yet opened a folder.</p>
              <button type="button" className="schala-nofolder-btn" onClick={() => void handleOpenFolder()}>
                <IconFolder size={14} /> Open Folder
              </button>
              <button type="button" className="schala-nofolder-btn" onClick={() => void handleOpenFileDialog()}>
                <IconFile size={14} /> Open File
              </button>
              <button type="button" className="schala-nofolder-btn" onClick={() => setCloneModalOpen(true)}>
                <IconGitClone size={14} /> Clone Repository
              </button>
            </div>
          )}
        </aside>

        <main className="schala-editor-area">
          {openFiles.length > 0 && (
            <div className="schala-tabs">
              {openFiles.map((f) => (
                <div
                  key={f.path}
                  className={`schala-tab${f.path === activePath ? " active" : ""}`}
                  onClick={() => setActivePath(f.path)}
                >
                  <span className="schala-tab-fileicon">
                    <SchalaFileIcon name={f.path.split("/").pop() || f.path} size={14} />
                  </span>
                  <span className="schala-tab-name">{f.path.split("/").pop()}</span>
                  {f.dirty && <span className="schala-tab-dirty">●</span>}
                  <button
                    type="button"
                    className="schala-tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(f.path);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeFile && (
            <div className="schala-breadcrumb">
              {activeFile.path.split("/").map((seg, i, arr) => (
                <span key={i} className="schala-breadcrumb-seg">
                  {seg}
                  {i < arr.length - 1 && <span className="schala-breadcrumb-sep">›</span>}
                </span>
              ))}
              {activeFile.previousContent !== undefined && (
                <button type="button" className="schala-breadcrumb-undo" onClick={() => void handleUndo()}>
                  <IconUndo size={11} /> Geri al
                </button>
              )}
            </div>
          )}

          {activeFile ? (
            activeFile.isDiff && activeFile.originalContent !== undefined ? (
              <DiffEditor
                key={`diff-${activeFile.path}`}
                original={activeFile.originalContent}
                modified={activeFile.content}
                language={languageForPath(activeFile.path)}
                theme="vs-dark"
                options={{ fontSize: 13, automaticLayout: true, readOnly: true }}
              />
            ) : (
              <Editor
                key={activeFile.path}
                path={activeFile.path}
                language={languageForPath(activeFile.path)}
                value={activeFile.content}
                theme="vs-dark"
                onChange={handleEditorChange}
                onMount={(editor) => {
                  editor.onDidChangeCursorPosition((e) => setCursor({ line: e.position.lineNumber, col: e.position.column }));
                }}
                options={{ fontSize: 13, minimap: { enabled: true }, automaticLayout: true }}
              />
            )
          ) : (
            <SchalaWelcome
              onOpenFolder={() => void handleOpenFolder()}
              onOpenFile={() => void handleOpenFileDialog()}
              onNewFile={() => void handleNewFile()}
              onCloneRepo={() => setCloneModalOpen(true)}
              recentProjects={recentProjects}
              onOpenRecent={(p) => void handleOpenRecent(p)}
            />
          )}
        </main>

        <aside className="schala-chat-pane">
          <div className="schala-righttabs">
            <div className="schala-righttabs-left">
              <button type="button" className={rightTab === "chat" ? "active" : ""} onClick={() => setRightTab("chat")}>CHAT</button>
              <button type="button" className={rightTab === "composer" ? "active" : ""} onClick={() => setRightTab("composer")}>COMPOSER</button>
              <button
                type="button"
                className={rightTab === "terminal" ? "active" : ""}
                onClick={() => {
                  setRightTab("terminal");
                  setTerminalOpened(true);
                }}
              >
                TERMINAL
              </button>
            </div>
          </div>
          <div className="schala-rightpanel-body">
            <div style={{ display: rightTab === "chat" ? "flex" : "none", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <SchalaChat activeFile={activeFile} onApplyEdit={(code) => void handleApplyEdit(code)} />
            </div>
            <div style={{ display: rightTab === "composer" ? "flex" : "none", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <SchalaComposer openFiles={openFiles} onApplyMultiEdit={(p, c) => void handleApplyMultiEdit(p, c)} />
            </div>
            {terminalOpened && (
              <div style={{ display: rightTab === "terminal" ? "flex" : "none", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <SchalaTerminal />
              </div>
            )}
          </div>
        </aside>
      </div>

      <SchalaStatusBar branch={branch} changeCount={changeCount} language={activeFile ? languageForPath(activeFile.path) : "—"} cursor={cursor} />

      {quickOpen && (
        <div className="schala-quickopen-overlay" onClick={() => setQuickOpen(false)}>
          <div className="schala-quickopen" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              placeholder="Fayl axtar..."
              value={quickQuery}
              onChange={(e) => {
                setQuickQuery(e.target.value);
                setQuickIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setQuickIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setQuickIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  const f = filteredFiles[quickIndex];
                  if (f) {
                    void handleOpenFile(f.path);
                    setQuickOpen(false);
                  }
                }
              }}
            />
            <div className="schala-quickopen-list">
              {filteredFiles.length === 0 && <div className="schala-quickopen-item">Nəticə yoxdur</div>}
              {filteredFiles.map((f, i) => (
                <div
                  key={f.path}
                  className={`schala-quickopen-item${i === quickIndex ? " selected" : ""}`}
                  onClick={() => {
                    void handleOpenFile(f.path);
                    setQuickOpen(false);
                  }}
                >
                  {f.path}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {cloneModalOpen && (
        <div className="schala-quickopen-overlay" onClick={() => !cloneBusy && setCloneModalOpen(false)}>
          <div className="schala-clonemodal" onClick={(e) => e.stopPropagation()}>
            <div className="schala-clonemodal-title">Clone Repository</div>
            <input
              autoFocus
              placeholder="https://github.com/istifadeci/layihe.git"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCloneRepo();
              }}
            />
            {cloneError && <p className="schala-clonemodal-error">{cloneError}</p>}
            <div className="schala-clonemodal-actions">
              <button type="button" onClick={() => setCloneModalOpen(false)} disabled={cloneBusy}>Ləğv et</button>
              <button type="button" className="primary" onClick={() => void handleCloneRepo()} disabled={cloneBusy || !cloneUrl.trim()}>
                {cloneBusy ? "Klonlanır…" : "Klonla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
