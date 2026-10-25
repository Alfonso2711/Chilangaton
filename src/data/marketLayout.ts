import { CartItem, Stall, StallCategory } from '../types';

/**
 * Distribución espacial 2D (RF-08) de la nave del mercado tradicional de la CDMX.
 * Define la cuadrícula arquitectónica, puestos físicos, coordenadas SVG y ruteo peatonal.
 */

export type AisleTone = 'neutral' | 'primary' | 'accent';

export interface AisleDef {
  id: string;
  label: string;
  short: string;
  quadrant: string;
  tone: AisleTone;
  categories: StallCategory[];
  filler: { number: string; name: string; available?: boolean }[];
}

export const MARKET_AISLES: AisleDef[] = [
  {
    id: 'p1',
    label: 'Pasillo 1 · Abarrotes y Semillas',
    short: 'Pasillo 1',
    quadrant: 'A',
    tone: 'neutral',
    categories: ['Abarrotes y Granos', 'Chiles Secos y Especies'],
    filler: [
      { number: '#01', name: 'Especias Lupita' },
      { number: '#03', name: 'Chiles Secos Mario' },
      { number: '#05', name: 'Granos Selectos', available: true },
      { number: '#07', name: 'Semillas El Águila' },
      { number: '#10', name: 'Molino Central' },
    ],
  },
  {
    id: 'p2',
    label: 'Pasillo 2 · Recaudería y Hortalizas',
    short: 'Pasillo 2',
    quadrant: 'B',
    tone: 'primary',
    categories: ['Frutas y Verduras'],
    filler: [
      { number: '#11', name: 'Hortalizas Xochimilco' },
      { number: '#13', name: 'Verduras San Juan' },
      { number: '#14', name: 'Chiles y Papas Tita' },
      { number: '#15', name: 'Nopales Milpa Alta' },
    ],
  },
  {
    id: 'central',
    label: 'Pasillo Central · Lácteos y Tradición',
    short: 'Pasillo Central',
    quadrant: 'E',
    tone: 'accent',
    categories: ['Cremería y Lácteos'],
    filler: [
      { number: '#31', name: 'Quesos Chipilo' },
      { number: '#32', name: 'Mantequilla Real' },
      { number: '#33', name: 'Embutidos Puebla' },
      { number: '#35', name: 'Cremas del Rancho' },
    ],
  },
  {
    id: 'p3',
    label: 'Pasillo 3 · Flores y Temporada',
    short: 'Pasillo 3',
    quadrant: 'C',
    tone: 'primary',
    categories: ['Flores y Plantas', 'Comida Preparada'],
    filler: [
      { number: '#16', name: 'Cítricos El Sol' },
      { number: '#17', name: 'Mangos Michoacán' },
      { number: '#19', name: 'Platanera Tabasco' },
      { number: '#20', name: 'Flores La Jamaica', available: true },
    ],
  },
  {
    id: 'p4',
    label: 'Pasillo 4 · Carnicerías y Pollerías',
    short: 'Pasillo 4',
    quadrant: 'D',
    tone: 'neutral',
    categories: ['Carnes y Pollería'],
    filler: [
      { number: '#25', name: 'Pollería Mary' },
      { number: '#26', name: 'Carnes La Fe' },
      { number: '#27', name: 'Pollo San Juan' },
      { number: '#28', name: 'Tocinería Alex' },
      { number: '#29', name: 'Obrador Don José' },
    ],
  },
];

export const getAisleForCategory = (category: StallCategory): AisleDef =>
  MARKET_AISLES.find((a) => a.categories.includes(category)) || MARKET_AISLES[0];

