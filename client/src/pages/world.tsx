import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Location } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import InteractiveWorldMap from "@/components/interactive-world-map/InteractiveWorldMap";
import ArcaneGlobe from "@/components/world-3d/ArcaneGlobe";
import {
  Compass,
  Map,
  Sparkles,
  Search,
  Layers,
  Shield,
  Globe,
  Crown,
  Zap,
  Flame,
  Wind,
  Droplets,
  Castle,
  Trees,
  Landmark,
  Anchor,
  X,
  ChevronRight,
  Crosshair,
  BookOpen,
  Filter,
  Eye,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ══════════════════════════════════════════════════════════════════════════════
// DATA STRUCTURES: CONTINENTS, FACTIONS & TERRITORIES
// ══════════════════════════════════════════════════════════════════════════════

interface ContinentMeta {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  element: string;
  color: string;
  glowColor: string;
  gradient: string;
  capital: string;
  ruler: string;
  climate: string;
  desc: string;
  imageUrl: string;
  tags: string[];
}

const CONTINENTS_DATA: ContinentMeta[] = [
  {
    id: "luminah",
    name: "Luminah",
    title: "O Berço da Centelha",
    subtitle: "Luz Primordial & Saber Ancestral",
    element: "Luz Solar & Mana Cósmica",
    color: "#f59e0b",
    glowColor: "#ffd28a",
    gradient: "from-[#ffd28a]/20 via-[#f59e0b]/10 to-transparent",
    capital: "Veyra / Fortaleza de Sylvaris",
    ruler: "Conselho dos Altos Magos & Casa Sylvaris",
    climate: "Subtropical temperado e vales iluminados",
    desc: "O zênite dourado de Calonia. Onde a primeira centelha de mana tocou o solo mortal, gerando os santuários élficos e as bibliotecas arcanas mais veneradas da história.",
    imageUrl: "/uploads/0402af7f-927c-42da-98dd-783442450450.png",
    tags: ["Reinos Humanos", "Elfos Ancestrais", "Bibliotecas Arcanas"]
  },
  {
    id: "umbra",
    name: "Umbra",
    title: "O Véu Inominado",
    subtitle: "Éter Sombrio & Penumbra Eterna",
    element: "Éter Sombrio & Gravidade",
    color: "#a855f7",
    glowColor: "#d8b4fe",
    gradient: "from-[#d8b4fe]/20 via-[#a855f7]/10 to-transparent",
    capital: "Necrópole de Kael-Mor",
    ruler: "A Ordem do Véu Silencioso",
    climate: "Frio glacial constante e névoa espessa",
    desc: "Envolto em uma bruma perpétua que filtra a luz solar. Cidadelas esculpidas em espigões de obsidiana abrigam feiticeiros que moldam as sombras como extensão da própria alma.",
    imageUrl: "/front-ed-assets/imagem_umbra_mapa_fantasia.png",
    tags: ["Feitiçaria Sombria", "Obsidiana", "Mistérios Ocultos"]
  },
  {
    id: "silvanum",
    name: "Silvanum",
    title: "O Domínio das Florestas Eternas",
    subtitle: "Mana Vegetal & Vida Primordial",
    element: "Mana Vegetal & Vida Primordial",
    color: "#10b981",
    glowColor: "#6ee7b7",
    gradient: "from-[#6ee7b7]/20 via-[#10b981]/10 to-transparent",
    capital: "Coração de Yggdras",
    ruler: "A Rainha das Mil Folhas & Dracos",
    climate: "Temperado com chuvas arcanas",
    desc: "Florestas colossais cujas copas tocam as nuvens e raízes entrelaçam montanhas inteiras. Soberania inviolável de cortes feéricas e dracos ancestrais adormecidos.",
    imageUrl: "/uploads/22ecc643-b08d-4a35-adc0-8ae2ea4965c3.png",
    tags: ["Cortes Feéricas", "Draconianos", "Bosques Vivos"]
  },
  {
    id: "ferros",
    name: "Ferros",
    title: "O Bastião da Forja e Fogo",
    subtitle: "Fogo Vulcânico & Metalurgia Rúnica",
    element: "Fogo & Metalurgia Rúnica",
    color: "#ef4444",
    glowColor: "#fca5a5",
    gradient: "from-[#fca5a5]/20 via-[#ef4444]/10 to-transparent",
    capital: "Kar-Drakor",
    ruler: "Conselho dos Mestres Forjadores",
    climate: "Árido, vulcânico e calor subterrâneo",
    desc: "Cordilheiras de basalto ardente cortadas por veios de lava incandescente. Nas entranhas da terra, forjas anãs trabalham sem cessar fundindo minérios mágicos e ligas rúnicas.",
    imageUrl: "/uploads/6ac2dc4a-4b46-42b6-8f31-bf33b2c21403.jpg",
    tags: ["Engenharia Anã", "Autômatos", "Minas Profundas"]
  },
  {
    id: "akeli",
    name: "Akeli",
    title: "O Vento das Estepes",
    subtitle: "Vento, Eletricidade & Balística Arcana",
    element: "Vento & Eletricidade",
    color: "#3b82f6",
    glowColor: "#93c5fd",
    gradient: "from-[#93c5fd]/20 via-[#3b82f6]/10 to-transparent",
    capital: "Fortaleza de Tirath",
    ruler: "Lorde Marechal de Tirath",
    climate: "Estepes temperadas e ventos contínuos",
    desc: "Terras de horizontes infinitos onde os ventos nunca cessam. Lar de povos orgulhosos com refinada tradição marcial, templos sobre colinas e pioneirismo em pólvora mágica.",
    imageUrl: "/uploads/1371ad10-977d-4204-a278-ea060eea0cb1.jpg",
    tags: ["Tirath", "Pólvora Arcana", "Cavalaria Alada"]
  },
  {
    id: "aquarius",
    name: "Aquarius",
    title: "O Mar das Marés Cósmicas",
    subtitle: "Água, Éter Líquido & Correntes Astrais",
    element: "Água & Marés Lunares",
    color: "#06b6d4",
    glowColor: "#67e8f9",
    gradient: "from-[#67e8f9]/20 via-[#06b6d4]/10 to-transparent",
    capital: "Porto das Pérolas",
    ruler: "Guilda dos Almirantes Arcanos",
    climate: "Tropical marítimo e recifes mágicos",
    desc: "Centenas de ilhas de corais fluorescentes e baías turquesas espalhadas pelo oceano austral. Centro do comércio náutico global e lar de hidromantes que comandam as marés.",
    imageUrl: "/uploads/0e7b9707-27f2-430a-b76f-f4c7b71a258d.jpg",
    tags: ["Arquipélago", "Rotas Náuticas", "Marés Lunares"]
  }
];

interface FactionLore {
  name: string;
  factionShort: string;
  continentId: string;
  continentName: string;
  insignia: string;
  philosophy: string;
  motto: string;
  ruler: string;
  stronghold: string;
  specialty: string;
  accentColor: string;
  accentBg: string;
}

const FACTIONS_DATA: FactionLore[] = [
  {
    name: "Casa Sylvaris",
    factionShort: "Sylvaris",
    continentId: "luminah",
    continentName: "Luminah",
    insignia: "☀️ Sol Dourado Alquímico",
    philosophy: "A preservação sagrada da Centelha original e a manutenção dos círculos de alta magia como escudo contra o caos cósmico.",
    motto: '"A luz não cede à escuridão; ela a redime com sabedoria."',
    ruler: "Alta Arquimaga Lysandra & Linhagem Sylvaris",
    stronghold: "Cidadela de Calonia",
    specialty: "Magia Solar Radiante, Bibliotecas Primordiais & Alquimia Nobre",
    accentColor: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)"
  },
  {
    name: "Ordem do Véu Silencioso",
    factionShort: "Ordem do Véu",
    continentId: "umbra",
    continentName: "Umbra",
    insignia: "🌘 Lua Eclipsada em Obsidiana",
    philosophy: "O verdadeiro equilíbrio repousa no que as sombras protegem. O conhecimento proibido não deve ser destruído, mas velado dos tolos.",
    motto: '"No silêncio absoluto repousa a verdade que a luz teme."',
    ruler: "O Círculo Encoberto de Kael-Mor",
    stronghold: "Necrópole de Kael-Mor",
    specialty: "Manipulação do Éter Sombrio, Gravidade & Teurgia Noturna",
    accentColor: "#a855f7",
    accentBg: "rgba(168, 85, 247, 0.12)"
  },
  {
    name: "Guardiões de Yggdras",
    factionShort: "Yggdras",
    continentId: "silvanum",
    continentName: "Silvanum",
    insignia: "🌿 Raiz Primordial & Asas de Draco",
    philosophy: "A vida vegetal e os dragões primordiais são o alicerce biológico do éter. Toda civilização que ouse desmatar sem reverência cairá sob raízes.",
    motto: '"O sangue verde pulsa eterno sob as pedras dos mortais."',
    ruler: "A Rainha das Mil Folhas & Dracos Anciãos",
    stronghold: "O Coração da Árvore Cósmica",
    specialty: "Simbiose Draconiana, Cura Botânica & Encantamento Feérico",
    accentColor: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.12)"
  },
  {
    name: "Forjadores de Kar-Drakor",
    factionShort: "Kar-Drakor",
    continentId: "ferros",
    continentName: "Ferros",
    insignia: "⚒️ Bigorna Rúnica sobre Fogo Vulcânico",
    philosophy: "A magia volátil deve ser domada em ligas de aço rúnico e mecanismos precisos. O trabalho incansável nas entranhas da rocha molda a realidade.",
    motto: '"O fogo forja a força; as runas consagram a eternidade."',
    ruler: "Conselho dos Mestres Forjadores Anões",
    stronghold: "A Grande Forja Subterrânea",
    specialty: "Metalurgia Arcana, Autômatos de Combate & Armas Rúnicas",
    accentColor: "#ef4444",
    accentBg: "rgba(239, 68, 68, 0.12)"
  },
  {
    name: "Cavalaria Celestial de Tirath",
    factionShort: "Tirath",
    continentId: "akeli",
    continentName: "Akeli",
    insignia: "⚡ Falcão Relampejante & Lança Alada",
    philosophy: "A velocidade dos ventos das estepes unida à precisão da pólvora mágica. Nenhum inimigo transporá as fronteiras enquanto as sentinelas velarem os céus.",
    motto: '"Rápidos como o relâmpago, implacáveis como o vendaval."',
    ruler: "Lorde Marechal de Tirath",
    stronghold: "Bastião das Nuvens",
    specialty: "Mosqueteiros Arcanos, Cavalaria Alada & Balística Elemental",
    accentColor: "#3b82f6",
    accentBg: "rgba(59, 130, 246, 0.12)"
  },
  {
    name: "Almirantes de Aquarius",
    factionShort: "Aquarius",
    continentId: "aquarius",
    continentName: "Aquarius",
    insignia: "🔱 Tridente de Coral & Rosa-dos-Ventos",
    philosophy: "As águas conectam todos os reinos do mundo conhecido. Quem comanda as marés lunares rege o ouro, as rotas e o destino de Calonia.",
    motto: '"As marés sobem e descem, mas nosso domínio jamais recua."',
    ruler: "Conselho Supremo do Almirantado",
    stronghold: "Porto das Pérolas",
    specialty: "Hidromancia de Alto Mar, Navegação Astral & Fragatas do Éter",
    accentColor: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.12)"
  }
];

