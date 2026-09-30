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
  Info,
  Plane,
  Route,
  Clock,
  ArrowRight,
  Radio,
  Navigation as NavIcon
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

interface StoryJourneyStop {
  chapterNum: string;
  chapterTitle: string;
  locationName: string;
  continentId: string;
  continentName: string;
  coords: { x: number; y: number };
  slug: string;
  synopsis: string;
  element: string;
  color: string;
  badge: string;
}

const STORY_JOURNEY: StoryJourneyStop[] = [
  {
    chapterNum: "Capítulo 1",
    chapterTitle: "O Despertar da Centelha",
    locationName: "Academia Arcana de Veyra",
    continentId: "luminah",
    continentName: "Luminah",
    coords: { x: 38, y: 35 },
    slug: "arco-1-o-limiar-capitulo-1-prologo",
    synopsis: "O ponto de partida do protagonista. Onde a centelha proibida de mana ressoa entre as torres douradas da capital.",
    element: "Luz Solar",
    color: "#f59e0b",
    badge: "Início da Jornada"
  },
  {
    chapterNum: "Capítulos 2 & 3",
    chapterTitle: "Sob as Cinzas do Passado",
    locationName: "Necrópole de Kael-Mor",
    continentId: "umbra",
    continentName: "Umbra",
    coords: { x: 68, y: 32 },
    slug: "arco-1-o-limiar-capitulo-2-cinzas-do-passado",
    synopsis: "Incursão ao domínio perpétuo da penumbra. Antigos rituais de éter sombrio e a busca por respostas seladas em obsidiana.",
    element: "Penumbra Eterna",
    color: "#a855f7",
    badge: "Fronteira Oculta"
  },
  {
    chapterNum: "Capítulo 4",
    chapterTitle: "Ecos do Passado & Bosques Vivos",
    locationName: "Coração de Yggdras",
    continentId: "silvanum",
    continentName: "Silvanum",
    coords: { x: 26, y: 56 },
    slug: "arco-1-o-limiar-capitulo-4-ecos-do-passado",
    synopsis: "O refúgio na floresta titânica. Pactos com as Cortes Feéricas e o despertar das raízes dracônicas adormecidas.",
    element: "Mana Vegetal",
    color: "#10b981",
    badge: "Domínio Selvagem"
  },
  {
    chapterNum: "Capítulo 5",
    chapterTitle: "Tirath — A Marcha dos Ventos",
    locationName: "Fortaleza de Tirath",
    continentId: "akeli",
    continentName: "Akeli",
    coords: { x: 80, y: 62 },
    slug: "arco-1-o-limiar-capitulo-5-tirath",
    synopsis: "As estepes infinitas sob o fogo da artilharia rúnica e os cavaleiros que domam as correntes dos céus abertos.",
    element: "Vento & Eletricidade",
    color: "#3b82f6",
    badge: "Clímax do Arco 1"
  },
  {
    chapterNum: "Próximos Arcos",
    chapterTitle: "A Grande Forja & O Mar Cósmico",
    locationName: "Kar-Drakor & Aquarius",
    continentId: "ferros",
    continentName: "Ferros & Aquarius",
    coords: { x: 48, y: 78 },
    slug: "mundo",
    synopsis: "Os mistérios que aguardam os feiticeiros nas profundezas vulcânicas de Kar-Drakor e no arquipélago das marés celestes.",
    element: "Fogo & Marés",
    color: "#ef4444",
    badge: "Expansão Futura"
  }
];

interface LeyConduit {
  id: string;
  name: string;
  source: string;
  destination: string;
  sourceId: string;
  destinationId: string;
  sourceCoords: { x: number; y: number };
  destCoords: { x: number; y: number };
  flowType: string;
  stability: number;
  travelTime: string;
  hazards: string;
  color: string;
}

