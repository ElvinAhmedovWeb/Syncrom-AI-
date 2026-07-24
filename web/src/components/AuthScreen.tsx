import { useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";
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
      setError(pass.length < 6 ? "Şifrə çox zəifdir (ən azı 6 simvol)." : "E-poçt ünvanı düzgün deyil.");
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
        <p className="auth-sub">Davam etmək üçün hesabına daxil ol</p>

        <div className={`auth-tabs${mode === "register" ? " register" : ""}`}>
          <button type="button" className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => setMode("login")}>
            Daxil ol
          </button>
          <button type="button" className={`auth-tab${mode === "register" ? " active" : ""}`} onClick={() => setMode("register")}>
            Qeydiyyat
          </button>
          <span className="auth-tab-slider" />
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <input type="text" placeholder="Adın" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="field">
            <input type="email" placeholder="E-poçt" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Şifrə (ən azı 6 simvol)"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {mode === "login" ? "Daxil ol" : "Qeydiyyatdan keç"}
          </button>
        </form>

        <div className="auth-divider">
          <span>və ya</span>
        </div>

        <button type="button" className="auth-google" onClick={google}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
          </svg>
          <span>Google ilə davam et</span>
        </button>

        <button type="button" className="auth-guest" onClick={onGuest}>
          Qonaq kimi davam et →
        </button>
      </motion.div>
    </div>
  );
}
