import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, SUPERADMIN_EMAIL } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { Reveal } from "@/components/Reveal";

const LINKEDIN = "https://www.linkedin.com/in/ehsan-mokhtary/";
const YOUTUBE = "https://www.youtube.com/@ehsanmokhtaryArchitect";
const FOOD4RHINO = "https://www.food4rhino.com/en/app/rhinoplus";
const EMAIL = "Ehsan0921@gmail.com";
type PortfolioProject = { id?: string; image: string; secondaryImage?: string; title: string; place: string; type: string; stat: string; link: string; source: string; order?: number };
type ThemeName = "technical" | "apple";
type MediaStory = { image: string; label: string; title: string; description: string; wide?: boolean };
type HobbyItem = { title: string; description: string; url: string; label: string };
type ThemeConfig = { heroImageUrl: string; portraitImageUrl: string; accentColor: string; heroLine1: string; heroLine2: string; heroSubtitle: string; showParticles: boolean; showFloatingPanels: boolean; mediaRail: MediaStory[]; hobbies: HobbyItem[] };
const DEFAULT_HOBBIES: HobbyItem[] = [
  { title: "Perforated Panel Designer", description: "A browser-based generative tool for exploring image-driven perforation patterns and fabrication geometry.", url: "/Image-Panel-perforated-designer/", label: "COMPUTATIONAL DESIGN" },
  { title: "Gym Records", description: "A personal training and progress tracker built as a practical experiment in product design and data ownership.", url: "/gym-records/", label: "PERSONAL BUILD" },
];
const DEFAULT_THEMES: Record<ThemeName, ThemeConfig> = {
  technical: { heroImageUrl: "/ehsan-banner-portrait.png", portraitImageUrl: "/ehsan-mokhtary-portrait.png", accentColor: "#ff5c35", heroLine1: "I make complex", heroLine2: "facades buildable.", heroSubtitle: "Facade BIM leadership for projects where geometry, coordination and information cannot fail—from clash detection and LOD strategy to fabrication-ready models and metadata.", showParticles: true, showFloatingPanels: true, mediaRail: [], hobbies: DEFAULT_HOBBIES },
  apple: { heroImageUrl: "/apple-tv-hero-2X.png", portraitImageUrl: "/Black and White no glass.jpg", accentColor: "#ff7a18", heroLine1: "Building the", heroLine2: "unbuildable.", heroSubtitle: "Facade BIM, computational design and digital delivery—where ambitious architecture becomes coordinated, controlled and real.", showParticles: false, showFloatingPanels: false, mediaRail: [
    { image: "/apple-story-beyond-model.png", label: "PROFILE", title: "Beyond the model", description: "Leadership, computation and a career built around complex façades.", wide: true },
    { image: "/apple-story-technical-human.png", label: "PERSON", title: "Technical. Human.", description: "Making digital delivery clear." },
    { image: "/bim-exploded-hero.png", label: "PROCESS", title: "Inside the façade", description: "Geometry, information and interfaces brought under control." },
    { image: "/ehsan-banner-portrait.png", label: "PERSPECTIVE", title: "Architecture meets code", description: "A connected approach to digital construction." },
  ], hobbies: DEFAULT_HOBBIES },
};
const SERVICES = [
  { no: "01", title: "Facade clash detection", text: "Federated coordination focused on curtain wall interfaces—structure, embeds, brackets, slab edges, fire-stopping and access zones.", meta: ["Model federation", "Issue ownership", "Resolution tracking"] },
  { no: "02", title: "Metadata & LOI control", text: "Information that survives handover. I define, validate and govern parameters from design intent through procurement and fabrication.", meta: ["Parameter schemas", "IFC mapping", "QA validation"] },
  { no: "03", title: "LOD modelling strategy", text: "The right geometry at the right milestone—clear modelling boundaries, progressive detail and dependable deliverables without model bloat.", meta: ["LOD matrices", "Model health", "Milestone gates"] },
  { no: "04", title: "Computational production", text: "Rhino and Grasshopper workflows that rationalise panels and automate backpans, cast-ins, dimensions, schedules and production data.", meta: ["Panelisation", "Automation", "Fabrication data"] },
];

