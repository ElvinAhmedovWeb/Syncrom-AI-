import type { ChatMessage, ModelsResponse } from "../types";

export async function fetchModels(): Promise<ModelsResponse | null> {
  try {
    const res = await fetch("/api/models");
    if (!res.ok) return null;
    return (await res.json()) as ModelsResponse;
  } catch {
    return null;
  }
}

export interface StreamChatArgs {
  messages: ChatMessage[];
  modelId: string;
  userName?: string | null;
  deepThink?: boolean;
  agentMode?: boolean;
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
}

export async function streamChat({
  messages,
  modelId,
  userName,
  deepThink,
  agentMode,
  signal,
  onChunk,
}: StreamChatArgs): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, modelId, userName, deepThink, agentMode }),
    signal,
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }
}

export async function generateTitle(messages: ChatMessage[]): Promise<string | null> {
  try {
    const sanitized = messages.slice(0, 2).map((m) => ({ role: m.role, content: m.content }));
    const res = await fetch("/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: sanitized }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch {
    return null;
  }
}

export async function fetchSpeech(text: string): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("TTS xətası");
  return res.blob();
}

export async function generateImage(prompt: string, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Şəkil yaratma xətası");
  }
  return res.blob();
}
