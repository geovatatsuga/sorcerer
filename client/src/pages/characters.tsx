import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Sparkles, 
  Crown, 
  UserCheck, 
  Flame, 
  BookOpen, 
  Search, 
  Bookmark, 
  ArrowRight, 
  Shield, 
  Compass, 
  Leaf, 
  SlidersHorizontal, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  Scale, 
  Maximize2, 
  X
} from "lucide-react";

// Canonical characters with mature dark fantasy novel lore & high-resolution artwork
interface CharacterDisplay {
  id: string;
  slug: string;
  name: string;
  title: string;
  role: "protagonist" | "supporting" | "antagonist";
  roleLabel: string;
  faction: string;
  description: string;
  quote: string;
  chaptersCount: string;
  imageUrl: string;
  accent: {
    border: string;
    badge: string;
    tagText: string;
    iconColor: string;
  };
}

const CANONICAL_CHARACTERS: CharacterDisplay[] = [
  {
    id: "kaelus-rhys-sylvaris",
    slug: "kaelus-rhys-sylvaris",
    name: "Kaelus Rhys Sylvaris",
    title: "Herdeiro de Calonia • O Desperto",
    role: "protagonist",
    roleLabel: "PROTAGONISTA",
    faction: "Reino de Calonia",
    description: "Receptáculo da alma ancestral de Aslam Radianthe. Domina a mana primordial enquanto busca os segredos por trás de sua queda e renascimento.",
    quote: "A mana não é uma arma, é a respiração do mundo.",
    chaptersCount: "24 Capítulos",
    imageUrl: "/rotativas/ChatGPT Image 1 de jul. de 2026, 14_56_27 (5).png",
    accent: {
      border: "border-[#d8aa5c] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(216,170,92,0.35),inset_0_0_12px_rgba(216,170,92,0.1)]",
      badge: "bg-[#d8aa5c]/20 text-[#fff2d1] border-[#d8aa5c]/60 font-bold",
      tagText: "text-[#d8aa5c]",
      iconColor: "text-[#d8aa5c]",
    }
  },
  {
    id: "lady-elena-sylvaris",
    slug: "lady-elena-sylvaris",
    name: "Lady Elena Sylvaris",
    title: "Senhora da Casa Sylvaris",
    role: "protagonist",
    roleLabel: "PROTAGONISTA",
    faction: "Casa Sylvaris",
    description: "Comandante das florestas de Luminah. Nobre guerreira que rege a Casa Sylvaris com disciplina férrea, magia botânica e proteção incansável.",
    quote: "A honra desta casa foi forjada em sangue e seiva.",
    chaptersCount: "18 Capítulos",
    imageUrl: "/uploads/498f8ae2-dfdf-4aa3-bac6-b47d218eaa59.png",
    accent: {
      border: "border-white/12 hover:border-[#d8aa5c]/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.92),0_0_30px_rgba(216,170,92,0.25)]",
      badge: "bg-[#062915]/95 text-[#4ade80] border-[#4ade80]/45 font-bold",
      tagText: "text-[#4ade80]",
      iconColor: "text-[#4ade80]",
    }
  },
  {
    id: "melina-duskbane",
    slug: "melina-duskbane",
    name: "Melina Duskbane",
    title: "Chama Ruiva de Luminah",
    role: "supporting",
    roleLabel: "ALIADA",
    faction: "Liga dos Aventureiros",
    description: "Veterana de expedições proibidas. Mestre em combate com adagas incandescentes e guia fundamental nos territórios além dos portões reais.",
    quote: "Quem teme o fogo nunca descobrirá o que há nas cinzas.",
    chaptersCount: "16 Capítulos",
    imageUrl: "/uploads/45fd9964-af13-4a88-8f72-8c02f6ca583c.png",
    accent: {
      border: "border-white/12 hover:border-[#d8aa5c]/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.92),0_0_30px_rgba(216,170,92,0.25)]",
      badge: "bg-[#301c05]/95 text-[#fbbf24] border-[#fbbf24]/45 font-bold",
      tagText: "text-[#fbbf24]",
      iconColor: "text-[#fbbf24]",
    }
  },
  {
    id: "kaelan-vorthis",
    slug: "kaelan-vorthis",
    name: "Kaelan Vorthis",
    title: "Lord das Sombras do Crepúsculo",
    role: "antagonist",
    roleLabel: "ANTAGONISTA",
    faction: "Ordem do Crepúsculo",
    description: "Soberano do vazio que orquestrou a ruptura primordial da mana. Manipula as trevas cósmicas para consumir as linhagens nobres.",
    quote: "A luz é apenas uma ilusão passageira antes do silêncio.",
    chaptersCount: "14 Capítulos",
    imageUrl: "/uploads/d404a050-acae-4b3e-901e-eb71c21cb5f7.png",
    accent: {
      border: "border-white/12 hover:border-[#d8aa5c]/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.92),0_0_30px_rgba(216,170,92,0.25)]",
      badge: "bg-[#280a3a]/95 text-[#c084fc] border-[#c084fc]/45 font-bold",
      tagText: "text-[#c084fc]",
      iconColor: "text-[#c084fc]",
    }
  },
  {
    id: "kellen-aurelio",
    slug: "kellen-aurelio",
    name: "Kellen Aurelio",
    title: "Comandante de Vanguarda",
    role: "supporting",
    roleLabel: "ALIADO",
    faction: "Liga dos Aventureiros",
    description: "Guerreiro experiente em batalhas campais. Empunha a lendária lâmina rubra e lidera as tropas de defesa contra as incursões do vazio.",
    quote: "Nenhum companheiro será deixado para trás enquanto eu respirar.",
    chaptersCount: "20 Capítulos",
    imageUrl: "/uploads/9642f58a-ea14-4b24-8430-f1808644d01f.jpg",
    accent: {
      border: "border-white/12 hover:border-[#d8aa5c]/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.92),0_0_30px_rgba(216,170,92,0.25)]",
      badge: "bg-[#300a0a]/95 text-[#f87171] border-[#f87171]/45 font-bold",
      tagText: "text-[#f87171]",
      iconColor: "text-[#f87171]",
    }
  }
];

