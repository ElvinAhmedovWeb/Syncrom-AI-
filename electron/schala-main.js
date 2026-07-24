const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { execFile, spawn } = require("child_process");

// Eyni server.js-i çağırırıq, sadəcə fərqli marşrutu ("/schala") açırıq.
const { server, PORT } = require("../server.js");

let mainWindow = null;
// İstifadəçinin "Qovluq aç"la seçdiyi kök qovluq — bütün fayl IPC-ləri
// buna SKOPLANIR, renderer/AI heç vaxt bundan kənara çıxa bilmir.
let rootDir = null;

const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".cache", "__pycache__", ".venv", "venv"]);
// Çox böyük layihələrdə (min-larla fayl) IPC-nin bütün ağacı birdəfəyə
// göndərməsi UI-ı yavaşlada bilər — ümumi node sayını məhdudlaşdırırıq.
const MAX_TREE_NODES = 3000;
let treeNodeCount = 0;

function readTree(dir, base, depth) {
  if (depth === 0) treeNodeCount = 0;
  if (depth > 6 || treeNodeCount >= MAX_TREE_NODES) return [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const nodes = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (treeNodeCount >= MAX_TREE_NODES) break;
    // Nöqtə ilə başlayan fayl/qovluqlar (.env, .git, .npmrc və s.) ağacda
    // göstərilmir — bu, gizlətmə rahatlığından çox, sirlərin (API açarları)
    // yanlışlıqla AI-a (üçüncü tərəf LLM sorğusuna) göndərilməsinin qarşısını
    // alan qəsdən qoyulmuş təhlükəsizlik defolt-udur.
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      treeNodeCount++;
      nodes.push({
        name: entry.name,
        path: path.relative(base, full).split(path.sep).join("/"),
        type: "dir",
        children: readTree(full, base, depth + 1),
      });
    } else {
      treeNodeCount++;
      nodes.push({
        name: entry.name,
        path: path.relative(base, path.join(dir, entry.name)).split(path.sep).join("/"),
        type: "file",
      });
    }
  }
  return nodes;
}

// relPath-i MƏCBURİ rootDir daxilinə skoplayır — "../../.env" kimi yollarla
// kənara çıxmaq mümkün olmasın (path-traversal qorunması).
function safeResolve(relPath) {
  if (!rootDir) throw new Error("Əvvəlcə qovluq aç");
  const normalizedRoot = path.resolve(rootDir);
  const resolved = path.resolve(normalizedRoot, String(relPath || ""));
  if (resolved !== normalizedRoot && !resolved.startsWith(normalizedRoot + path.sep)) {
    throw new Error("İcazəsiz fayl yolu");
  }
  return resolved;
}

// "git status --porcelain" ilə dəyişmiş/izlənməyən faylları tapır — git
// quraşdırılmayıbsa və ya qovluq repo deyilsə sükutla boş obyekt qaytarır.
function gitStatus() {
  return new Promise((resolve) => {
    if (!rootDir) return resolve({});
    execFile("git", ["status", "--porcelain"], { cwd: rootDir, timeout: 5000, windowsHide: true }, (err, stdout) => {
      if (err) return resolve({});
      const map = {};
      for (const line of stdout.split("\n")) {
        if (!line.trim()) continue;
        const code = line.slice(0, 2).trim();
        const filePath = line.slice(3).trim();
        if (!filePath) continue;
        const normalized = filePath.split(/[\\/]/).join("/");
        if (code === "??") map[normalized] = "untracked";
        else if (code.includes("D")) map[normalized] = "deleted";
        else map[normalized] = "modified";
      }
      resolve(map);
    });
  });
}

ipcMain.handle("schala:openFolder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"] });
  if (result.canceled || !result.filePaths[0]) return null;
  rootDir = result.filePaths[0];
  return { rootPath: rootDir, tree: readTree(rootDir, rootDir, 0), gitStatus: await gitStatus() };
});

// "Recent Projects" siyahısından bilinən bir yolu OS seçici olmadan yenidən açır.
ipcMain.handle("schala:openFolderByPath", async (_event, dirPath) => {
  if (!dirPath || !fs.existsSync(dirPath)) return null;
  rootDir = dirPath;
  return { rootPath: rootDir, tree: readTree(rootDir, rootDir, 0), gitStatus: await gitStatus() };
});

// Tək fayl aç — qovluq seçilməyib, ona görə rootDir həmin faylın valideyn
// qovluğuna qoyulur (bütün mövcud IPC-lər dəyişmədən işləməyə davam edir).
ipcMain.handle("schala:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openFile"] });
  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  rootDir = path.dirname(filePath);
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {}
  return {
    rootPath: rootDir,
    tree: readTree(rootDir, rootDir, 0),
    gitStatus: await gitStatus(),
    openedFile: { path: path.basename(filePath), content },
  };
});

ipcMain.handle("schala:newFile", async () => {
  const result = await dialog.showSaveDialog(mainWindow, { defaultPath: "untitled.txt" });
  if (result.canceled || !result.filePath) return null;
  // Save dialoqu MÖVCUD faylı seçməyə də icazə verir — belə olsa onu boşaltmaq
  // (silmək) əvəzinə sadəcə OLDUĞU KİMİ açırıq ki, istifadəçi məlumat itirməsin.
  const alreadyExists = fs.existsSync(result.filePath);
  let content = "";
  if (alreadyExists) {
    try {
      content = fs.readFileSync(result.filePath, "utf8");
    } catch {}
  } else {
    fs.writeFileSync(result.filePath, "", "utf8");
  }
  rootDir = path.dirname(result.filePath);
  return {
    rootPath: rootDir,
    tree: readTree(rootDir, rootDir, 0),
    gitStatus: await gitStatus(),
    openedFile: { path: path.basename(result.filePath), content },
  };
});

