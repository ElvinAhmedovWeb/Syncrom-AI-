const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

// Eyni layihədəki server.js-i modul kimi çağırırıq — o, öz .env-ini
// __dirname-ə görə oxuyur, ona görə Electron-un CWD-si fərqli olsa da işləyir.
const { server, PORT } = require("../server.js");

let mainWindow = null;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#000000",
    icon: path.join(__dirname, "..", "public", "favicon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(url);

  // Xarici linklər (Wikipedia mənbələri, e-poçt və s.) sistem brauzerində açılsın,
  // tətbiq pəncərəsi yalnız öz serverimizi göstərsin.
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (!targetUrl.startsWith(url.split("/chat")[0]) && !targetUrl.startsWith("http://localhost")) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function boot() {
  const url = `http://localhost:${PORT}/chat`;

  if (server.listening) {
    createWindow(url);
    return;
  }

  server.once("listening", () => createWindow(url));
  server.once("error", (err) => {
    // Port artıq tutulubsa (məs. "npm start" ayrıca işləyir) — mövcud serverə qoşul
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
