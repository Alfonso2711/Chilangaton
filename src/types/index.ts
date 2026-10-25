export type MarketType = 'mercado' | 'tianguis';

export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  alcaldia: string;
  colonia: string;
  address: string;
  schedule: string;
  activeDays: DayOfWeek[];
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  stallsCount: number;
  description: string;
  image: string;
  distanceKm: number;
}

export type StallCategory =
  | 'Frutas y Verduras'
  | 'Carnes y Pollería'
  | 'Abarrotes y Granos'
  | 'Cremería y Lácteos'
  | 'Chiles Secos y Especies'
  | 'Flores y Plantas'
  | 'Comida Preparada';

export type TrustLevel = 1 | 2 | 3; // 1: Tienda Básica (Popular), 2: Tienda Verificada (Bancarizada CoDi), 3: Tienda Oficial (Pre-candidato FONDESO)

export interface TrustProfile {
  level: TrustLevel;
  levelName: string;
  score: number; // 0 to 100
  registeredSalesMonth: number;
  monthlyOrdersCount: number;
  acceptsDigitalPayments: boolean;
  preQualifiedCreditAmount: number; // e.g. 10000 MXN
  hasRFC: boolean;
  selloComercioSeguro: boolean;
  bankAccountLinked?: string; // e.g. "Cuenta Nivel 2 Banxico (CoDi)"
}

export interface Stall {
  id: string;
  marketId: string;
  marketName: string;
  stallNumber: string;
  name: string;
  ownerName: string;
  category: StallCategory;
  phone: string;
  whatsAppBotEnabled: boolean;
  rating: number;
  trustProfile: TrustProfile;
  schedule: string;
  cubiculoCoords: {
    section: string;
    booth: string;
  };
  avatar: string;
  bannerImage: string;
  lastVoiceUpdate: string;
}

export interface Product {
  id: string;
  stallId: string;
  stallName: string;
  marketId: string;
  marketName: string;
  name: string;
  category: StallCategory;
  price: number; // Price in MXN at CanastaLocal
  supermarketPrice: number; // Equivalent price at Walmart/Chedraui
  conveniencePrice: number; // Equivalent price at OXXO/7-Eleven
  unit: string; // "kg", "pieza", "manojo", "litro", "medio kg"
  inStock: boolean;
  stockQty?: number;
  origin: string; // e.g., "Milpa Alta, CDMX", "Puebla", "Xochimilco", "Central de Abasto"
  badge?: 'Fresco de Hoy' | 'Oferta Barrial' | 'Orgánico Local' | 'Agotándose';
  image: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  deliveryType: 'bici' | 'pickup';
  pickupStalls: string[];
  status: 'recibido' | 'preparando' | 'en_camino' | 'entregado';
  paymentMethod: 'efectivo' | 'codi_dimo' | 'spei';
  totalCanastaLocal: number;
  totalSupermercado: number;
  totalSavings: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryFee: number;
  // Recolección presencial en cubículos (RF-08 / RF-14)
  pickupToken?: string;
  notes?: string;
  cashTendered?: number;
}

export interface VoiceInventoryParseResult {
  rawTranscript: string;
  action: 'ACTUALIZAR_PRECIO' | 'MARCAR_AGOTADO' | 'MARCAR_DISPONIBLE' | 'AGREGAR_PRODUCTO' | 'CONSULTAR';
  productName: string;
  variety?: string;
  price?: number;
  unit?: string;
  confidence: number;
  ambiguityDetected: boolean;
  ambiguousOptions?: { id: string; name: string }[];
  matchedProductId?: string;
  explanation: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'locatario' | 'bot';
  timestamp: string;
  type: 'text' | 'audio';
  content: string;
  audioDuration?: string;
  status?: 'enviado' | 'procesando' | 'actualizado';
  parsedData?: VoiceInventoryParseResult;
}