const WORK: PortfolioProject[] = [
  { image: "/projects/atlassian-central.jpg", secondaryImage: "/projects/atlassian-central-01.jpg", title: "Atlassian Central", place: "Sydney, Australia", type: "Specialist curtain wall façade", stat: "SRG GLOBAL / CURRENT", link: "https://www.bvn.com.au/project/atlassian-central/", source: "IMAGES / BVN + PROJECT ARCHIVE" },
  { image: "/projects/new-dunedin-hospital.png", title: "New Dunedin Hospital", place: "Dunedin, New Zealand", type: "Outpatients Building façade", stat: "HEALTH / FACADE", link: "https://www.tewhatuora.govt.nz/health-services-and-programmes/infrastructure-and-investment/new-dunedin-hospital-whakatuputupu", source: "IMAGE / HEALTH NZ" },
  { image: "/projects/project-dove.jpg", title: "Project Dove", place: "53 Ord Street, Subiaco", type: "Expressive engineered façade", stat: "PERTH / COMMERCIAL", link: "https://www.linkedin.com/posts/glasss-wall-systems-india-pvt-ltd-_name-of-the-project-dove-location-perth-activity-7472978778894274562-h_-7", source: "IMAGE / GWS" },
  { image: "/projects/women-babies-hospital.png", title: "Women and Babies Hospital", place: "Murdoch, Western Australia", type: "Major healthcare façade delivery", stat: "PERTH / HEALTH", link: "https://www.webuild-group.com.au/en/media/press-notes/webuild-construction-commences-western-australias-new-women-and-babies-hospital/", source: "IMAGE / WEBUILD" },
];

const COMMANDS = ["PanelAutoDimension", "BlockManagementPlus", "ExportByKeyValue", "KeyValueToIFCParameter", "GenerateBarcode", "ImportCSV"];