export default function Characters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inspectedCharacter, setInspectedCharacter] = useState<CharacterDisplay | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // High-end Champagne Gold / Obsidian filter chips
  const filterChips = [
    { key: "all", label: "Todos os Personagens", icon: Sparkles },
    { key: "protagonist", label: "Protagonistas", icon: Crown },
    { key: "supporting", label: "Aliados", icon: UserCheck },
    { key: "antagonist", label: "Antagonistas", icon: Flame },
    { key: "factions", label: "Casas & Facções", icon: Shield },
  ];

  const filteredCharacters = useMemo(() => {
    return CANONICAL_CHARACTERS.filter(character => {
      const name = character.name.toLowerCase();
      const title = character.title.toLowerCase();
      const desc = character.description.toLowerCase();
      const faction = character.faction.toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch = !q || name.includes(q) || title.includes(q) || desc.includes(q) || faction.includes(q);
      if (!matchesSearch) return false;

      if (selectedRole === "all") return true;
      if (selectedRole === "protagonist") return character.role === "protagonist";
      if (selectedRole === "supporting") return character.role === "supporting";
      if (selectedRole === "antagonist") return character.role === "antagonist";
      if (selectedRole === "factions") return Boolean(character.faction);

      return true;
    }).sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, selectedRole, sortBy]);

  return (
    <div className="min-h-screen bg-[#02050a] text-[#e8e4d9] pl-0 xl:pl-[68px] overflow-x-hidden relative selection:bg-[#d8aa5c]/30 font-sans">
      <Navigation />

      {/* Main Container: Tight cohesive vertical rhythm */}
      <main className="pt-[54px] pb-14 px-3 sm:px-5 lg:px-6 w-full max-w-none flex flex-col gap-2.5">
        
        {/* ════════════════════════════════════════════════════════════════
            1. HERO / BANNER PANORÂMICO WIDESCREEN CINEMATOGRÁFICO
        ════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full rounded-2xl border border-[#d8aa5c]/35 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] h-[325px] lg:h-[355px] flex items-center bg-[#03060d]">
          
          {/* Panoramic Widescreen Key Visual Layer */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Background Castelo & Céu Cósmico */}
            <img
              src="/front-ed-assets/imagem_umbra_mapa_fantasia.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[center_35%] opacity-35 filter saturate-[1.15] brightness-85"
            />
            {/* Personagem Principal Kaelus com Círculo Arcano */}
            <div className="absolute right-0 lg:right-20 xl:right-28 top-0 bottom-0 w-[68%] lg:w-[56%] h-full flex items-center justify-end overflow-visible">
              <img
                src="/rotativas/ChatGPT Image 1 de jul. de 2026, 14_56_27 (5).png"
                alt="Key Visual Kaelus Rhys Sylvaris"
                className="h-[135%] w-auto max-w-none object-contain object-center filter saturate-[1.2] contrast-[1.1] drop-shadow-[0_0_55px_rgba(56,189,248,0.5)] translate-y-3"
              />
            </div>

            {/* Vinheta Escura Suave à Esquerda para Contraste Tipográfico Nobre */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#02050a] via-[#02050a]/90 via-42% to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050a]/80 via-transparent to-[#02050a]/30 z-10" />
          </div>

          {/* Conteúdo Editorial do Hero */}
          <div className="relative z-20 w-full px-6 sm:px-10 lg:px-12 py-3 flex items-center justify-between gap-6">
            
            {/* Bloco Esquerdo: Título & Lore Nobres */}
            <div className="max-w-xl select-none">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-[1px] w-6 bg-[#d8aa5c]" />
                <span className="text-[11px] tracking-[0.35em] font-sans font-bold text-[#d8aa5c] uppercase">
                  Galeria de
                </span>
              </div>

              <h1 
                className="font-display text-4xl sm:text-5xl lg:text-[58px] font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fef5e0] via-[#dfb76c] to-[#9e7a36] leading-none mb-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                data-testid="text-characters-title"
              >
                Personagens
              </h1>

              <p className="text-[#cfc9b8] text-xs sm:text-[14.5px] leading-relaxed max-w-lg font-medium drop-shadow mb-4">
                Conheça as almas, linhagens e forças ancestrais que moldam o destino e os conflitos do reino de Calonia.
              </p>
              
              <Link 
                href="/chapters"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#d8aa5c]/45 bg-[#050a12]/90 text-[12px] font-semibold tracking-wider uppercase text-[#e8c87b] hover:bg-[#d8aa5c]/20 hover:border-[#d8aa5c] transition-all duration-300 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)] group w-fit"
              >
                <BookOpen className="h-4 w-4 text-[#d8aa5c]" />
                <span>Explorar História</span>
                <ArrowRight className="h-4 w-4 text-[#d8aa5c] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Bloco Direito: Citação do Feiticeiro em Vidro Escuro Nobre */}
            <div className="hidden xl:flex flex-col items-end max-w-[270px] select-none">
              <div className="p-4 rounded-2xl bg-[#040810]/90 border border-[#d8aa5c]/35 backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] text-right relative overflow-hidden">
                <div className="absolute top-2 left-3 text-[#d8aa5c]/35 text-3xl font-serif leading-none">“</div>
                <p className="text-[12.5px] text-[#cfc9b8] italic leading-relaxed font-serif pt-2 pr-1">
                  O passado é a chama que me guia. O futuro, a promessa que eu irei forjar.
                </p>
                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10 text-[#d8aa5c]">
                  <span className="text-[9.5px] uppercase font-bold tracking-[0.2em] text-[#d8aa5c]/80">O Primeiro Feiticeiro</span>
                  <div className="w-6 h-6 rounded-full bg-[#d8aa5c]/15 border border-[#d8aa5c]/50 flex items-center justify-center shadow-[0_0_10px_rgba(197,160,89,0.5)]">
                    <Compass className="h-3.5 w-3.5 text-[#d8aa5c]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            2. TOOLBAR HORIZONTAL AMPLIADA & ELEGANTE
        ════════════════════════════════════════════════════════════════ */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-1 py-1 select-none">
          
          {/* Chips de Filtro em Ouro Champagne & Vidro Obsidian */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-wrap">
            {filterChips.map(chip => {
              const active = selectedRole === chip.key;
              const Icon = chip.icon;
              return (
                <button
                  key={chip.key}
                  onClick={() => setSelectedRole(chip.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                    active 
                      ? "bg-[#d8aa5c]/25 text-[#fff2d1] border-[#d8aa5c] shadow-[0_0_20px_rgba(216,170,92,0.4)] scale-102 font-bold" 
                      : "bg-[#060e1a]/85 text-[#a39c8f] border-[#d8aa5c]/30 hover:border-[#d8aa5c] hover:bg-[#d8aa5c]/15 hover:text-white"
                  }`}
                  data-testid={`button-filter-${chip.key}`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#d8aa5c]" : "text-[#a39c8f]"}`} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controles da Direita com Alinhamento Premium */}
          <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto">
            
            {/* Caixa de Busca Integrada */}
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e988a] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar personagem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#040810]/90 border border-[#d8aa5c]/25 text-[12.5px] text-white placeholder:text-[#6b665c] focus:outline-none focus:border-[#d8aa5c] focus:ring-1 focus:ring-[#d8aa5c]/40 transition-all shadow-inner"
                data-testid="input-search-characters"
              />
            </div>

            {/* Ordenar */}
            <button
              onClick={() => setSortBy(prev => prev === 'name' ? 'recent' : 'name')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#040810]/90 border border-[#d8aa5c]/25 text-[12.5px] font-semibold text-[#9e988a] hover:text-white hover:border-[#d8aa5c]/50 transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#d8aa5c]" />
              <span>{sortBy === 'name' ? 'Nome A–Z' : 'Mais Recentes'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {/* Modo Grade / Lista */}
            <div className="flex items-center rounded-xl bg-[#040810]/90 border border-[#d8aa5c]/25 p-0.5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#d8aa5c]/25 text-[#d8aa5c]" : "text-[#9e988a] hover:text-white"}`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#d8aa5c]/25 text-[#d8aa5c]" : "text-[#9e988a] hover:text-white"}`}
                title="Visualização em Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            3. GALERIA DOS 5 PERSONAGENS (ULTRA-PREMIUM & NOMES PROEMINENTES)
        ════════════════════════════════════════════════════════════════ */}
        <section className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
            {filteredCharacters.map((character) => {
              const isBookmarked = savedIds.has(character.id);
              const linkHref = `/characters/${character.slug || character.id}`;

              return (
                <div
                  key={character.id}
                  className={`group relative flex flex-col justify-between h-[475px] rounded-2xl border overflow-hidden backdrop-blur-xl transition-all duration-400 ease-out hover:-translate-y-2 ${character.accent.border} bg-[#040810] shadow-[0_20px_45px_rgba(0,0,0,0.95)]`}
                  data-testid={`card-character-${character.id}`}
                >
                  {/* Retrato em Alta Resolução (Arte Dominante ~56% da Altura) */}
                  <Link href={linkHref} className="relative w-full h-[260px] overflow-hidden bg-black/80 block cursor-pointer">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-106 group-hover:brightness-108"
                      data-testid={`img-character-${character.id}`}
                    />
                    
                    {/* Gradiente Escuro Suave para Fusão Perfeita com o Corpo do Card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-[#040810]/40 to-transparent z-10 pointer-events-none" />
                  </Link>

                  {/* Botões de Ação no Topo Direito (Inspecionar & Favoritar) */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectedCharacter(character)}
                      className="p-1.5 rounded-lg border border-white/10 bg-black/60 text-[#a8a294] backdrop-blur-md hover:text-[#d8aa5c] hover:border-[#d8aa5c]/40 hover:bg-black/80 transition-all duration-200"
                      title="Inspecionar Lore Completo"
                      aria-label="Inspecionar"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => toggleBookmark(e, character.id)}
                      className={`p-1.5 rounded-lg border backdrop-blur-md transition-all duration-200 ${
                        isBookmarked 
                          ? "bg-[#d8aa5c] text-black border-[#d8aa5c] shadow-[0_0_12px_rgba(216,170,92,0.6)]" 
                          : "bg-black/60 text-[#a8a294] border-white/10 hover:text-[#d8aa5c] hover:border-[#d8aa5c]/40 hover:bg-black/80"
                      }`}
                      aria-label="Salvar"
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Informações Narrativas Editoriais da Novel */}
                  <div className="relative z-20 p-4 pt-1 flex flex-col justify-between flex-1 select-none">
                    
                    <div>
                      {/* Tag de Papel Narrativo & Capítulos */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[9.5px] font-sans font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-md border ${character.accent.badge}`}>
                          {character.roleLabel}
                        </span>

                        <span className="text-[10.5px] text-[#8e887d] font-mono tracking-wider">
                          {character.chaptersCount}
                        </span>
                      </div>

                      {/* Nome do Personagem (Serifa Nobre Proeminente) */}
                      <Link href={linkHref} className="block cursor-pointer">
                        <h2 
                          className="font-display text-[19px] font-bold text-[#fefbf6] group-hover:text-[#dfb76c] transition-colors leading-tight line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1"
                          data-testid={`text-name-${character.id}`}
                        >
                          {character.name}
                        </h2>
                      </Link>
                      
                      {/* Epíteto / Título */}
                      <p className="text-[12.5px] text-[#d8aa5c] line-clamp-1 leading-tight mt-0.5 font-medium">
                        {character.title}
                      </p>

                      {/* Casa / Facção */}
                      <div className="flex items-center gap-1.5 text-[11.5px] text-[#8e887d] mt-1.5">
                        <Shield className="h-3 w-3 text-[#d8aa5c]/80 flex-shrink-0" />
                        <span className="line-clamp-1 font-medium">{character.faction}</span>
                      </div>

                      {/* Breve Resumo Literário */}
                      <p className="text-[11.5px] text-[#9e988a] line-clamp-2 leading-relaxed mt-2 pt-2 border-t border-white/8 font-serif italic">
                        "{character.description}"
                      </p>
                    </div>

                    {/* Rodapé Editorial com Link Direto */}
                    <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between text-[11.5px] text-[#d8aa5c] font-semibold tracking-wider uppercase group-hover:text-[#fef5e0] transition-colors">
                      <span>Ler Registro</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL DE INSPEÇÃO EDITORIAL DO PERSONAGEM (QUANDO CLICADO EM ⛶)
      ════════════════════════════════════════════════════════════════ */}
      {inspectedCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#040810] border border-[#d8aa5c]/40 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.98)] overflow-hidden">
            <button
              onClick={() => setInspectedCharacter(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 border border-white/10 text-[#9e988a] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <img
                src={inspectedCharacter.imageUrl}
                alt={inspectedCharacter.name}
                className="w-40 h-56 sm:w-48 sm:h-68 rounded-xl object-cover border border-[#d8aa5c]/30 shadow-2xl flex-shrink-0"
              />
              <div className="flex flex-col gap-2 select-none">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d8aa5c]">
                  {inspectedCharacter.faction} • {inspectedCharacter.roleLabel}
                </span>
                <h2 className="font-display text-2xl font-bold text-white">
                  {inspectedCharacter.name}
                </h2>
                <p className="text-xs text-[#d8aa5c] font-medium">
                  {inspectedCharacter.title}
                </p>
                <p className="text-[12.5px] text-[#cfc9b8] leading-relaxed mt-2 font-serif">
                  {inspectedCharacter.description}
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs italic text-[#e8c87b] font-serif mt-2">
                  "{inspectedCharacter.quote}"
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                  <Link
                    href={`/characters/${inspectedCharacter.slug || inspectedCharacter.id}`}
                    className="px-5 py-2.5 rounded-xl bg-[#d8aa5c] text-black font-bold text-xs hover:bg-[#ffdf99] transition-colors"
                  >
                    Ver Perfil Completo
                  </Link>
                  <button
                    onClick={() => setInspectedCharacter(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#9e988a] hover:text-white transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
