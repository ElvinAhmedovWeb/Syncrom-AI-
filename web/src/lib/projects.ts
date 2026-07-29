// ============================================================
// Capricorn — layihə iş sahələri.
//
// Adi söhbət hər dəfə sıfırdan başlayır. Uzun bir iş (diplom, biznes planı,
// məhsul buraxılışı) üzərində həftələrlə işləyəndə konteksti hər dəfə
// yenidən izah etmək lazım gəlir. Capricorn bunu həll edir: layihənin
// məqsədi, təlimatı və bilik bazası HƏR mesajda modelə ötürülür, söhbətlər
// isə layihəyə görə qruplaşır.
//
// Yaddaş (memory.ts) kimi burada da məlumat SERVERDƏ SAXLANMIR: qonaqda
// localStorage, hesabda istifadəçinin öz Firestore sənədi.
// ============================================================

import { loadUserProjects, saveUserProjects } from "./firebase";

export const MAX_PROJECTS = 20;
/** Bilik bazası kontekstə tam gedir — token büdcəsini partlatmamaq üçün limit */
export const MAX_KNOWLEDGE_CHARS = 6000;

export interface Project {
  id: string;
  name: string;
  /** Layihənin məqsədi — modelə "nəyə çalışırıq" kimi ötürülür */
  goal: string;
  /** Bu layihədəki hər cavaba tətbiq olunan davranış təlimatı */
  instructions: string;
  /** Sabit arxa məlumat: terminlər, faktlar, qaydalar, çıxarışlar */
  knowledge: string;
  /** Layihə üçün üstün tutulan model (boşdursa cari model işlədilir) */
  modelId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectStore {
  load(): Promise<Project[]>;
  save(projects: Project[]): Promise<void>;
}

const GUEST_KEY = "syncrom_projects";
export const ACTIVE_PROJECT_KEY = "syncrom_active_project";

export function newProject(name: string): Project {
  const now = Date.now();
  return {
    id: "p" + now.toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim().slice(0, 80),
    goal: "",
    instructions: "",
    knowledge: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function createLocalProjectStore(): ProjectStore {
  return {
    async load() {
      try {
        const raw = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
        return Array.isArray(raw) ? (raw as Project[]) : [];
      } catch {
        return [];
      }
    },
    async save(projects) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(projects.slice(0, MAX_PROJECTS)));
    },
  };
}

export function createFirestoreProjectStore(uid: string): ProjectStore {
  return {
    async load() {
      return loadUserProjects(uid);
    },
    async save(projects) {
      await saveUserProjects(uid, projects.slice(0, MAX_PROJECTS));
    },
  };
}

/**
 * Layihənin serverə göndərilən konteksti. Boş sahələr atılır ki, model
 * mənasız başlıqlar görməsin.
 */
export interface ProjectContext {
  name: string;
  goal?: string;
  instructions?: string;
  knowledge?: string;
}

export function toContext(p: Project | null): ProjectContext | undefined {
  if (!p) return undefined;
  const ctx: ProjectContext = { name: p.name };
  if (p.goal.trim()) ctx.goal = p.goal.trim();
  if (p.instructions.trim()) ctx.instructions = p.instructions.trim();
  if (p.knowledge.trim()) ctx.knowledge = p.knowledge.trim().slice(0, MAX_KNOWLEDGE_CHARS);
  return ctx;
}
