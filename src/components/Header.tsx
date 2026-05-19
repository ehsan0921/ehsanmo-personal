import { useState } from "react";
import type { User } from "firebase/auth";
import type { Product } from "@/lib/types";

type HeaderProps = {
  user: User | null;
  isAdmin: boolean;
  menuProducts: Product[];
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
};

export function Header({ user, isAdmin, menuProducts, onOpenLogin, onOpenRegister, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = !!user;

  return (
    <header className="sticky top-0 z-20 mt-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-400/90">EHSAN MOKHTARY</div>
        <button
          type="button"
          className="rounded-lg border border-zinc-700 p-2 text-zinc-300 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <nav
          className={
            (menuOpen ? "flex" : "hidden") +
            " w-full flex-col gap-1 text-sm text-zinc-300 md:flex md:w-auto md:flex-row md:items-center md:gap-2"
          }
        >
          <a
            href="#about"
            className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#tools"
            className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Tools
          </a>
          <details className="relative" onClick={() => setMenuOpen(true)}>
            <summary className="list-none cursor-pointer rounded-lg px-3 py-2 text-zinc-300 transition marker:content-[''] hover:bg-zinc-800/80 hover:text-white">
              Menu
            </summary>
            <div className="right-0 z-30 mt-1 w-72 max-md:w-full max-md:static md:absolute md:rounded-xl md:border md:border-zinc-700 md:bg-zinc-900/95 md:p-2 md:shadow-xl">
              <a
                href="/Image-Panel-perforated-designer/"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
              >
                Perforated Panel Designer
              </a>
              <a href="/gym-records/" className="block rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800">
                Gym Records Tracker
              </a>
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Products
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {menuProducts.map((p) => {
                  const u = p.currentVersion?.fileUrl || p.fileUrl;
                  if (!u) return null;
                  return (
                    <a
                      key={p.id}
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg px-3 py-1.5 text-sm text-cyan-200/90 hover:bg-zinc-800"
                    >
                      {p.title || "Product"}
                    </a>
                  );
                })}
                {!menuProducts.length && (
                  <p className="px-3 py-1.5 text-xs text-zinc-500">No products listed.</p>
                )}
              </div>
            </div>
          </details>
          <a
            href="https://www.linkedin.com/in/ehsan-mokhtary/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white"
          >
            LinkedIn
          </a>
          <div className="ml-0 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-2 md:ml-1 md:border-0 md:pt-0">
            {!loggedIn && (
              <>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white shadow-cyan-900/30 transition hover:bg-cyan-500"
                >
                  Register
                </button>
              </>
            )}
            {loggedIn && (
              <a
                href="/Image-Panel-perforated-designer/"
                className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
              >
                Open tool
              </a>
            )}
            {loggedIn && isAdmin && (
              <a
                href="/admin-main/"
                className="rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
              >
                Admin
              </a>
            )}
            {loggedIn && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