export type ActiveAppView =
  | 'comprador'
  | 'locatario'
  | 'whatsapp_bot'
  | 'gobierno_b2g'
  | 'mercados_mapa'
  | 'admin_territorial'
  // Cliente
  | 'mi_canasta' // RF-12: Carrito multivendedor (pantalla completa)
  | 'croquis_ruteo' // RF-08: Croquis 2D y ruteo de recolección
  // Vendedor (portal de negocios)
  | 'vendedor_ia' // Sincronización por IA (historial WhatsApp)
  | 'vendedor_inventario' // Inventario de productos
  | 'vendedor_pedidos' // Ventas y pedidos / fichas de recolección
  | 'vendedor_ajustes'; // Ajustes del puesto e inclusión financiera

/** Vistas permitidas por rol (las usa el guardia de navegación del contexto). */
export const CLIENTE_VIEWS: ActiveAppView[] = ['comprador', 'mercados_mapa', 'mi_canasta', 'croquis_ruteo'];
export const VENDEDOR_VIEWS: ActiveAppView[] = [
  'locatario',
  'whatsapp_bot',
  'vendedor_ia',
  'vendedor_inventario',
  'vendedor_pedidos',
  'vendedor_ajustes',
];
export const ADMIN_VIEWS: ActiveAppView[] = ['gobierno_b2g', 'admin_territorial'];

/** Estado de cada parada (puesto) dentro de una ficha de recolección. */
export type StopStatus = 'pendiente' | 'preparando' | 'en_bascula' | 'listo' | 'recolectado' | 'incidencia';

export interface PickupProgress {
  statuses: Record<string, StopStatus>; // stallId -> estado
  incidents: Record<string, string>; // stallId -> motivo
}

/** Canasta de compra recurrente pre-armada o guardada por el usuario (1-clic reorder) */
export interface FrequentBasket {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  items: { productId: string; quantity: number }[];
  approxTotal: number;
  savingsVsSuper: number;
}

export type UserRole = 'admin' | 'cliente' | 'vendedor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
  badgeText: string;
  organization?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface SedecoPriceItem {
  id: string;
  productName: string;
  category: string;
  unit: string;
  mercadosPublicos: PriceRange;
  mercadosMoviles: PriceRange;
  mercadosSobreRuedas: PriceRange;
  centrosComerciales: PriceRange;
  calculatedAverage: number;
  spreadVsSupermarketPct: number;
  tendency: 'baja' | 'estable' | 'alta';
  updatedAt: string;
}

export interface AdminAssignment {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  email: string;
  phone: string;
  alcaldia: string;
  zone: string;
  assignedMarkets: string[];
  assignedTianguis: string[];
  assignedComerciosCount: number;
  reportsCount: number;
  status: 'al_corriente' | 'inspeccion_pendiente' | 'alerta';
}

export interface BuyerReport {
  id: string;
  folio: string;
  adminId: string;
  adminName: string;
  buyerName: string;
  buyerPhone?: string;
  vendorName: string;
  stallNumber?: string;
  venueName: string;
  alcaldia: string;
  incidentType:
    | 'Báscula no calibrada / Kilos incompletos'
    | 'No respetar precio exhibido / Sobreprecio'
    | 'Producto en mal estado / Falta de higiene'
    | 'Negativa de venta o condicionamiento'
    | 'Mala conducta / Acoso en pasillo'
    | 'Incumplimiento de horario o reglamento';
  severity: 'alta' | 'media' | 'baja';
  description: string;
  status: 'pendiente' | 'en_investigacion' | 'inspector_asignado' | 'resuelto' | 'sancionado';
  createdAt: string;
}


export interface ComercioBarrialItem {
  id: string;
  name: string;
  type: 'Mercado Público' | 'Tianguis Sobre Ruedas' | 'Comercio Popular Local';
  venueName: string;
  alcaldia: string;
  colonia: string;
  stallNumber: string;
  category: string;
  ownerName: string;
  phone: string;
  trustLevel: number;
  assignedAdminId: string;
  assignedAdminName: string;
  assignedAdminEmail: string;
  assignedAdminPhone: string;
  assignedAdminZone: string;
  status: 'activo' | 'en_regularizacion' | 'sin_incidencias';
  updatedAt: string;
}



