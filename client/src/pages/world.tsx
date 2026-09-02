import React from 'react';
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import type { Location } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import InteractiveWorldMap from "@/components/interactive-world-map/InteractiveWorldMap";
import { Compass, Map, Sparkles, Search, Layers, Shield } from "lucide-react";

export default function World() {
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  const [, setLocation] = useLocation();

  const { t } = useLanguage();

  const typePt = (type: string) => {
    const map: Record<string, string> = {
      kingdom: 'Reino',
      city: 'Cidade',
      capital: 'Capital',
      forest: 'Floresta',
      ruins: 'Ruínas',
      mountains: 'Montanhas',
      desert: 'Deserto',
      ocean: 'Oceano',
      plains: 'Planícies',
      other: 'Outro',
      islands: 'Ilhas',
      island: 'Ilha',
      ilha: 'Ilha',
      montanha: 'Montanha',
      montanhas: 'Montanhas',
    };
    return map[type] || type;
  };

  const themes: Record<string, { color: string; gradient: string }> = {
    luminah: { color: '#ffd28a', gradient: 'linear-gradient(135deg,#ffd28a 0%,#ffb36b 100%)' },
    akeli: { color: '#7ee7c6', gradient: 'linear-gradient(135deg,#bff6e8 0%,#56d8b0 100%)' },
    umbra: { color: '#c7b3ff', gradient: 'linear-gradient(135deg,#d7cbff 0%,#9a7bff 100%)' },
    aquario: { color: '#8fd8ff', gradient: 'linear-gradient(135deg,#cfeeff 0%,#61bfff 100%)' },
    ferros: { color: '#f0a78a', gradient: 'linear-gradient(135deg,#f6c8b8 0%,#e07a50 100%)' },
    silvanum: { color: '#9be59a', gradient: 'linear-gradient(135deg,#cff7cf 0%,#60c65f 100%)' },
  };

  const [query, setQuery] = React.useState('');
  const [activeTypeFilter, setActiveTypeFilter] = React.useState<string | null>(null);

  const matchesFilter = (l: Location) => {
    const rawSlug = (((l as any).slug) ?? '') as string;
    const computedSlug = rawSlug.trim() || (l.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slugOrId = (computedSlug || (l.id || '') as string).toString().toLowerCase();
    const title = (l.name || '').toString().toLowerCase();
    const q = query.trim().toLowerCase();
    if (q) {
      if (!slugOrId.includes(q) && !title.includes(q)) return false;
    }
    if (activeTypeFilter) {
      if ((l.type || 'other') !== activeTypeFilter) return false;
    }
    return true;
  };

  const filteredLocations = React.useMemo(() => {
    return (locations || [])
      .filter((l) => !['luminah','akeli','umbra','aquario','ferros','silvanum'].includes(((l.id || '') as string).toLowerCase()))
      .filter(matchesFilter);
  }, [locations, query, activeTypeFilter]);

  return (
    <div className="min-h-screen bg-[#02050a] text-[#e8e4d9] pl-0 xl:pl-[68px] overflow-x-hidden selection:bg-[#d8aa5c]/30 font-sans">
      <Navigation />

      <main className="pt-[58px] pb-20 px-3 sm:px-5 lg:px-8 flex flex-col items-center gap-6">
        
        {/* ════════════════════════════════════════════════════════════════
            1. HERO / CABEÇALHO DO MAPA MUNDI INTERATIVO
        ════════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-6xl mx-auto text-center mt-2 select-none">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="h-[1px] w-8 bg-[#d8aa5c]" />
            <span className="text-[11px] tracking-[0.35em] font-sans font-bold text-[#d8aa5c] uppercase">
              Cartografia & Geografia
            </span>
            <span className="h-[1px] w-8 bg-[#d8aa5c]" />
          </div>

          <h1 
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fef5e0] via-[#dfb76c] to-[#9e7a36] leading-none mb-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          >
            Mapa do Mundo
          </h1>

          <p className="text-[#cfc9b8] text-xs sm:text-[14.5px] max-w-2xl mx-auto font-medium drop-shadow mb-4 leading-relaxed">
            Navegue pelo mapa interativo de Calonia. Passe o mouse ou toque sobre as regiões, continentes e mares para revelar os territórios, rotas e segredos do mundo.
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            2. O MAPA INTERATIVO REAL (COM HOVER, ZOOM E TOOLTIPS)
        ════════════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-6xl mx-auto rounded-2xl border border-[#d8aa5c]/35 overflow-hidden bg-[#040810] shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative">
          <InteractiveWorldMap />
        </section>

        {/* ════════════════════════════════════════════════════════════════
            3. OS ECOS DA PRIMEIRA GERAÇÃO (CONTINENTES PRINCIPAIS)
        ════════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-6xl mx-auto mt-6">
          <section className="mx-auto mb-12 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Compass className="h-4 w-4 text-[#d8aa5c]" />
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#fef5e0]" style={{ textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
                Os Ecos da Primeira Geração
              </h2>
            </div>
            <p className="text-[#a39c8f] text-xs sm:text-sm max-w-2xl mx-auto mb-6">
              As massas de terra primordiais — continentes que guardam a memória e as lendas da aurora do mundo.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {['luminah','akeli','umbra','aquario','ferros','silvanum'].map((slug) => {
                const loc = locations.find((l) => ((l.id || '') as string).toLowerCase() === slug || (((l as any).slug || '') as string).toLowerCase() === slug || (l.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug);
                const title = loc?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);
                const desc = loc?.description ?? 'Território ancestral marcado pela mana e pelos ecos da grande guerra cósmica.';
                const href = `/mundo/${loc?.id ?? slug}`;
                const theme = themes[slug] ?? { color: '#ffd28a', gradient: 'linear-gradient(135deg,#ffd28a 0%,#ffb36b 100%)' };

                return (
                  <Card
                    key={slug}
                    onClick={() => {
                      try { window.dispatchEvent(new CustomEvent('continent-click', { detail: { slug, name: title } })); } catch (err) {}
                      setLocation(href);
                    }}
                    role="button"
                    tabIndex={0}
                    className="relative group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 ease-out shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-hidden border border-white/10 hover:border-[#d8aa5c]/60 rounded-2xl bg-[#040810]"
                    style={{ ['--accent' as any]: theme.color }}
                  >
                    {loc && loc.imageUrl ? (
                      <div className="relative w-full h-44 overflow-hidden rounded-t-2xl bg-black/60">
                        <img src={loc.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-b from-white/5 to-[#040810] rounded-t-2xl flex items-center justify-center">
                        <Compass className="h-10 w-10 text-white/20" />
                      </div>
                    )}
                    <CardContent className="p-5 pt-3 select-none">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ background: theme.color }} />
                          <span className="text-[10.5px] uppercase tracking-wider font-mono text-[#d8aa5c] font-bold">{slug}</span>
                        </div>
                        <span className="text-[11px] text-[#d8aa5c] font-semibold group-hover:underline">Explorar →</span>
                      </div>
                      <h3 className="font-display text-xl font-bold transition-all text-[#fef5e0] group-hover:text-[#d8aa5c] text-left">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#a39c8f] leading-relaxed line-clamp-2 text-left font-serif">
                        {desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              4. OUTROS LOCAIS & BUSCA DE REGIÕES
          ════════════════════════════════════════════════════════════════ */}
          <div className="w-full flex items-center justify-center my-8">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/4 md:w-1/3" />
            <div className="mx-4 text-xs font-bold text-[#d8aa5c] uppercase tracking-widest">Outros Locais e Reinos</div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/4 md:w-1/3" />
          </div>

          <div className="w-full mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e988a] pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, região ou reino..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#040810]/90 border border-white/10 text-xs text-white placeholder:text-[#6b665c] focus:outline-none focus:border-[#d8aa5c] focus:ring-1 focus:ring-[#d8aa5c]/40 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => { setQuery(''); setActiveTypeFilter(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !activeTypeFilter ? 'bg-[#d8aa5c]/25 text-[#fef5e0] border-[#d8aa5c]' : 'bg-[#040810]/80 text-[#9e988a] border-white/10 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                {['kingdom', 'city', 'forest', 'ruins', 'mountains'].map((typeKey) => (
                  <button
                    key={typeKey}
                    onClick={() => setActiveTypeFilter(activeTypeFilter === typeKey ? null : typeKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      activeTypeFilter === typeKey ? 'bg-[#d8aa5c]/25 text-[#fef5e0] border-[#d8aa5c]' : 'bg-[#040810]/80 text-[#9e988a] border-white/10 hover:text-white'
                    }`}
                  >
                    {typePt(typeKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLocations.map((loc) => (
                <Card
                  key={loc.id}
                  onClick={() => setLocation(`/mundo/${loc.id}`)}
                  role="button"
                  tabIndex={0}
                  className="relative group cursor-pointer transform hover:-translate-y-1 transition-all duration-200 shadow-md overflow-hidden border border-white/10 hover:border-[#d8aa5c]/50 rounded-2xl bg-[#040810]"
                >
                  {loc.imageUrl ? (
                    <img src={loc.imageUrl} alt={loc.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-white/5 flex items-center justify-center">
                      <Map className="h-8 w-8 text-white/20" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-[10.5px] text-[#d8aa5c] font-semibold uppercase mb-1">
                      <span>{typePt(loc.type || 'other')}</span>
                      <span className="group-hover:underline">Ver perfil →</span>
                    </div>
                    <h4 className="font-display text-base font-bold text-white group-hover:text-[#d8aa5c] transition-colors">{loc.name}</h4>
                    <p className="mt-1 text-xs text-[#9e988a] truncate font-serif">{loc.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