interface CuratedTerritory {
  id: string;
  name: string;
  slug: string;
  continentId: 'luminah' | 'umbra' | 'silvanum' | 'ferros' | 'akeli' | 'aquarius';
  continentName: string;
  category: 'Reinos' | 'Cidades' | 'Fortalezas' | 'Florestas' | 'Ruínas' | 'Arquipélagos' | 'Arenas';
  ruler: string;
  capital: string;
  manaLevel: 'Primordial' | 'Alto' | 'Concentrado' | 'Volátil' | 'Estável' | 'Denso';
  climate: string;
  description: string;
  imageUrl: string;
  mapX: number;
  mapY: number;
}

const CURATED_TERRITORIES: CuratedTerritory[] = [
  {
    id: "calonia",
    name: "Reino de Calonia",
    slug: "calonia",
    continentId: "luminah",
    continentName: "Luminah",
    category: "Reinos",
    ruler: "Casa Sylvaris / Lorde Alistair",
    capital: "Fortaleza de Sylvaris",
    manaLevel: "Primordial",
    climate: "Florestas densas e vales fluviais solares",
    description: "Coração político e espiritual de Luminah. Famoso por sua nobreza imbuída em mana pura, códigos de honra inabaláveis e pela mítica fortaleza que guarda o Códice da Centelha.",
    imageUrl: "/uploads/55c9db10-d255-443f-9120-335d430196ae.png",
    mapX: 58,
    mapY: 35
  },
  {
    id: "valtoria",
    name: "Principado de Valtoria",
    slug: "valtoria",
    continentId: "luminah",
    continentName: "Luminah",
    category: "Reinos",
    ruler: "Grão-Duque Cedric de Valtoria",
    capital: "Sol-Verde",
    manaLevel: "Estável",
    climate: "Planícies férteis e campos dourados",
    description: "Vastos campos banhados por rios mágicos e colheitas abençoadas. Centro de festivais sazonais, celebrações de solstício e diplomacia aberta entre as raças de Calonia.",
    imageUrl: "/uploads/225e93aa-4d4b-4423-a140-fa9a68d9ffb8.jpg",
    mapX: 69,
    mapY: 58
  },
  {
    id: "galvia",
    name: "Porto Real de Galvia",
    slug: "galvia",
    continentId: "luminah",
    continentName: "Luminah",
    category: "Cidades",
    ruler: "Lorde Chanceler dos Portos",
    capital: "Galvia Costeira",
    manaLevel: "Alto",
    climate: "Litoral temperado com brisas marinhas",
    description: "A mais movimentada metrópole costeira de Luminah. Entrepostos de seda mágica, fundições de bronze arcano e rotas que interligam os continentes através do Mar Exterior.",
    imageUrl: "/uploads/236eed82-5948-4fc0-8de1-417825db5190.jpg",
    mapX: 33,
    mapY: 22
  },
  {
    id: "eldrida",
    name: "Eldrida, a Cidade Branca",
    slug: "eldrida",
    continentId: "luminah",
    continentName: "Luminah",
    category: "Cidades",
    ruler: "Alta Mestra Lysandra Vespera",
    capital: "Torre do Zênite",
    manaLevel: "Primordial",
    climate: "Planalto etéreo e jardins arcanos",
    description: "Sede magna da Guilda dos Magos e maior repositório de pergaminhos do mundo. Construída em mármore alvo sobre veios de mana pura que iluminam a cidade durante a noite.",
    imageUrl: "/uploads/d2cccfa2-9485-4ab4-aa94-459c41b7c8d6.png",
    mapX: 60,
    mapY: 30
  },
  {
    id: "valeron",
    name: "Bastião Mineral de Valeron",
    slug: "valeron",
    continentId: "ferros",
    continentName: "Ferros",
    category: "Cidades",
    ruler: "Barão Aurelius dos Metais",
    capital: "Cidadela dos Lingotes",
    manaLevel: "Denso",
    climate: "Desfiladeiros secos e galerias profundas",
    description: "Cidadela erguida em torno dos mais ricos filões de ouro mágico e ferro meteórico. Atrai artífices de todos os continentes para moldar armaduras blindadas contra feitiçaria.",
    imageUrl: "/uploads/6f577b17-5dc4-4dba-a736-2c79026d979b.jpg",
    mapX: 48,
    mapY: 40
  },
  {
    id: "vireth",
    name: "Agulhas de Cristal de Vireth",
    slug: "vireth",
    continentId: "luminah",
    continentName: "Luminah",
    category: "Cidades",
    ruler: "Arquimaga Gemológica Seraphina",
    capital: "Vireth Prismática",
    manaLevel: "Concentrado",
    climate: "Cavernas de geodos e escarpas rochosas",
    description: "Conhecida pela extração e refinamento de gemas de mana capazes de aprisionar feitiços inteiros. Seus artesãos lapidam os orbes utilizados pelos maiores feiticeiros de Calonia.",
    imageUrl: "/uploads/3e2635d3-28f8-4363-a6c7-ef668ad85875.png",
    mapX: 53,
    mapY: 43
  },
  {
    id: "arena-leste",
    name: "Arena Leste dos Elementos",
    slug: "arena-leste",
    continentId: "akeli",
    continentName: "Akeli",
    category: "Arenas",
    ruler: "Tribunal do Campeonato Arcano",
    capital: "Coliseu das Cinco Zonas",
    manaLevel: "Volátil",
    climate: "Convergência climática artificial",
    description: "Colosso de granito dividido em anéis de terra, fogo, água, vento e éter. Palco onde feiticeiros de todas as linhagens disputam a glória máxima no lendário Campeonato Arcano.",
    imageUrl: "/uploads/79fe1f41-22ff-4068-aa2f-a0b9a24d4712.jpg",
    mapX: 75,
    mapY: 48
  },
  {
    id: "kael-mor",
    name: "Necrópole de Kael-Mor",
    slug: "kael-mor",
    continentId: "umbra",
    continentName: "Umbra",
    category: "Fortalezas",
    ruler: "A Ordem do Véu Silencioso",
    capital: "Agulha de Obsidiana",
    manaLevel: "Denso",
    climate: "Frio ártico e penumbra perpétua",
    description: "Monumento impenetrável talhado na rocha negra de Umbra. Santuário das artes proibidas da dobra espacial e refúgio dos guardiões que contêm as entidades do vácuo cósmico.",
    imageUrl: "/front-ed-assets/imagem_umbra_mapa_fantasia.png",
    mapX: 17,
    mapY: 30
  },
  {
    id: "coracao-yggdras",
    name: "O Coração de Yggdras",
    slug: "coracao-yggdras",
    continentId: "silvanum",
    continentName: "Silvanum",
    category: "Florestas",
    ruler: "A Rainha das Mil Folhas",
    capital: "O Tronco Ancestral",
    manaLevel: "Primordial",
    climate: "Selva primordial úmida e orvalho brilhante",
    description: "Uma árvore-montanha cujas raízes bebem diretamente do núcleo mágico de Calonia. Guardada por dracos gigantes e ninfas, é o berço de onde brotam as sementes da regeneração.",
    imageUrl: "/uploads/22ecc643-b08d-4a35-adc0-8ae2ea4965c3.png",
    mapX: 37,
    mapY: 46
  },
  {
    id: "kar-drakor",
    name: "Cidadela de Kar-Drakor",
    slug: "kar-drakor",
    continentId: "ferros",
    continentName: "Ferros",
    category: "Fortalezas",
    ruler: "Conselho dos Mestres Forjadores",
    capital: "A Bigorna Central",
    manaLevel: "Concentrado",
    climate: "Vulcânico com rios de escória fervente",
    description: "Bastião inexpugnável aninhado na cratera de um supervulcão. Seus salões ressoam dia e noite com marteladas que combinam runas arcanas a armas e armaduras colossais.",
    imageUrl: "/uploads/6ac2dc4a-4b46-42b6-8f31-bf33b2c21403.jpg",
    mapX: 39,
    mapY: 78
  },
  {
    id: "fortaleza-tirath",
    name: "Bastião de Tirath",
    slug: "fortaleza-tirath",
    continentId: "akeli",
    continentName: "Akeli",
    category: "Fortalezas",
    ruler: "Lorde Marechal de Tirath",
    capital: "Tirath Alta",
    manaLevel: "Alto",
    climate: "Estepes varridas por vendavais elétricos",
    description: "A fortaleza das sentinelas do leste. Estrutura monumental construída em camadas defensivas concêntricas, armada com canhões a éter e pistas para a cavalaria hipogrifo.",
    imageUrl: "/uploads/1371ad10-977d-4204-a278-ea060eea0cb1.jpg",
    mapX: 80,
    mapY: 56
  },
  {
    id: "porto-perolas",
    name: "Porto das Pérolas de Aquarius",
    slug: "porto-perolas",
    continentId: "aquarius",
    continentName: "Aquarius",
    category: "Arquipélagos",
    ruler: "Guilda dos Almirantes Arcanos",
    capital: "Baía dos Navegadores",
    manaLevel: "Concentrado",
    climate: "Tropical marítimo e recifes luminosos",
    description: "Cidade flutuante interligada por pontes de coral vivo. Epicentro do comércio transoceânico onde marinheiros, mercadores e hidromantes negociam tesouros das profundezas.",
    imageUrl: "/uploads/0e7b9707-27f2-430a-b76f-f4c7b71a258d.jpg",
    mapX: 62,
    mapY: 66
  }
];

