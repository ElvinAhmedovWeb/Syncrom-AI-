import type { Chat } from "../types";

export function chatToMarkdown(chat: Chat): string {
  const lines = [`# ${chat.title || "Söhbət"}`, ""];
  for (const m of chat.messages) {
    lines.push(m.role === "user" ? "**Sən:**" : "**AI:**");
    if (m.content) lines.push(m.content);
    if (m.image) lines.push("*(şəkil göndərildi)*");
    lines.push("");
  }
  return lines.join("\n");
}

export function downloadChat(chat: Chat): void {
  const md = chatToMarkdown(chat);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const safeName = (chat.title || "sohbet").replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60) || "sohbet";
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