export function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>(WORK);
  const [phone, setPhone] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("ehsan-theme");
    return saved === "apple" || saved === "technical" ? saved : "technical";
  });
  const [themes, setThemes] = useState<Record<ThemeName, ThemeConfig>>(DEFAULT_THEMES);
  const [activeStory, setActiveStory] = useState(0);
  const [themeResolved, setThemeResolved] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(document.readyState === "complete");
  const [introComplete, setIntroComplete] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false);
  const mediaRailRef = useRef<HTMLDivElement>(null);
  const isAdmin = !!user?.email && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); if (u) setAuthOpen(false); }), []);
  const loadProducts = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const items: Product[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Product));
      setProducts(items.filter((x) => x.isActive !== false && (x.type === "webapp" ? x.url : x.currentVersion?.fileUrl || x.fileUrl)));
    } catch { setProducts([]); }
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    getDoc(doc(db, "siteConfig", "themes")).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      const savedApple = { ...DEFAULT_THEMES.apple, ...(data.apple || {}) };
      if (savedApple.heroImageUrl === "/apple-tv-hero.png") savedApple.heroImageUrl = DEFAULT_THEMES.apple.heroImageUrl;
      savedApple.mediaRail = (savedApple.mediaRail || []).map((item) => item.title === "Beyond the model" && item.image === "/orange background.jpg" ? { ...item, image: "/apple-story-beyond-model.png" } : item.title === "Technical. Human." && item.image === "/ehsan-mokhtary-portrait-Hotizontal.png" ? { ...item, image: "/apple-story-technical-human.png" } : item);
      setThemes({ technical: { ...DEFAULT_THEMES.technical, ...(data.technical || {}) }, apple: savedApple });
      const saved = localStorage.getItem("ehsan-theme");
      setTheme(saved === "technical" || saved === "apple" ? saved : (data.activeTheme === "apple" ? "apple" : "technical"));
    }).catch(() => undefined).finally(() => setThemeResolved(true));
  }, []);
  useEffect(() => {
    if (pageLoaded) return;
    const loaded = () => setPageLoaded(true);
    window.addEventListener("load", loaded, { once: true });
    const fallback = window.setTimeout(loaded, 4000);
    return () => { window.removeEventListener("load", loaded); window.clearTimeout(fallback); };
  }, [pageLoaded]);
  useEffect(() => {
    const fallback = window.setTimeout(() => setThemeResolved(true), 4000);
    return () => window.clearTimeout(fallback);
  }, []);
  useEffect(() => {
    if (!themeResolved || !pageLoaded) return;
    const reveal = window.setTimeout(() => setIntroComplete(true), 650);
    return () => window.clearTimeout(reveal);
  }, [themeResolved, pageLoaded]);
  useEffect(() => {
    getDocs(collection(db, "portfolioProjects")).then((snap) => {
      const remote = snap.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item: any) => item.isPublished !== false && item.title && item.imageUrl)
        .map((item: any) => ({ id: item.id, image: item.imageUrl, secondaryImage: item.secondaryImageUrl || undefined, title: item.title, place: item.place || "", type: item.type || "", stat: item.stat || "PROJECT", link: item.link || "#", source: item.source || "PROJECT IMAGE", order: Number(item.order) || 0 }))
        .sort((a, b) => a.order - b.order);
      if (remote.length) setProjects(remote);
    }).catch(() => undefined);
  }, []);
  useEffect(() => {
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mx", `${(event.clientX / window.innerWidth - 0.5) * 2}`);
      document.documentElement.style.setProperty("--my", `${(event.clientY / window.innerHeight - 0.5) * 2}`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const revealPhone = () => {
    const digits = [43, 54, 49, 52, 50, 48, 54, 57, 54, 54, 51, 57];
    setPhone(String.fromCharCode(...digits));
  };
  const onDownload = async (item: Product) => {
    const url = item.currentVersion?.fileUrl || item.fileUrl;
    if (!url) return;
    try { await updateDoc(doc(db, "products", item.id), { downloadCount: increment(1), lastDownloadedAt: serverTimestamp() }); } catch { /* best effort */ }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const switchTheme = () => {
    const next: ThemeName = theme === "technical" ? "apple" : "technical";
    setThemeChanging(true);
    window.setTimeout(() => {
      setTheme(next);
      localStorage.setItem("ehsan-theme", next);
      window.setTimeout(() => setThemeChanging(false), 450);
    }, 220);
  };
  const activeTheme = themes[theme];
  const scrollStoryRail = useCallback((index: number) => {
    const rail = mediaRailRef.current;
    const target = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !target) return;
    rail.scrollTo({ left: target.offsetLeft - (rail.clientWidth - target.clientWidth) / 2, behavior: "smooth" });
  }, []);
  const showStory = useCallback((index: number) => {
    const count = activeTheme.mediaRail.length;
    if (!count) return;
    const next = (index + count) % count;
    setActiveStory(next);
    scrollStoryRail(next);
  }, [activeTheme.mediaRail.length, scrollStoryRail]);
  useEffect(() => {
    if (theme !== "apple" || activeTheme.mediaRail.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveStory((current) => {
      const next = (current + 1) % activeTheme.mediaRail.length;
      scrollStoryRail(next);
      return next;
    }), 5000);
    return () => window.clearInterval(timer);
  }, [theme, activeTheme.mediaRail.length, scrollStoryRail]);
  const hobbyKeys = new Set(activeTheme.hobbies.flatMap((item) => [item.title.toLowerCase(), item.url.toLowerCase()]));
  const additionalProducts = products.filter((item) => !hobbyKeys.has((item.title || "").toLowerCase()) && !hobbyKeys.has((item.url || "").toLowerCase()));

  return <div className={`site-shell theme-${theme} ${introComplete ? "page-ready" : "page-loading"} ${themeChanging ? "theme-changing" : ""} min-h-screen overflow-x-hidden text-[#deddd8]`} data-theme={theme} style={{ "--accent": activeTheme.accentColor, "--theme-hero": `url("${activeTheme.heroImageUrl}")` } as React.CSSProperties}>
    <div className="site-loader" role="status" aria-label="Loading portfolio" aria-hidden={introComplete}>
      <div className="loader-orbit"><i /><i /><i /><span>EM</span></div>
      <p>COORDINATING THE MODEL</p>
      <div className="loader-progress"><i /></div>
    </div>
    {activeTheme.showParticles && <BackgroundCanvas />}
    <button type="button" className="theme-switch" onClick={switchTheme} aria-label={`Switch to ${theme === "technical" ? "Apple TV" : "technical"} theme`}><span>{theme === "technical" ? "APPLE TV" : "TECHNICAL"}</span><i><b /></i></button>
    <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-7 lg:px-10">
      <Header user={user} isAdmin={isAdmin} menuProducts={products} onOpenLogin={() => { setAuthMode("login"); setAuthOpen(true); }} onOpenRegister={() => { setAuthMode("register"); setAuthOpen(true); }} onLogout={() => signOut(auth).catch(() => undefined)} />

      <main>
        <section className="hero-grid relative min-h-[820px] overflow-hidden border-x border-white/10 px-5 pb-16 pt-20 sm:px-10 lg:px-16 lg:pt-28">
          <div className="hero-image absolute inset-0" aria-hidden />
          <div className="hero-scan absolute inset-0" aria-hidden />
          {activeTheme.showFloatingPanels && <><div className="hero-float hero-float-a" aria-hidden><span>CLASH / 014</span><b>RESOLVED</b></div><div className="hero-float hero-float-b" aria-hidden><span>MODEL STATE</span><b>FEDERATED</b></div><div className="hero-float hero-float-c" aria-hidden><span>LOD</span><b>350</b></div></>}
          <div className="relative z-10 max-w-4xl">
            <p className="eyebrow"><span className="status-dot" /> MELBOURNE / AUSTRALIA — AVAILABLE FOR BIM CONSULTING</p>
            <h1 className="hero-title mt-8">{activeTheme.heroLine1}<br /><span>{activeTheme.heroLine2}</span></h1>
            <p className="hero-subtitle mt-8 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">{activeTheme.heroSubtitle}</p>
            <a className="current-company" href="https://srgglobal.com.au/" target="_blank" rel="noreferrer"><span>CURRENTLY AT</span><span className="company-logo-wrap"><img src="/srg-global-logo.svg" alt="SRG Global" /></span><b>FACADE BIM MANAGER</b></a>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#services" className="button-primary">Explore BIM services <span>↘</span></a>
              <a href={`mailto:${EMAIL}`} className="button-ghost">Discuss a project</a>
            </div>
          </div>
          <div className="hero-data absolute bottom-7 left-5 right-5 z-10 grid grid-cols-2 border-t border-white/15 pt-5 sm:left-10 sm:right-10 lg:left-16 lg:right-16 lg:grid-cols-4">
            {[['15+', 'YEARS IN AEC'], ['20+', 'RHINOPLUS COMMANDS'], ['LOD 100–500', 'MODEL GOVERNANCE'], ['01', 'CONNECTED WORKFLOW']].map(([a,b]) => <div key={b} className="border-l border-white/15 px-4 first:border-0 first:pl-0"><strong>{a}</strong><span>{b}</span></div>)}
          </div>
        </section>

        <section className="apple-showcase" aria-label="Featured visual stories">
          <div className="apple-rail-heading"><div><span>FEATURED</span><h2>Stories in design.</h2></div><div className="apple-rail-actions"><p>Explore the person, process and projects behind the models.</p><nav aria-label="Featured story controls"><button type="button" onClick={() => showStory(activeStory - 1)} aria-label="Previous story">←</button><span>{String(activeStory + 1).padStart(2, "0")} / {String(activeTheme.mediaRail.length).padStart(2, "0")}</span><button type="button" onClick={() => showStory(activeStory + 1)} aria-label="Next story">→</button></nav></div></div>
          <div className="apple-rail-window">
            <button className="apple-horizontal-button is-left" type="button" onClick={() => showStory(activeStory - 1)} aria-label="Scroll featured stories left">←</button>
            <div className="apple-media-rail" ref={mediaRailRef}>
              {activeTheme.mediaRail.map((item, index) => <article className={`apple-media-card ${item.wide ? "apple-media-wide" : ""}`} key={`${item.title}-${index}`}><img src={item.image} alt={item.title} /><div><span>{item.label}</span><h3>{item.title}</h3><p>{item.description}</p></div></article>)}
            </div>
            <button className="apple-horizontal-button is-right" type="button" onClick={() => showStory(activeStory + 1)} aria-label="Scroll featured stories right">→</button>
          </div>
        </section>

        <section className="statement border-x border-b border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-36">
          <Reveal><p className="section-index">00 / POSITION</p><h2 className="max-w-6xl">BIM is not a model.<br /><span>It is a controlled decision system.</span></h2><div className="mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-3"><p className="text-white/45">EHSAN MOKHTARY<br />Facade BIM Manager<br />Computational Designer</p><p className="text-lg leading-relaxed text-white/70 md:col-span-2">I connect design intent to fabrication reality. My work brings geometry, information and project teams into one governed workflow—then uses computation to remove repetition, expose risk early and make every handover more reliable.</p></div></Reveal>
        </section>

        <section className="identity-zone border-x border-b border-white/10">
          <Reveal className="identity-photo"><img src={activeTheme.portraitImageUrl} alt="Ehsan Mokhtary, Facade BIM Manager" loading="lazy" /><div className="portrait-reticle" aria-hidden /><span className="portrait-code">EM / PROFILE_01</span></Reveal>
          <Reveal className="identity-copy" delay={120}><p className="section-index">PERSON BEHIND THE MODEL</p><h2>Technical precision.<br /><span>Human leadership.</span></h2><p>I lead teams through complex digital delivery with a practical focus: make responsibilities clear, make information dependable and make the façade buildable.</p><dl><div><dt>ROLE</dt><dd>Facade BIM Manager</dd></div><div><dt>BASE</dt><dd>Melbourne, Australia</dd></div><div><dt>FOCUS</dt><dd>Facade systems + computation</dd></div></dl></Reveal>
        </section>

        <section id="services" className="border-x border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <Reveal><div className="section-head"><div><p className="section-index">01 / CORE SERVICES</p><h2>Digital control for<br />the building envelope.</h2></div><p>Specialist BIM services built around the interfaces where façade projects carry the most risk.</p></div></Reveal>
          <div className="mt-16 border-t border-white/15">
            {SERVICES.map((s, i) => <Reveal key={s.no} delay={i * 70}><article className="service-row group"><span className="service-no">{s.no}</span><h3>{s.title}</h3><p>{s.text}</p><div className="service-tags">{s.meta.map(x => <span key={x}>{x}</span>)}</div><span className="service-arrow">↗</span></article></Reveal>)}
          </div>
        </section>

        <section className="model-zone relative overflow-hidden border border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="model-lines" aria-hidden><i /><i /><i /><i /><b className="clash clash-a" /><b className="clash clash-b" /></div>
          <Reveal className="relative z-10 max-w-xl"><p className="section-index">02 / COORDINATION LOGIC</p><h2>See the conflict.<br />Own the resolution.</h2><p className="mt-6 text-lg leading-relaxed text-white/60">Clash detection only creates value when it is filtered, assigned and closed. I structure coordination around buildable façade interfaces—not software screenshots or inflated clash counts.</p><div className="mt-10 grid grid-cols-3 gap-2 text-center">{[['A','FEDERATE'],['B','RESOLVE'],['C','VERIFY']].map(x=><div className="metric" key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div></Reveal>
        </section>

        <section id="work" className="border-x border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <Reveal><div className="section-head"><div><p className="section-index">03 / SELECTED WORK</p><h2>Proof in the model.</h2></div><a href={YOUTUBE} target="_blank" rel="noreferrer">VIEW ALL CASE STUDIES ↗</a></div></Reveal>
          <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-2">
            {projects.map((w, i) => <Reveal key={w.id || w.title} delay={(i%2)*90}><a href={w.link} target="_blank" rel="noreferrer" className="project-card group"><div className={`project-image ${w.secondaryImage ? "project-image-dual" : ""}`}><img src={w.image} alt={w.title} />{w.secondaryImage && <img className="project-image-alt" src={w.secondaryImage} alt={`${w.title} alternate view`} />}<span>{w.stat}</span>{w.secondaryImage && <em>02 VIEWS</em>}<i>VIEW PROJECT ↗</i></div><div className="project-copy"><span>{String(i+1).padStart(2,"0")}</span><div><h3>{w.title}</h3><p>{w.place} — {w.type}</p><small>{w.source}</small></div></div></a></Reveal>)}
          </div>
        </section>

        <section id="experience" className="experience-grid border border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <Reveal><p className="section-index">04 / EXPERIENCE</p><h2>15 years across<br />architecture, facades<br />and digital delivery.</h2><p className="mt-8 max-w-lg leading-relaxed text-white/55">From façade engineering and BIM modelling to computational leadership—experience shaped across Iran, Malaysia and Australia.</p><a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-link mt-8 inline-block">FULL LINKEDIN PROFILE ↗</a></Reveal>
          <Reveal delay={120}><div className="timeline">
            <div><time>2021—NOW</time><h3>Facade BIM Manager</h3><p>SRG Global · Melbourne</p></div>
            <div><time>MAR 2020—JUL 2021 · 1 YR 5 MOS</time><h3>Facade BIM Manager & Computational Designer</h3><p>Euro Facade Tech · Full-time · Malaysia</p></div>
            <div><time>2018—2020</time><h3>BIM / Architectural Management</h3><p>VR-CAM Technologies & ADAS</p></div>
            <div><time>2014—2018</time><h3>Facade engineering & simulation</h3><p>Alumglass Facade Consultancy</p></div>
            <div><time>2018—2020</time><h3>Master of Architecture</h3><p>Universiti Putra Malaysia</p></div>
          </div></Reveal>
        </section>

        <section className="rhino-zone border-x border-white/10 px-5 py-24 sm:px-10 lg:px-16 lg:py-32">
          <Reveal><p className="section-index">05 / BUILT, NOT BOUGHT</p><div className="mt-5 grid gap-12 lg:grid-cols-2"><div><h2>RhinoPlus.</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">A production toolkit I designed and shipped for Rhino—turning repeated modelling and information tasks into reliable commands.</p><a href={FOOD4RHINO} target="_blank" rel="noreferrer" className="button-primary mt-8 inline-flex">Explore the plug-in ↗</a></div><div className="command-list">{COMMANDS.map((c,i)=><div key={c}><span>CMD_{String(i+1).padStart(2,'0')}</span><code>{c}</code><b>READY</b></div>)}</div></div></Reveal>
        </section>

        <section id="tools" className="border-x border-white/10 px-5 py-24 sm:px-10 lg:px-16"><div className="section-head"><div><p className="section-index">06 / HOBBIES &amp; DEVELOPMENTS</p><h2>Things I build<br />to explore ideas.</h2></div><p>Personal experiments, computational design tools and useful products developed beyond day-to-day façade delivery.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2">{activeTheme.hobbies.map((item,index)=><article className="product-card" key={`${item.title}-${index}`}><span className="product-label">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p><a href={item.url}>EXPLORE PROJECT ↗</a></article>)}{additionalProducts.map(item=><article className="product-card" key={item.id}><span className="product-label">INDEPENDENT DEVELOPMENT</span><h3>{item.title}</h3><p>{item.description}</p>{item.type === 'webapp' ? <a href={item.url}>OPEN PROJECT ↗</a> : <button onClick={()=>onDownload(item)}>DOWNLOAD ↘</button>}</article>)}</div></section>

        <section id="contact" className="contact-zone border border-white/10 px-5 py-24 text-center sm:px-10 lg:px-16 lg:py-40"><Reveal><p className="section-index">HAVE A COMPLEX FACADE?</p><h2>Let’s make it<br /><span>clear, coordinated, buildable.</span></h2><div className="mt-10 flex flex-wrap justify-center gap-3"><a className="button-primary" href={`mailto:${EMAIL}`}>Start a conversation ↗</a>{phone ? <a className="button-ghost phone-revealed" href={`tel:${phone}`}>{phone} <span>CALL ↗</span></a> : <button className="button-ghost" type="button" onClick={revealPhone}>Reveal phone <span>CLICK ↗</span></button>}<a className="button-ghost" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a></div><p className="phone-note">Phone number is protected and only loaded after you click.</p></Reveal></section>
      </main>
      <footer className="flex flex-col gap-4 border-x border-white/10 px-6 py-8 text-[11px] tracking-[.16em] text-white/35 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} EHSAN MOKHTARY</span><span>FACADE BIM / COMPUTATION / DELIVERY</span><span>MELBOURNE, AU</span></footer>
    </div>
    <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
  </div>;
}
