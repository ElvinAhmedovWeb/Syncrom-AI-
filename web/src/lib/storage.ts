import type { Chat } from "../types";
import { loadUserChats, saveChat as saveFirestoreChat, deleteChatDoc } from "./firebase";

export interface ChatStorage {
  load(): Promise<Chat[]>;
  save(chat: Chat): Promise<Chat>;
  remove(chatId: string): Promise<void>;
}

export function createLocalChatStorage(key: string): ChatStorage {
  return {
    async load() {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]") as Chat[];
      } catch {
        return [];
      }
    },
    async save(chat) {
      const all = await this.load();
      const withId: Chat = chat.id ? chat : { ...chat, id: "c" + Date.now() };
      const next = [withId, ...all.filter((c) => c.id !== withId.id)].slice(0, 50);
      localStorage.setItem(key, JSON.stringify(next));
      return withId;
    },
    async remove(chatId) {
      const all = await this.load();
      localStorage.setItem(key, JSON.stringify(all.filter((c) => c.id !== chatId)));
    },
  };
}

export function createFirestoreChatStorage(uid: string): ChatStorage {
  return {
    async load() {
      return loadUserChats(uid);
    },
    async save(chat) {
      const id = await saveFirestoreChat(uid, chat);
      return { ...chat, id };
    },
    async remove(chatId) {
      await deleteChatDoc(uid, chatId);
    },
  };
}
