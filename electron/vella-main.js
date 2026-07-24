const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

// Eyni server.js-i çağırırıq, sadəcə fərqli marşrutu ("/vella") açırıq.
const { server, PORT } = require("../server.js");

let mainWindow = null;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 820,
    minHeight: 560,
    title: "Syncrom Vella",
    backgroundColor: "#0b0d14",
    icon: path.join(__dirname, "..", "public", "vella-logo.png"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function boot() {
  const url = `http://localhost:${PORT}/vella`;

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
