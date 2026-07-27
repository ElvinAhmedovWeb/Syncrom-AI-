import type { ChatMessage, ModelsResponse } from "../types";

export async function fetchModels(lang?: string): Promise<ModelsResponse | null> {
  try {
    const res = await fetch(`/api/models${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`);
    if (!res.ok) return null;
    return (await res.json()) as ModelsResponse;
  } catch {
    return null;
  }
}

/** Kod Köməkçisinin alət addımı — serverdən canlı gəlir (bax: server.js STEP_RS) */
export interface AgentStep {
  tool: string;
  detail: string;
  status: "running" | "done" | "failed";
}

export interface StreamChatArgs {
  messages: ChatMessage[];
  modelId: string;
  userName?: string | null;
  deepThink?: boolean;
  agentMode?: boolean;
  webSearchMode?: boolean;
  translateMode?: boolean;
  translateTo?: string;
  /** İnterfeys dili — mesajın dili aydın olmayanda model bu dildə cavab verir */
  uiLang?: string;
  /** Yaddaşdaki faktlar — server saxlamır, hər sorğuda göndərilir */
  memories?: string[];
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
  onStep?: (step: AgentStep) => void;
}

// Server addım kadrlarını RS (U+001E) simvolu ilə çərçivəyə alıb adi mətn
// axınına qoyur: ...mətn\x1e{json}\x1e...mətn. Burada onları mətndən ayırırıq.
// Kadr iki oxu arasında yarıya bölünə bilər, ona görə yarımçıq hissə buferdə
// saxlanılır.
const STEP_RS = "\u001e";

function createStepSplitter(onText: (s: string) => void, onStep: (s: AgentStep) => void) {
  let pending = "";
  let insideFrame = false;

  return (chunk: string) => {
    pending += chunk;

    for (;;) {
      const idx = pending.indexOf(STEP_RS);
      if (idx === -1) {
        // Kadr içindəyiksə mətn kimi buraxma — kadrın bağlanmasını gözlə
        if (!insideFrame && pending) {
          onText(pending);
          pending = "";
        }
        return;
      }

      const before = pending.slice(0, idx);
      pending = pending.slice(idx + 1);

      if (insideFrame) {
        // "before" tam bir kadrın JSON-udur
        insideFrame = false;
        try {
          const step = JSON.parse(before) as AgentStep;
          if (step && step.tool) onStep(step);
        } catch {
          // Pozulmuş kadrı sükutla ötür — mətnə qarışdırmaqdansa itirmək yaxşıdır
        }
      } else {
        if (before) onText(before);
        insideFrame = true;
      }
    }
  };
}

export async function streamChat({
  messages,
  modelId,
  userName,
  deepThink,
  agentMode,
  webSearchMode,
  translateMode,
  translateTo,
  uiLang,
  memories,
  signal,
  onChunk,
  onStep,
}: StreamChatArgs): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      modelId,
      userName,
      deepThink,
      agentMode,
      webSearchMode,
      translateMode,
      translateTo,
      uiLang,
      memories,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const feed = createStepSplitter(onChunk, onStep || (() => {}));

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) feed(chunk);
  }
}

export async function extractMemory(
  userText: string,
  assistantText: string,
  existing: string[]
): Promise<string | null> {
  try {
    const res = await fetch("/api/memory/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText, assistantText, existing }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.fact || null;
  } catch {
    return null;
  }
}

export async function fetchFollowups(
  userText: string,
  assistantText: string,
  uiLang: string
): Promise<string[]> {
  try {
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText, assistantText, uiLang }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.followups) ? data.followups : [];
  } catch {
    return [];
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

export type ImageAspect = "square" | "landscape" | "portrait";

export interface GeneratedImage {
  blob: Blob;
  /** Serverin şəkil üçün qurduğu ingiliscə prompt — istifadəçiyə göstərilir */
  usedPrompt: string;
}

export async function generateImage(
  prompt: string,
  aspect: ImageAspect,
  signal?: AbortSignal
): Promise<GeneratedImage> {
  const res = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspect }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Şəkil yaratma xətası");
  }
  let usedPrompt = "";
  try {
    usedPrompt = decodeURIComponent(res.headers.get("X-Image-Prompt") || "");
  } catch {
    // Başlıq pozuqdursa prompt sadəcə göstərilmir
  }
  return { blob: await res.blob(), usedPrompt };
}