const stallNumberValue = (stallNumber: string) => {
  const n = parseInt(stallNumber.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

/** Datos de ubicación y preparación de un puesto físico. */
export interface StallLocation {
  stallId: string;
  stallNumber: string;
  stallName: string;
  ownerName: string;
  avatar?: string;
  phone?: string;
  aisle: AisleDef;
  cell: string;
  prepMinutes: number;
}

export const getStallLocation = (
  stallId: string,
  stalls: Stall[],
  fallback: { stallName: string; category: StallCategory }
): StallLocation => {
  const stall = stalls.find((s) => s.id === stallId);
  const category = stall?.category || fallback.category;
  const aisle = getAisleForCategory(category);
  const stallNumber = stall?.stallNumber || '#00';
  const num = stallNumberValue(stallNumber);
  return {
    stallId,
    stallNumber,
    stallName: stall?.name || fallback.stallName,
    ownerName: stall?.ownerName || 'Locatario',
    avatar: stall?.avatar,
    phone: stall?.phone,
    aisle,
    cell: `${aisle.quadrant}${num}`,
    prepMinutes: [5, 10, 8][num % 3],
  };
};

/** Agrupa el carrito por cubículo físico, ordenado según la ruta óptima. */
export interface StallBox {
  location: StallLocation;
  items: CartItem[];
  subtotal: number;
}

export const groupItemsByStall = (items: CartItem[], stalls: Stall[]): StallBox[] => {
  const map = new Map<string, StallBox>();
  items.forEach((item) => {
    const key = item.product.stallId;
    if (!map.has(key)) {
      map.set(key, {
        location: getStallLocation(key, stalls, {
          stallName: item.product.stallName,
          category: item.product.category,
        }),
        items: [],
        subtotal: 0,
      });
    }
    const box = map.get(key)!;
    box.items.push(item);
    box.subtotal += item.product.price * item.quantity;
  });

  const aisleIndex = (id: string) => MARKET_AISLES.findIndex((a) => a.id === id);
  return Array.from(map.values()).sort((a, b) => {
    const diff = aisleIndex(a.location.aisle.id) - aisleIndex(b.location.aisle.id);
    if (diff !== 0) return diff;
    return stallNumberValue(a.location.stallNumber) - stallNumberValue(b.location.stallNumber);
  });
};

/** Lista legible de pasillos a recorrer. */
export const describeAisles = (boxes: StallBox[]): string => {
  const names: string[] = [];
  boxes.forEach((b) => {
    const label = b.location.aisle.short.replace('Pasillo ', '');
    if (!names.includes(label)) names.push(label);
  });
  if (names.length === 0) return '';
  const prefix = names.length === 1 ? 'Pasillo' : 'Pasillos';
  if (names.length === 1) return `${prefix} ${names[0]}`;
  return `${prefix} ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
};

/* ------------------------------------------------------------------ */
/* Modelo Vectorial 2D para el Mapa Interactivo (Indoor Blueprint)    */
/* ------------------------------------------------------------------ */

export interface BlueprintStall {
  id: string; // stallId si coincide con mockData, o id sintético
  number: string;
  name: string;
  category: StallCategory;
  aisleId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  doorPoint: { x: number; y: number }; // punto en el pasillo para el comprador
  iconColor: string;
}

/**
 * Puestos colocados geométricamente en la nave del mercado (viewBox 0 0 1000 660).
 * La nave tiene 4 pasillos verticales principales y 1 pasillo transversal central.
 */
export const MARKET_BLUEPRINT_STALLS: BlueprintStall[] = [
  // --- NAVE IZQUIERDA: Pasillo 1 (Abarrotes y Chiles Secos) [x: 100-240]
  {
    id: 'stall-semillas-01',
    number: '#01',
    name: 'Especias Lupita',
    category: 'Chiles Secos y Especies',
    aisleId: 'p1',
    x: 80,
    y: 110,
    width: 100,
    height: 70,
    doorPoint: { x: 215, y: 145 },
    iconColor: '#b45309',
  },
  {
    id: 'stall-semillas-xochi',
    number: '#P-04',
    name: 'Semillas y Chiles Los Volcanes',
    category: 'Chiles Secos y Especies',
    aisleId: 'p1',
    x: 80,
    y: 200,
    width: 100,
    height: 70,
    doorPoint: { x: 215, y: 235 },
    iconColor: '#b45309',
  },
  {
    id: 'stall-granos-05',
    number: '#05',
    name: 'Granos Selectos San Jerónimo',
    category: 'Abarrotes y Granos',
    aisleId: 'p1',
    x: 80,
    y: 370,
    width: 100,
    height: 70,
    doorPoint: { x: 215, y: 405 },
    iconColor: '#78350f',
  },
  {
    id: 'stall-don-pepe',
    number: '#09',
    name: 'Cremería y Quesos Don Pepe',
    category: 'Cremería y Lácteos',
    aisleId: 'central',
    x: 80,
    y: 460,
    width: 100,
    height: 70,
    doorPoint: { x: 215, y: 495 },
    iconColor: '#d97706',
  },

  // --- NAVE CENTRO-IZQUIERDA: Pasillo 2 (Frutas, Hortalizas y Verduras) [x: 250-400]
  {
    id: 'stall-hortalizas-11',
    number: '#11',
    name: 'Hortalizas Xochimilco Frescas',
    category: 'Frutas y Verduras',
    aisleId: 'p2',
    x: 250,
    y: 110,
    width: 105,
    height: 70,
    doorPoint: { x: 390, y: 145 },
    iconColor: '#15803d',
  },
  {
    id: 'stall-verduras-13',
    number: '#13',
    name: 'Verduras San Juan Selectas',
    category: 'Frutas y Verduras',
    aisleId: 'p2',
    x: 250,
    y: 200,
    width: 105,
    height: 70,
    doorPoint: { x: 390, y: 235 },
    iconColor: '#15803d',
  },
  {
    id: 'stall-dona-mary',
    number: '#42',
    name: 'Frutas y Verduras Doña Mary',
    category: 'Frutas y Verduras',
    aisleId: 'p2',
    x: 250,
    y: 370,
    width: 105,
    height: 70,
    doorPoint: { x: 390, y: 405 },
    iconColor: '#006948',
  },
  {
    id: 'stall-nopales-15',
    number: '#15',
    name: 'Nopales y Papas Milpa Alta',
    category: 'Frutas y Verduras',
    aisleId: 'p2',
    x: 250,
    y: 460,
    width: 105,
    height: 70,
    doorPoint: { x: 390, y: 495 },
    iconColor: '#15803d',
  },

  // --- NAVE CENTRAL TRANSVERSAL: Pabellón Gastronómico y Tradición [x: 430-570]
  {
    id: 'stall-quesos-chipilo',
    number: '#31',
    name: 'Quesos Chipilo de Puebla',
    category: 'Cremería y Lácteos',
    aisleId: 'central',
    x: 440,
    y: 110,
    width: 120,
    height: 70,
    doorPoint: { x: 500, y: 195 },
    iconColor: '#ea580c',
  },
  {
    id: 'stall-mantequilla-32',
    number: '#32',
    name: 'Mantequilla y Crema Real',
    category: 'Cremería y Lácteos',
    aisleId: 'central',
    x: 440,
    y: 460,
    width: 120,
    height: 70,
    doorPoint: { x: 500, y: 445 },
    iconColor: '#ea580c',
  },

  // --- NAVE CENTRO-DERECHA: Pasillo 3 (Flores y Frutas de Temporada) [x: 600-750]
  {
    id: 'stall-citricos-16',
    number: '#16',
    name: 'Cítricos El Sol Michoacán',
    category: 'Frutas y Verduras',
    aisleId: 'p3',
    x: 630,
    y: 110,
    width: 105,
    height: 70,
    doorPoint: { x: 605, y: 145 },
    iconColor: '#ca8a04',
  },
  {
    id: 'stall-mangos-17',
    number: '#17',
    name: 'Mangos y Papayas Costa Chica',
    category: 'Frutas y Verduras',
    aisleId: 'p3',
    x: 630,
    y: 200,
    width: 105,
    height: 70,
    doorPoint: { x: 605, y: 235 },
    iconColor: '#ca8a04',
  },
  {
    id: 'stall-flores-20',
    number: '#20',
    name: 'Florería La Jamaica Tradición',
    category: 'Flores y Plantas',
    aisleId: 'p3',
    x: 630,
    y: 370,
    width: 105,
    height: 70,
    doorPoint: { x: 605, y: 405 },
    iconColor: '#db2777',
  },
  {
    id: 'stall-platanera-19',
    number: '#19',
    name: 'Platanera Tabasco y Berries',
    category: 'Frutas y Verduras',
    aisleId: 'p3',
    x: 630,
    y: 460,
    width: 105,
    height: 70,
    doorPoint: { x: 605, y: 495 },
    iconColor: '#ca8a04',
  },

  // --- NAVE DERECHA: Pasillo 4 (Carnes y Pollerías) [x: 770-920]
  {
    id: 'stall-la-fama',
    number: '#18',
    name: 'Carnicería & Pollería La Fama',
    category: 'Carnes y Pollería',
    aisleId: 'p4',
    x: 800,
    y: 110,
    width: 110,
    height: 70,
    doorPoint: { x: 775, y: 145 },
    iconColor: '#b91c1c',
  },
  {
    id: 'stall-carnes-la-fe',
    number: '#26',
    name: 'Carnes Selectas La Fe',
    category: 'Carnes y Pollería',
    aisleId: 'p4',
    x: 800,
    y: 200,
    width: 110,
    height: 70,
    doorPoint: { x: 775, y: 235 },
    iconColor: '#b91c1c',
  },
  {
    id: 'stall-pollo-san-juan',
    number: '#27',
    name: 'Pollería San Juan de Aragón',
    category: 'Carnes y Pollería',
    aisleId: 'p4',
    x: 800,
    y: 370,
    width: 110,
    height: 70,
    doorPoint: { x: 775, y: 405 },
    iconColor: '#b91c1c',
  },
  {
    id: 'stall-obrador-jose',
    number: '#29',
    name: 'Obrador y Cecina Don José',
    category: 'Carnes y Pollería',
    aisleId: 'p4',
    x: 800,
    y: 460,
    width: 110,
    height: 70,
    doorPoint: { x: 775, y: 495 },
    iconColor: '#b91c1c',
  },
];

/** Puntos fijos de arquitectura en el mercado. */
export const MARKET_ARCH_ELEMENTS = {
  viewBox: '0 0 1000 660',
  width: 1000,
  height: 660,
  entrance: { x: 500, y: 35, label: 'Acceso Norte · Eje Central' },
  exit: { x: 500, y: 625, label: 'Salida Sur · Calle Medellín' },
  bascula: { x: 865, y: 575, label: 'Báscula del Consumidor (PROFECO)' },
  administracion: { x: 135, y: 575, label: 'Administración y Locutorio' },
  corridorNorth: { y: 65 },
  corridorCenter: { y: 315 },
  corridorSouth: { y: 575 },
};

/**
 * Busca las coordenadas de un puesto según su stallId o stallNumber.
 */
export const findBlueprintStall = (stallId: string, stallNumber?: string): BlueprintStall | undefined => {
  return (
    MARKET_BLUEPRINT_STALLS.find((s) => s.id === stallId) ||
    MARKET_BLUEPRINT_STALLS.find((s) => s.number === stallNumber) ||
    MARKET_BLUEPRINT_STALLS.find((s) => s.name.toLowerCase().includes(stallId.toLowerCase()))
  );
};

/**
 * Genera el trazado SVG peatonal que conecta la entrada, los puestos a visitar y la salida.
 */
export const buildWalkingRoutePath = (stops: StallBox[]): { pathD: string; waypoints: { x: number; y: number }[] } => {
  if (stops.length === 0) return { pathD: '', waypoints: [] };

  const start = { x: MARKET_ARCH_ELEMENTS.entrance.x, y: MARKET_ARCH_ELEMENTS.corridorNorth.y };
  const waypoints: { x: number; y: number }[] = [start];

  stops.forEach((s) => {
    const bp = findBlueprintStall(s.location.stallId, s.location.stallNumber);
    if (!bp) return;
    const pt = bp.doorPoint;

    // Pasillo transversal intermedio para caminar naturalmente
    const lastPt = waypoints[waypoints.length - 1];
    if (Math.abs(lastPt.x - pt.x) > 60) {
      const transitY = pt.y > 315 ? MARKET_ARCH_ELEMENTS.corridorCenter.y : MARKET_ARCH_ELEMENTS.corridorNorth.y;
      waypoints.push({ x: lastPt.x, y: transitY });
      waypoints.push({ x: pt.x, y: transitY });
    }
    waypoints.push(pt);
  });

  const lastWp = waypoints[waypoints.length - 1];
  const exitTransit = { x: lastWp.x, y: MARKET_ARCH_ELEMENTS.corridorSouth.y };
  const end = { x: MARKET_ARCH_ELEMENTS.exit.x, y: MARKET_ARCH_ELEMENTS.corridorSouth.y };
  waypoints.push(exitTransit);
  waypoints.push(end);
  waypoints.push({ x: MARKET_ARCH_ELEMENTS.exit.x, y: MARKET_ARCH_ELEMENTS.exit.y });

  // Construir comando SVG M y L
  let pathD = `M ${waypoints[0].x} ${waypoints[0].y}`;
  for (let i = 1; i < waypoints.length; i++) {
    pathD += ` L ${waypoints[i].x} ${waypoints[i].y}`;
  }

  return { pathD, waypoints };
};
