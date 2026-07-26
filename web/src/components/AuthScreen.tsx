import { useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
import { LANGS, useI18n } from "../lib/i18n";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  authErrorMessage,
} from "../lib/firebase";

interface Props {
  logoSrc: string;
  onGuest: () => void;
}

export default function AuthScreen({ logoSrc, onGuest }: Props) {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || pass.length < 6) {
      setError(pass.length < 6 ? t("auth.weakPass") : t("auth.badEmail"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, pass);
      } else {
        await registerWithEmail(email, pass, name.trim());
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    }
  };

  return (
    <div className="auth-screen">
      {/* Dil seçimi giriş ekranında da lazımdır — istifadəçi hesaba
          girməmişdən interfeysi öz dilinə keçirə bilsin. */}
      <div className="auth-langs" role="group" aria-label={t("acct.language")}>
        {LANGS.map((l) => (
          <button
            type="button"
            key={l.code}
            className={`auth-lang${l.code === lang ? " active" : ""}`}
            title={l.label}
            aria-pressed={l.code === lang}
            onClick={() => setLang(l.code)}
          >
            {l.short}
          </button>
        ))}
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="auth-logo">
          <img src={logoSrc} alt="" />
        </div>
        <h2 className="auth-title">
          SYNCROM<b>AI</b>
        </h2>
        <p className="auth-sub">{t("auth.sub")}</p>

        <div className={`auth-tabs${mode === "register" ? " register" : ""}`}>
          <button type="button" className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => setMode("login")}>
            {t("auth.login")}
          </button>
          <button type="button" className={`auth-tab${mode === "register" ? " active" : ""}`} onClick={() => setMode("register")}>
            {t("auth.register")}
          </button>
          <span className="auth-tab-slider" />
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <input type="text" placeholder={t("auth.name")} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="field">
            <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder={t("auth.pass")}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {mode === "login" ? t("auth.login") : t("auth.registerSubmit")}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t("auth.or")}</span>
        </div>

        <button type="button" className="auth-google" onClick={google}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
          </svg>
          <span>{t("auth.google")}</span>
        </button>

        <button type="button" className="auth-guest" onClick={onGuest}>
          {t("auth.guest")}
        </button>
      </motion.div>
    </div>
  );
}
