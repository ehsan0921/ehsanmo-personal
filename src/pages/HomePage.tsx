import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, SUPERADMIN_EMAIL } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { Reveal } from "@/components/Reveal";
import type { User } from "firebase/auth";

const LINKEDIN = "https://www.linkedin.com/in/ehsan-mokhtary/";
const YOUTUBE = "https://www.youtube.com/@ehsanmokhtaryArchitect";
const EMAIL = "Ehsan0921@gmail.com";
const FOOD4RHINO = "https://www.food4rhino.com/en/app/rhinoplus";

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const ROLES = [
  {
    title: "Facade BIM Manager",
    text: "Leading BIM delivery for facade and curtain wall systems — from design coordination and panel rationalisation to fabrication-ready documentation and production data.",
    tags: ["Curtain Wall", "Panelisation", "Cast-ins & Backpans", "Shop Drawings"],
  },
  {
    title: "Computational Designer",
    text: "Algorithmic design with Rhino & Grasshopper — parametric facade systems, ETFE roof geometry, automated dimensioning and AR-ready BIM models.",
    tags: ["Rhino", "Grasshopper", "Parametric", "AR / BIM"],
  },
  {
    title: "Developer",
    text: "Building the tools behind the workflow — the RhinoPlus plug-in, Grasshopper scripts, web apps and AI-driven automation for BIM teams.",
    tags: ["C# / Python", "RhinoPlus", "Web Apps", "AI Automation"],
  },
];

const PROJECTS = [
  {
    id: "XtfDwJbAbpw",
    title: "Atlassian Project — Sydney",
    sub: "Computational design for a facade curtain wall system",
    tag: "Facade BIM",
  },
  {
    id: "FOphlK0PcCI",
    title: "SRG Global Facade",
    sub: "Algorithmic extraction of facade panel backpans",
    tag: "Computational Design",
  },
  {
    id: "KzDMJugAHxQ",
    title: "ETFE Hexagon Roof",
    sub: "Parametric geometry for a hexagonal ETFE roof",
    tag: "Parametric",
  },
  {
    id: "Lw7ydXdN-7M",
    title: "Facade Design Process in BIM",
    sub: "End-to-end facade workflow in Rhino & Grasshopper",
    tag: "Workflow",
  },
];

const VIDEOS = [
  { id: "TafuodYqCHQ", title: "Auto Dimension — Rhino Grasshopper", views: "9.8K views" },
  { id: "KzDMJugAHxQ", title: "Hexagon Roof of ETFE", views: "4K views" },
  { id: "9eFJMBZYURM", title: "Full Rhinoceros 7 Course", views: "3.4K views" },
  { id: "Lw7ydXdN-7M", title: "Facade design process in BIM by Rhino Grasshopper", views: "1.2K views" },
  { id: "HddA8nMklF8", title: "BIM or Parametric design", views: "1.2K views" },
  { id: "9mhKwyhyww8", title: "Generating CurtainWall's Cast-in by Algorithmic design", views: "970 views" },
];

const MARQUEE = [
  "Facade BIM", "Curtain Wall Systems", "Rhino 3D", "Grasshopper", "Computational Design",
  "Panel Auto-Dimensioning", "RhinoPlus", "Python", "C#", "IFC / VisualARQ",
  "Augmented Reality", "AI Automation", "Web Development", "Documentation",
];

function PlayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

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
        .filter((x) => x.isActive !== false && (x.type === "webapp" ? x.url : (x.currentVersion?.fileUrl || x.fileUrl)))
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

      {/* floating orbs */}
      <div className="pointer-events-none fixed inset-0 -z-[6] overflow-hidden" aria-hidden>
        <div className="orb left-[-10%] top-[10%] h-96 w-96 bg-cyan-500" />
        <div className="orb orb-2 right-[-8%] top-[35%] h-80 w-80 bg-teal-500" />
        <div className="orb orb-3 bottom-[5%] left-[30%] h-72 w-72 bg-violet-500" />
      </div>

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
          {/* ============ HERO ============ */}
          <section className="grid items-center gap-10 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400/80">
                Facade BIM Manager · Computational Designer · Developer
              </p>
              <h1
                className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl md:text-7xl"
                style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}
              >
                Ehsan
                <br />
                <span className="text-flow">Mokhtary</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-balance text-base text-zinc-400 sm:text-lg lg:mx-0">
                Shaping complex building facades through BIM leadership, algorithmic design and custom software —
                from curtain wall systems in Sydney to the RhinoPlus plug-in used by designers worldwide.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-900/40 transition hover:bg-cyan-400"
                >
                  Connect on LinkedIn
                </a>
                <a
                  href="#work"
                  className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/50 hover:text-white"
                >
                  View my work
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                {[
                  ["15+", "BIM & design videos"],
                  ["20+", "RhinoPlus commands"],
                  ["3", "Disciplines, one workflow"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-bold text-zinc-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {n}
                    </div>
                    <div className="text-xs text-zinc-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="portrait-ring absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-cyan-500/40 via-teal-400/20 to-violet-500/40 blur-md" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-cyan-950/40">
                <img
                  src="/ehsan-portrait.png"
                  alt="Ehsan Mokhtary — Facade BIM Manager"
                  className="aspect-[2/3] w-full object-cover object-top"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-5">
                  <p className="text-sm font-semibold text-zinc-100">Ehsan Mokhtary</p>
                  <p className="text-xs text-cyan-300/90">Facade BIM Manager · Melbourne, AU</p>
                </div>
              </div>
            </div>
          </section>

          {/* ============ MARQUEE ============ */}
          <div className="mt-16 overflow-hidden border-y border-zinc-800/80 py-3" aria-hidden>
            <div className="marquee gap-8">
              {[...MARQUEE, ...MARQUEE].map((s, i) => (
                <span key={i} className="flex items-center gap-8 text-sm font-medium text-zinc-500">
                  {s}
                  <span className="text-cyan-500/50">◆</span>
                </span>
              ))}
            </div>
          </div>

          {/* ============ ABOUT / ROLES ============ */}
          <section id="about" className="mt-20">
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-zinc-50 sm:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                One career, <span className="text-gradient">three disciplines</span>
              </h2>
              <p className="mt-5 leading-relaxed text-zinc-400">
                I work where architecture meets code. As a Facade BIM Manager I lead digital delivery of complex
                building envelopes; as a computational designer I turn geometry problems into algorithms; and as a
                developer I ship the plug-ins and apps that make it all faster.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {ROLES.map((r, i) => (
                <Reveal key={r.title} delay={i * 120}>
                  <div className="group glass-dark h-full rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-bold text-cyan-300">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-zinc-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {r.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{r.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {r.tags.map((t) => (
                        <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ FEATURED WORK ============ */}
          <section id="work" className="mt-24">
            <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-zinc-50 sm:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Featured work
                </h2>
                <p className="mt-3 max-w-xl text-zinc-400">
                  Real projects from the facade industry — designed, rationalised and documented with computational BIM.
                </p>
              </div>
              <a
                href={YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-cyan-400/90 transition hover:text-cyan-300"
              >
                Watch on YouTube →
              </a>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {PROJECTS.map((p, i) => (
                <Reveal key={p.id} delay={(i % 2) * 120}>
                  <a
                    href={yt(p.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass-dark block overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={thumb(p.id)} alt={p.title} className="zoom-img h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-zinc-950/70 px-3 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur">
                        {p.tag}
                      </span>
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-zinc-950 opacity-90 transition group-hover:scale-110">
                        <PlayIcon />
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-zinc-100">{p.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{p.sub}</p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ MOST VIEWED VIDEOS ============ */}
          <section id="videos" className="mt-24">
            <Reveal className="text-center">
              <h2 className="text-3xl font-bold text-zinc-50 sm:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Most-watched <span className="text-gradient">tutorials &amp; talks</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-zinc-400">
                Teaching the industry — the most-viewed videos from my channel on BIM, Grasshopper and automation.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.map((v, i) => (
                <Reveal key={v.id} delay={(i % 3) * 100}>
                  <a
                    href={yt(v.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass-dark flex h-full flex-col overflow-hidden rounded-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={thumb(v.id)} alt={v.title} className="zoom-img h-full w-full object-cover" loading="lazy" />
                      <span className="absolute bottom-2 right-2 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                        {v.views}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-zinc-950">
                          <PlayIcon />
                        </span>
                      </span>
                    </div>
                    <p className="flex-1 p-4 text-sm font-medium leading-snug text-zinc-200">{v.title}</p>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============ RHINOPLUS ============ */}
          <section className="mt-24">
            <Reveal>
              <div className="glass-dark relative overflow-hidden rounded-3xl p-8 sm:p-10">
                <div className="orb right-[-5%] top-[-30%] h-64 w-64 bg-cyan-500" aria-hidden />
                <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400/80">Developer highlight</p>
                    <h2 className="mt-3 text-3xl font-bold text-zinc-50 sm:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      RhinoPlus <span className="text-gradient">plug-in</span>
                    </h2>
                    <p className="mt-4 max-w-xl leading-relaxed text-zinc-400">
                      My own Rhino plug-in with 20+ productivity commands — panel auto-dimensioning with CSV export,
                      block management, barcode generation, key-value &amp; IFC parameter workflows and more. Available on
                      Food4Rhino.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={FOOD4RHINO}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                      >
                        Get it on Food4Rhino
                      </a>
                      <a
                        href={yt("8OT5qKNbCvc")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/50"
                      >
                        See it in action
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    {[
                      "PanelAutoDimension", "BlockManagementPlus", "GenerateBarcode", "ImportCSV",
                      "KeyValueToIFC", "CurveLengthFilter", "MultipleAlignedDim", "ExportByKeyValue",
                    ].map((c) => (
                      <div key={c} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-[11px]">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ============ TOOLS & PRODUCTS ============ */}
          <section id="tools" className="mt-24">
            <Reveal>
              <div className="glass-dark rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Tools &amp; products
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">Downloadable tools and web apps I have built.</p>
                  </div>
                  <a
                    href={LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-cyan-400/90 transition hover:text-cyan-300"
                  >
                    Connect on LinkedIn →
                  </a>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {products.map((item) => {
                    const isWebapp = item.type === "webapp";
                    const currentVersion = item.currentVersion;
                    const btnLabel = item.buttonLabel || (isWebapp ? "Open" : "Download");
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
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {isWebapp ? (
                            <a
                              href={item.url || "#"}
                              target={item.url?.startsWith("http") ? "_blank" : undefined}
                              rel={item.url?.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
                            >
                              {btnLabel}
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDownload(item)}
                              className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
                            >
                              {btnLabel}
                            </button>
                          )}
                          {dlVersion && (
                            <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                              {dlVersion}
                            </span>
                          )}
                          {isWebapp && (
                            <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                              Web App
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!products.length && (
                    <p className="text-sm text-zinc-500">No products listed yet — check back soon.</p>
                  )}
                </div>
              </div>
            </Reveal>
          </section>

          {/* ============ CONNECT ============ */}
          <section id="contact" className="mt-24">
            <Reveal>
              <div className="glass-dark rounded-3xl p-8 text-center sm:p-12">
                <h2 className="text-3xl font-bold text-zinc-50 sm:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Let&rsquo;s build something <span className="text-flow">extraordinary</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                  Facade BIM, computational design or custom tooling — I&rsquo;m always open to interesting projects
                  and conversations.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                  >
                    {EMAIL}
                  </a>
                  <a
                    href={LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/50"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={YOUTUBE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-500/50"
                  >
                    YouTube
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="mt-16 border-t border-zinc-800/80 py-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Ehsan Mokhtary · Facade BIM Manager · Computational Designer · Developer · ehsanmo.me
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