// git clone — url execFile-a arqument kimi ötürülür (shell YOXDUR), ona görə
// istifadəçi girişində shell-injection riski yoxdur.
ipcMain.handle("schala:cloneRepo", async (_event, url) => {
  if (!url || typeof url !== "string") return { error: "Repo URL-i boş ola bilməz." };
  const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"], title: "Klon üçün qovluq seç" });
  if (result.canceled || !result.filePaths[0]) return null;
  const destParent = result.filePaths[0];
  const repoName = (url.trim().split(/[\\/]/).pop() || "repo").replace(/\.git$/i, "") || "repo";
  const destPath = path.join(destParent, repoName);
  return new Promise((resolve) => {
    execFile("git", ["clone", url.trim(), destPath], { timeout: 120000, windowsHide: true }, async (err, _stdout, stderr) => {
      if (err) {
        resolve({ error: (stderr || err.message || "Klonlama uğursuz oldu").slice(0, 500) });
        return;
      }
      rootDir = destPath;
      resolve({ rootPath: rootDir, tree: readTree(rootDir, rootDir, 0), gitStatus: await gitStatus() });
    });
  });
});

ipcMain.handle("schala:gitStatus", async () => gitStatus());

function gitBranch() {
  return new Promise((resolve) => {
    if (!rootDir) return resolve(null);
    execFile("git", ["branch", "--show-current"], { cwd: rootDir, timeout: 5000, windowsHide: true }, (err, stdout) => {
      resolve(err ? null : stdout.trim() || null);
    });
  });
}

ipcMain.handle("schala:gitBranch", async () => gitBranch());

// ---------- Pəncərə idarəetməsi (Windows-un xüsusi başlıq zolağı üçün) ----------
ipcMain.handle("schala:winMinimize", () => mainWindow?.minimize());
ipcMain.handle("schala:winMaximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle("schala:winClose", () => mainWindow?.close());
ipcMain.handle("schala:winIsMaximized", () => !!mainWindow?.isMaximized());

// ---------- Terminal (sadələşdirilmiş: əsl PTY deyil, sadə spawn+pipe) ----------
// Qeyd: node-pty tələb etmir (native-build riski/paketləmə mürəkkəbliyi
// olduğu üçün qəsdən saxlanılmayıb) — ona görə tam ekranlı interaktiv TUI
// proqramlar (vim, htop) düzgün işləməyə bilər, amma adi əmrlər (npm, git,
// node) normal işləyir.
let termProcess = null;

ipcMain.handle("schala:termStart", () => {
  if (termProcess) return true;
  if (!rootDir) return false;
  const shellCmd = process.platform === "win32" ? process.env.COMSPEC || "cmd.exe" : process.env.SHELL || "/bin/bash";
  termProcess = spawn(shellCmd, [], { cwd: rootDir, env: process.env, windowsHide: true });
  termProcess.stdout.on("data", (chunk) => mainWindow?.webContents.send("schala:termData", chunk.toString()));
  termProcess.stderr.on("data", (chunk) => mainWindow?.webContents.send("schala:termData", chunk.toString()));
  termProcess.on("exit", () => {
    mainWindow?.webContents.send("schala:termData", "\r\n[proses bitdi]\r\n");
    termProcess = null;
  });
  return true;
});

ipcMain.handle("schala:termWrite", (_event, data) => {
  termProcess?.stdin.write(data);
});

ipcMain.handle("schala:termKill", () => {
  termProcess?.kill();
  termProcess = null;
});

ipcMain.handle("schala:readFile", async (_event, relPath) => {
  const full = safeResolve(relPath);
  const stat = fs.statSync(full);
  if (!stat.isFile()) throw new Error("Bu bir fayl deyil");
  if (stat.size > 2 * 1024 * 1024) throw new Error("Fayl çox böyükdür (2MB limiti)");
  return fs.readFileSync(full, "utf8");
});

ipcMain.handle("schala:writeFile", async (_event, relPath, content) => {
  const full = safeResolve(relPath);
  fs.writeFileSync(full, String(content ?? ""), "utf8");
  return true;
});

function createWindow(url) {
  const isMac = process.platform === "darwin";

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Schala",
    backgroundColor: "#fafafa",
    icon: path.join(__dirname, "..", "public", "Schala logo.png"),
    autoHideMenuBar: true,
    // macOS: nativ "traffic light" düymələri saxlanılır, amma başlıq mətni
    // gizlədilir ki, öz axtarış-zolağımızı ora yerləşdirə bilək. Windows/Linux:
    // pəncərə TAM çərçivəsiz, minimize/maximize/close düymələrini özümüz
    // render edib IPC ilə idarə edirik (SchalaTitleBar.tsx).
    ...(isMac
      ? { titleBarStyle: "hiddenInset" }
      : { frame: false }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "schala-preload.js"),
    },
  });

  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (!targetUrl.startsWith("http://localhost")) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  mainWindow.on("maximize", () => mainWindow?.webContents.send("schala:winMaximizedChange", true));
  mainWindow.on("unmaximize", () => mainWindow?.webContents.send("schala:winMaximizedChange", false));

  mainWindow.on("closed", () => {
    termProcess?.kill();
    termProcess = null;
    mainWindow = null;
  });
}

function boot() {
  const url = `http://localhost:${PORT}/schala`;

  if (server.listening) {
    createWindow(url);
    return;
  }

  server.once("listening", () => createWindow(url));
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn("Port tutulub, mövcud serverə qoşulunur:", url);
      createWindow(url);
    }
  });
}

app.whenReady().then(boot);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) boot();
});
