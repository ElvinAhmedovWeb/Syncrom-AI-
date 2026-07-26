import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchModels,
  streamChat,
  generateTitle,
  fetchSpeech,
  generateImage,
  extractMemory,
  fetchFollowups,
  type AgentStep,
} from "../lib/api";
import { stripForSpeech } from "../lib/markdown";
import { blobToDataUrl } from "../lib/image";
import { useI18n } from "../lib/i18n";
import {
  isMemoryEnabled,
  setMemoryEnabled,
  newFact,
  isDuplicateFact,
  MAX_MEMORIES,
  type MemoryFact,
  type MemoryStore,
} from "../lib/memory";
import type { ChatStorage } from "../lib/storage";
import type { Chat, ChatMessage, ModelInfo } from "../types";

interface Options {
  storage: ChatStorage;
  fixedModelId?: string;
  userName?: string | null;
  storageKeyForModel?: string; // localStorage key to remember last-picked model (undefined = no persistence)
  memoryStore?: MemoryStore;
}

type SpeakState = { key: string; state: "loading" | "playing" } | null;

const TRANSLATE_TARGET_KEY = "syncrom_translate_to";

// Adsız söhbətin başlığı YADDA SAXLANMIR (boş string kimi saxlanır) — belə
// olmasa başlıq bir dildə yazılıb, istifadəçi dili dəyişəndə köhnə dildə
// donub qalardı. "Yeni söhbət" isə i18n-dən əvvəl saxlanmış söhbətlər üçün
// geriyə uyğunluq yoxlamasıdır.
export function isUntitled(title: string | undefined): boolean {
  return !title || title.trim() === "" || title === "Yeni söhbət";
}