const LEY_CONDUITS: LeyConduit[] = [
  {
    id: "ley-1",
    name: "Canal Celeste Veyra ⇄ Tirath",
    source: "Luminah (Veyra)",
    destination: "Akeli (Tirath)",
    sourceId: "luminah",
    destinationId: "akeli",
    sourceCoords: { x: 38, y: 35 },
    destCoords: { x: 80, y: 62 },
    flowType: "Corrente Eólica & Mana Solar",
    stability: 98,
    travelTime: "Instantâneo (Distorção Aérea)",
    hazards: "Flutuação barométrica e ventos cortantes",
    color: "#f59e0b"
  },
  {
    id: "ley-2",
    name: "Caminho Esmeralda Luminah ⇄ Yggdras",
    source: "Luminah (Bastiões)",
    destination: "Silvanum (Coração de Yggdras)",
    sourceId: "luminah",
    destinationId: "silvanum",
    sourceCoords: { x: 38, y: 35 },
    destCoords: { x: 26, y: 56 },
    flowType: "Simbiose Bio-Arcana de Raízes",
    stability: 94,
    travelTime: "Instantâneo (Túnel Arbóreo)",
    hazards: "Esporos mágicos de transe e desorientação",
    color: "#10b981"
  },
  {
    id: "ley-3",
    name: "Fenda Crepuscular Silvanum ⇄ Kael-Mor",
    source: "Silvanum (Orla)",
    destination: "Umbra (Necrópole)",
    sourceId: "silvanum",
    destinationId: "umbra",
    sourceCoords: { x: 26, y: 56 },
    destCoords: { x: 68, y: 32 },
    flowType: "Fissura de Gravidade & Éter Noturno",
    stability: 79,
    travelTime: "Transição Sombria (Fase de Penumbra)",
    hazards: "Distorção temporal e eco de memórias antigas",
    color: "#a855f7"
  },
  {
    id: "ley-4",
    name: "Conduto Vulcânico Kar-Drakor ⇄ Aquarius",
    source: "Ferros (Kar-Drakor)",
    destination: "Aquarius (Abismo Austral)",
    sourceId: "ferros",
    destinationId: "aquarius",
    sourceCoords: { x: 48, y: 78 },
    destCoords: { x: 62, y: 66 },
    flowType: "Tubo Termo-Cinético Submarino",
    stability: 87,
    travelTime: "Propulsão Hidro-Ígnea",
    hazards: "Vapor superaquecido e pressão abissal",
    color: "#ef4444"
  },
  {
    id: "ley-5",
    name: "Corrente dos Almirantes Luminah ⇄ Porto das Pérolas",
    source: "Luminah (Litoral)",
    destination: "Aquarius (Porto das Pérolas)",
    sourceId: "luminah",
    destinationId: "aquarius",
    sourceCoords: { x: 38, y: 35 },
    destCoords: { x: 62, y: 66 },
    flowType: "Rota Marítima de Marés Astrais",
    stability: 99,
    travelTime: "Navegação Acelerada por Éter Líquido",
    hazards: "Nenhum — Rota civil mais segura do globo",
    color: "#06b6d4"
  }
];

