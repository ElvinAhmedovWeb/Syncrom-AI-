import { useCallback, useEffect, useRef, useState } from "react";
import { fetchModels, streamChat, generateTitle, fetchSpeech, generateImage } from "../lib/api";
import { stripForSpeech } from "../lib/markdown";
import { blobToDataUrl } from "../lib/image";
import type { ChatStorage } from "../lib/storage";
import type { Chat, ChatMessage, ModelInfo } from "../types";

interface Options {
  storage: ChatStorage;
  fixedModelId?: string;
  userName?: string | null;
  storageKeyForModel?: string; // localStorage key to remember last-picked model (undefined = no persistence)
}

type SpeakState = { key: string; state: "loading" | "playing" } | null;

export function useChatController({ storage, fixedModelId, userName, storageKeyForModel }: Options) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModelId, setCurrentModelId] = useState<string>(
    fixedModelId || (storageKeyForModel && localStorage.getItem(storageKeyForModel)) || ""
  );
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("Hazır");
  const [deepThink, setDeepThink] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [streamDraft, setStreamDraft] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<SpeakState>(null);

  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedRef = useRef(false);

  // ---------- Modellər ----------
  useEffect(() => {
    if (fixedModelId) return;
    fetchModels().then((data) => {
      if (!data) return;
      setModels(data.models);
      setCurrentModelId((prev) => (prev && data.models.some((m) => m.id === prev) ? prev : data.default));
    });
  }, [fixedModelId]);

  const selectModel = useCallback(
    (id: string) => {
      setCurrentModelId(id);
      if (storageKeyForModel) localStorage.setItem(storageKeyForModel, id);
      setCurrentChat((c) => (c ? { ...c, modelId: id } : c));
    },
    [storageKeyForModel]
  );

  // ---------- Söhbətlərin ilkin yüklənməsi ----------
  const loadChats = useCallback(async () => {
    const list = await storage.load();
    setChats(list);
    return list;
  }, [storage]);

  const freshChat = useCallback(
    (): Chat => ({ id: null, title: "Yeni söhbət", messages: [], modelId: currentModelId, updatedAt: Date.now() }),
    [currentModelId]
  );

  const stopEverything = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(null);
    setBusy(false);
    setStatusText("Hazır");
    setStreamDraft(null);
  }, []);

  const newChat = useCallback(() => {
    stopEverything();
    setCurrentChat(freshChat());
  }, [stopEverything, freshChat]);

  const openChat = useCallback(
    (id: string) => {
      const c = chats.find((x) => x.id === id);
      if (!c) return;
      stopEverything();
      setCurrentChat(c);
      if (c.modelId && (fixedModelId ? c.modelId === fixedModelId : models.some((m) => m.id === c.modelId))) {
        setCurrentModelId(c.modelId);
        if (storageKeyForModel) localStorage.setItem(storageKeyForModel, c.modelId);
      }
    },
    [chats, stopEverything, fixedModelId, models, storageKeyForModel]
  );

  const deleteChat = useCallback(
    async (id: string) => {
      await storage.remove(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      setCurrentChat((cur) => (cur?.id === id ? null : cur));
    },
    [storage]
  );

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      await loadChats();
      setCurrentChat(freshChat());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (chat: Chat) => {
      const saved = await storage.save({ ...chat, updatedAt: Date.now() });
      setChats((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
      return saved;
    },
    [storage]
  );

  const maybeTitleAndPersist = useCallback(
    async (chat: Chat) => {
      const saved = await persist(chat);
      setCurrentChat((cur) => (cur && cur.id === null ? saved : cur?.id === saved.id ? saved : cur));
      if (saved.title === "Yeni söhbət" && saved.messages.length >= 2) {
        const title = await generateTitle(saved.messages);
        if (title) {
          const retitled = { ...saved, title };
          const persisted = await persist(retitled);
          setCurrentChat((cur) => (cur?.id === persisted.id ? persisted : cur));
        }
      }
    },
    [persist]
  );

  // ---------- Mesaj göndərmə + canlı axın ----------
  const streamAssistant = useCallback(
    async (chatSnapshot: Chat) => {
      setBusy(true);
      setStatusText(agentMode ? "Kod icra edir, araşdırır..." : deepThink ? "Dərin düşünürəm, araşdırıram..." : "Düşünür...");
      setStreamDraft("");
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let acc = "";
      let firstChunk = true;

      try {
        await streamChat({
          messages: chatSnapshot.messages,
          modelId: chatSnapshot.modelId || currentModelId,
          userName,
          deepThink,
          agentMode,
          signal: ctrl.signal,
          onChunk: (chunk) => {
            if (firstChunk) {
              firstChunk = false;
              setStatusText("Yazır...");
            }
            acc += chunk;
            setStreamDraft(acc);
          },
        });

        if (!acc) {
          setStreamDraft(null);
          setCurrentChat({
            ...chatSnapshot,
            messages: [...chatSnapshot.messages, { role: "assistant", content: "Bağışla, cavab ala bilmədim." }],
          });
          setStatusText("Hazır");
          return;
        }

        const finalMessages: ChatMessage[] = [...chatSnapshot.messages, { role: "assistant", content: acc }];
        const finalChat: Chat = { ...chatSnapshot, messages: finalMessages };
        setStreamDraft(null);
        setCurrentChat(finalChat);
        setStatusText("Hazır");
        void maybeTitleAndPersist(finalChat);
        if (autoSpeak) void speak(acc, String(finalMessages.length - 1));
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          if (acc) {
            const finalMessages: ChatMessage[] = [...chatSnapshot.messages, { role: "assistant", content: acc + " …" }];
            const finalChat: Chat = { ...chatSnapshot, messages: finalMessages };
            setCurrentChat(finalChat);
            void maybeTitleAndPersist(finalChat);
          }
          setStreamDraft(null);
          setStatusText("Dayandırıldı");
        } else {
          setStreamDraft(null);
          setCurrentChat({
            ...chatSnapshot,
            messages: [
              ...chatSnapshot.messages,
              { role: "assistant", content: "Serverlə əlaqə qurulmadı. Serverin işlədiyinə əmin ol." },
            ],
          });
          setStatusText("Oflayn");
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentModelId, userName, deepThink, agentMode, autoSpeak, maybeTitleAndPersist]
  );

  // ---------- Şəkil yaratma (Pollinations.ai, pulsuz) ----------
  const generateImageMessage = useCallback(
    async (prompt: string) => {
      const base = currentChat ?? freshChat();
      const userMsg: ChatMessage = { role: "user", content: prompt };
      const withUser: Chat = {
        ...base,
        messages: [...base.messages, userMsg],
        modelId: base.modelId || currentModelId,
      };
      setCurrentChat(withUser);

      setBusy(true);
      setStatusText("Şəkil yaradılır...");
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const blob = await generateImage(prompt, ctrl.signal);
        const dataUrl = await blobToDataUrl(blob);
        const finalMessages: ChatMessage[] = [
          ...withUser.messages,
          { role: "assistant", content: "Budur, sizin üçün yaratdığım şəkil:", image: dataUrl },
        ];
        const finalChat: Chat = { ...withUser, messages: finalMessages };
        setCurrentChat(finalChat);
        setStatusText("Hazır");
        void maybeTitleAndPersist(finalChat);
      } catch (err) {
        const aborted = (err as Error).name === "AbortError";
        const serverMsg = !aborted && (err as Error).message;
        const finalMessages: ChatMessage[] = [
          ...withUser.messages,
          {
            role: "assistant",
            content: aborted ? "Şəkil yaratma dayandırıldı." : serverMsg || "Şəkli yarada bilmədim. Yenidən cəhd et.",
          },
        ];
        setCurrentChat({ ...withUser, messages: finalMessages });
        setStatusText(aborted ? "Dayandırıldı" : "Xəta");
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [currentChat, freshChat, currentModelId, maybeTitleAndPersist]
  );

  const sendMessage = useCallback(
    (text: string, image?: string | null) => {
      const content = text.trim();
      if ((!content && !image) || busy) return;

      if (imageGenMode && content) {
        void generateImageMessage(content);
        return;
      }

      const base = currentChat ?? freshChat();
      const userMsg: ChatMessage = { role: "user", content, ...(image ? { image } : {}) };
      const withUser: Chat = { ...base, messages: [...base.messages, userMsg], modelId: base.modelId || currentModelId };
      setCurrentChat(withUser);
      void streamAssistant(withUser);
    },
    [busy, currentChat, freshChat, currentModelId, streamAssistant, imageGenMode, generateImageMessage]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(() => {
    if (busy || !currentChat) return;
    const msgs = currentChat.messages;
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "assistant") return;
    const trimmed: Chat = { ...currentChat, messages: msgs.slice(0, -1) };
    setCurrentChat(trimmed);
    void streamAssistant(trimmed);
  }, [busy, currentChat, streamAssistant]);

  // Mesajı redaktə et: seçilən mesajdan (daxil) sonrakı hər şeyi tarixçədən
  // kəsir — istifadəçi mətni composer-ə qaytarıb düzəldib yenidən göndərir.
  const editMessage = useCallback(
    (index: number) => {
      if (busy || !currentChat) return;
      const msg = currentChat.messages[index];
      if (!msg || msg.role !== "user") return;
      const trimmed: Chat = { ...currentChat, messages: currentChat.messages.slice(0, index) };
      setCurrentChat(trimmed);
    },
    [busy, currentChat]
  );

  const renameChat = useCallback(
    async (id: string, title: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;
      const chat = chats.find((c) => c.id === id);
      if (!chat) return;
      const saved = await persist({ ...chat, title: trimmedTitle });
      setCurrentChat((cur) => (cur?.id === id ? saved : cur));
    },
    [chats, persist]
  );

  // ---------- Səsləndirmə ----------
  const speak = useCallback(async (text: string, key: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      const wasThis = speaking?.key === key;
      setSpeaking(null);
      if (wasThis) {
        setStatusText("Hazır");
        return;
      }
    }

    setSpeaking({ key, state: "loading" });
    setStatusText("Səs hazırlanır...");

    try {
      const blob = await fetchSpeech(stripForSpeech(text));
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeaking({ key, state: "playing" });
      setStatusText("Danışır...");

      audio.addEventListener("ended", () => {
        setSpeaking(null);
        audioRef.current = null;
        setStatusText("Hazır");
        URL.revokeObjectURL(url);
      });

      await audio.play();
    } catch {
      setSpeaking(null);
      audioRef.current = null;
      setStatusText("Səs xətası");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDeepThink = useCallback(() => setDeepThink((v) => !v), []);
  const toggleAgentMode = useCallback(() => setAgentMode((v) => !v), []);
  const toggleImageGen = useCallback(() => setImageGenMode((v) => !v), []);
  const toggleAutoSpeak = useCallback(() => setAutoSpeak((v) => !v), []);

  return {
    chats,
    currentChat,
    models,
    currentModelId,
    selectModel,
    busy,
    statusText,
    deepThink,
    toggleDeepThink,
    agentMode,
    toggleAgentMode,
    imageGenMode,
    toggleImageGen,
    autoSpeak,
    toggleAutoSpeak,
    streamDraft,
    sendMessage,
    stop,
    regenerate,
    editMessage,
    renameChat,
    newChat,
    openChat,
    deleteChat,
    speak,
    speaking,
  };
}
