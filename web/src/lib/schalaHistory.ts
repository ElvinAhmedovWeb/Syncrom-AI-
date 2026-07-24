import type { ChatMessage } from "../types";

export interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const KEY = "schala_conversations";

export function loadConversations(): StoredConversation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveConversation(conv: StoredConversation): void {
  const all = loadConversations().filter((c) => c.id !== conv.id);
  const next = [conv, ...all].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "indi";
  if (mins < 60) return `${mins} dəq əvvəl`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 saat əvvəl" : `${hours} saat əvvəl`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Dünən";
  if (days < 7) return `${days} gün əvvəl`;
  return new Date(ts).toLocaleDateString("az-AZ");
}