export default function World() {
  const { data: dbLocations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [activeTravelTab, setActiveTravelTab] = useState<'destinos' | 'novel' | 'ley'>('destinos');
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
            3. CONSOLE DE EXPEDIÇÃO & VIAGEM DE CALONIA (INTERACTIVE TRAVEL HUB)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="w-full mt-2 rounded-3xl bg-gradient-to-b from-[#060c18]/95 via-[#03060f]/98 to-[#010308]/99 border border-[#d8aa5c]/35 p-5 sm:p-7 lg:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.98)] backdrop-blur-2xl relative">
          
          {/* Ornate Corner Accents */}
          <div className="absolute top-3.5 left-4 text-[#d8aa5c]/40 font-mono text-[10.5px] flex items-center gap-1.5">
            <Radio className="h-3 w-3 animate-pulse text-[#d8aa5c]" />
            <span>TERMINAL DE VIAGEM & CARTOGRAFIA</span>
          </div>
          <div className="absolute top-3.5 right-4 text-[#d8aa5c]/40 font-mono text-[10.5px] hidden sm:block">
            SISTEMA ARC-ATLAS v2.5 ❖
          </div>

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mt-3 mb-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d8aa5c]/10 border border-[#d8aa5c]/30 text-[#d8aa5c] text-[11px] font-bold font-mono uppercase mb-2">
              <Compass className="h-3.5 w-3.5 text-[#ffd28a] animate-spin-slow" />
              <span>Navegação & Expedição Interativa</span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f7e0aa] to-[#c99539] uppercase tracking-tight">
              Console de Viagem pelo Mundo
            </h2>

            <p className="text-xs sm:text-sm text-[#b0a99a] mt-2 leading-relaxed">
              Viaje diretamente até qualquer quadrante do globo arcano. Acompanhe a rota dos capítulos da novel no mapa ou examine o fluxo de mana das Linhas Ley.
            </p>
          </div>

          {/* MAIN TRAVEL TABS CONTROLLER */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-black/70 border border-[#d8aa5c]/30 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.9)]">
              
              {/* Tab 1: Destinos Primordiais */}
              <button
                onClick={() => setActiveTravelTab('destinos')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200",
                  activeTravelTab === 'destinos'
                    ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.6)] font-extrabold"
                    : "text-[#a8a294] hover:text-white hover:bg-white/5"
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Destinos Primordiais</span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded font-mono",
                  activeTravelTab === 'destinos' ? "bg-black/20 text-black font-bold" : "bg-white/10 text-[#d8aa5c]"
                )}>6</span>
              </button>

              {/* Tab 2: Trilha da Novel */}
              <button
                onClick={() => setActiveTravelTab('novel')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200",
                  activeTravelTab === 'novel'
                    ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.6)] font-extrabold"
                    : "text-[#a8a294] hover:text-white hover:bg-white/5"
                )}
              >
                <Route className="h-3.5 w-3.5" />
                <span>Trilha da Novel</span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded font-mono",
                  activeTravelTab === 'novel' ? "bg-black/20 text-black font-bold" : "bg-white/10 text-[#d8aa5c]"
                )}>Cap. 1–5</span>
              </button>

              {/* Tab 3: Linhas Ley & Rotas */}
              <button
                onClick={() => setActiveTravelTab('ley')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200",
                  activeTravelTab === 'ley'
                    ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.6)] font-extrabold"
                    : "text-[#a8a294] hover:text-white hover:bg-white/5"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Linhas Ley de Mana</span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded font-mono",
                  activeTravelTab === 'ley' ? "bg-black/20 text-black font-bold" : "bg-white/10 text-[#d8aa5c]"
                )}>5 Rotas</span>
              </button>

              {/* Tab 4: Feudos & Santuários */}
              <button
                onClick={() => setActiveTravelTab('feudos' as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200",
                  (activeTravelTab as string) === 'feudos'
                    ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.6)] font-extrabold"
                    : "text-[#a8a294] hover:text-white hover:bg-white/5"
                )}
              >
                <Castle className="h-3.5 w-3.5" />
                <span>Feudos & Capitais</span>
              </button>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              TAB PANEL 1: DESTINOS PRIMORDIAIS (VIAJAR PELO GLOBO)
          ════════════════════════════════════════════════════════════════════════ */}
          {activeTravelTab === 'destinos' && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CONTINENTS_DATA.map((cont) => {
                  return (
                    <div
                      key={cont.id}
                      className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#091122]/90 to-[#02050f]/95 border border-white/10 hover:border-[#d8aa5c]/70 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:shadow-[0_0_24px_rgba(216,170,92,0.25)] flex flex-col justify-between"
                    >
                      {/* Top Thumbnail Image */}
                      <div className="relative w-full h-44 overflow-hidden bg-black">
                        <img
                          src={cont.imageUrl}
                          alt={cont.name}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091122] via-[#091122]/30 to-transparent" />
                        
                        {/* Element Badge */}
                        <div
                          className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border backdrop-blur-md"
                          style={{ borderColor: cont.color }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cont.color, boxShadow: `0 0 8px ${cont.color}` }} />
                          <span className="text-[9.5px] font-bold font-mono tracking-wider text-white uppercase">
                            {cont.element}
                          </span>
                        </div>

                        {/* Capital Pill */}
                        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#d8aa5c] bg-black/75 px-2 py-0.5 rounded border border-[#d8aa5c]/25 backdrop-blur-sm">
                          🏛️ {cont.capital.split('/')[0]}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold tracking-widest uppercase mb-0.5" style={{ color: cont.color }}>
                            {cont.subtitle}
                          </div>

                          <h3 className="font-display text-xl font-bold text-[#fef5e0] group-hover:text-[#ffd28a] transition-colors mb-1.5">
                            {cont.name}
                          </h3>

                          <p className="text-[11.5px] text-[#a8a294] font-serif leading-relaxed line-clamp-2 mb-3">
                            {cont.desc}
                          </p>
                        </div>

                        {/* Travel Action Controls */}
                        <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                          <Button
                            size="sm"
                            onClick={() => handleFocusOnGlobe(cont.id, cont.name)}
                            className="flex-1 bg-gradient-to-r from-[#ffe4a0] via-[#dfb76c] to-[#a87d2f] text-black font-display text-[11px] font-black uppercase tracking-wider hover:opacity-90 shadow-[0_0_16px_rgba(216,170,92,0.4)] transition-all"
                          >
                            <Plane className="h-3.5 w-3.5 mr-1 text-black" />
                            <span>Viajar até Aqui</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/mundo/${cont.id}`)}
                            className="bg-black/60 border-white/15 text-[#ffd28a] hover:bg-white/10 font-display text-[11px] font-bold uppercase tracking-wider"
                          >
                            <span>Crônica</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB PANEL 2: TRILHA DA NOVEL (A ROTA DOS CAPÍTULOS NO GLOBO)
          ════════════════════════════════════════════════════════════════════════ */}
          {activeTravelTab === 'novel' && (
            <div className="w-full flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-[#d8aa5c]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#d8aa5c]">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-display font-bold uppercase tracking-wider">Trilha Canônica da História</span>
                </div>
                <span className="text-[#a8a294] text-[11px]">
                  Clique em <strong className="text-[#ffd28a]">"Sobrevoar Cena"</strong> para girar o globo 3D automaticamente até as coordenadas exatas da trama!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STORY_JOURNEY.map((stop, idx) => {
                  return (
                    <div
                      key={stop.chapterNum}
                      className="group relative rounded-2xl p-5 bg-gradient-to-b from-[#091122]/90 to-[#02050f]/95 border border-white/10 hover:border-[#d8aa5c]/60 shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-all flex flex-col justify-between"
                      style={{
                        borderLeftColor: stop.color,
                        borderLeftWidth: '4px'
                      }}
                    >
                      <div>
                        {/* Step Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/70 border border-white/10 text-white">
                            {stop.chapterNum}
                          </span>
                          <span
                            className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border"
                            style={{
                              color: stop.color,
                              borderColor: `${stop.color}50`,
                              backgroundColor: `${stop.color}15`
                            }}
                          >
                            {stop.badge}
                          </span>
                        </div>

                        {/* Chapter Title & Location */}
                        <h4 className="font-display text-lg font-bold text-white group-hover:text-[#ffd28a] transition-colors mb-0.5">
                          {stop.chapterTitle}
                        </h4>
                        <div className="text-[11px] font-mono text-[#d8aa5c] mb-2 flex items-center gap-1.5">
                          <span>📍 {stop.locationName}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-[#888173]">{stop.continentName}</span>
                        </div>

                        {/* Narrative Hook */}
                        <p className="text-xs text-[#a8a294] font-serif leading-relaxed mb-4">
                          {stop.synopsis}
                        </p>
                      </div>

                      {/* Action Buttons: Fly to scene & Read chapter */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <Button
                          size="sm"
                          onClick={() => handleFocusOnGlobe(stop.continentId, stop.locationName, stop.coords)}
                          className="flex-1 bg-[#d8aa5c]/20 hover:bg-[#d8aa5c] text-[#ffd28a] hover:text-black border border-[#d8aa5c]/40 font-display text-[11px] font-bold uppercase tracking-wider transition-all"
                        >
                          <Plane className="h-3.5 w-3.5 mr-1" />
                          <span>Sobrevoar Cena</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (stop.slug.startsWith('mundo')) {
                              setLocation(`/${stop.slug}`);
                            } else {
                              setLocation(`/ler/${stop.slug}`);
                            }
                          }}
                          className="bg-black/60 border-white/15 text-white hover:text-[#ffd28a] hover:border-[#d8aa5c]/40 font-display text-[11px] font-bold uppercase tracking-wider"
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1 text-[#d8aa5c]" />
                          <span>Ler Cena</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB PANEL 3: LINHAS LEY & CONDUTOS DE MANA
          ════════════════════════════════════════════════════════════════════════ */}
          {activeTravelTab === 'ley' && (
            <div className="w-full flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-[#d8aa5c]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#d8aa5c]">
                  <Zap className="h-4 w-4" />
                  <span className="font-display font-bold uppercase tracking-wider">Canais Tubulares de Éter</span>
                </div>
                <span className="text-[#a8a294] text-[11px]">
                  As 5 rotas de mana que cruzam a atmosfera do globo 3D. Selecione um canal para traçar o teletransporte planetário.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LEY_CONDUITS.map((conduit) => {
                  return (
                    <div
                      key={conduit.id}
                      className="group rounded-2xl p-5 bg-gradient-to-b from-[#091122]/90 to-[#02050f]/95 border border-white/10 hover:border-[#d8aa5c]/60 shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-all flex flex-col justify-between"
                      style={{
                        borderTopColor: conduit.color,
                        borderTopWidth: '3px'
                      }}
                    >
                      <div>
                        {/* Route Name & Stability Indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-display text-base font-bold text-white group-hover:text-[#ffd28a] transition-colors">
                            {conduit.name}
                          </h4>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              color: conduit.stability >= 90 ? '#10b981' : '#f59e0b',
                              borderColor: conduit.stability >= 90 ? '#10b98150' : '#f59e0b50',
                              backgroundColor: conduit.stability >= 90 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
                            }}
                          >
                            Estabilidade: {conduit.stability}%
                          </span>
                        </div>

                        {/* Conduit Coordinates Route */}
                        <div className="flex items-center gap-2 text-xs font-mono text-[#d8aa5c] bg-black/50 p-2.5 rounded-xl border border-white/5 mb-3">
                          <span className="truncate">{conduit.source}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-white/50 shrink-0" />
                          <span className="truncate">{conduit.destination}</span>
                        </div>

                        {/* Route Spec Sheet */}
                        <div className="space-y-1 text-[11px] text-[#a8a294] font-sans mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[#888173]">⚡ Propulsão:</span>
                            <span className="text-white font-medium">{conduit.flowType}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#888173]">⏱️ Duração:</span>
                            <span className="text-[#ffd28a] font-medium">{conduit.travelTime}</span>
                          </div>
                          <div className="flex items-start justify-between gap-2 border-t border-white/5 pt-1 mt-1">
                            <span className="text-[#888173] shrink-0">⚠️ Perigos:</span>
                            <span className="text-right text-[#b0a99a] truncate max-w-[200px]">{conduit.hazards}</span>
                          </div>
                        </div>
                      </div>

                      {/* Travel Button */}
                      <Button
                        size="sm"
                        onClick={() => handleFocusOnGlobe(conduit.sourceId, conduit.name, conduit.sourceCoords)}
                        className="w-full bg-[#d8aa5c]/20 hover:bg-[#d8aa5c] text-[#ffd28a] hover:text-black border border-[#d8aa5c]/40 font-display text-[11px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        <span>Navegar Conduíte no Globo</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              TAB PANEL 4: FEUDOS & CAPITAIS (STREAMLINED FAST FINDER)
          ════════════════════════════════════════════════════════════════════════ */}
          {(activeTravelTab as string) === 'feudos' && (
            <div className="w-full flex flex-col gap-5">
              
              {/* Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                
                {/* Continent Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedContinentFilter('todos')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all",
                      selectedContinentFilter === 'todos'
                        ? "bg-[#d8aa5c] text-black"
                        : "bg-black/40 text-[#a8a294] border border-white/10 hover:text-white"
                    )}
                  >
                    Todos
                  </button>
                  {CONTINENTS_DATA.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContinentFilter(c.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all whitespace-nowrap border",
                        selectedContinentFilter === c.id
                          ? "bg-black/90 text-white border-white/40"
                          : "bg-black/40 text-[#a8a294] border-white/10 hover:text-white"
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9a9485] pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar feudo, capital..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-[#6a6559] focus:outline-none focus:border-[#d8aa5c]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9a9485] hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

              </div>

              {/* Territory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerritories.map((loc) => {
                  const contMeta = CONTINENTS_DATA.find((c) => c.id === loc.continentId) || CONTINENTS_DATA[0];
                  return (
                    <div
                      key={loc.id}
                      className="group rounded-2xl p-4 bg-gradient-to-b from-[#091122]/90 to-[#02050f]/95 border border-white/10 hover:border-[#d8aa5c]/60 shadow-[0_8px_20px_rgba(0,0,0,0.8)] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-[#d8aa5c] border border-white/10">
                            {loc.category}
                          </span>
                          <span className="text-[10px] font-mono text-[#a8a294] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: contMeta.color }} />
                            {contMeta.name}
                          </span>
                        </div>

                        <h4 className="font-display text-base font-bold text-white group-hover:text-[#ffd28a] transition-colors mb-1">
                          {loc.name}
                        </h4>

                        <p className="text-xs text-[#a8a294] font-serif leading-relaxed line-clamp-2 mb-3">
                          {loc.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Button
                          size="sm"
                          onClick={() => handleFocusOnGlobe(loc.continentId, loc.name, { x: loc.mapX, y: loc.mapY })}
                          className="flex-1 bg-black/60 border border-[#d8aa5c]/40 text-[#ffd28a] hover:bg-[#d8aa5c] hover:text-black font-display text-[10.5px] font-bold uppercase tracking-wider"
                        >
                          <Crosshair className="h-3 w-3 mr-1" />
                          <span>Localizar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLocation(`/mundo/${loc.id}`)}
                          className="text-[#a8a294] hover:text-white text-[10.5px] font-bold uppercase tracking-wider"
                        >
                          <span>Crônica</span>
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}
