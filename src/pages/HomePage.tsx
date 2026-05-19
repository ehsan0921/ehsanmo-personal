import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, SUPERADMIN_EMAIL } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import type { User } from "firebase/auth";

export function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [products, setProducts] = useState<Product[]>([]);

  const isAdmin = !!user?.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setAuthOpen(false);
    });
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const items: Product[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Product));
      const active = items
        .filter((x) => x.isActive !== false && (x.currentVersion?.fileUrl || x.fileUrl))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setProducts(active);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onDownload = async (item: Product) => {
    const currentVersion = item.currentVersion;
    const dlUrl = currentVersion?.fileUrl || item.fileUrl;
    if (!dlUrl) return;
    try {
      await updateDoc(doc(db, "products", item.id), {
        downloadCount: increment(1),
        lastDownloadedAt: serverTimestamp(),
      });
    } catch {
      /* best-effort */
    }
    window.open(dlUrl, "_blank", "noopener,noreferrer");
    loadProducts();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-zinc-200">
      <div className="mesh-grid pointer-events-none fixed inset-0 -z-[5] opacity-40" aria-hidden />
      <BackgroundCanvas />

      <div className="page-layer relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Header
          user={user}
          isAdmin={isAdmin}
          menuProducts={products}
          onOpenLogin={() => {
            setAuthMode("login");
            setAuthOpen(true);
          }}
          onOpenRegister={() => {
            setAuthMode("register");
            setAuthOpen(true);
          }}
          onLogout={() => signOut(auth).catch(() => undefined)}
        />

        <main>
          <section className="pt-14 text-center sm:pt-20">
            <div className="glass-dark mx-auto max-w-4xl overflow-hidden rounded-3xl p-[1px] sm:p-0.5">
              <div className="rounded-3xl bg-zinc-950/90 px-6 py-10 sm:px-10 sm:py-12">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-500/80">BIM · Grasshopper · Web</p>
                <h1
                  className="mt-4 text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl md:text-6xl"
                  style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}
                >
                  Computational design for
                  <br />
                  <span className="text-gradient">BIM, automation &amp; parametric tools</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-zinc-400 sm:text-lg">
                  High-tech workflows for algorithmic geometry, BIM production, and practical tools. Explore the platform
                  and downloadable products below.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-zinc-500">
                  {["Grasshopper 3D", "Rhino", "BIM", "Python / C#", "Web"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="mt-16">
            <div className="glass-dark rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                About
              </h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">
                I build efficient design-to-documentation systems for architecture and engineering teams. This site is
                the hub for tools, product releases, and ongoing experiments in computational design.
              </p>
            </div>
          </section>

          <section id="tools" className="mt-10">
            <div className="glass-dark rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Tools &amp; products
                </h2>
                <a
                  href="https://www.linkedin.com/in/ehsan-mokhtary/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-cyan-400/90 transition hover:text-cyan-300"
                >
                  Connect on LinkedIn →
                </a>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="/Image-Panel-perforated-designer/"
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-950/20"
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/20" />
                  <h3 className="text-lg font-semibold text-zinc-50">Perforated Panel Designer</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Upload an image, generate panel perforation, export PNG, CAD, and project settings.
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-cyan-400">
                    Open tool
                    <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
                  </div>
                </a>
                <a
                  href="/gym-records/"
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-950/20"
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl transition group-hover:bg-teal-500/20" />
                  <h3 className="text-lg font-semibold text-zinc-50">Gym Records Tracker</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Log sets, reps, and weight, session time, goals, body weight, reports, and share links.
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-teal-400">
                    Open app
                    <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
                  </div>
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {products.map((item) => {
                  const currentVersion = item.currentVersion;
                  const dlUrl = currentVersion?.fileUrl || item.fileUrl;
                  if (!dlUrl) return null;
                  const btnLabel = item.buttonLabel || "Download";
                  const dlName = currentVersion?.fileName || item.fileName;
                  const dlVersion = currentVersion?.version;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-cyan-500/25"
                    >
                      <h3 className="text-lg font-semibold text-zinc-100">{item.title || "Product"}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                        {item.description || "No description"}
                      </p>
                      <button
                        type="button"
                        onClick={() => onDownload(item)}
                        className="mt-4 w-full rounded-lg bg-cyan-600 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 sm:w-auto sm:px-4"
                      >
                        {btnLabel}
                        {dlName ? ` (${dlName})` : ""}
                        {dlVersion ? ` · ${dlVersion}` : ""}
                      </button>
                      <div className="mt-2 text-sm text-zinc-500">Downloads: {(item.downloadCount || 0).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 border-t border-zinc-800/80 py-8 text-center text-sm text-zinc-500">
          © Ehsan Mokhtary · ehsanmo.me
        </footer>
      </div>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
