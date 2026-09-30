import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useLocation } from 'wouter';
import { 
  Compass, 
  RotateCcw, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Info, 
  X, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  BookOpen, 
  Crosshair,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ContinentLore {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  mapX: number; // 0 to 100 percentage
  mapY: number; // 0 to 100 percentage
  color: string;
  glowColor: string;
  imageUrl: string;
  element: string;
  capital: string;
  ruler: string;
  climate: string;
  tags: string[];
  chapters: { title: string; slug: string }[];
}

export const CONTINENTS_LORE: ContinentLore[] = [
  {
    id: "luminah",
    name: "Luminah",
    title: "O Berço da Centelha",
    subtitle: "Continente da Luz Primordial & Saber Ancestral",
    description: "Luminah ergue-se sob o zênite dourado do mundo. Foi aqui que a primeira centelha de mana tocou o solo mortal, dando origem aos reinos dos primeiros magos e aos santuários dos elfos de alta estirpe.",
    details: "Suas terras férteis abrigam a grandiosa Casa Sylvaris e as bibliotecas subterrâneas onde repousam os papiros dos primórdios. As rotas arcanas que cortam seus vales ainda vibram com a frequência original da criação.",
    mapX: 66,
    mapY: 44,
    color: "#f59e0b",
    glowColor: "#ffd28a",
    imageUrl: "/uploads/0402af7f-927c-42da-98dd-783442450450.png",
    element: "Luz & Mana Cósmica",
    capital: "Veyra / Sylvaris",
    ruler: "Conselho dos Altos Magos",
    climate: "Subtropical temperado e vales iluminados",
    tags: ["Reinos Humanos", "Elfos Ancestrais", "Bibliotecas Arcanas"],
    chapters: [
      { title: "Capítulo 1 — Prólogo", slug: "arco-1-o-limiar-capitulo-1-prologo" },
      { title: "Capítulo 2 — O Despertar da Alma", slug: "arco-1-o-limiar-capitulo-2-o-despertar-da-alma" },
      { title: "Capítulo 4 — A Cidade que Não Deveria Existir", slug: "arco-1-o-limiar-capitulo-4-a-cidade-que-nao-deveria-existir" }
    ]
  },
  {
    id: "umbra",
    name: "Umbra",
    title: "O Véu Inominado",
    subtitle: "Continente das Sombras & Penumbra Eterna",
    description: "Envolto em uma bruma fria que nunca se dissipa, Umbra guarda os vestígios da fissura celestial. O sol ali parece apenas um disco pálido que jamais aquece as florestas de espinhos negros.",
    details: "Lar de criaturas adaptadas à escuridão e de feiticeiros que aprenderam a manipular as sombras como extensão da própria alma. Cidadelas esculpidas em obsidiana erguem-se como agulhas contra o céu tempestuoso.",
    mapX: 17,
    mapY: 30,
    color: "#a855f7",
    glowColor: "#d8b4fe",
    imageUrl: "/front-ed-assets/imagem_umbra_mapa_fantasia.png",
    element: "Éter Sombrio & Gravidade",
    capital: "Necrópole de Kael-Mor",
    ruler: "A Ordem do Véu Silencioso",
    climate: "Frio glacial constante e névoa espessa",
    tags: ["Feitiçaria Sombria", "Obsidiana", "Mistérios Ocultos"],
    chapters: [
      { title: "Capítulo 2 — O Despertar da Alma", slug: "arco-1-o-limiar-capitulo-2-o-despertar-da-alma" }
    ]
  },
  {
    id: "silvanum",
    name: "Silvanum",
    title: "O Domínio das Florestas Eternas",
    subtitle: "As Raízes Primordiais da Criação",
    description: "Florestas colossais cujas árvores tocam as nuvens e onde raízes seculares entrelaçam montanhas inteiras. A própria terra respira e pulsa com magia vegetal incontrolável.",
    details: "Território soberano de cortes feéricas e dracos anciãos adormecidos nas clareiras. Nenhum forasteiro ousa cortar um galho sem proferir as antigas preces de reverência à Mãe Veyra.",
    mapX: 37,
    mapY: 46,
    color: "#10b981",
    glowColor: "#6ee7b7",
    imageUrl: "/uploads/22ecc643-b08d-4a35-adc0-8ae2ea4965c3.png",
    element: "Mana Vegetal & Vida",
    capital: "Coração de Yggdras",
    ruler: "A Rainha das Mil Folhas & Dracos",
    climate: "Temperado com chuvas arcanas",
    tags: ["Fadas", "Draconianos", "Bosques Vivos"],
    chapters: [
      { title: "Capítulo 4 — A Cidade que Não Deveria Existir", slug: "arco-1-o-limiar-capitulo-4-a-cidade-que-nao-deveria-existir" }
    ]
  },
  {
    id: "ferros",
    name: "Ferros",
    title: "O Bastião da Forja e Fogo",
    subtitle: "Montanhas Vulcânicas & Cidadelas de Pedra",
    description: "Cordilheiras de basalto ardente e desfiladeiros cortados por rios de lava líquida. Nas entranhas dessas montanhas, forjas ancestrais trabalham sem descanso dia e noite.",
    details: "Habitado por clãs de anões lendários e engenheiros de runas que dominam a arte de fundir minérios mágicos com aço temperado. Suas fortalezas subterrâneas são inexpugnáveis até mesmo para dragões.",
    mapX: 39,
    mapY: 78,
    color: "#ef4444",
    glowColor: "#fca5a5",
    imageUrl: "/uploads/6ac2dc4a-4b46-42b6-8f31-bf33b2c21403.jpg",
    element: "Fogo & Metalurgia Rúnica",
    capital: "Kar-Drakor",
    ruler: "Conselho dos Mestres Forjadores",
    climate: "Árido, vulcânico e calor subterrâneo",
    tags: ["Anões", "Armas Rúnicas", "Minas Profundas"],
    chapters: [
      { title: "Capítulo 1 — Prólogo", slug: "arco-1-o-limiar-capitulo-1-prologo" }
    ]
  },
  {
    id: "akeli",
    name: "Akeli",
    title: "O Vento das Estepes",
    subtitle: "Vastas Planícies & Cidades Fortificadas",
    description: "Terras de horizontes infinitos onde os ventos nunca cessam. Lar de povos orgulhosos com tradições bélicas refinadas, templos milenares e capitais erguidas sobre colinas escarpadas.",
    details: "Aqui situa-se Tirath, o bastião da pólvora e da magia bélica, cruzamento de mercadores, espiões e batalhões da cavalaria celestial que patrulham as fronteiras com Akeli.",
    mapX: 80,
    mapY: 56,
    color: "#3b82f6",
    glowColor: "#93c5fd",
    imageUrl: "/uploads/1371ad10-977d-4204-a278-ea060eea0cb1.jpg",
    element: "Vento & Eletricidade",
    capital: "Tirath",
    ruler: "Lorde Marechal de Tirath",
    climate: "Estepes temperadas e ventos contínuos",
    tags: ["Tirath", "Pólvora Arcana", "Cavalaria"],
    chapters: [
      { title: "Capítulo 5 — Tirath", slug: "arco-1-o-limiar-capitulo-5-tirath" }
    ]
  },
  {
    id: "aquarius",
    name: "Aquarius",
    title: "O Mar das Marés Cósmicas",
    subtitle: "Arquipélago dos Mil Rios & Navegadores",
    description: "Centenas de ilhas de corais fluorescentes e baías turquesas espalhadas pelo oceano austral. As correntes marítimas aqui obedecem às fases das luas mágicas.",
    details: "Centro do comércio marítimo global, rotas de piratas do éter e criaturas das profundezas abissais que protegem templos submersos anteriores à própria Primeira Guerra.",
    mapX: 62,
    mapY: 66,
    color: "#06b6d4",
    glowColor: "#67e8f9",
    imageUrl: "/uploads/0e7b9707-27f2-430a-b76f-f4c7b71a258d.jpg",
    element: "Água & Marés Lunares",
    capital: "Porto das Pérolas",
    ruler: "Guilda dos Almirantes Arcanos",
    climate: "Tropical marítimo e recifes mágicos",
    tags: ["Arquipélago", "Rotas Náuticas", "Mistérios Marítimos"],
    chapters: [
      { title: "Capítulo 1 — Prólogo", slug: "arco-1-o-limiar-capitulo-1-prologo" }
    ]
  }
];

// Helper: map percentage (x, y) to spherical 3D coordinates (R = radius)
function latLongToVector3(mapX: number, mapY: number, radius: number): THREE.Vector3 {
  // Map equirectangular projection:
  // mapX: 0 to 100 -> Longitude: -180 to +180 deg
  // mapY: 0 to 100 -> Latitude: +90 to -90 deg
  const lon = (mapX / 100) * 360 - 180;
  const lat = 90 - (mapY / 100) * 180;

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = - (radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

export default function ArcaneGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const [selectedContinent, setSelectedContinent] = useState<ContinentLore | null>(null);
  const [hoveredContinent, setHoveredContinent] = useState<ContinentLore | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [screenPins, setScreenPins] = useState<{ id: string; name: string; x: number; y: number; visible: boolean; color: string }[]>([]);

  // Sound generator (synthesized cosmic wind / mana hum)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleAudio = () => {
    if (!audioActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          
          // Ethereal low-frequency ambient drone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note (mystical drone)

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2 harmonic

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, ctx.currentTime);

          gain.gain.setValueAtTime(0.08, ctx.currentTime);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          gainNodeRef.current = gain;
        } else if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0.08, audioCtxRef.current.currentTime, 0.5);
        }
        setAudioActive(true);
      } catch (err) {
        console.warn('Web Audio not allowed', err);
      }
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
      }
      setAudioActive(false);
    }
  };

  // Three.js State Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const astrolabeGroupRef = useRef<THREE.Group | null>(null);
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const pinMeshesRef = useRef<{ id: string; mesh: THREE.Object3D; pos: THREE.Vector3 }[]>([]);

  // Drag interaction variables
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.1, y: 0 });
  const currentRotation = useRef({ x: 0.1, y: 0 });
  const zoomLevel = useRef(4.8);
  const targetZoom = useRef(4.8);

  const GLOBE_RADIUS = 2.0;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, zoomLevel.current);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e0, 2.4);
    sunLight.position.set(6, 4, 7);
    scene.add(sunLight);

    const blueBackLight = new THREE.DirectionalLight(0x4a77ff, 1.2);
    blueBackLight.position.set(-6, -3, -5);
    scene.add(blueBackLight);

    // 4. Cosmic Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 35 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      const colorTint = Math.random();
      if (colorTint > 0.8) {
        starColors[i] = 1.0; starColors[i + 1] = 0.85; starColors[i + 2] = 0.5; // Gold star
      } else if (colorTint > 0.6) {
        starColors[i] = 0.6; starColors[i + 1] = 0.8; starColors[i + 2] = 1.0; // Cyan star
      } else {
        starColors[i] = 0.9; starColors[i + 1] = 0.9; starColors[i + 2] = 1.0; // Pure white
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load(
      '/FinalMap.png',
      () => renderer.render(scene, camera),
      undefined,
      () => {
        // Fallback procedural canvas texture if image is missing
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a1628';
          ctx.fillRect(0, 0, 1024, 512);
          ctx.fillStyle = '#dfb872';
          ctx.font = '36px serif';
          ctx.fillText('Calonia Arcana', 400, 256);
          const fallbackTex = new THREE.CanvasTexture(canvas);
          globeMesh.material = new THREE.MeshStandardMaterial({ map: fallbackTex, roughness: 0.5, metalness: 0.2 });
        }
      }
    );
    mapTexture.wrapS = THREE.RepeatWrapping;
    mapTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Sphere Geometry
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: mapTexture,
      roughness: 0.55,
      metalness: 0.2,
      bumpScale: 0.05,
    });
    const globeMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeMesh);

    // Atmospheric Glow Sphere (Fresnel Effect via BackSide Mesh)
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.85, 0.70, 0.40, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 6. Astrolabe Rings Group
    const astrolabeGroup = new THREE.Group();
    scene.add(astrolabeGroup);
    astrolabeGroupRef.current = astrolabeGroup;

    // Brass Material for Rings
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8aa5c,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x6e4812,
      emissiveIntensity: 0.35,
    });

    // Ring 1: Celestial Equator
    const ring1Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.28, 0.018, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, brassMaterial);
    astrolabeGroup.add(ring1);

    // Ring 2: Ecliptic Tilted Ring
    const ring2Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.35, 0.015, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, brassMaterial);
    ring2.rotation.x = Math.PI / 4.5;
    ring2.rotation.y = Math.PI / 6;
    astrolabeGroup.add(ring2);

    // Ring 3: Polar Meridian Ring
    const ring3Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.42, 0.014, 16, 100);
    const ring3 = new THREE.Mesh(ring3Geo, brassMaterial);
    ring3.rotation.y = Math.PI / 2;
    astrolabeGroup.add(ring3);

    // 7. 3D Continent Pins & Beacons
    const pins: { id: string; mesh: THREE.Object3D; pos: THREE.Vector3 }[] = [];

    CONTINENTS_LORE.forEach((cont) => {
      const pinPos = latLongToVector3(cont.mapX, cont.mapY, GLOBE_RADIUS * 1.018);
      
      const pinContainer = new THREE.Group();
      pinContainer.position.copy(pinPos);

      // Orient pin normal to sphere surface
      pinContainer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pinPos.clone().normalize());

      // Glowing core orb
      const orbGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cont.color),
        emissive: new THREE.Color(cont.color),
        emissiveIntensity: 2.5,
        roughness: 0.1,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.y = 0.08;
      pinContainer.add(orbMesh);

      // Light beam pin
      const stemGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.14, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffe8a6, transparent: true, opacity: 0.85 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.07;
      pinContainer.add(stemMesh);

      // Pulsing wave ring at base
      const ringGeo = new THREE.RingGeometry(0.04, 0.08, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cont.glowColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      pinContainer.add(ringMesh);

      globeGroup.add(pinContainer);
      pins.push({ id: cont.id, mesh: pinContainer, pos: pinPos });
    });

    pinMeshesRef.current = pins;

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow astrolabe celestial rotation
      if (astrolabeGroupRef.current) {
        astrolabeGroupRef.current.rotation.y = elapsedTime * 0.03;
        astrolabeGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.02) * 0.08;
      }

      // Smooth Rotation Damping
      if (autoRotate && !isDragging.current && !targetCameraPos.current) {
        targetRotation.current.y += 0.0035;
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotation.current.x;
        globeGroupRef.current.rotation.y = currentRotation.current.y;
      }

      // Smooth Zoom Damping
      zoomLevel.current += (targetZoom.current - zoomLevel.current) * 0.1;
      if (cameraRef.current && !targetCameraPos.current) {
        cameraRef.current.position.z = zoomLevel.current;
      }

      // Smooth Camera Fly-To Target
      if (targetCameraPos.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPos.current, 0.055);
        cameraRef.current.lookAt(0, 0, 0);

        if (cameraRef.current.position.distanceTo(targetCameraPos.current) < 0.02) {
          targetCameraPos.current = null;
        }
      }

      // Project 3D Pins to 2D Screen for HTML labels
      if (containerRef.current && cameraRef.current && globeGroupRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const updatedScreenPins = pins.map((p) => {
          const worldPos = p.pos.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);
          
          // Check if pin is on the facing side of the sphere relative to camera
          const dirToCamera = cameraRef.current!.position.clone().sub(worldPos).normalize();
          const normal = worldPos.clone().normalize();
          const dot = normal.dot(dirToCamera);

          const proj = worldPos.project(cameraRef.current!);
          const screenX = (proj.x * 0.5 + 0.5) * w;
          const screenY = (-(proj.y * 0.5) + 0.5) * h;

          const cont = CONTINENTS_LORE.find((c) => c.id === p.id);

          return {
            id: p.id,
            name: cont?.name || p.id,
            x: screenX,
            y: screenY,
            visible: dot > 0.18, // Only visible if front-facing
            color: cont?.color || '#ffd28a',
          };
        });

        setScreenPins(updatedScreenPins);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;

      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [autoRotate]);

  // Pointer / Drag Controls for Smooth Globe Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    targetRotation.current.y += deltaX * 0.006;
    targetRotation.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, targetRotation.current.x + deltaY * 0.006));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Wheel Zoom Control
  const handleWheel = (e: React.WheelEvent) => {
    targetZoom.current = Math.max(3.2, Math.min(8.0, targetZoom.current + e.deltaY * 0.0035));
  };

  // Fly-To Continent Action
  const focusContinent = useCallback((cont: ContinentLore) => {
    setSelectedContinent(cont);
    setAutoRotate(false);

    // Calculate spherical angles for this continent
    const lon = (cont.mapX / 100) * 360 - 180;
    const lat = 90 - (cont.mapY / 100) * 180;

    const phi = (lat * Math.PI) / 180;
    const theta = (lon * Math.PI) / 180;

    // Smoothly rotate globe so continent faces camera (Z-axis)
    targetRotation.current.x = phi;
    targetRotation.current.y = -theta - Math.PI / 2;
    targetZoom.current = 3.6; // Dramatic close-up zoom
  }, []);

  const resetView = () => {
    setSelectedContinent(null);
    targetRotation.current.x = 0.1;
    targetRotation.current.y = 0;
    targetZoom.current = 4.8;
    setAutoRotate(true);
  };

  return (
    <div className={cn(
      "relative w-full overflow-hidden select-none font-sans rounded-3xl border border-[#d8aa5c]/35 shadow-[0_30px_90px_rgba(0,0,0,0.98)] bg-[#02050a]",
      isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[680px] lg:h-[760px]"
    )}>
      {/* 1. THREE.JS CANVAS CONTAINER */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* 2. PROJECTED 3D PIN LABELS ON SCREEN */}
      {screenPins.map((pin) => {
        if (!pin.visible) return null;
        const cont = CONTINENTS_LORE.find((c) => c.id === pin.id);
        const isHovered = hoveredContinent?.id === pin.id;
        const isSelected = selectedContinent?.id === pin.id;

        return (
          <div
            key={pin.id}
            style={{
              position: 'absolute',
              left: `${pin.x}px`,
              top: `${pin.y}px`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'auto',
            }}
            className="group cursor-pointer transition-all duration-200 z-20"
            onClick={(e) => {
              e.stopPropagation();
              if (cont) focusContinent(cont);
            }}
            onMouseEnter={() => setHoveredContinent(cont || null)}
            onMouseLeave={() => setHoveredContinent(null)}
          >
            {/* Pulsing Aura Badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md transition-all shadow-[0_4px_20px_rgba(0,0,0,0.85)]",
              isSelected 
                ? "bg-[#d8aa5c] text-black border-white shadow-[0_0_25px_rgba(216,170,92,0.9)] scale-110" 
                : isHovered
                ? "bg-black/85 text-[#fef5e0] border-[#d8aa5c] scale-105"
                : "bg-black/60 text-[#dfb872] border-[#d8aa5c]/40 hover:border-[#d8aa5c]"
            )}>
              <span 
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: pin.color }}
              />
              <span className="text-xs font-bold tracking-widest uppercase font-display">
                {pin.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* 3. TOP TACTICAL HUD BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        {/* Left: World Astrolabe Badge */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/60 backdrop-blur-md border border-[#d8aa5c]/35 px-4 py-2 rounded-2xl shadow-xl">
          <Compass className="h-5 w-5 text-[#d8aa5c] animate-spin-slow" />
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[#d8aa5c] uppercase font-bold">
              Esfera Celeste de Calonia
            </div>
            <div className="text-xs font-semibold text-[#fef5e0] font-display">
              Astrolábio Arcano 3D
            </div>
          </div>
        </div>

        {/* Right: Interaction Tools */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[#d8aa5c]/35 p-1.5 rounded-2xl shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#d8aa5c] hover:bg-white/10"
            title={autoRotate ? "Pausar Rotação" : "Girar Automaticamente"}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#d8aa5c] hover:bg-white/10"
            title="Resetar Visão Orbital"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-colors",
              audioActive ? "text-amber-400 bg-amber-400/20" : "text-[#d8aa5c] hover:bg-white/10"
            )}
            title={audioActive ? "Desativar Ressonância Cósmica" : "Ativar Ressonância Cósmica"}
            onClick={toggleAudio}
          >
            {audioActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#d8aa5c] hover:bg-white/10"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 4. BOTTOM CONTINENT QUICK-NAV DOCK */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center pointer-events-none z-30">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full p-2 bg-black/70 backdrop-blur-lg border border-[#d8aa5c]/40 rounded-2xl shadow-2xl">
          {CONTINENTS_LORE.map((c) => {
            const isSelected = selectedContinent?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => focusContinent(c)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-[#d8aa5c] text-black shadow-[0_0_18px_rgba(216,170,92,0.8)] scale-105"
                    : "text-[#d8aa5c]/80 hover:text-white hover:bg-white/10"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SLIDE-OUT LORE DRAWER (WHEN CONTINENT SELECTED) */}
      {selectedContinent && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#03060df2] backdrop-blur-2xl border-l border-[#d8aa5c]/35 shadow-[-20px_0_60px_rgba(0,0,0,0.95)] z-40 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header Banner Image */}
          <div className="relative w-full h-48 overflow-hidden bg-black/80 flex-shrink-0">
            <img 
              src={selectedContinent.imageUrl} 
              alt={selectedContinent.name}
              className="w-full h-full object-cover brightness-[0.75]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03060d] via-transparent to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedContinent(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 border border-white/20 transition-all"
              title="Fechar Detalhes"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Badge */}
            <div className="absolute bottom-3 left-6">
              <span className="text-[10px] tracking-[0.25em] text-[#d8aa5c] uppercase font-bold block mb-1">
                {selectedContinent.subtitle}
              </span>
              <h2 className="text-2xl font-extrabold text-[#fef5e0] font-display uppercase tracking-wide">
                {selectedContinent.name}
              </h2>
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-[#cfc8b8] custom-scrollbar">
            {/* Motto / Title */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-[#d8aa5c] font-semibold mb-0.5">Título Ancestral</div>
              <div className="text-sm font-bold text-white font-display">
                "{selectedContinent.title}"
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[#a09a8d] block mb-1">Afinidade:</span>
                <span className="font-semibold text-[#fef5e0]">{selectedContinent.element}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[#a09a8d] block mb-1">Capital:</span>
                <span className="font-semibold text-[#fef5e0]">{selectedContinent.capital}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[#a09a8d] block mb-1">Governante:</span>
                <span className="font-semibold text-[#fef5e0]">{selectedContinent.ruler}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[#a09a8d] block mb-1">Clima:</span>
                <span className="font-semibold text-[#fef5e0]">{selectedContinent.climate}</span>
              </div>
            </div>

            {/* Lore Description */}
            <div className="space-y-2 leading-relaxed">
              <h3 className="text-xs uppercase font-bold text-[#d8aa5c] tracking-wider">
                Crônicas Territoriais
              </h3>
              <p className="text-xs sm:text-sm text-[#cfc8b8]">
                {selectedContinent.description}
              </p>
              <p className="text-xs sm:text-sm text-[#a39c8f] italic">
                {selectedContinent.details}
              </p>
            </div>

            {/* Novel Chapters linked to this land */}
            {selectedContinent.chapters.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-[#d8aa5c]" />
                  <h4 className="text-xs uppercase font-bold text-[#fef5e0] tracking-wider">
                    Capítulos que se passam aqui:
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {selectedContinent.chapters.map((chap) => (
                    <button
                      key={chap.slug}
                      onClick={() => setLocation(`/chapters/${chap.slug}`)}
                      className="w-full text-left p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/20 hover:border-amber-400/60 hover:bg-amber-400/15 transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-medium text-[#fef5e0] group-hover:text-amber-300">
                        {chap.title}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-[#d8aa5c]/25 bg-black/50 flex items-center gap-3">
            <Button
              onClick={() => setLocation(`/mundo/${selectedContinent.id}`)}
              className="flex-1 bg-[#d8aa5c] hover:bg-[#c2964b] text-black font-bold font-display uppercase tracking-wider text-xs h-10 shadow-lg"
            >
              Explorar Detalhes Completos
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedContinent(null)}
              className="border-white/20 text-[#cfc8b8] hover:text-white h-10 text-xs"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