export default function World() {
  const { data: dbLocations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState<string>('todos');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Merge DB locations and curated feuds
  const allTerritories = useMemo(() => {
    const list: CuratedTerritory[] = [...CURATED_TERRITORIES];

    // Enrich with any extra database locations not yet present in curated list
    if (dbLocations && dbLocations.length > 0) {
      dbLocations.forEach((dbLoc) => {
        const existingIndex = list.findIndex(
          (item) => item.id.toLowerCase() === dbLoc.id.toLowerCase() ||
                    item.slug.toLowerCase() === (dbLoc.slug || '').toLowerCase()
        );

        if (existingIndex >= 0) {
          // Update imageUrl or description if DB has custom values
          if (dbLoc.imageUrl) list[existingIndex].imageUrl = dbLoc.imageUrl;
          if (dbLoc.description && dbLoc.description.length > 20) {
            list[existingIndex].description = dbLoc.description;
          }
        } else {
          // Don't include raw continent entries as cards in the feuds list
          const isContinent = ['luminah','umbra','silvanum','ferros','akeli','aquario','aquarius'].includes(
            (dbLoc.id || '').toLowerCase()
          );
          if (!isContinent) {
            list.push({
              id: dbLoc.id,
              name: dbLoc.name,
              slug: dbLoc.slug || dbLoc.id,
              continentId: (dbLoc.tags?.includes('ferros') ? 'ferros' :
                            dbLoc.tags?.includes('umbra') ? 'umbra' :
                            dbLoc.tags?.includes('silvanum') ? 'silvanum' :
                            dbLoc.tags?.includes('akeli') ? 'akeli' :
                            dbLoc.tags?.includes('aquarius') ? 'aquarius' : 'luminah') as any,
              continentName: "Luminah",
              category: "Reinos",
              ruler: "Autoridade Local",
              capital: dbLoc.name,
              manaLevel: "Concentrado",
              climate: "Temperado",
              description: dbLoc.description || "Território catalogado no atlas de Calonia.",
              imageUrl: dbLoc.imageUrl || "/uploads/55c9db10-d255-443f-9120-335d430196ae.png",
              mapX: dbLoc.mapX || 50,
              mapY: dbLoc.mapY || 50,
            });
          }
        }
      });
    }

    return list;
  }, [dbLocations]);

  // Filtered Territories logic
  const filteredTerritories = useMemo(() => {
    return allTerritories.filter((item) => {
      // Continent filter
      if (selectedContinentFilter !== 'todos' && item.continentId !== selectedContinentFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'todos') {
        const catNorm = item.category.toLowerCase();
        const filterNorm = selectedCategoryFilter.toLowerCase();
        if (!catNorm.includes(filterNorm) && !filterNorm.includes(catNorm)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchRuler = item.ruler.toLowerCase().includes(q);
        const matchCapital = item.capital.toLowerCase().includes(q);
        const matchContinent = item.continentName.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchRuler && !matchCapital && !matchContinent && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [allTerritories, selectedContinentFilter, selectedCategoryFilter, searchQuery]);

  // Focus Globe & Smooth Scroll
  const handleFocusOnGlobe = useCallback((continentId: string, locName?: string, coords?: { x: number; y: number }) => {
    if (mapMode !== '3d') {
      setMapMode('3d');
    }

    // Small delay to ensure 3D component is mounted if switched from 2D
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('focus-globe-continent', {
          detail: {
            continentId,
            slug: continentId,
            id: continentId,
            name: locName,
            mapX: coords?.x,
            mapY: coords?.y
          }
        })
      );

      const target = document.getElementById('arcane-globe-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  }, [mapMode]);

  return (
    <div className="min-h-screen bg-[#02050b] text-[#e8e4d9] pl-0 xl:pl-[68px] overflow-x-hidden selection:bg-[#d8aa5c]/30 font-sans relative">
      {/* Ambient Celestial Glow Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(216,170,92,0.12),transparent_70%)] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_90%_40%,rgba(168,85,247,0.06),transparent_65%)] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_10%_70%,rgba(6,182,212,0.05),transparent_65%)] z-0" />

      <Navigation />

      <main className="relative z-10 pt-[62px] pb-28 px-3 sm:px-6 lg:px-10 flex flex-col items-center gap-10 max-w-7xl mx-auto">
        
        {/* ════════════════════════════════════════════════════════════════════════
            1. HERO & COMMAND DECK (AAA DARK FANTASY ATLAS)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="w-full text-center mt-3 select-none flex flex-col items-center">
          
          {/* Glowing Arcane Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a1020]/90 border border-[#d8aa5c]/40 shadow-[0_0_24px_rgba(216,170,92,0.25)] mb-3.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#d8aa5c] animate-pulse" />
            <span className="text-[11px] sm:text-xs tracking-[0.35em] font-sans font-bold text-[#fef5e0] uppercase">
              ✦ CÓDEX CARTOGRÁFICO DE CALONIA ✦
            </span>
            <span className="w-2 h-2 rounded-full bg-[#d8aa5c] animate-pulse" />
          </div>

          {/* Majestic Hero Title */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#f7e0aa] to-[#c99539] leading-[1.08] mb-3.5 drop-shadow-[0_4px_30px_rgba(216,170,92,0.35)]">
            Atlas dos Feiticeiros
          </h1>

          {/* Ornate Golden Filigree Divider */}
          <div className="flex items-center justify-center gap-3 w-full max-w-md my-2.5 opacity-90">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d8aa5c] to-[#d8aa5c]/20" />
            <div className="rotate-45 w-2 h-2 bg-[#d8aa5c] shadow-[0_0_8px_#d8aa5c]" />
            <div className="rotate-45 w-3 h-3 border border-[#d8aa5c] flex items-center justify-center">
              <div className="w-1 h-1 bg-[#d8aa5c]" />
            </div>
            <div className="rotate-45 w-2 h-2 bg-[#d8aa5c] shadow-[0_0_8px_#d8aa5c]" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d8aa5c] to-[#d8aa5c]/20" />
          </div>

          {/* Atmospheric Subtitle */}
          <p className="text-[#cfc9b8] text-xs sm:text-[15.5px] max-w-3xl mx-auto font-medium leading-relaxed drop-shadow mb-8">
            Navegue pelo cosmos arcano de Calonia. Explore as rotas de mana que cruzam os seis continentes primordiais, testemunhe a rotação celeste e examine os feudos, santuários e capitais que resistem ao teste das eras.
          </p>

          {/* Live World Statistics Badge Deck (4 Metrics) */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mb-7">
            
            {/* Metric 1 */}
            <div className="group relative rounded-2xl p-4 bg-gradient-to-b from-[#091122]/90 to-[#03060f]/95 border border-[#d8aa5c]/25 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)] hover:border-[#d8aa5c]/60 hover:shadow-[0_0_24px_rgba(216,170,92,0.22)] transition-all">
              <div className="flex items-center justify-center gap-2 mb-1.5 text-[#ffd28a]">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d8aa5c]">Continentes</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-white">6 Conhecidos</div>
              <p className="text-[11px] text-[#9a9485] mt-0.5">Massas Primordiais</p>
            </div>

            {/* Metric 2 */}
            <div className="group relative rounded-2xl p-4 bg-gradient-to-b from-[#091122]/90 to-[#03060f]/95 border border-[#d8aa5c]/25 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)] hover:border-[#d8aa5c]/60 hover:shadow-[0_0_24px_rgba(216,170,92,0.22)] transition-all">
              <div className="flex items-center justify-center gap-2 mb-1.5 text-[#ffd28a]">
                <Castle className="h-4 w-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d8aa5c]">Territórios</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-white">12+ Reinos & Feudos</div>
              <p className="text-[11px] text-[#9a9485] mt-0.5">Soberanias Ativas</p>
            </div>

            {/* Metric 3 */}
            <div className="group relative rounded-2xl p-4 bg-gradient-to-b from-[#091122]/90 to-[#03060f]/95 border border-[#d8aa5c]/25 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)] hover:border-[#d8aa5c]/60 hover:shadow-[0_0_24px_rgba(216,170,92,0.22)] transition-all">
              <div className="flex items-center justify-center gap-2 mb-1.5 text-[#ffd28a]">
                <Zap className="h-4 w-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d8aa5c]">Linhas Ley</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-white">5 Rotas de Mana</div>
              <p className="text-[11px] text-[#9a9485] mt-0.5">Fluxo Harmônico</p>
            </div>

            {/* Metric 4 */}
            <div className="group relative rounded-2xl p-4 bg-gradient-to-b from-[#091122]/90 to-[#03060f]/95 border border-[#d8aa5c]/25 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)] hover:border-[#d8aa5c]/60 hover:shadow-[0_0_24px_rgba(216,170,92,0.22)] transition-all">
              <div className="flex items-center justify-center gap-2 mb-1.5 text-[#ffd28a]">
                <Flame className="h-4 w-4" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d8aa5c]">Ciclo Cósmico</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-display text-white">Era da Centelha</div>
              <p className="text-[11px] text-[#9a9485] mt-0.5">Pós-Fissura Cósmica</p>
            </div>

          </div>

          {/* Mode Switcher: Globo Arcano 3D vs Cartografia 2D */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-[#040814]/90 border border-[#d8aa5c]/35 shadow-[0_8px_32px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <button
              onClick={() => setMapMode('3d')}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 relative",
                mapMode === '3d'
                  ? "bg-gradient-to-r from-[#ffe4a0] via-[#dfb76c] to-[#a87d2f] text-black shadow-[0_0_28px_rgba(216,170,92,0.7)] scale-102 ring-1 ring-[#fff1c7]"
                  : "bg-transparent text-[#d8aa5c] hover:text-white hover:bg-white/5"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>Globo Arcano 3D</span>
              <span className={cn(
                "hidden sm:inline-block px-1.5 py-0.5 rounded text-[9.5px] font-mono",
                mapMode === '3d' ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-[#d8aa5c]"
              )}>
                Interativo
              </span>
            </button>

            <button
              onClick={() => setMapMode('2d')}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 relative",
                mapMode === '2d'
                  ? "bg-gradient-to-r from-[#ffe4a0] via-[#dfb76c] to-[#a87d2f] text-black shadow-[0_0_28px_rgba(216,170,92,0.7)] scale-102 ring-1 ring-[#fff1c7]"
                  : "bg-transparent text-[#d8aa5c] hover:text-white hover:bg-white/5"
              )}
            >
              <Map className="h-4 w-4" />
              <span>Cartografia 2D</span>
              <span className={cn(
                "hidden sm:inline-block px-1.5 py-0.5 rounded text-[9.5px] font-mono",
                mapMode === '2d' ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-[#d8aa5c]"
              )}>
                Tático
              </span>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            2. THE INTERACTIVE MAP STAGE (3D ARCANUM GLOBE OR 2D TACTICAL MAP)
        ════════════════════════════════════════════════════════════════════════ */}
        <section id="arcane-globe-section" className="w-full scroll-mt-24 transition-all">
          {mapMode === '3d' ? (
            <ArcaneGlobe />
          ) : (
            <div className="w-full rounded-3xl border border-[#d8aa5c]/40 overflow-hidden bg-[#040812] shadow-[0_25px_80px_rgba(0,0,0,0.98)] relative">
              <div className="p-3 bg-[#0a1020] border-b border-[#d8aa5c]/25 flex items-center justify-between text-xs text-[#d8aa5c] px-6 font-display font-semibold">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#ffd28a]" />
                  <span>Projeção Equirretangular Primordial de Calonia</span>
                </div>
                <span className="text-[11px] text-[#9a9485]">Pressione os marcadores para traçar as fronteiras</span>
              </div>
              <InteractiveWorldMap />
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            3. OS ECOS DA PRIMEIRA GERAÇÃO (CONTINENTES PRINCIPAIS)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="w-full mt-4 flex flex-col items-center">
          
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Compass className="h-5 w-5 text-[#d8aa5c]" />
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#fef5e0] uppercase tracking-wide">
              Os Ecos da Primeira Geração
            </h2>
          </div>
          
          <p className="text-[#a8a294] text-xs sm:text-sm max-w-2xl text-center mb-8">
            As seis massas primordiais que sustentam a trama da criação. Cada continente possui afinidade elemental pura, liderança consagrada e lendas que remontam à Aurora do Mundo.
          </p>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTINENTS_DATA.map((cont) => {
              return (
                <div
                  key={cont.id}
                  className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#091122]/90 to-[#02050e]/95 border border-white/10 hover:border-[#d8aa5c]/70 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.9)] flex flex-col justify-between"
                  style={{
                    boxShadow: `0 16px 40px rgba(0,0,0,0.9)`
                  }}
                >
                  {/* Top Image Banner */}
                  <div className="relative w-full h-48 overflow-hidden bg-black">
                    <img
                      src={cont.imageUrl}
                      alt={cont.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091122] via-[#091122]/30 to-transparent" />
                    
                    {/* Element Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border backdrop-blur-md"
                      style={{ borderColor: cont.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cont.color, boxShadow: `0 0 8px ${cont.color}` }} />
                      <span className="text-[10px] font-bold font-mono tracking-wider text-white uppercase">
                        {cont.element}
                      </span>
                    </div>

                    {/* Capital Tag */}
                    <div className="absolute bottom-2.5 right-3 text-[10.5px] font-mono text-[#d8aa5c] bg-black/60 px-2.5 py-0.5 rounded-md border border-[#d8aa5c]/25 backdrop-blur-sm">
                      🏛️ {cont.capital.split('/')[0]}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono font-bold tracking-widest uppercase mb-1" style={{ color: cont.color }}>
                        {cont.subtitle}
                      </div>

                      <h3 className="font-display text-2xl font-bold text-[#fef5e0] group-hover:text-[#ffd28a] transition-colors mb-2">
                        {cont.name}
                      </h3>

                      <p className="text-xs text-[#a8a294] leading-relaxed line-clamp-3 font-serif mb-4">
                        {cont.desc}
                      </p>

                      {/* Mini Metadata Grid */}
                      <div className="grid grid-cols-1 gap-1 text-[11px] text-[#c2bcae] border-t border-white/5 pt-3 mb-4 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-[#888173]">👑 Soberania:</span>
                          <span className="font-medium text-right text-white truncate max-w-[190px]">{cont.ruler}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#888173]">⛅ Bioma / Clima:</span>
                          <span className="font-medium text-right text-white truncate max-w-[190px]">{cont.climate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Focus on Globe + Chronicle Page */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFocusOnGlobe(cont.id, cont.name)}
                        className="flex-1 bg-black/60 border-[#d8aa5c]/40 text-[#f7e0aa] hover:bg-[#d8aa5c] hover:text-black font-display text-[11px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Crosshair className="h-3.5 w-3.5 mr-1 text-[#ffd28a] group-hover:text-black" />
                        Focar no Globo
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setLocation(`/mundo/${cont.id}`)}
                        className="flex-1 bg-[#d8aa5c]/20 hover:bg-[#d8aa5c] text-[#ffd28a] hover:text-black border border-[#d8aa5c]/40 font-display text-[11px] font-bold uppercase tracking-wider transition-all"
                      >
                        <span>Explorar</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            4. COMPÊNDIO DE TERRITÓRIOS & FEUDOS (LUXURY DARK GLASS CATALOG)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="w-full mt-10 rounded-3xl bg-gradient-to-b from-[#060c18]/95 to-[#020409]/98 border border-[#d8aa5c]/35 p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.98)] backdrop-blur-2xl relative">
          
          {/* Ornate Corner Accents */}
          <div className="absolute top-3 left-3 text-[#d8aa5c]/40 font-mono text-[10px]">❖ FEUDA-ARCHIVUM</div>
          <div className="absolute top-3 right-3 text-[#d8aa5c]/40 font-mono text-[10px]">LIBER SECUNDUS ❖</div>

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8aa5c]/10 border border-[#d8aa5c]/30 text-[#d8aa5c] text-[11px] font-bold font-mono uppercase mb-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Registro Nobiliárquico & Territorial</span>
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7e0aa] to-[#c99539] uppercase tracking-tight">
              Compêndio de Territórios & Feudos
            </h2>

            <p className="text-xs sm:text-sm text-[#b0a99a] mt-2">
              Catálogo exaustivo de cidades-fortaleza, academias arcanas, ruínas pré-colapso e territórios soberanos. Filtre por continente primordial ou categoria nobiliárquica.
            </p>
          </div>

          {/* CONTROLS: CONTINENT TABS, CATEGORY FILTER & LIVE SEARCH */}
          <div className="flex flex-col gap-5 mb-8">
            
            {/* 1. Quick Continent Filter Pills with Elemental Color Swatches */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#d8aa5c] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>Continente Primordial:</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedContinentFilter('todos')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all whitespace-nowrap",
                    selectedContinentFilter === 'todos'
                      ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.6)]"
                      : "bg-[#091122]/80 text-[#9e988a] border border-white/10 hover:text-white hover:border-white/20"
                  )}
                >
                  Todos
                </button>

                {CONTINENTS_DATA.map((c) => {
                  const isActive = selectedContinentFilter === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContinentFilter(c.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all whitespace-nowrap border",
                        isActive
                          ? "bg-black/90 text-white shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                          : "bg-[#091122]/60 text-[#a8a294] border-white/10 hover:text-white hover:border-white/20"
                      )}
                      style={{
                        borderColor: isActive ? c.color : undefined,
                        boxShadow: isActive ? `0 0 16px ${c.color}40` : undefined
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Category Filter Pills & Live Search Input */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                {['todos', 'Reinos', 'Cidades', 'Fortalezas', 'Florestas', 'Arenas', 'Arquipélagos'].map((cat) => {
                  const isActive = selectedCategoryFilter === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat.toLowerCase())}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap border",
                        isActive
                          ? "bg-[#d8aa5c]/25 border-[#d8aa5c] text-[#fef5e0] font-bold"
                          : "bg-black/40 border-white/10 text-[#8e887a] hover:text-white hover:border-white/20"
                      )}
                    >
                      {cat === 'todos' ? 'Todas Categorias' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar with Clear Button & Live Counter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9485] pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por feudo, governante, capital..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-[#6a6559] focus:outline-none focus:border-[#d8aa5c] focus:ring-1 focus:ring-[#d8aa5c]/40 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9485] hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="hidden sm:flex items-center px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-[#d8aa5c] whitespace-nowrap">
                  {filteredTerritories.length} {filteredTerritories.length === 1 ? 'resultado' : 'resultados'}
                </div>
              </div>

            </div>

          </div>

          {/* TERRITORY CARDS GRID */}
          {filteredTerritories.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-black/40 p-6">
              <Compass className="h-10 w-10 text-[#d8aa5c]/40 mb-3 animate-spin" />
              <h4 className="text-base font-bold font-display text-white">Nenhum feudo ou território sob estes filtros</h4>
              <p className="text-xs text-[#9a9485] max-w-sm mt-1 mb-4">
                Tente ajustar a busca ou limpar os filtros para visualizar os outros territórios primordiais.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedContinentFilter('todos');
                  setSelectedCategoryFilter('todos');
                  setSearchQuery('');
                }}
                className="border-[#d8aa5c]/40 text-[#ffd28a] hover:bg-[#d8aa5c] hover:text-black text-xs font-bold uppercase tracking-wider"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTerritories.map((loc) => {
                const contMeta = CONTINENTS_DATA.find((c) => c.id === loc.continentId) || CONTINENTS_DATA[0];

                return (
                  <Card
                    key={loc.id}
                    className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-[#091122]/90 via-[#040814]/95 to-[#02050e]/98 border border-white/10 hover:border-[#d8aa5c]/60 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_28px_rgba(216,170,92,0.25)] transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Location Card Image */}
                    <div className="relative w-full h-44 overflow-hidden bg-black">
                      <img
                        src={loc.imageUrl}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/30 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: contMeta.color }} />
                        <span className="text-[10px] font-mono font-bold uppercase text-[#fef5e0]">
                          {contMeta.name}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 text-[10px] font-mono font-semibold text-[#d8aa5c] bg-black/75 px-2 py-0.5 rounded border border-[#d8aa5c]/30 backdrop-blur-md">
                        {loc.category}
                      </div>
                    </div>

                    {/* Card Details */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between pt-2">
                      <div>
                        <h4 className="font-display text-xl font-bold text-[#fef5e0] group-hover:text-[#ffd28a] transition-colors leading-snug mb-2 text-left">
                          {loc.name}
                        </h4>

                        <p className="text-xs text-[#a8a294] leading-relaxed line-clamp-2 font-serif mb-4 text-left">
                          {loc.description}
                        </p>

                        {/* Nobility Metadata Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 rounded-xl p-3 border border-white/5 mb-4 text-left">
                          <div>
                            <span className="text-[#888173] block text-[9.5px] uppercase font-mono">👑 Soberano</span>
                            <span className="font-medium text-white truncate block">{loc.ruler}</span>
                          </div>
                          <div>
                            <span className="text-[#888173] block text-[9.5px] uppercase font-mono">🏛️ Capital</span>
                            <span className="font-medium text-white truncate block">{loc.capital}</span>
                          </div>
                          <div>
                            <span className="text-[#888173] block text-[9.5px] uppercase font-mono">⚡ Nível de Mana</span>
                            <span className="font-bold text-[#ffd28a] truncate block">{loc.manaLevel}</span>
                          </div>
                          <div>
                            <span className="text-[#888173] block text-[9.5px] uppercase font-mono">⛅ Clima</span>
                            <span className="font-medium text-white truncate block">{loc.climate.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Globe Focus & Chronicle */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFocusOnGlobe(loc.continentId, loc.name, { x: loc.mapX, y: loc.mapY })}
                          className="flex-1 bg-black/70 border-[#d8aa5c]/40 text-[#f7e0aa] hover:bg-[#d8aa5c] hover:text-black font-display text-[10.5px] font-bold uppercase tracking-wider transition-all"
                        >
                          <Crosshair className="h-3.5 w-3.5 mr-1 text-[#ffd28a] group-hover:text-black" />
                          Localizar no Globo
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setLocation(`/mundo/${loc.id}`)}
                          className="flex-1 bg-[#d8aa5c]/20 hover:bg-[#d8aa5c] text-[#ffd28a] hover:text-black border border-[#d8aa5c]/40 font-display text-[10.5px] font-bold uppercase tracking-wider transition-all"
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Ler Crônica
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            5. WORLD LORE & FACTION MATRIX WIDGET (AS GRANDES FORÇAS DE CALONIA)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="w-full mt-4 select-none">
          
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8aa5c]/10 border border-[#d8aa5c]/30 text-[#d8aa5c] text-[11px] font-bold font-mono uppercase mb-2">
              <Crown className="h-3.5 w-3.5" />
              <span>Geopolítica das Seis Forças</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7e0aa] to-[#c99539] uppercase tracking-tight">
              Grandes Forças & Alianças de Calonia
            </h2>

            <p className="text-xs sm:text-sm text-[#b0a99a] mt-2">
              As casas nobres, ordens de feitiçaria e guildas militares que disputam as correntes de mana e moldam as leis do mundo conhecido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACTIONS_DATA.map((faction) => {
              return (
                <div
                  key={faction.name}
                  className="rounded-2xl p-6 bg-gradient-to-b from-[#091122]/90 to-[#02050f]/95 border border-white/10 hover:border-[#d8aa5c]/60 shadow-[0_16px_40px_rgba(0,0,0,0.85)] hover:shadow-[0_0_30px_rgba(216,170,92,0.2)] transition-all flex flex-col justify-between"
                  style={{
                    borderTopColor: faction.accentColor,
                    borderTopWidth: '3px'
                  }}
                >
                  <div>
                    {/* Faction Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base sm:text-lg font-bold">{faction.insignia}</span>
                      <span
                        className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          color: faction.accentColor,
                          borderColor: `${faction.accentColor}50`,
                          backgroundColor: faction.accentBg
                        }}
                      >
                        {faction.continentName}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-1">
                      {faction.name}
                    </h3>

                    {/* Motto */}
                    <div className="text-[11.5px] italic text-[#ffd28a] font-serif mb-3 leading-relaxed">
                      {faction.motto}
                    </div>

                    {/* Philosophy */}
                    <p className="text-xs text-[#a8a294] font-serif leading-relaxed mb-4">
                      {faction.philosophy}
                    </p>

                    {/* Faction Spec Sheet */}
                    <div className="space-y-1.5 text-[11px] bg-black/40 rounded-xl p-3 border border-white/5 font-sans mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[#888173]">👑 Liderança:</span>
                        <span className="text-white font-medium text-right">{faction.ruler}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[#888173]">🏰 Bastião:</span>
                        <span className="text-[#ffd28a] font-medium text-right">{faction.stronghold}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2 border-t border-white/5 pt-1.5 mt-1.5">
                        <span className="text-[#888173]">⚔️ Poder Arcana:</span>
                        <span className="text-white font-medium text-right">{faction.specialty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Continent Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFocusOnGlobe(faction.continentId, faction.stronghold)}
                    className="w-full bg-black/50 border-[#d8aa5c]/40 text-[#f7e0aa] hover:bg-[#d8aa5c] hover:text-black font-display text-[11px] font-bold uppercase tracking-wider transition-all"
                  >
                    <Compass className="h-3.5 w-3.5 mr-1 text-[#ffd28a] group-hover:text-black" />
                    Localizar Domínio no Globo
                  </Button>
                </div>
              );
            })}
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
