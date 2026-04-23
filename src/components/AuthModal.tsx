import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type Mode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  initialMode: Mode;
  onClose: () => void;
};

const googleProvider = new GoogleAuthProvider();

export function AuthModal({ open, initialMode, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  if (!open) return null;

  const onSubmit = async () => {
    const em = email.trim();
    if (!em || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, em, password);
      } else {
        await signInWithEmailAndPassword(auth, em, password);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Google login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900 p-5 shadow-2xl shadow-cyan-950/40">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Sign in</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-600 px-2.5 py-0.5 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={
              mode === "login"
                ? "rounded-lg border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-200"
                : "rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-400"
            }
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={
              mode === "register"
                ? "rounded-lg border border-cyan-500/60 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-200"
                : "rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm font-medium text-zinc-400"
            }
          >
            Register
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="mb-1 block text-sm text-zinc-400">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-2 ring-transparent transition focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label htmlFor="auth-pass" className="mb-1 block text-sm text-zinc-400">
              Password
            </label>
            <input
              id="auth-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-2 ring-transparent transition focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
          </div>
          {error ? <p className="min-h-[1.1rem] text-sm text-rose-400">{error}</p> : <div className="min-h-[1.1rem]" />}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy}
              className="rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white shadow shadow-cyan-900/30 transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {mode === "register" ? "Register" : "Login"}
            </button>
            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-50"
            >
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
