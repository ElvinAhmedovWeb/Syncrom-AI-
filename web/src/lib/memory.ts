// ============================================================
// Yaddaş — istifadəçi haqqında davamlı faktlar.
//
// Faktlar SERVERDƏ SAXLANMIR. Qonaq rejimində localStorage-da, hesab
// açılıbsa istifadəçinin öz Firestore sənədində saxlanılır və hər chat
// sorğusunda kontekst kimi göndərilir. Beləliklə server heç bir profil
// yığmır, istifadəçi isə yaddaşı tam idarə edir.
// ============================================================

import { loadUserMemories, saveUserMemories } from "./firebase";

export const MAX_MEMORIES = 40;

export interface MemoryFact {
  id: string;
  text: string;
  createdAt: number;
  /** true = istifadəçi özü yazdı, false = söhbətdən avtomatik çıxarıldı */
  manual?: boolean;
}

export interface MemoryStore {
  load(): Promise<MemoryFact[]>;
  save(facts: MemoryFact[]): Promise<void>;
}

const GUEST_KEY = "syncrom_memory";
export const MEMORY_ENABLED_KEY = "syncrom_memory_on";

export function isMemoryEnabled(): boolean {
  // Standart olaraq açıqdır; yalnız açıq şəkildə "0" yazılıbsa söndürülür
  return localStorage.getItem(MEMORY_ENABLED_KEY) !== "0";
}

export function setMemoryEnabled(on: boolean): void {
  localStorage.setItem(MEMORY_ENABLED_KEY, on ? "1" : "0");
}

export function newFact(text: string, manual = false): MemoryFact {
  return {
    id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.trim().slice(0, 300),
    createdAt: Date.now(),
    ...(manual ? { manual: true } : {}),
  };
}

export function createLocalMemoryStore(): MemoryStore {
  return {
    async load() {
      try {
        const raw = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
        return Array.isArray(raw) ? (raw as MemoryFact[]) : [];
      } catch {
        return [];
      }
    },
    async save(facts) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(facts.slice(0, MAX_MEMORIES)));
    },
  };
}

export function createFirestoreMemoryStore(uid: string): MemoryStore {
  return {
    async load() {
      return loadUserMemories(uid);
    },
    async save(facts) {
      await saveUserMemories(uid, facts.slice(0, MAX_MEMORIES));
    },
  };
}

// Eyni faktın təkrar yazılmasının qarşısını alır. Model bəzən eyni şeyi
// başqa sözlərlə çıxarır, ona görə sadə normalizasiya + söz kəsişməsi
// ilə yaxınlığı yoxlayırıq.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,;:!?()"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isDuplicateFact(text: string, existing: MemoryFact[]): boolean {
  const a = normalize(text);
  if (!a) return true;
  const aWords = new Set(a.split(" ").filter((w) => w.length > 3));
  if (aWords.size === 0) return existing.some((f) => normalize(f.text) === a);

  for (const f of existing) {
    const b = normalize(f.text);
    if (b === a) return true;
    const bWords = new Set(b.split(" ").filter((w) => w.length > 3));
    if (bWords.size === 0) continue;
    let shared = 0;
    for (const w of aWords) if (bWords.has(w)) shared++;
    // Mənalı sözlərin 70%-i üst-üstə düşürsə eyni fakt sayılır
    const ratio = shared / Math.min(aWords.size, bWords.size);
    if (ratio >= 0.7) return true;
  }
  return false;
}
