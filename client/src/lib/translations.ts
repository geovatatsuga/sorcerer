export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  // Navigation
  home: string;
  chapters: string;
  characters: string;
  world: string;
  codex: string;
  blog: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  startReading: string;
  exploreWorld: string;
  
  // Home Page Sections
  latestChapters: string;
  latestChaptersDesc: string;
  viewAllChapters: string;
  charactersTitle: string;
  charactersDesc: string;
  viewCharacterProfiles: string;
  exploreRealms: string;
  exploreRealmsDesc: string;
  codexTitle: string;
  codexDesc: string;
  authorsChronicles: string;
  authorsChroniclesDesc: string;
  
  // Chapters Page
  allChapters: string;
  allChaptersDesc: string;
  searchChapters: string;
  noChapters: string;
  noChaptersFound: string;
  adjustSearchTerms: string;
  chaptersWillAppear: string;
  
  // Characters Page
  characterGallery: string;
  characterGalleryDesc: string;
  searchCharacters: string;
  noCharacters: string;
  adjustFilters: string;
  all: string;
  protagonist: string;
  antagonist: string;
  supporting: string;
  
  // World Page
  worldTitle: string;
  worldDesc: string;
  noLocations: string;
  locationsWillAppear: string;
  kingdoms: string;
  kingdomsDesc: string;
  ancientRuins: string;
  ancientRuinsDesc: string;
  magicalRealms: string;
  magicalRealmsDesc: string;
  
  // Codex Page
  codexPageTitle: string;
  codexPageDesc: string;
  magic: string;
  creatures: string;
  locations: string;
  magicSystems: string;
  creaturesBeasts: string;
  legendaryLocations: string;
  
  // Blog Page
  blogTitle: string;
  blogDesc: string;
  searchBlog: string;
  noBlogPosts: string;
  noBlogPostsFound: string;
  blogWillAppear: string;
  update: string;
  worldBuilding: string;
  behindScenes: string;
  research: string;
  
  // Chapter Reader
  chapterNotFound: string;
  chapterNotFoundDesc: string;
  backToChapters: string;
  published: string;
  minRead: string;
  readingProgress: string;
  previous: string;
  next: string;
  
  // Newsletter
  joinJourney: string;
  joinJourneyDesc: string;
  enterEmail: string;
  subscribe: string;
  subscribing: string;
  noSpam: string;
  
  // Footer
  footerDesc: string;
  quickLinks: string;
  support: string;
  copyright: string;
  
  // Time
  dayAgo: string;
  daysAgo: string;
  weekAgo: string;
  weeksAgo: string;
  
  // Toast messages
  subscribeSuccess: string;
  subscribeSuccessDesc: string;
  subscribeFailed: string;
  subscribeFailedDesc: string;
  invalidEmail: string;
  invalidEmailDesc: string;
  
  // Magic content from codex
  elementalMagic: string;
  elementalMagicDesc: string;
  shadowWeaving: string;
  shadowWeavingDesc: string;
  divineChanneling: string;
  divineChannelingDesc: string;
  runeCrafting: string;
  runeCraftingDesc: string;
  
  skyfireDragons: string;
  skyfireDragonsDesc: string;
  shadowWraiths: string;
  shadowWraithsDesc: string;
  crystalSprites: string;
  crystalSpritesDesc: string;
  voidStalkers: string;
  voidStalkersDesc: string;
  
  sunspireTower: string;
  sunspireTowerDesc: string;
  nethermoorCaverns: string;
  nethermoorCavernsDesc: string;
  eternalForge: string;
  eternalForgeDesc: string;
  whisperingWoods: string;
  whisperingWoodsDesc: string;
  
  // Admin
  admin: string;
  adminPanel: string;
  manageContent: string;
  addNew: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role: string;
  published: string;
  draft: string;
  loginRequired: string;
  adminRequired: string;
  login: string;
  logout: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Navigation
    home: 'Início',
    chapters: 'Capítulos',
    characters: 'Personagens',
    world: 'Mundo',
    codex: 'Codex',
    blog: 'Blog',
    
    // Hero Section
    heroTitle: 'O Retorno do Primeiro Feiticeiro',
    heroSubtitle: 'Entre em um mundo onde a magia antiga desperta, reinos se chocam e o retorno de um feiticeiro mudará o destino de todos os reinos.',
    startReading: 'Começar a Ler',
    exploreWorld: 'Explorar Mundo',
    
    // Home Page Sections
    latestChapters: 'Últimos Capítulos',
    latestChaptersDesc: 'Siga a jornada épica conforme ela se desenrola, com novos capítulos publicados regularmente',
    viewAllChapters: 'Ver Todos os Capítulos',
    charactersTitle: 'Personagens',
    charactersDesc: 'Conheça os heróis, vilões e figuras complexas que moldam esta história épica',
    viewCharacterProfiles: 'Ver Perfis dos Personagens',
    exploreRealms: 'Explore os Reinos',
    exploreRealmsDesc: 'Descubra o vasto mundo de Aethermoor através de mapas interativos e guias detalhados de localização',
    codexTitle: 'O Codex',
    codexDesc: 'Guia abrangente dos sistemas de magia, criaturas e lore de Aethermoor',
    authorsChronicles: 'Crônicas do Autor',
    authorsChroniclesDesc: 'Insights dos bastidores, notas de construção de mundo e atualizações do autor',
    
    // Chapters Page
    allChapters: 'Todos os Capítulos',
    allChaptersDesc: 'Mergulhe na coleção completa de capítulos de O Retorno do Primeiro Feiticeiro',
    searchChapters: 'Buscar capítulos...',
    noChapters: 'Nenhum capítulo disponível',
    noChaptersFound: 'Nenhum capítulo encontrado',
    adjustSearchTerms: 'Tente ajustar seus termos de busca',
    chaptersWillAppear: 'Novos capítulos aparecerão aqui conforme forem publicados',
    
    // Characters Page
    characterGallery: 'Galeria de Personagens',
    characterGalleryDesc: 'Conheça os heróis, vilões e figuras complexas que moldam esta história épica',
    searchCharacters: 'Buscar personagens...',
    noCharacters: 'Nenhum personagem encontrado',
    adjustFilters: 'Tente ajustar seus termos de busca ou filtros',
    all: 'todos',
    protagonist: 'protagonista',
    antagonist: 'antagonista',
    supporting: 'coadjuvante',
    
    // World Page
    worldTitle: 'O Mundo de Aethermoor',
    worldDesc: 'Descubra os vastos reinos, reinos antigos e localizações místicas que compõem este mundo de fantasia épica',
    noLocations: 'Nenhuma localização disponível',
    locationsWillAppear: 'Localizações do mundo aparecerão aqui conforme forem adicionadas à história',
    kingdoms: '7 Reinos',
    kingdomsDesc: 'Cada um com culturas únicas e tradições mágicas',
    ancientRuins: 'Ruínas Antigas',
    ancientRuinsDesc: 'Localizações misteriosas escondendo artefatos poderosos',
    magicalRealms: 'Reinos Mágicos',
    magicalRealmsDesc: 'Dimensões ocultas acessíveis através de portais',
    
    // Codex Page
    codexPageTitle: 'O Codex de Aethermoor',
    codexPageDesc: 'Guia abrangente dos sistemas de magia, criaturas e lore deste mundo de fantasia épica',
    magic: 'Magia',
    creatures: 'Criaturas',
    locations: 'Locais',
    magicSystems: 'Sistemas de Magia',
    creaturesBeasts: 'Criaturas e Feras',
    legendaryLocations: 'Locais Lendários',
    
    // Blog Page
    blogTitle: 'Crônicas do Autor',
    blogDesc: 'Insights dos bastidores, notas de construção de mundo e atualizações do autor',
    searchBlog: 'Buscar posts do blog...',
    noBlogPosts: 'Nenhum post do blog disponível',
    noBlogPostsFound: 'Nenhum post do blog encontrado',
    blogWillAppear: 'Novos posts do blog aparecerão aqui conforme forem publicados',
    update: 'atualização',
    worldBuilding: 'construção-mundo',
    behindScenes: 'bastidores',
    research: 'pesquisa',
    
    // Chapter Reader
    chapterNotFound: 'Capítulo Não Encontrado',
    chapterNotFoundDesc: 'O capítulo que você está procurando não existe ou foi movido.',
    backToChapters: 'Voltar aos Capítulos',
    published: 'Publicado',
    minRead: 'min de leitura',
    readingProgress: 'Progresso de Leitura',
    previous: 'Anterior',
    next: 'Próximo',
    
    // Newsletter
    joinJourney: 'Junte-se à Jornada',
    joinJourneyDesc: 'Inscreva-se para receber notificações quando novos capítulos forem publicados e conteúdo exclusivo dos bastidores.',
    enterEmail: 'Digite seu email',
    subscribe: 'Inscrever-se',
    subscribing: 'Inscrevendo...',
    noSpam: 'Sem spam, apenas conteúdo épico de fantasia.',
    
    // Footer
    footerDesc: 'Um webnovel de fantasia épica explorando temas de poder, redenção e a luta eterna entre luz e trevas.',
    quickLinks: 'Links Rápidos',
    support: 'Suporte',
    copyright: '© 2024 O Retorno do Primeiro Feiticeiro. Todos os direitos reservados.',
    
    // Time
    dayAgo: '1 dia atrás',
    daysAgo: 'dias atrás',
    weekAgo: '1 semana atrás',
    weeksAgo: 'semanas atrás',
    
    // Toast messages
    subscribeSuccess: 'Inscrito com sucesso!',
    subscribeSuccessDesc: 'Você receberá notificações sobre novos capítulos e conteúdo exclusivo.',
    subscribeFailed: 'Falha na inscrição',
    subscribeFailedDesc: 'Por favor, verifique seu endereço de email e tente novamente.',
    invalidEmail: 'Email inválido',
    invalidEmailDesc: 'Por favor, digite um endereço de email válido.',
    
    // Magic content
    elementalMagic: 'Magia Elemental',
    elementalMagicDesc: 'Controle sobre fogo, água, terra e ar através de encantamentos antigos',
    shadowWeaving: 'Tecelagem das Sombras',
    shadowWeavingDesc: 'Manipulação das trevas e energia do vazio, proibida na maioria dos reinos',
    divineChanneling: 'Canalização Divina',
    divineChannelingDesc: 'Extrair poder de seres celestiais e deuses antigos',
    runeCrafting: 'Criação de Runas',
    runeCraftingDesc: 'Inscrever símbolos mágicos para armazenar e liberar poder',
    
    skyfireDragons: 'Dragões de Fogo Celestial',
    skyfireDragonsDesc: 'Guardiões antigos dos picos das montanhas, mestres do fogo elemental',
    shadowWraiths: 'Espectros das Sombras',
    shadowWraithsDesc: 'Almas corrompidas presas às trevas, buscando drenar força vital',
    crystalSprites: 'Sprites de Cristal',
    crystalSpritesDesc: 'Seres benevolentes de energia mágica pura que habitam cavernas de cristal',
    voidStalkers: 'Caçadores do Vazio',
    voidStalkersDesc: 'Predadores de entre dimensões que caçam seres mágicos',
    
    sunspireTower: 'A Torre Sunspire',
    sunspireTowerDesc: 'A academia de magia mais alta do reino, flutuando acima das nuvens',
    nethermoorCaverns: 'Cavernas de Nethermoor',
    nethermoorCavernsDesc: 'Rede subterrânea de túneis antigos repletos de magia sombria',
    eternalForge: 'A Forja Eterna',
    eternalForgeDesc: 'Onde armas lendárias são criadas usando fogo estelar e sopro de dragão',
    whisperingWoods: 'Bosques Sussurrantes',
    whisperingWoodsDesc: 'Uma floresta mística onde as próprias árvores guardam memórias antigas',
  },
  
  en: {
    // Navigation
    home: 'Home',
    chapters: 'Chapters',
    characters: 'Characters',
    world: 'World',
    codex: 'Codex',
    blog: 'Blog',
    
    // Hero Section
    heroTitle: 'The Return of the First Sorcerer',
    heroSubtitle: 'Enter a world where ancient magic awakens, kingdoms clash, and one sorcerer\'s return will reshape the fate of all realms.',
    startReading: 'Start Reading',
    exploreWorld: 'Explore World',
    
    // Home Page Sections
    latestChapters: 'Latest Chapters',
    latestChaptersDesc: 'Follow the epic journey as it unfolds, with new chapters published regularly',
    viewAllChapters: 'View All Chapters',
    charactersTitle: 'Characters',
    charactersDesc: 'Meet the heroes, villains, and complex figures that shape this epic tale',
    viewCharacterProfiles: 'View Character Profiles',
    exploreRealms: 'Explore the Realms',
    exploreRealmsDesc: 'Discover the vast world of Aethermoor through interactive maps and detailed location guides',
    codexTitle: 'The Codex',
    codexDesc: 'Comprehensive guide to the magic systems, creatures, and lore of Aethermoor',
    authorsChronicles: 'Author\'s Chronicles',
    authorsChroniclesDesc: 'Behind-the-scenes insights, world-building notes, and updates from the author',
    
    // Chapters Page
    allChapters: 'All Chapters',
    allChaptersDesc: 'Dive into the complete collection of chapters in The Return of the First Sorcerer',
    searchChapters: 'Search chapters...',
    noChapters: 'No chapters available',
    noChaptersFound: 'No chapters found',
    adjustSearchTerms: 'Try adjusting your search terms',
    chaptersWillAppear: 'New chapters will appear here as they are published',
    
    // Characters Page
    characterGallery: 'Character Gallery',
    characterGalleryDesc: 'Meet the heroes, villains, and complex figures that shape this epic tale',
    searchCharacters: 'Search characters...',
    noCharacters: 'No characters found',
    adjustFilters: 'Try adjusting your search terms or filters',
    all: 'all',
    protagonist: 'protagonist',
    antagonist: 'antagonist',
    supporting: 'supporting',
    
    // World Page
    worldTitle: 'The World of Aethermoor',
    worldDesc: 'Discover the vast realms, ancient kingdoms, and mystical locations that make up this epic fantasy world',
    noLocations: 'No locations available',
    locationsWillAppear: 'World locations will appear here as they are added to the story',
    kingdoms: '7 Kingdoms',
    kingdomsDesc: 'Each with unique cultures and magical traditions',
    ancientRuins: 'Ancient Ruins',
    ancientRuinsDesc: 'Mysterious locations hiding powerful artifacts',
    magicalRealms: 'Magical Realms',
    magicalRealmsDesc: 'Hidden dimensions accessible through portals',
    
    // Codex Page
    codexPageTitle: 'The Codex of Aethermoor',
    codexPageDesc: 'Comprehensive guide to the magic systems, creatures, and lore of this epic fantasy world',
    magic: 'Magic',
    creatures: 'Creatures',
    locations: 'Locations',
    magicSystems: 'Magic Systems',
    creaturesBeasts: 'Creatures & Beasts',
    legendaryLocations: 'Legendary Locations',
    
    // Blog Page
    blogTitle: 'Author\'s Chronicles',
    blogDesc: 'Behind-the-scenes insights, world-building notes, and updates from the author',
    searchBlog: 'Search blog posts...',
    noBlogPosts: 'No blog posts available',
    noBlogPostsFound: 'No blog posts found',
    blogWillAppear: 'New blog posts will appear here as they are published',
    update: 'update',
    worldBuilding: 'world-building',
    behindScenes: 'behind-scenes',
    research: 'research',
    
    // Chapter Reader
    chapterNotFound: 'Chapter Not Found',
    chapterNotFoundDesc: 'The chapter you\'re looking for doesn\'t exist or has been moved.',
    backToChapters: 'Back to Chapters',
    published: 'Published',
    minRead: 'min read',
    readingProgress: 'Reading Progress',
    previous: 'Previous',
    next: 'Next',
    
    // Newsletter
    joinJourney: 'Join the Journey',
    joinJourneyDesc: 'Subscribe to receive notifications when new chapters are published and exclusive behind-the-scenes content.',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    subscribing: 'Subscribing...',
    noSpam: 'No spam, just epic fantasy content.',
    
    // Footer
    footerDesc: 'An epic fantasy webnovel exploring themes of power, redemption, and the eternal struggle between light and darkness.',
    quickLinks: 'Quick Links',
    support: 'Support',
    copyright: '© 2024 The Return of the First Sorcerer. All rights reserved.',
    
    // Time
    dayAgo: '1 day ago',
    daysAgo: 'days ago',
    weekAgo: '1 week ago',
    weeksAgo: 'weeks ago',
    
    // Toast messages
    subscribeSuccess: 'Successfully subscribed!',
    subscribeSuccessDesc: 'You\'ll receive notifications about new chapters and exclusive content.',
    subscribeFailed: 'Subscription failed',
    subscribeFailedDesc: 'Please check your email address and try again.',
    invalidEmail: 'Invalid email',
    invalidEmailDesc: 'Please enter a valid email address.',
    
    // Magic content
    elementalMagic: 'Elemental Magic',
    elementalMagicDesc: 'Control over fire, water, earth, and air through ancient incantations',
    shadowWeaving: 'Shadow Weaving',
    shadowWeavingDesc: 'Manipulation of darkness and void energy, forbidden in most kingdoms',
    divineChanneling: 'Divine Channeling',
    divineChannelingDesc: 'Drawing power from celestial beings and ancient gods',
    runeCrafting: 'Rune Crafting',
    runeCraftingDesc: 'Inscribing magical symbols to store and release power',
    
    skyfireDragons: 'Skyfire Dragons',
    skyfireDragonsDesc: 'Ancient guardians of the mountain peaks, masters of elemental fire',
    shadowWraiths: 'Shadow Wraiths',
    shadowWraithsDesc: 'Corrupted souls bound to darkness, seeking to drain life force',
    crystalSprites: 'Crystal Sprites',
    crystalSpritesDesc: 'Benevolent beings of pure magical energy that inhabit crystal caves',
    voidStalkers: 'Void Stalkers',
    voidStalkersDesc: 'Predators from between dimensions that hunt magical beings',
    
    sunspireTower: 'The Sunspire Tower',
    sunspireTowerDesc: 'The highest magical academy in the realm, floating above the clouds',
    nethermoorCaverns: 'Nethermoor Caverns',
    nethermoorCavernsDesc: 'Underground network of ancient tunnels filled with dark magic',
    eternalForge: 'The Eternal Forge',
    eternalForgeDesc: 'Where legendary weapons are crafted using starfire and dragon breath',
    whisperingWoods: 'Whispering Woods',
    whisperingWoodsDesc: 'A mystical forest where the trees themselves hold ancient memories',
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    chapters: 'Capítulos',
    characters: 'Personajes',
    world: 'Mundo',
    codex: 'Códice',
    blog: 'Blog',
    
    // Hero Section
    heroTitle: 'El Retorno del Primer Hechicero',
    heroSubtitle: 'Entra en un mundo donde la magia antigua despierta, los reinos chocan y el retorno de un hechicero cambiará el destino de todos los reinos.',
    startReading: 'Comenzar a Leer',
    exploreWorld: 'Explorar Mundo',
    
    // Home Page Sections
    latestChapters: 'Últimos Capítulos',
    latestChaptersDesc: 'Sigue el viaje épico mientras se desarrolla, con nuevos capítulos publicados regularmente',
    viewAllChapters: 'Ver Todos los Capítulos',
    charactersTitle: 'Personajes',
    charactersDesc: 'Conoce a los héroes, villanos y figuras complejas que dan forma a esta historia épica',
    viewCharacterProfiles: 'Ver Perfiles de Personajes',
    exploreRealms: 'Explora los Reinos',
    exploreRealmsDesc: 'Descubre el vasto mundo de Aethermoor a través de mapas interactivos y guías detalladas de ubicación',
    codexTitle: 'El Códice',
    codexDesc: 'Guía completa de los sistemas de magia, criaturas y tradiciones de Aethermoor',
    authorsChronicles: 'Crónicas del Autor',
    authorsChroniclesDesc: 'Perspectivas entre bastidores, notas de construcción de mundo y actualizaciones del autor',
    
    // Chapters Page
    allChapters: 'Todos los Capítulos',
    allChaptersDesc: 'Sumérgete en la colección completa de capítulos de El Retorno del Primer Hechicero',
    searchChapters: 'Buscar capítulos...',
    noChapters: 'No hay capítulos disponibles',
    noChaptersFound: 'No se encontraron capítulos',
    adjustSearchTerms: 'Intenta ajustar tus términos de búsqueda',
    chaptersWillAppear: 'Los nuevos capítulos aparecerán aquí cuando se publiquen',
    
    // Characters Page
    characterGallery: 'Galería de Personajes',
    characterGalleryDesc: 'Conoce a los héroes, villanos y figuras complejas que dan forma a esta historia épica',
    searchCharacters: 'Buscar personajes...',
    noCharacters: 'No se encontraron personajes',
    adjustFilters: 'Intenta ajustar tus términos de búsqueda o filtros',
    all: 'todos',
    protagonist: 'protagonista',
    antagonist: 'antagonista',
    supporting: 'secundario',
    
    // World Page
    worldTitle: 'El Mundo de Aethermoor',
    worldDesc: 'Descubre los vastos reinos, reinos antiguos y ubicaciones místicas que conforman este mundo de fantasía épica',
    noLocations: 'No hay ubicaciones disponibles',
    locationsWillAppear: 'Las ubicaciones del mundo aparecerán aquí cuando se agreguen a la historia',
    kingdoms: '7 Reinos',
    kingdomsDesc: 'Cada uno con culturas únicas y tradiciones mágicas',
    ancientRuins: 'Ruinas Antiguas',
    ancientRuinsDesc: 'Ubicaciones misteriosas que ocultan artefactos poderosos',
    magicalRealms: 'Reinos Mágicos',
    magicalRealmsDesc: 'Dimensiones ocultas accesibles a través de portales',
    
    // Codex Page
    codexPageTitle: 'El Códice de Aethermoor',
    codexPageDesc: 'Guía completa de los sistemas de magia, criaturas y tradiciones de este mundo de fantasía épica',
    magic: 'Magia',
    creatures: 'Criaturas',
    locations: 'Ubicaciones',
    magicSystems: 'Sistemas de Magia',
    creaturesBeasts: 'Criaturas y Bestias',
    legendaryLocations: 'Ubicaciones Legendarias',
    
    // Blog Page
    blogTitle: 'Crónicas del Autor',
    blogDesc: 'Perspectivas entre bastidores, notas de construcción de mundo y actualizaciones del autor',
    searchBlog: 'Buscar publicaciones del blog...',
    noBlogPosts: 'No hay publicaciones del blog disponibles',
    noBlogPostsFound: 'No se encontraron publicaciones del blog',
    blogWillAppear: 'Las nuevas publicaciones del blog aparecerán aquí cuando se publiquen',
    update: 'actualización',
    worldBuilding: 'construcción-mundo',
    behindScenes: 'entre-bastidores',
    research: 'investigación',
    
    // Chapter Reader
    chapterNotFound: 'Capítulo No Encontrado',
    chapterNotFoundDesc: 'El capítulo que buscas no existe o ha sido movido.',
    backToChapters: 'Volver a Capítulos',
    published: 'Publicado',
    minRead: 'min de lectura',
    readingProgress: 'Progreso de Lectura',
    previous: 'Anterior',
    next: 'Siguiente',
    
    // Newsletter
    joinJourney: 'Únete al Viaje',
    joinJourneyDesc: 'Suscríbete para recibir notificaciones cuando se publiquen nuevos capítulos y contenido exclusivo entre bastidores.',
    enterEmail: 'Ingresa tu email',
    subscribe: 'Suscribirse',
    subscribing: 'Suscribiendo...',
    noSpam: 'Sin spam, solo contenido épico de fantasía.',
    
    // Footer
    footerDesc: 'Una webnovela de fantasía épica que explora temas de poder, redención y la lucha eterna entre la luz y la oscuridad.',
    quickLinks: 'Enlaces Rápidos',
    support: 'Soporte',
    copyright: '© 2024 El Retorno del Primer Hechicero. Todos los derechos reservados.',
    
    // Time
    dayAgo: 'hace 1 día',
    daysAgo: 'días atrás',
    weekAgo: 'hace 1 semana',
    weeksAgo: 'semanas atrás',
    
    // Toast messages
    subscribeSuccess: '¡Suscrito exitosamente!',
    subscribeSuccessDesc: 'Recibirás notificaciones sobre nuevos capítulos y contenido exclusivo.',
    subscribeFailed: 'Fallo en la suscripción',
    subscribeFailedDesc: 'Por favor, verifica tu dirección de email e intenta de nuevo.',
    invalidEmail: 'Email inválido',
    invalidEmailDesc: 'Por favor, ingresa una dirección de email válida.',
    
    // Magic content
    elementalMagic: 'Magia Elemental',
    elementalMagicDesc: 'Control sobre fuego, agua, tierra y aire a través de encantamientos antiguos',
    shadowWeaving: 'Tejido de Sombras',
    shadowWeavingDesc: 'Manipulación de la oscuridad y energía del vacío, prohibida en la mayoría de los reinos',
    divineChanneling: 'Canalización Divina',
    divineChannelingDesc: 'Extraer poder de seres celestiales y dioses antiguos',
    runeCrafting: 'Creación de Runas',
    runeCraftingDesc: 'Inscribir símbolos mágicos para almacenar y liberar poder',
    
    skyfireDragons: 'Dragones de Fuego Celestial',
    skyfireDragonsDesc: 'Guardianes antiguos de los picos montañosos, maestros del fuego elemental',
    shadowWraiths: 'Espectros de las Sombras',
    shadowWraithsDesc: 'Almas corrompidas atadas a la oscuridad, buscando drenar fuerza vital',
    crystalSprites: 'Sprites de Cristal',
    crystalSpritesDesc: 'Seres benevolentes de energía mágica pura que habitan cuevas de cristal',
    voidStalkers: 'Acechadores del Vacío',
    voidStalkersDesc: 'Depredadores de entre dimensiones que cazan seres mágicos',
    
    sunspireTower: 'La Torre Sunspire',
    sunspireTowerDesc: 'La academia de magia más alta del reino, flotando sobre las nubes',
    nethermoorCaverns: 'Cavernas de Nethermoor',
    nethermoorCavernsDesc: 'Red subterránea de túneles antiguos llenos de magia oscura',
    eternalForge: 'La Forja Eterna',
    eternalForgeDesc: 'Donde se crean armas legendarias usando fuego estelar y aliento de dragón',
    whisperingWoods: 'Bosques Susurrantes',
    whisperingWoodsDesc: 'Un bosque místico donde los propios árboles guardan recuerdos antiguos',
  },
};

export function useTranslation(language: Language = 'pt'): Translations {
  return translations[language] || translations.pt;
}