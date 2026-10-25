import { CartItem, Stall, StallCategory } from '../types';

/**
 * Distribución espacial 2D (RF-08) de la nave del mercado.
 * Cada pasillo agrupa giros comerciales; los puestos con pedido se insertan
 * en el pasillo de su giro y el resto de cubículos se muestran como
 * "comercio regular" para dar contexto al croquis.
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
    id: 'central',
    label: 'Pasillo Central · Lácteos y Tradición',
    short: 'Pasillo Central',
    quadrant: 'E',
    tone: 'accent',
    categories: ['Cremería y Lácteos'],
    filler: [
      { number: '#32', name: 'Quesos Chipilo' },
      { number: '#33', name: 'Mantequilla Real' },
      { number: '#35', name: 'Embutidos Puebla' },
      { number: '#36', name: 'Cremas del Rancho' },
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
  cell: string; // ej. "B42"
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

/** Agrupa el carrito por cubículo físico, ordenado según la ruta óptima (orden de pasillos). */
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

/** Lista legible de pasillos a recorrer: "Pasillo 2, 3 y Central". */
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
