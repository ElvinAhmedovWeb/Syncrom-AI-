import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { useT } from "../lib/i18n";
import { MAX_KNOWLEDGE_CHARS, MAX_PROJECTS, type Project } from "../lib/projects";

export interface CapricornApi {
  projects: Project[];
  activeProject: Project | null;
  select: (id: string | null) => void;
  create: (name: string) => Project | null;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => Promise<void>;
}

/** Yan paneldəki seçici — aktiv layihəni göstərir, siyahını açır. */
export default function CapricornPicker({ api }: { api: CapricornApi }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleCreate() {
    const p = api.create(t("cap.newName"));
    if (!p) return;
    api.select(p.id);
    setOpen(false);
    setEditing(p);
  }

  const active = api.activeProject;

  return (
    <>
      <div className="cap-wrap" ref={wrapRef}>
        <button type="button" className={`cap-trigger${active ? " on" : ""}`} onClick={() => setOpen((v) => !v)}>
          <span className="cap-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20l6-9 4 5 3-4 5 8z" />
              <circle cx="17" cy="5" r="2" />
            </svg>
          </span>
          <span className="cap-label">{active ? active.name : t("cap.none")}</span>
          <svg className={`cap-chev${open ? " open" : ""}`} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <motion.div
            className="cap-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
          >
            <p className="cap-menu-head">{t("cap.title")}</p>

            <button
              type="button"
              className={`cap-item${!active ? " active" : ""}`}
              onClick={() => {
                api.select(null);
                setOpen(false);
              }}
            >
              <span className="cap-item-name">{t("cap.none")}</span>
              {!active && <span className="plus-menu-check">✓</span>}
            </button>

            {api.projects.map((p) => (
              <div key={p.id} className={`cap-item row${p.id === active?.id ? " active" : ""}`}>
                <button
                  type="button"
                  className="cap-item-main"
                  onClick={() => {
                    api.select(p.id);
                    setOpen(false);
                  }}
                >
                  <span className="cap-item-name">{p.name}</span>
                  {p.goal && <span className="cap-item-goal">{p.goal}</span>}
                </button>
                <button
                  type="button"
                  className="cap-item-edit"
                  title={t("cap.edit")}
                  aria-label={t("cap.edit")}
                  onClick={() => {
                    setEditing(p);
                    setOpen(false);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              className="cap-new"
              onClick={handleCreate}
              disabled={api.projects.length >= MAX_PROJECTS}
            >
              + {t("cap.new")}
            </button>
          </motion.div>
        )}
      </div>

      {editing && (
        <ProjectDialog
          project={editing}
          api={api}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ProjectDialog({
  project,
  api,
  onClose,
}: {
  project: Project;
  api: CapricornApi;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(project.name);
  const [goal, setGoal] = useState(project.goal);
  const [instructions, setInstructions] = useState(project.instructions);
  const [knowledge, setKnowledge] = useState(project.knowledge);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const delTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => () => { if (delTimer.current) clearTimeout(delTimer.current); }, []);

  function save() {
    const clean = name.trim();
    if (!clean) return;
    api.update(project.id, { name: clean, goal, instructions, knowledge });
    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      if (delTimer.current) clearTimeout(delTimer.current);
      delTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    void api.remove(project.id);
    onClose();
  }

  return (
    <motion.div
      className="about-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="about-dialog cap-dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        role="dialog"
        aria-modal="true"
      >
        <h3>{t("cap.edit")}</h3>
        <p className="mem-sub">{t("cap.sub")}</p>

        <label className="cap-field">
          <span>{t("cap.name")}</span>
          <input type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="cap-field">
          <span>{t("cap.goal")}</span>
          <textarea
            rows={2}
            value={goal}
            maxLength={600}
            placeholder={t("cap.goalHint")}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>

        <label className="cap-field">
          <span>{t("cap.instructions")}</span>
          <textarea
            rows={3}
            value={instructions}
            maxLength={2000}
            placeholder={t("cap.instructionsHint")}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>

        <label className="cap-field">
          <span>
            {t("cap.knowledge")}
            <small className="cap-count">
              {knowledge.length} / {MAX_KNOWLEDGE_CHARS}
            </small>
          </span>
          <textarea
            rows={6}
            value={knowledge}
            maxLength={MAX_KNOWLEDGE_CHARS}
            placeholder={t("cap.knowledgeHint")}
            onChange={(e) => setKnowledge(e.target.value)}
          />
        </label>

        <div className="cap-actions">
          <button type="button" className="cap-save" onClick={save} disabled={!name.trim()}>
            {t("cap.save")}
          </button>
          <button type="button" className="about-close cap-cancel" onClick={onClose}>
            {t("cap.cancel")}
          </button>
        </div>

        <button type="button" className="mem-wipe" onClick={handleDelete}>
          {confirmDelete ? t("cap.deleteConfirm") : t("cap.delete")}
        </button>
        <p className="cap-note">{t("cap.deleteNote")}</p>
      </motion.div>
    </motion.div>
  );
}
