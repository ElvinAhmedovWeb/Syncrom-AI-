import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import type { ModelInfo } from "../types";

interface Props {
  models: ModelInfo[];
  currentId: string;
  onSelect: (id: string) => void;
}

export default function ModelPicker({ models, currentId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = models.find((m) => m.id === currentId) ?? models[0];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (!current) return null;

  return (
    <div className="model-select-wrap" ref={wrapRef}>
      <motion.button
        type="button"
        className={`model-pill${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
      >
        <span className="m-dot" style={{ background: current.color, color: current.color }} />
        <span>{current.name}</span>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </motion.button>
      {open && (
        <motion.div
          className="model-menu"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {models.map((m) => (
            <motion.div
              key={m.id}
              className={`model-item${m.id === currentId ? " active" : ""}`}
              onClick={() => {
                onSelect(m.id);
                setOpen(false);
              }}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
            >
              <span className="m-dot" style={{ background: m.color, color: m.color }} />
              <span className="m-info">
                <span className="m-name">
                  {m.name}
                  {m.vision && <span title="Şəkil analizi">📷</span>}
                </span>
                <span className="m-tag">
                  {m.tag} · {m.desc}
                </span>
              </span>
              <span className="m-check">✓</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
