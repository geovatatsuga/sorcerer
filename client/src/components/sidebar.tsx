import { Moon } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarItem {
  href: string;
  label: string;
  src: string;
  isActive: (path: string) => boolean;
}

const items: SidebarItem[] = [
  {
    href: "/",
    label: "INÍCIO",
    src: "/front-ed-assets/icone_emblema_ativo.png",
    isActive: (loc) => loc === "/" || loc === "",
  },
  {
    href: "/chapters",
    label: "CAPÍTULOS",
    src: "/front-ed-assets/icone_runa_compasso.png",
    isActive: (loc) => loc.startsWith("/chapters"),
  },
  {
    href: "/characters",
    label: "PERSONAGENS",
    src: "/front-ed-assets/icone_personagens.png",
    isActive: (loc) => loc.startsWith("/characters"),
  },
  {
    href: "/mundo",
    label: "MUNDO",
    src: "/front-ed-assets/icone_mundo_globo.png",
    isActive: (loc) => loc.startsWith("/mundo") || loc.startsWith("/world"),
  },
  {
    href: "/codex",
    label: "CÓDEX",
    src: "/front-ed-assets/icone_codex_livro.png",
    isActive: (loc) => loc.startsWith("/codex"),
  },
  {
    href: "/blog",
    label: "DIÁRIO",
    src: "/front-ed-assets/icone_criaturas_dragao.png",
    isActive: (loc) => loc.startsWith("/blog"),
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-between fixed left-0 top-[56px] w-[68px] h-[calc(100vh-56px)] border-r border-primary/15 py-5 z-40 bg-[#03070c]/80 backdrop-blur-xl select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Decorative subtle border frame */}
      <div className="absolute inset-x-2 top-3 bottom-3 rounded-full border border-primary/20 bg-[#02070d]/60 shadow-[inset_0_0_24px_rgba(216,170,92,0.08),0_0_28px_rgba(0,0,0,0.4)] pointer-events-none" aria-hidden />
      <div className="absolute top-20 bottom-16 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/25 to-transparent pointer-events-none" aria-hidden />

      {/* Top Emblem / Home Button */}
      <Link href="/" className="relative flex items-center justify-center w-14 h-14 cursor-pointer group hover:scale-105 transition-transform">
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${location === "/" || location === "" ? "bg-primary/25 blur-lg" : "bg-primary/10 blur-md group-hover:bg-primary/20"}`} />
        <img
          src="/front-ed-assets/icone_emblema_ativo.png"
          alt="Início"
          aria-hidden
          className={`relative h-12 w-12 object-contain transition-all duration-300 ${location === "/" || location === "" ? "drop-shadow-[0_0_20px_rgba(216,170,92,0.8)] scale-105" : "opacity-80 drop-shadow-[0_0_12px_rgba(216,170,92,0.4)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_20px_rgba(216,170,92,0.7)]"}`}
        />
        <span className="absolute left-16 bg-[#050a0f] border border-primary/30 text-primary text-[9px] tracking-[0.2em] px-2.5 py-1.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 font-display whitespace-nowrap shadow-lg">INÍCIO</span>
      </Link>

      {/* Navigation items (Accompanying the user on all pages) */}
      <div className="relative flex flex-col items-center gap-6 my-auto">
        {items.map((item, index) => {
          const active = item.isActive(location);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 cursor-pointer ${active ? "scale-110" : "hover:scale-110"}`}
            >
              {/* Active ambient aura */}
              {active && (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/25 blur-md animate-pulse" />
                  <span className="absolute -left-2 w-1 h-6 rounded-r bg-primary shadow-[0_0_12px_rgba(216,170,92,0.9)]" />
                </>
              )}

              {/* Connecting diamond between items */}
              {index < items.length - 1 && (
                <span className="absolute h-1.5 w-1.5 -bottom-4 rotate-45 bg-primary/40 shadow-[0_0_8px_rgba(216,170,92,0.4)] pointer-events-none" aria-hidden />
              )}

              <img
                src={item.src}
                alt={item.label}
                aria-hidden
                className={`h-8 w-8 object-contain transition-all duration-300 ${active ? "opacity-100 drop-shadow-[0_0_18px_rgba(216,170,92,0.9)]" : "opacity-65 drop-shadow-[0_0_10px_rgba(216,170,92,0.2)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_16px_rgba(216,170,92,0.6)]"}`}
              />
              <span className={`absolute left-16 bg-[#050a0f] border text-[9px] tracking-[0.2em] px-2.5 py-1.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 font-display whitespace-nowrap shadow-lg ${active ? "border-primary text-primary font-bold" : "border-primary/25 text-primary"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom theme / scroll control */}
      <div className="relative flex flex-col items-center gap-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full text-foreground/60 hover:text-primary transition-all duration-300 hover:scale-110"
          aria-label="Voltar ao topo"
        >
          <Moon className="h-[20px] w-[20px] text-primary/70 group-hover:text-primary transition-colors duration-300" />
          <span className="absolute left-16 bg-[#050a0f] border border-primary/25 text-primary text-[9px] tracking-[0.2em] px-2.5 py-1.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 font-display whitespace-nowrap shadow-lg">TOPO</span>
        </button>
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-primary/60 rotate-45" />
          <div className="absolute w-3 h-3 rounded-full border border-primary/20" />
        </div>
      </div>
    </aside>
  );
}
