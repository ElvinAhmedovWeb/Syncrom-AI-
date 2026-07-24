import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export function useSpeechInput(onResult: (text: string) => void, onEnd: () => void) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const rec = new Ctor();
    rec.lang = "az-AZ";
    rec.interimResults = true;
    rec.continuous = false;

    rec.addEventListener("result", (e: Event) => {
      const ev = e as SpeechRecognitionEventLike;
      const text = Array.from(ev.results as ArrayLike<ArrayLike<SpeechRecognitionResultLike>>)
        .map((r) => r[0].transcript)
        .join("");
      onResult(text);
    });
    rec.addEventListener("end", () => {
      setRecording(false);
      onEnd();
    });
    rec.addEventListener("error", () => {
      setRecording(false);
    });

    recRef.current = rec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (recording) {
      rec.stop();
      return;
    }
    setRecording(true);
    rec.start();
  };

  return { supported, recording, toggle };
}
