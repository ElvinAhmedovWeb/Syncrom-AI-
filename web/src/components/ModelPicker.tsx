import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { useT } from "../lib/i18n";
import type { ModelInfo } from "../types";

interface Props {
  models: ModelInfo[];
  currentId: string;
  onSelect: (id: string) => void;
}

export default function ModelPicker({ models, currentId, onSelect }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = models.find((m) => m.id === currentId) ?? models[0];

  // Səkkiz model bir siyahıda çox olur. Əsas dördlük həmişə görünür,
  // ixtisaslaşmış modellər isə "Digər modellər" altında qalır.
  const primary = models.filter((m) => m.primary);
  const others = models.filter((m) => !m.primary);
  const currentIsOther = others.some((m) => m.id === currentId);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Seçili model "digər"lərdəndirsə, menyu açılanda bölmə də açıq olsun —
  // əks halda istifadəçi öz seçdiyi modeli siyahıda görməz.
  useEffect(() => {
    if (open && currentIsOther) setOthersOpen(true);
  }, [open, currentIsOther]);

  if (!current) return null;

  const renderItem = (m: (typeof models)[number]) => (
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
          {m.vision && <span title={t("plus.imageSub")}></span>}
        </span>
        <span className="m-tag">
          {m.tag} · {m.desc}
        </span>
      </span>
      <span className="m-check">✓</span>
    </motion.div>
  );

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
          // x: "-50%" mərkəzləmə üçündür (CSS-də left: 50%). Framer inline
          // transform yazdığı üçün bunu CSS-də saxlamaq mümkün deyil —
          // inline transform CSS-dəki transform-u tamamilə əvəz edir.
          initial={{ opacity: 0, x: "-50%", y: 8 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {/* primary bayrağı hələ serverdən gəlmirsə (köhnə keş) bütün
              modelləri göstəririk — boş menyu qalmasın */}
          {(primary.length ? primary : models).map(renderItem)}

          {primary.length > 0 && others.length > 0 && (
            <>
              <button
                type="button"
                className={`model-others-toggle${othersOpen ? " open" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOthersOpen((v) => !v);
                }}
                aria-expanded={othersOpen}
              >
                <span>{t("model.others")}</span>
                <span className="model-others-count">{others.length}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {othersOpen && (
                <motion.div
                  className="model-others"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.16, ease: EASE_OUT }}
                >
                  {others.map(renderItem)}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
