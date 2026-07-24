export interface RecentProject {
  path: string;
  name: string;
  lastOpened: number;
}

const KEY = "schala_recent_projects";

export function loadRecentProjects(): RecentProject[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentProject(rootPath: string): void {
  const name = rootPath.split(/[\\/]/).filter(Boolean).pop() || rootPath;
  const all = loadRecentProjects().filter((p) => p.path !== rootPath);
  const next = [{ path: rootPath, name, lastOpened: Date.now() }, ...all].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
}
