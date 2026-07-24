export interface SchalaFileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: SchalaFileNode[];
}

export interface SchalaOpenFolderResult {
  rootPath: string;
  tree: SchalaFileNode[];
  gitStatus: Record<string, string>;
  openedFile?: { path: string; content: string };
}

export interface SchalaCloneResult extends SchalaOpenFolderResult {
  error?: string;
}

export interface SchalaAPI {
  platform: "darwin" | "win32" | "linux" | string;

  openFolder: () => Promise<SchalaOpenFolderResult | null>;
  openFolderByPath: (dirPath: string) => Promise<SchalaOpenFolderResult | null>;
  openFile: () => Promise<SchalaOpenFolderResult | null>;
  newFile: () => Promise<SchalaOpenFolderResult | null>;
  cloneRepo: (url: string) => Promise<SchalaCloneResult | null>;
  readFile: (relPath: string) => Promise<string>;
  writeFile: (relPath: string, content: string) => Promise<boolean>;
  gitStatus: () => Promise<Record<string, string>>;
  gitBranch: () => Promise<string | null>;

  winMinimize: () => Promise<void>;
  winMaximize: () => Promise<void>;
  winClose: () => Promise<void>;
  winIsMaximized: () => Promise<boolean>;
  onWinMaximizedChange: (cb: (isMaximized: boolean) => void) => () => void;

  termStart: () => Promise<boolean>;
  termWrite: (data: string) => Promise<void>;
  termKill: () => Promise<void>;
  onTermData: (cb: (data: string) => void) => () => void;
}

declare global {
  interface Window {
    schalaAPI?: SchalaAPI;
  }
}

export function getSchalaAPI(): SchalaAPI | null {
  return typeof window !== "undefined" && window.schalaAPI ? window.schalaAPI : null;
}

export function flattenFiles(nodes: SchalaFileNode[]): SchalaFileNode[] {
  const out: SchalaFileNode[] = [];
  for (const n of nodes) {
    if (n.type === "file") out.push(n);
    else if (n.children) out.push(...flattenFiles(n.children));
  }
  return out;
}

const EXT_LANG: Record<string, string> = {
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python", java: "java", c: "c", cpp: "cpp", cs: "csharp", go: "go", rs: "rust",
  json: "json", css: "css", scss: "scss", html: "html", md: "markdown",
  sql: "sql", yml: "yaml", yaml: "yaml", sh: "shell", php: "php",
};

export function languageForPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return EXT_LANG[ext] || "plaintext";
}

// Fayl növünə görə kiçik rəngli hərf-nişan (real ikon paketi əvəzinə, öz
// minimal, orijinal sistemimiz).
const FILE_BADGE: Record<string, { label: string; color: string }> = {
  ts: { label: "TS", color: "#3178c6" },
  tsx: { label: "TSX", color: "#3178c6" },
  js: { label: "JS", color: "#f0db4f" },
  jsx: { label: "JSX", color: "#f0db4f" },
  mjs: { label: "JS", color: "#f0db4f" },
  cjs: { label: "JS", color: "#f0db4f" },
  json: { label: "{}", color: "#e8a33d" },
  css: { label: "#", color: "#a855f7" },
  scss: { label: "#", color: "#a855f7" },
  html: { label: "<>", color: "#e34c26" },
  md: { label: "M↓", color: "#8b949e" },
  py: { label: "PY", color: "#3572A5" },
  java: { label: "JV", color: "#b07219" },
  go: { label: "GO", color: "#00ADD8" },
  rs: { label: "RS", color: "#dea584" },
  sql: { label: "DB", color: "#e38c00" },
  yml: { label: "YML", color: "#8b949e" },
  yaml: { label: "YML", color: "#8b949e" },
  sh: { label: ">_", color: "#89e051" },
};

export function fileBadge(name: string): { label: string; color: string } {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return FILE_BADGE[ext] || { label: "•", color: "#8b949e" };
}
