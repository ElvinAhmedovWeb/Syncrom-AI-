const { contextBridge, ipcRenderer } = require("electron");

// "sandbox: true" ilə preload skripti yalnız electron modulunu (contextBridge/
// ipcRenderer) işlədə bilər — fs/path birbaşa burda YOXDUR, hər şey main
// prosesə IPC ilə ötürülür ki, renderer heç vaxt xam fayl sisteminə çıxış almasın.
contextBridge.exposeInMainWorld("schalaAPI", {
  platform: process.platform,

  openFolder: () => ipcRenderer.invoke("schala:openFolder"),
  openFolderByPath: (dirPath) => ipcRenderer.invoke("schala:openFolderByPath", dirPath),
  openFile: () => ipcRenderer.invoke("schala:openFile"),
  newFile: () => ipcRenderer.invoke("schala:newFile"),
  cloneRepo: (url) => ipcRenderer.invoke("schala:cloneRepo", url),
  readFile: (relPath) => ipcRenderer.invoke("schala:readFile", relPath),
  writeFile: (relPath, content) => ipcRenderer.invoke("schala:writeFile", relPath, content),
  gitStatus: () => ipcRenderer.invoke("schala:gitStatus"),
  gitBranch: () => ipcRenderer.invoke("schala:gitBranch"),

  winMinimize: () => ipcRenderer.invoke("schala:winMinimize"),
  winMaximize: () => ipcRenderer.invoke("schala:winMaximize"),
  winClose: () => ipcRenderer.invoke("schala:winClose"),
  winIsMaximized: () => ipcRenderer.invoke("schala:winIsMaximized"),
  onWinMaximizedChange: (cb) => {
    const listener = (_event, isMaximized) => cb(isMaximized);
    ipcRenderer.on("schala:winMaximizedChange", listener);
    return () => ipcRenderer.removeListener("schala:winMaximizedChange", listener);
  },

  termStart: () => ipcRenderer.invoke("schala:termStart"),
  termWrite: (data) => ipcRenderer.invoke("schala:termWrite", data),
  termKill: () => ipcRenderer.invoke("schala:termKill"),
  onTermData: (cb) => {
    const listener = (_event, data) => cb(data);
    ipcRenderer.on("schala:termData", listener);
    return () => ipcRenderer.removeListener("schala:termData", listener);
  },
});