export function useChatController({
  storage,
  fixedModelId,
  userName,
  storageKeyForModel,
  memoryStore,
}: Options) {
  const { t, lang } = useI18n();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModelId, setCurrentModelId] = useState<string>(
    fixedModelId || (storageKeyForModel && localStorage.getItem(storageKeyForModel)) || ""
  );
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState(() => t("status.ready"));
  const [deepThink, setDeepThink] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [imageGenMode, setImageGenMode] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState(false);
  const [translateMode, setTranslateMode] = useState(false);
  const [translateTo, setTranslateTo] = useState<string>(
    () => localStorage.getItem(TRANSLATE_TARGET_KEY) || "en"
  );
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [streamDraft, setStreamDraft] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<SpeakState>(null);

  // ---------- Yaddaş / addımlar / davam sualları ----------
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [memoryOn, setMemoryOn] = useState(isMemoryEnabled);
  const [memorySaved, setMemorySaved] = useState<string | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedRef = useRef(false);
  // memories state-i streamAssistant-ın deps-inə salmamaq üçün ref-də də
  // saxlanılır — əks halda hər fakt əlavəsi funksiyanı yenidən yaradardı.
  const memoriesRef = useRef<MemoryFact[]>([]);
  const memoryOnRef = useRef(memoryOn);
  const savedToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);
  useEffect(() => {
    memoryOnRef.current = memoryOn;
  }, [memoryOn]);

  useEffect(() => {
    if (!memoryStore) return;
    let alive = true;
    memoryStore.load().then((facts) => {
      if (alive) setMemories(facts);
    });
    return () => {
      alive = false;
    };
  }, [memoryStore]);

  useEffect(
    () => () => {
      if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
    },
    []
  );

  const persistMemories = useCallback(
    (facts: MemoryFact[]) => {
      setMemories(facts);
      memoriesRef.current = facts;
      void memoryStore?.save(facts);
    },
    [memoryStore]
  );

  // Dil dəyişəndə status mətni köhnə dildə donub qalmasın — boş vaxtda
  // "Hazır"-ı yeni dilə çevir (işləyən sorğunun statusuna toxunmuruq,
  // onsuz da bir neçə saniyəyə yenilənəcək).
  useEffect(() => {
    if (!busy) setStatusText(t("status.ready"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ---------- Modellər ----------
  // Model etiketləri (tag/desc) serverdə tərcümə olunur, ona görə dil
  // dəyişəndə siyahı yenidən çəkilir.
  useEffect(() => {
    if (fixedModelId) return;
    fetchModels(lang).then((data) => {
      if (!data) return;
      setModels(data.models);
      setCurrentModelId((prev) => (prev && data.models.some((m) => m.id === prev) ? prev : data.default));
    });
  }, [fixedModelId, lang]);

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
    (): Chat => ({ id: null, title: "", messages: [], modelId: currentModelId, updatedAt: Date.now() }),
    [currentModelId]
  );

  const stopEverything = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(null);
    setBusy(false);
    setStatusText(t("status.ready"));
    setStreamDraft(null);
    setAgentSteps([]);
    setFollowups([]);
  }, [t]);

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
      if (isUntitled(saved.title) && saved.messages.length >= 2) {
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
      setStatusText(
        translateMode
          ? t("status.translating")
          : agentMode
            ? t("status.agentWorking")
            : webSearchMode
              ? t("status.searchingWeb")
              : deepThink
                ? t("status.deepThinking")
                : t("status.thinking")
      );
      setStreamDraft("");
      setAgentSteps([]);
      setFollowups([]);
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
          webSearchMode,
          translateMode,
          translateTo,
          uiLang: lang,
          // Tərcümə rejimində yaddaş göndərilmir — model orada söhbət etmir,
          // yalnız mətn çevirir, kontekst isə tərcüməni yayındıra bilər.
          memories:
            memoryOnRef.current && !translateMode
              ? memoriesRef.current.map((m) => m.text)
              : undefined,
          signal: ctrl.signal,
          onStep: (step) => {
            setAgentSteps((prev) => {
              // Eyni alət+detal üçün "running" sətrini "done/failed" ilə əvəz et
              const i = prev.findIndex(
                (p) => p.tool === step.tool && p.detail === step.detail && p.status === "running"
              );
              if (i === -1) return [...prev, step];
              const next = [...prev];
              next[i] = step;
              return next;
            });
          },
          onChunk: (chunk) => {
            if (firstChunk) {
              firstChunk = false;
              setStatusText(t("status.writing"));
            }
            acc += chunk;
            setStreamDraft(acc);
          },
        });

        if (!acc) {
          setStreamDraft(null);
          setCurrentChat({
            ...chatSnapshot,
            messages: [...chatSnapshot.messages, { role: "assistant", content: t("reply.noAnswer") }],
          });
          setStatusText(t("status.ready"));
          return;
        }

        const finalMessages: ChatMessage[] = [...chatSnapshot.messages, { role: "assistant", content: acc }];
        const finalChat: Chat = { ...chatSnapshot, messages: finalMessages };
        setStreamDraft(null);
        setCurrentChat(finalChat);
        setStatusText(t("status.ready"));
        void maybeTitleAndPersist(finalChat);
        if (autoSpeak) void speak(acc, String(finalMessages.length - 1));

        // Cavabdan sonrakı işlər cavabı bloklamır — paralel və "sükutlu"
        // işləyir, uğursuz olsa istifadəçi heç nə görmür.
        const lastUserText =
          [...chatSnapshot.messages].reverse().find((m) => m.role === "user")?.content || "";

        if (!translateMode) {
          void fetchFollowups(lastUserText, acc, lang).then(setFollowups);
        }

        if (memoryOnRef.current && !translateMode && lastUserText) {
          void extractMemory(
            lastUserText,
            acc,
            memoriesRef.current.map((m) => m.text)
          ).then((fact) => {
            if (!fact) return;
            const current = memoriesRef.current;
            if (isDuplicateFact(fact, current)) return;
            // Limit dolubsa ən köhnə AVTOMATİK faktı çıxarırıq — istifadəçinin
            // öz əlilə yazdığı faktlar silinmir.
            let base = current;
            if (base.length >= MAX_MEMORIES) {
              const oldestAutoIdx = base.reduce(
                (best, f, i) =>
                  f.manual ? best : best === -1 || f.createdAt < base[best].createdAt ? i : best,
                -1
              );
              base = oldestAutoIdx === -1 ? base.slice(1) : base.filter((_, i) => i !== oldestAutoIdx);
            }
            persistMemories([...base, newFact(fact)]);
            setMemorySaved(fact);
            if (savedToastTimer.current) clearTimeout(savedToastTimer.current);
            savedToastTimer.current = setTimeout(() => setMemorySaved(null), 4000);
          });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          if (acc) {
            const finalMessages: ChatMessage[] = [...chatSnapshot.messages, { role: "assistant", content: acc + " …" }];
            const finalChat: Chat = { ...chatSnapshot, messages: finalMessages };
            setCurrentChat(finalChat);
            void maybeTitleAndPersist(finalChat);
          }
          setStreamDraft(null);
          setStatusText(t("status.stopped"));
        } else {
          setStreamDraft(null);
          setCurrentChat({
            ...chatSnapshot,
            messages: [...chatSnapshot.messages, { role: "assistant", content: t("reply.noConnection") }],
          });
          setStatusText(t("status.offline"));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      currentModelId,
      userName,
      deepThink,
      agentMode,
      webSearchMode,
      translateMode,
      translateTo,
      lang,
      t,
      autoSpeak,
      maybeTitleAndPersist,
      persistMemories,
    ]
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
      setStatusText(t("status.generatingImage"));
      setFollowups([]);
      setAgentSteps([]);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const blob = await generateImage(prompt, ctrl.signal);
        const dataUrl = await blobToDataUrl(blob);
        const finalMessages: ChatMessage[] = [
          ...withUser.messages,
          { role: "assistant", content: t("reply.imageHere"), image: dataUrl },
        ];
        const finalChat: Chat = { ...withUser, messages: finalMessages };
        setCurrentChat(finalChat);
        setStatusText(t("status.ready"));
        void maybeTitleAndPersist(finalChat);
      } catch (err) {
        const aborted = (err as Error).name === "AbortError";
        const serverMsg = !aborted && (err as Error).message;
        const finalMessages: ChatMessage[] = [
          ...withUser.messages,
          {
            role: "assistant",
            content: aborted ? t("reply.imageStopped") : serverMsg || t("reply.imageFailed"),
          },
        ];
        setCurrentChat({ ...withUser, messages: finalMessages });
        setStatusText(aborted ? t("status.stopped") : t("status.error"));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [currentChat, freshChat, currentModelId, maybeTitleAndPersist, t]
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
        setStatusText(t("status.ready"));
        return;
      }
    }

    setSpeaking({ key, state: "loading" });
    setStatusText(t("status.preparingVoice"));

    try {
      const blob = await fetchSpeech(stripForSpeech(text));
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeaking({ key, state: "playing" });
      setStatusText(t("status.speaking"));

      audio.addEventListener("ended", () => {
        setSpeaking(null);
        audioRef.current = null;
        setStatusText(t("status.ready"));
        URL.revokeObjectURL(url);
      });

      await audio.play();
    } catch {
      setSpeaking(null);
      audioRef.current = null;
      setStatusText(t("status.voiceError"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bütün söhbətləri sil — hər iki anbarda (localStorage və Firestore)
  // işləməsi üçün bir-bir silinir; ChatStorage-də toplu silmə yoxdur.
  const clearAllChats = useCallback(async () => {
    const ids = chats.map((c) => c.id).filter((id): id is string => !!id);
    await Promise.all(ids.map((id) => storage.remove(id).catch(() => undefined)));
    setChats([]);
    stopEverything();
    setCurrentChat(freshChat());
  }, [chats, storage, stopEverything, freshChat]);

  const toggleDeepThink = useCallback(() => setDeepThink((v) => !v), []);
  const toggleAgentMode = useCallback(() => setAgentMode((v) => !v), []);
  const toggleWebSearch = useCallback(() => setWebSearchMode((v) => !v), []);

  // Şəkil yaratma və tərcümə bir-birini istisna edir: ikisi də yazılanı
  // "sual" kimi yox, "material" kimi qəbul edir, birlikdə mənasızdır.
  const toggleImageGen = useCallback(() => {
    setImageGenMode((v) => {
      if (!v) setTranslateMode(false);
      return !v;
    });
  }, []);

  const toggleTranslate = useCallback(() => {
    setTranslateMode((v) => {
      if (!v) setImageGenMode(false);
      return !v;
    });
  }, []);

  const selectTranslateTo = useCallback((code: string) => {
    setTranslateTo(code);
    localStorage.setItem(TRANSLATE_TARGET_KEY, code);
  }, []);

  const toggleAutoSpeak = useCallback(() => setAutoSpeak((v) => !v), []);

  // ---------- Yaddaş idarəetməsi ----------
  const addMemory = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      const current = memoriesRef.current;
      if (current.length >= MAX_MEMORIES || isDuplicateFact(clean, current)) return;
      persistMemories([...current, newFact(clean, true)]);
    },
    [persistMemories]
  );

  const deleteMemory = useCallback(
    (id: string) => persistMemories(memoriesRef.current.filter((f) => f.id !== id)),
    [persistMemories]
  );

  const clearMemories = useCallback(() => persistMemories([]), [persistMemories]);

  const toggleMemory = useCallback(() => {
    setMemoryOn((v) => {
      const next = !v;
      setMemoryEnabled(next);
      memoryOnRef.current = next;
      return next;
    });
  }, []);

  const dismissMemoryToast = useCallback(() => setMemorySaved(null), []);

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
    webSearchMode,
    toggleWebSearch,
    translateMode,
    toggleTranslate,
    translateTo,
    selectTranslateTo,
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
    clearAllChats,
    speak,
    speaking,
    agentSteps,
    followups,
    memories,
    memoryOn,
    memorySaved,
    addMemory,
    deleteMemory,
    clearMemories,
    toggleMemory,
    dismissMemoryToast,
  };
}
