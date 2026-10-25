import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { CartItem, PickupProgress, StopStatus } from '../types';
import {
  MARKET_AISLES,
  StallBox,
  groupItemsByStall,
  MARKET_BLUEPRINT_STALLS,
  MARKET_ARCH_ELEMENTS,
  BlueprintStall,
  findBlueprintStall,
  buildWalkingRoutePath,
} from '../data/marketLayout';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  DoorOpen,
  Filter,
  Maximize2,
  Minimize2,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  RotateCcw,
  Route,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Store,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Constantes de Estado y Etiquetas                                   */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<StopStatus, string> = {
  pendiente: 'Sin ficha',
  preparando: 'Preparando',
  en_bascula: 'En báscula',
  listo: 'Listo para retiro',
  recolectado: 'Recolectado',
  incidencia: 'Incidencia',
};

const STATUS_BADGE: Record<StopStatus, { bg: string; text: string; dot: string }> = {
  pendiente: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  preparando: { bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500 animate-pulse' },
  en_bascula: { bg: 'bg-orange-50', text: 'text-orange-800', dot: 'bg-orange-500 animate-pulse' },
  listo: { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  recolectado: { bg: 'bg-[#006948] text-white', text: 'text-white', dot: 'bg-white' },
  incidencia: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const INCIDENT_REASONS = [
  'Báscula no calibrada / Kilo incompleto',
  'Producto faltante o no surtido',
  'Puesto cerrado temporalmente',
  'Diferencia con el precio acordado',
];

const CATEGORY_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'mis_paradas', label: '🎯 Solo mis paradas' },
  { id: 'Frutas y Verduras', label: '🥦 Frutas y Verduras' },
  { id: 'Cremería y Lácteos', label: '🧀 Cremería' },
  { id: 'Carnes y Pollería', label: '🥩 Carnes' },
  { id: 'Chiles Secos y Especies', label: '🌶️ Chiles y Semillas' },
];

const money = (n: number) => `$${n.toFixed(2)}`;
const EMPTY: PickupProgress = { statuses: {}, incidents: {} };

/** Patrón QR determinista para la ficha de retiro del cliente. */
const QrPattern: React.FC<{ value: string; size?: number }> = ({ value, size = 180 }) => {
  const n = 25;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if (rand() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }
  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className="bg-white" shapeRendering="crispEdges">
      <g fill="#131b2e">
        {cells}
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Componente Principal                                                */
/* ------------------------------------------------------------------ */

export const CroquisRuteoView: React.FC = () => {
  const {
    cart,
    stalls,
    selectedMarket,
    activeOrder,
    croquisPreview,
    setCroquisPreview,
    setActiveView,
    updateOrderStatus,
    setRecentNotification,
    pickupProgress,
    setStopStatus,
    reportStopIncident,
    merchantStall,
  } = useApp();

  const order =
    !croquisPreview && activeOrder && activeOrder.deliveryType === 'pickup' ? activeOrder : undefined;
  const preview = !order;
  const items: CartItem[] = order ? order.items : cart;
  const stops = useMemo(() => groupItemsByStall(items, stalls), [items, stalls]);
  const stopIds = stops.map((s) => s.location.stallId).join('|');

  /* ---------- Estado de la ruta sincronizado en vivo ---------- */
  const route: PickupProgress = (order && pickupProgress[order.id]) || EMPTY;

  // Simulación en vivo del avance de locatarios (preparando → en báscula → empacado)
  useEffect(() => {
    if (!order) return;
    const pending = stops
      .map((s) => s.location.stallId)
      .filter((sid) => {
        const st = route.statuses[sid] || 'preparando';
        return st === 'preparando' || st === 'en_bascula';
      });
    if (pending.length === 0) return;
    const others = pending.filter((sid) => sid !== merchantStall.id);
    const target = others[0] || pending[0];
    const delay = others.length ? 5000 : 15000;
    const timer = window.setTimeout(() => {
      const st = route.statuses[target] || 'preparando';
      setStopStatus(order.id, target, st === 'preparando' ? 'en_bascula' : 'listo');
    }, delay);
    return () => window.clearTimeout(timer);
  }, [order?.id, stopIds, route]);

  const statusOf = (stallId: string): StopStatus =>
    preview ? 'pendiente' : route.statuses[stallId] || 'preparando';

  const doneCount = stops.filter((s) => statusOf(s.location.stallId) === 'recolectado').length;
  const readyCount = stops.filter((s) => {
    const st = statusOf(s.location.stallId);
    return st === 'listo' || st === 'recolectado';
  }).length;
  const allDone = !preview && stops.length > 0 && doneCount === stops.length;
  const nextPendingIdx = stops.findIndex((s) => statusOf(s.location.stallId) !== 'recolectado');

  /* ---------- Estado de Interacción del Mapa ---------- */
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('todos');
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<number>(0);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [incidentOpen, setIncidentOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selección automática inicial de la primera parada
  useEffect(() => {
    if (stops.length > 0 && !selectedStallId) {
      setSelectedStallId(stops[0].location.stallId);
    }
  }, [stops, selectedStallId]);

  // Si entra a modo guiado, alinear con la siguiente parada pendiente
  useEffect(() => {
    if (isGuidedMode && nextPendingIdx !== -1) {
      setGuidedStep(nextPendingIdx);
      setSelectedStallId(stops[nextPendingIdx].location.stallId);
    }
  }, [isGuidedMode]);

  // Festejo con confeti cuando todo es recolectado
  const closedRef = useRef<string | null>(null);
  useEffect(() => {
    if (allDone && order && closedRef.current !== order.id) {
      closedRef.current = order.id;
      setIsGuidedMode(false);
      if (order.status !== 'entregado') updateOrderStatus(order.id, 'entregado');
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#006948', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Confetti ignorado si no hay soporte
      }
    }
  }, [allDone, order, updateOrderStatus]);

  // Manejo de teclado (Escape para modales)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQrModal(false);
        setIncidentOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- Operaciones de Recolección ---------- */
  const handleMarkCollected = (stallId: string, stallNumber: string, stallName: string) => {
    if (order) {
      setStopStatus(order.id, stallId, 'recolectado');
      setRecentNotification(`✅ Puesto ${stallNumber} validado con tu ficha · ${stallName}`);
      window.setTimeout(() => setRecentNotification(null), 3000);

      // Si estamos en modo guiado, avanzar a la siguiente parada pendiente
      if (isGuidedMode) {
        const nextIdx = stops.findIndex(
          (s, idx) => idx > guidedStep && statusOf(s.location.stallId) !== 'recolectado'
        );
        if (nextIdx !== -1) {
          setGuidedStep(nextIdx);
          setSelectedStallId(stops[nextIdx].location.stallId);
        } else {
          // Buscar desde el principio
          const firstPending = stops.findIndex(
            (s) => s.location.stallId !== stallId && statusOf(s.location.stallId) !== 'recolectado'
          );
          if (firstPending !== -1) {
            setGuidedStep(firstPending);
            setSelectedStallId(stops[firstPending].location.stallId);
          }
        }
      }
    }
  };

  const handleReportIncident = (stallId: string, stallNumber: string, reason: string) => {
    if (order) {
      reportStopIncident(order.id, stallId, reason);
      setIncidentOpen(false);
      setRecentNotification(`⚠️ Incidencia reportada en Puesto ${stallNumber}: ${reason}. Notificamos a la administración.`);
      window.setTimeout(() => setRecentNotification(null), 4000);
    }
  };

  const handleResolveIncident = (stallId: string) => {
    if (order) {
      reportStopIncident(order.id, stallId, null);
      setIncidentOpen(false);
    }
  };

  /* ---------- Ruteo y Trazado SVG ---------- */
  const walkingRoute = useMemo(() => buildWalkingRoutePath(stops), [stops]);

  // Mapear puestos del plano con información de la canasta
  const stopsByBlueprintId = useMemo(() => {
    const map = new Map<string, { stop: StallBox; index: number }>();
    stops.forEach((stop, index) => {
      const bp = findBlueprintStall(stop.location.stallId, stop.location.stallNumber);
      if (bp) {
        map.set(bp.id, { stop, index });
      }
    });
    return map;
  }, [stops]);

  // Puesto actualmente seleccionado para el BottomSheet
  const activeSelectedStop = useMemo(() => {
    return stops.find((s) => s.location.stallId === selectedStallId) || stops[0];
  }, [stops, selectedStallId]);

  const activeSelectedBlueprint = useMemo(() => {
    if (!activeSelectedStop) return undefined;
    return findBlueprintStall(activeSelectedStop.location.stallId, activeSelectedStop.location.stallNumber);
  }, [activeSelectedStop]);

  /* ---------- Manejadores de Paneo y Zoom ---------- */
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.2, Math.max(0.75, +(prev + delta).toFixed(2))));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setMapPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  /* ---------- Estado Vacío ---------- */
  if (stops.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-[#006948] flex items-center justify-center shadow-inner">
          <Route className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No hay una ruta de recolección activa</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Agrega productos a tu canasta y selecciona <strong>Recolección en Cubículo</strong> para generar tu mapa
          interactivo y ruta de pasillos.
        </p>
        <button
          onClick={() => setActiveView('comprador')}
          className="px-6 h-12 rounded-2xl bg-[#006948] text-white font-bold text-sm hover:bg-emerald-800 transition-all shadow-md"
        >
          Explorar Puestos y Mercados
        </button>
      </div>
    );
  }

  const token = order?.pickupToken || 'CDMX-····';
  const customerName = order?.customerName || 'Tu Canasta';

  return (
    <div className="space-y-4 select-none pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. Barra Superior Informativa y Acciones Rápidas              */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#006948]">
                {preview ? 'Vista Previa del Croquis' : 'Ruta Activa de Recolección en Nave'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {selectedMarket?.name} ({selectedMarket?.colonia})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Mapa Interactivo del Mercado
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Botón Ver Ficha QR */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs"
              title="Mostrar ficha QR de retiro en cubículo"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Ficha QR: {token}</span>
            </button>

            {/* Modo Guiado Paso a Paso */}
            <button
              onClick={() => setIsGuidedMode(!isGuidedMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isGuidedMode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 text-[#006948] border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Compass className={`w-4 h-4 ${isGuidedMode ? 'animate-spin' : ''}`} />
              <span>{isGuidedMode ? 'Modo Guiado Activo' : 'Iniciar Navegación Guiada'}</span>
            </button>
          </div>
        </div>

        {/* Franja de Métricas de Ruta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006948] flex items-center justify-center font-black">
              {stops.length}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Paradas Totales</div>
              <div className="font-extrabold text-slate-800">{stops.length} Puestos</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              {readyCount}/{stops.length}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Listas para Recoger</div>
              <div className="font-extrabold text-slate-800">{readyCount} Puestos listos</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Recolectadas</div>
              <div className="font-extrabold text-slate-800">
                {doneCount} de {stops.length}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tiempo Estimado</div>
              <div className="font-extrabold text-slate-800">~{2 + stops.length * 2} min a pie</div>
            </div>
          </div>
        </div>

        {/* Banner de Paso Actual en Modo Guiado */}
        {isGuidedMode && activeSelectedStop && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center font-black text-sm shrink-0">
                {guidedStep + 1}
              </div>
              <div className="text-xs">
                <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px] block">
                  Paso {guidedStep + 1} de {stops.length} en tu recorrido:
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  Puesto {activeSelectedStop.location.stallNumber} · {activeSelectedStop.location.stallName}
                </span>
                <span className="text-slate-500 block text-[11px]">
                  {activeSelectedStop.location.aisle.short} • {activeSelectedStop.items.length} artículos por recoger
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                disabled={guidedStep === 0}
                onClick={() => {
                  const prevIdx = Math.max(0, guidedStep - 1);
                  setGuidedStep(prevIdx);
                  setSelectedStallId(stops[prevIdx].location.stallId);
                }}
                className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                disabled={guidedStep === stops.length - 1}
                onClick={() => {
                  const nextIdx = Math.min(stops.length - 1, guidedStep + 1);
                  setGuidedStep(nextIdx);
                  setSelectedStallId(stops[nextIdx].location.stallId);
                }}
                className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filtros de Categoría y Controles de Zoom                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        {/* Chips de filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                activeCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Controles de Vista de Mapa */}
        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 bg-white border border-slate-200/80 rounded-2xl p-1 shadow-2xs text-slate-600">
          <button
            onClick={() => handleZoom(0.2)}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            title="Acercar mapa"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            title="Alejar mapa"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="px-2.5 h-8 rounded-xl hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1"
            title="Restablecer vista centrada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Centrar</span>
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Canvas SVG Interactivo de Nave de Mercado (Indoor Map)     */}
      {/* ------------------------------------------------------------- */}
      <div
        className="relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm min-h-[460px] sm:min-h-[580px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Fondo con cuadrícula arquitectónica sutil */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Leyenda fija en esquina superior izquierda */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 text-[10px] text-slate-700 pointer-events-none space-y-1.5 shadow-md">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Plano de Nave Comercial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-md bg-[#006948] ring-1 ring-emerald-400" />
            <span>Puesto con tu pedido</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-md bg-white border border-slate-300" />
            <span>Comercio regular</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600" />
            <span>Ruta sugerida de recolección</span>
          </div>
        </div>

        {/* Contenedor SVG transformado con Pan & Zoom */}
        <div
          className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75"
          style={{
            transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox={MARKET_ARCH_ELEMENTS.viewBox}
            className="w-full max-w-[960px] h-auto drop-shadow-md select-none"
            style={{ minWidth: '700px' }}
          >
            {/* Definiciones de filtros */}
            <defs>
              <filter id="glowPin" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Perímetro del mercado (Muros de la nave) */}
            <rect
              x="50"
              y="50"
              width="900"
              height="550"
              rx="24"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="2.5"
            />

            {/* Pasillos transitables (Walkways sombreados) */}
            {/* Pasillos verticales */}
            <rect x="195" y="80" width="40" height="490" fill="#f8fafc" stroke="#f1f5f9" rx="4" />
            <rect x="370" y="80" width="45" height="490" fill="#f8fafc" stroke="#f1f5f9" rx="4" />
            <rect x="585" y="80" width="40" height="490" fill="#f8fafc" stroke="#f1f5f9" rx="4" />
            <rect x="755" y="80" width="40" height="490" fill="#f8fafc" stroke="#f1f5f9" rx="4" />
            {/* Pasillo central transversal */}
            <rect x="70" y="295" width="860" height="45" fill="#f1f5f9" stroke="#e2e8f0" rx="6" />

            {/* Rótulos de pasillos */}
            <text x="215" y="72" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
              PASILLO 1
            </text>
            <text x="392" y="72" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
              PASILLO 2
            </text>
            <text x="500" y="322" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              PASILLO CENTRAL · LÁCTEOS Y TRADICIÓN
            </text>
            <text x="605" y="72" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
              PASILLO 3
            </text>
            <text x="775" y="72" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
              PASILLO 4
            </text>

            {/* ELEMENTOS ARQUITECTÓNICOS: ACCESOS Y SERVICIOS */}
            {/* Acceso Norte */}
            <g transform={`translate(${MARKET_ARCH_ELEMENTS.entrance.x}, ${MARKET_ARCH_ELEMENTS.entrance.y})`}>
              <rect x="-110" y="-18" width="220" height="34" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
              <text x="0" y="4" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle">
                🚪 ACCESO NORTE (ENTRADA)
              </text>
            </g>

            {/* Salida Sur */}
            <g transform={`translate(${MARKET_ARCH_ELEMENTS.exit.x}, ${MARKET_ARCH_ELEMENTS.exit.y})`}>
              <rect x="-110" y="-18" width="220" height="34" rx="10" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
              <text x="0" y="4" fill="#15803d" fontSize="11" fontWeight="bold" textAnchor="middle">
                🏁 SALIDA SUR (CALLE MEDELLÍN)
              </text>
            </g>

            {/* Báscula del Consumidor PROFECO */}
            <g transform={`translate(${MARKET_ARCH_ELEMENTS.bascula.x - 50}, ${MARKET_ARCH_ELEMENTS.bascula.y - 18})`}>
              <rect x="0" y="0" width="115" height="34" rx="8" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
              <text x="57" y="21" fill="#854d0e" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                ⚖️ Báscula PROFECO
              </text>
            </g>

            {/* Administración del Mercado */}
            <g transform={`translate(${MARKET_ARCH_ELEMENTS.administracion.x - 55}, ${MARKET_ARCH_ELEMENTS.administracion.y - 18})`}>
              <rect x="0" y="0" width="120" height="34" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="60" y="21" fill="#475569" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                🏢 Administración
              </text>
            </g>

            {/* LÍNEA DE RUTA PEATONAL ANIMADA */}
            {walkingRoute.pathD && (
              <g>
                {/* Halo brillante bajo la ruta */}
                <path
                  d={walkingRoute.pathD}
                  fill="none"
                  stroke="#a7f3d0"
                  strokeWidth="8"
                  strokeOpacity="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Trazo punteado */}
                <path
                  d={walkingRoute.pathD}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* PUESTOS EN LA NAVE (BLUEPRINT STALLS) */}
            {MARKET_BLUEPRINT_STALLS.map((bp) => {
              const stopInfo = stopsByBlueprintId.get(bp.id);
              const isStop = !!stopInfo;
              const isSelected = selectedStallId === (stopInfo ? stopInfo.stop.location.stallId : bp.id);
              const stopIdx = stopInfo ? stopInfo.index : -1;
              const status: StopStatus = stopInfo ? statusOf(stopInfo.stop.location.stallId) : 'pendiente';
              const isDone = status === 'recolectado';

              // Filtros visuales
              const matchesFilter =
                activeCategoryFilter === 'todos'
                  ? true
                  : activeCategoryFilter === 'mis_paradas'
                  ? isStop
                  : bp.category === activeCategoryFilter;

              const opacity = matchesFilter ? (isStop ? 1 : 0.85) : 0.25;

              return (
                <g
                  key={bp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (stopInfo) {
                      setSelectedStallId(stopInfo.stop.location.stallId);
                      if (isGuidedMode) setGuidedStep(stopInfo.index);
                    } else {
                      setSelectedStallId(bp.id);
                    }
                  }}
                  className="cursor-pointer transition-all duration-150"
                  opacity={opacity}
                >
                  {/* Halo de selección */}
                  {isSelected && (
                    <rect
                      x={bp.x - 4}
                      y={bp.y - 4}
                      width={bp.width + 8}
                      height={bp.height + 8}
                      rx="14"
                      fill="none"
                      stroke={isStop ? '#059669' : '#0284c7'}
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Cuerpo del cubículo */}
                  <rect
                    x={bp.x}
                    y={bp.y}
                    width={bp.width}
                    height={bp.height}
                    rx="10"
                    fill={isStop ? (isDone ? '#f0fdf4' : '#ecfdf5') : '#ffffff'}
                    stroke={isStop ? '#059669' : '#cbd5e1'}
                    strokeWidth={isStop ? '2' : '1.2'}
                    className="hover:stroke-emerald-400"
                  />

                  {/* Franja superior de color de categoría */}
                  <rect
                    x={bp.x}
                    y={bp.y}
                    width={bp.width}
                    height="5"
                    rx="2"
                    fill={bp.iconColor}
                  />

                  {/* Número de puesto */}
                  <text
                    x={bp.x + 8}
                    y={bp.y + 22}
                    fill={isStop ? '#065f46' : '#475569'}
                    fontSize="13"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {bp.number}
                  </text>

                  {/* Nombre del puesto */}
                  <text
                    x={bp.x + 8}
                    y={bp.y + 38}
                    fill={isStop ? '#047857' : '#334155'}
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {bp.name.length > 15 ? `${bp.name.slice(0, 14)}…` : bp.name}
                  </text>

                  {/* Indicador de estado para paradas con pedido */}
                  {isStop && (
                    <g transform={`translate(${bp.x + bp.width - 24}, ${bp.y + 10})`}>
                      {isDone ? (
                        <circle cx="10" cy="10" r="9" fill="#10b981" />
                      ) : status === 'en_bascula' ? (
                        <circle cx="10" cy="10" r="9" fill="#f97316" />
                      ) : status === 'listo' ? (
                        <circle cx="10" cy="10" r="9" fill="#0284c7" />
                      ) : (
                        <circle cx="10" cy="10" r="9" fill="#eab308" />
                      )}
                      <text x="10" y="14" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {isDone ? '✓' : stopIdx + 1}
                      </text>
                    </g>
                  )}

                  {/* PIN DESTACADO CON NÚMERO DE PARADA */}
                  {isStop && (
                    <g transform={`translate(${bp.doorPoint.x}, ${bp.doorPoint.y})`} filter="url(#glowPin)">
                      <circle
                        cx="0"
                        cy="0"
                        r="14"
                        fill={isDone ? '#047857' : '#006948'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text x="0" y="4.5" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
                        {stopIdx + 1}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Panel Inferior Detalle del Puesto Seleccionado (Sheet)     */}
      {/* ------------------------------------------------------------- */}
      {activeSelectedStop ? (
        <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-[#006948] flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                {activeSelectedStop.location.stallNumber}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948]">
                    Parada {stops.indexOf(activeSelectedStop) + 1} de {stops.length}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {activeSelectedStop.location.aisle.label}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {activeSelectedStop.location.stallName}
                </h2>
                <p className="text-xs text-slate-500">
                  Atendido por: <strong className="text-slate-700">{activeSelectedStop.location.ownerName}</strong>
                </p>
              </div>
            </div>

            {/* Badge de Estado en Vivo */}
            <div className="flex items-center gap-2">
              {(() => {
                const st = statusOf(activeSelectedStop.location.stallId);
                const badge = STATUS_BADGE[st];
                return (
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border border-slate-200/80 ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span>{STATUS_LABEL[st]}</span>
                  </div>
                );
              })()}

              {activeSelectedStop.location.phone && (
                <a
                  href={`tel:${activeSelectedStop.location.phone}`}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                  title="Llamar al locatario"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Lista de productos a recoger en este puesto */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Artículos preparados en este puesto ({activeSelectedStop.items.length})
            </div>
            <div className="divide-y divide-slate-200/60">
              {activeSelectedStop.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">{item.product.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      ({item.quantity} {item.product.unit})
                    </span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    {money(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-black text-slate-900">
              <span>Subtotal del puesto:</span>
              <span className="text-[#006948] font-mono text-sm">
                {money(activeSelectedStop.subtotal)}
              </span>
            </div>
          </div>

          {/* Botones de Acción sobre la Parada */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Botón Validar Recolectado */}
              {statusOf(activeSelectedStop.location.stallId) !== 'recolectado' ? (
                <button
                  onClick={() =>
                    handleMarkCollected(
                      activeSelectedStop.location.stallId,
                      activeSelectedStop.location.stallNumber,
                      activeSelectedStop.location.stallName
                    )
                  }
                  className="flex-1 sm:flex-none px-5 h-11 rounded-2xl bg-[#006948] text-white font-bold text-xs hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Validar y Recoger en Puesto</span>
                </button>
              ) : (
                <div className="flex-1 sm:flex-none px-4 h-11 rounded-2xl bg-emerald-100 text-[#006948] font-extrabold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Artículos Recolectados!</span>
                </div>
              )}

              {/* Botón Reportar Incidencia */}
              <button
                onClick={() => setIncidentOpen(!incidentOpen)}
                className="px-3.5 h-11 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Incidencia</span>
              </button>
            </div>

            {/* Navegación entre puestos */}
            <div className="flex items-center gap-1 self-end sm:self-auto text-xs text-slate-500">
              <button
                onClick={() => {
                  const cur = stops.indexOf(activeSelectedStop);
                  const prev = cur > 0 ? cur - 1 : stops.length - 1;
                  setSelectedStallId(stops[prev].location.stallId);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  const cur = stops.indexOf(activeSelectedStop);
                  const next = cur < stops.length - 1 ? cur + 1 : 0;
                  setSelectedStallId(stops[next].location.stallId);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 font-bold flex items-center gap-1"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Menú Desplegable de Incidencias */}
          {incidentOpen && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  ¿Qué problema ocurrió en el Puesto {activeSelectedStop.location.stallNumber}?
                </span>
                <button
                  onClick={() => setIncidentOpen(false)}
                  className="text-amber-700 hover:text-amber-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {INCIDENT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() =>
                      handleReportIncident(
                        activeSelectedStop.location.stallId,
                        activeSelectedStop.location.stallNumber,
                        reason
                      )
                    }
                    className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-left font-semibold text-slate-800 transition-all flex items-center justify-between"
                  >
                    <span>{reason}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* 5. Modal Ficha de Retiro QR                                   */}
      {/* ------------------------------------------------------------- */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-[#006948] flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Ficha Digital de Recolección CDMX
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Ficha de Retiro</h3>
              <p className="text-xs text-slate-500">Muestra este código al locatario en cada puesto</p>
            </div>

            {/* Código QR Generado */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block">
              <QrPattern value={token} size={190} />
            </div>

            <div className="font-mono text-xl font-black tracking-widest text-[#006948] bg-emerald-50/60 py-2 rounded-xl">
              {token}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Titular: <strong>{customerName}</strong> • {stops.length} puestos incluidos en esta ruta.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Volver al Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
