import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { CartItem, PickupProgress, StopStatus } from '../types';
import { MARKET_AISLES, AisleDef, StallBox, groupItemsByStall } from '../data/marketLayout';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DoorOpen,
  Layers,
  LogOut,
  Maximize,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  Route,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Store,
  Timer,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Tipos y utilidades                                                  */
/* ------------------------------------------------------------------ */



const STATUS_LABEL: Record<StopStatus, string> = {
  pendiente: 'Sin ficha',
  preparando: 'Preparando',
  en_bascula: 'En báscula',
  listo: 'Empacado',
  recolectado: 'Recolectado',
  incidencia: 'Incidencia',
};

const STATUS_BADGE: Record<StopStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-600',
  preparando: 'bg-amber-100 text-amber-800',
  en_bascula: 'bg-orange-100 text-orange-800',
  listo: 'bg-emerald-100 text-emerald-800',
  recolectado: 'bg-[#006948] text-white',
  incidencia: 'bg-red-100 text-red-700',
};

const INCIDENT_REASONS = ['Producto faltante', 'Peso o precio incorrecto', 'Puesto cerrado'];

const GIRO_FILTERS: { id: string; label: string; aisles: string[] }[] = [
  { id: 'todos', label: 'Todos los pasillos', aisles: MARKET_AISLES.map((a) => a.id) },
  { id: 'frutas', label: 'Frutas y verduras', aisles: ['p2', 'p3'] },
  { id: 'cremeria', label: 'Cremería / Abarrotes', aisles: ['p1', 'central'] },
  { id: 'carniceria', label: 'Carnicería', aisles: ['p4'] },
  { id: 'polleria', label: 'Pollería', aisles: ['p4'] },
  { id: 'flores', label: 'Flores', aisles: ['p3'] },
];

const money = (n: number) => `$${n.toFixed(2)}`;
const EMPTY: PickupProgress = { statuses: {}, incidents: {} };


/** Patrón QR determinista (visual) a partir del token. */
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
/* Componente principal                                                */
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
    setActiveOrderId,
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

  /* ---------- Estado de la ruta (compartido con el portal del vendedor) ---------- */
  const route: PickupProgress = (order && pickupProgress[order.id]) || EMPTY;

  // Simulación en vivo de los demás locatarios: preparando → báscula → empacado.
  // El puesto del vendedor demo (merchantStall) lo avanza el propio locatario desde
  // "Ventas y Pedidos"; si no lo hace, se avanza solo tras una espera mayor.
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
    const delay = others.length ? 6000 : 20000;
    const timer = window.setTimeout(() => {
      const st = route.statuses[target] || 'preparando';
      setStopStatus(order.id, target, st === 'preparando' ? 'en_bascula' : 'listo');
    }, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, stopIds, route]);

  const statusOf = (stallId: string): StopStatus =>
    preview ? 'pendiente' : route.statuses[stallId] || 'preparando';
  const doneCount = stops.filter((s) => statusOf(s.location.stallId) === 'recolectado').length;
  const readyCount = stops.filter((s) => {
    const st = statusOf(s.location.stallId);
    return st === 'listo' || st === 'recolectado';
  }).length;
  const allDone = !preview && stops.length > 0 && doneCount === stops.length;
  const currentIdx = stops.findIndex((s) => statusOf(s.location.stallId) !== 'recolectado');
  const walkMinutes = 2 + stops.length * 2;
  const remainingMinutes = allDone ? 0 : 2 + (stops.length - doneCount) * 2;

  /* ---------- UI local ---------- */
  const [guided, setGuided] = useState(false);
  const [focusedStop, setFocusedStop] = useState<string | null>(null);
  const [incidentMenu, setIncidentMenu] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [giro, setGiro] = useState('todos');
  const [layers, setLayers] = useState({ route: true, regular: true, quadrants: true });
  const [showLayers, setShowLayers] = useState(false);
  const [showScales, setShowScales] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Cierra el pedido cuando todas las paradas fueron recolectadas
  const closedRef = useRef<string | null>(null);
  useEffect(() => {
    if (allDone && order && closedRef.current !== order.id) {
      closedRef.current = order.id;
      setGuided(false);
      if (order.status !== 'entregado') updateOrderStatus(order.id, 'entregado');
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 }, colors: ['#006948', '#10b981', '#fd761a'] });
      } catch {
        // confetti no soportado
      }
    }
  }, [allDone, order, updateOrderStatus]);

  useEffect(() => {
    if (!showQr) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowQr(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQr]);

  const setStatus = (stallId: string, status: StopStatus) => {
    if (order) setStopStatus(order.id, stallId, status);
  };

  const markCollected = (box: StallBox) => {
    setStatus(box.location.stallId, 'recolectado');
    setRecentNotification(`Puesto ${box.location.stallNumber} validado con tu ficha · ${box.location.stallName}`);
    window.setTimeout(() => setRecentNotification(null), 3000);
  };

  const reportIncident = (box: StallBox, reason: string) => {
    if (order) reportStopIncident(order.id, box.location.stallId, reason);
    setIncidentMenu(null);
    setRecentNotification(`Incidencia en Puesto ${box.location.stallNumber}: ${reason}. Avisamos al líder de pasillo.`);
    window.setTimeout(() => setRecentNotification(null), 3500);
  };

  const resolveIncident = (box: StallBox) => {
    if (order) reportStopIncident(order.id, box.location.stallId, null);
  };

  /* ---------- Trazo de la ruta (SVG sobre la cuadrícula) ---------- */
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const entranceRef = useRef<HTMLSpanElement>(null);
  const exitRef = useRef<HTMLSpanElement>(null);
  const stopRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const [segments, setSegments] = useState<{ d: string; state: 'done' | 'current' | 'next' }[]>([]);
  const [dots, setDots] = useState<{ x: number; y: number; state: 'done' | 'current' | 'next' }[]>([]);
  const [startDot, setStartDot] = useState<{ x: number; y: number } | null>(null);

  const offsetIn = (el: HTMLElement | null, container: HTMLElement) => {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== container) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { x, y, w: el?.offsetWidth || 0, h: el?.offsetHeight || 0 };
  };

  const computeRoute = () => {
    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;
    setBaseSize({ w: outer.clientWidth, h: inner.offsetHeight });
    if (!entranceRef.current || !exitRef.current) return;

    const ent = offsetIn(entranceRef.current, inner);
    const ext = offsetIn(exitRef.current, inner);
    let cur = { x: ent.x + ent.w / 2, y: ent.y + ent.h / 2 };
    setStartDot(cur);

    const segs: { d: string; state: 'done' | 'current' | 'next' }[] = [];
    const pts: { x: number; y: number; state: 'done' | 'current' | 'next' }[] = [];
    const segState = (i: number): 'done' | 'current' | 'next' => {
      if (preview) return i === 0 ? 'current' : 'next';
      if (i < stops.length && statusOf(stops[i].location.stallId) === 'recolectado') return 'done';
      if (i === stops.length && allDone) return 'done';
      return i === (currentIdx === -1 ? stops.length : currentIdx) ? 'current' : 'next';
    };

    stops.forEach((s, i) => {
      const el = stopRefs.current[s.location.stallId];
      if (!el) return;
      const r = offsetIn(el, inner);
      const tx = r.x + r.w / 2;
      const ty = r.y;
      const gapY = ty - 14;
      segs.push({ d: `M ${cur.x} ${cur.y} V ${gapY} H ${tx} V ${ty}`, state: segState(i) });
      pts.push({ x: tx, y: ty, state: segState(i) });
      cur = { x: tx, y: r.y + r.h };
    });

    const exitPoint = { x: ext.x + ext.w / 2, y: ext.y + ext.h / 2 };
    segs.push({
      d: `M ${cur.x} ${cur.y} V ${exitPoint.y - 18} H ${exitPoint.x} V ${exitPoint.y}`,
      state: segState(stops.length),
    });
    setSegments(segs);
    setDots(pts);
  };

  useLayoutEffect(() => {
    computeRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIds, route, layers.regular, layers.quadrants, preview, baseSize.w]);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => computeRoute());
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIds, route]);

  /* ---------- Estado vacío ---------- */
  if (stops.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <Route className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No hay una ruta de recolección activa</h2>
        <p className="text-sm text-slate-500">
          Agrega productos a tu canasta y elige <strong>Recolección en Cubículo</strong> para generar tu ficha y croquis de pasillos.
        </p>
        <button
          onClick={() => setActiveView('comprador')}
          className="px-5 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
        >
          Explorar Puestos
        </button>
      </div>
    );
  }

  const routeId = order ? order.id : 'Vista previa';
  const token = order?.pickupToken || 'CDMX-····';
  const customerName = order?.customerName || 'Tu canasta';
  const activeGiro = GIRO_FILTERS.find((g) => g.id === giro) || GIRO_FILTERS[0];
  const featured = stops[0].location;
  const segColor = { done: '#006948', current: '#059669', next: '#f97316' } as const;

  /* ---------- Render de un pasillo ---------- */
  const renderAisle = (aisle: AisleDef) => {
    const aisleStops = stops.filter((s) => s.location.aisle.id === aisle.id);
    const stopNumbers = aisleStops.map((s) => s.location.stallNumber);
    type Cell = { kind: 'filler'; number: string; name: string; available?: boolean } | { kind: 'stop'; box: StallBox };
    // Máximo 5 cubículos por fila en escritorio: los puestos con pedido desplazan comercio regular
    const cells: Cell[] = aisle.filler
      .filter((f) => !stopNumbers.includes(f.number))
      .slice(0, Math.max(0, 5 - aisleStops.length))
      .map((f) => ({ kind: 'filler' as const, ...f }));
    aisleStops.forEach((box) => {
      const num = parseInt(box.location.stallNumber.replace(/\D/g, ''), 10) || 0;
      const pos = Math.min(cells.length, num % (cells.length + 1));
      cells.splice(pos, 0, { kind: 'stop', box });
    });

    const dimmed = !activeGiro.aisles.includes(aisle.id);
    const accent = aisle.tone === 'accent';
    const range = aisle.filler.length
      ? `Cuadrante ${aisle.quadrant}${aisle.filler[0].number.replace('#', '')} - ${aisle.quadrant}${aisle.filler[aisle.filler.length - 1].number.replace('#', '')}`
      : '';

    return (
      <div
        key={aisle.id}
        className={`rounded-2xl p-3 transition-all ${
          aisleStops.length ? (accent ? 'bg-orange-50/60' : 'bg-[#f2f3ff]') : ''
        } ${dimmed ? 'opacity-35 grayscale' : ''}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
          <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${accent ? 'text-orange-800' : aisleStops.length ? 'text-[#006948]' : 'text-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${accent ? 'bg-orange-700' : aisleStops.length ? 'bg-[#006948]' : 'bg-slate-300'}`} />
            {aisle.label}
          </span>
          {aisleStops.length > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${accent ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-[#006948]'}`}>
              {aisleStops.length} {aisleStops.length === 1 ? 'Parada activa' : 'Paradas activas'}
            </span>
          ) : (
            layers.quadrants && <span className="text-[10px] text-slate-500">{range}</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {cells.map((cell) => {
            if (cell.kind === 'filler') {
              if (!layers.regular) return <div key={cell.number} className="h-[72px] rounded-xl border border-dashed border-slate-200" />;
              return (
                <div key={cell.number} className="h-[72px] p-2.5 rounded-xl bg-white border border-slate-200/70 relative">
                  <div className="text-xs font-bold text-slate-800">{cell.number}</div>
                  <div className="text-[11px] text-slate-600 truncate">{cell.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{cell.available ? 'Disponible' : 'Ocupado'}</div>
                  <span className={`absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ${cell.available ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                </div>
              );
            }

            const box = cell.box;
            const idx = stops.indexOf(box);
            const st = statusOf(box.location.stallId);
            const isCurrent = guided && idx === currentIdx;
            const isDone = st === 'recolectado';
            const mainItem = box.items[0];
            return (
              <div
                key={box.location.stallId}
                ref={(el) => {
                  stopRefs.current[box.location.stallId] = el;
                }}
                onClick={() => setFocusedStop(box.location.stallId)}
                className={`col-span-2 sm:col-span-1 lg:col-span-1 min-h-[118px] p-3 rounded-xl text-white cursor-pointer transition-all relative flex flex-col justify-between shadow-md ${
                  accent ? 'bg-[#9d4300]' : 'bg-[#006948]'
                } ${isDone ? 'opacity-70' : ''} ${
                  isCurrent || focusedStop === box.location.stallId ? 'ring-4 ring-emerald-300/70 scale-[1.02]' : ''
                } ${st === 'incidencia' ? 'ring-4 ring-red-300' : ''}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xl font-black leading-none">{box.location.stallNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${
                    isDone ? 'bg-white/20 text-white' : st === 'en_bascula' ? 'bg-orange-500 text-white' : st === 'incidencia' ? 'bg-red-500 text-white' : 'bg-white text-slate-800'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : st === 'en_bascula' ? <Scale className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                    {STATUS_LABEL[st]}
                  </span>
                </div>
                <div className="mt-1.5 min-w-0">
                  <div className="text-xs font-bold truncate">{box.location.stallName}</div>
                  <div className="text-[10px] text-white/80 truncate">
                    {mainItem.product.name} ({mainItem.quantity} {mainItem.product.unit})
                    {box.items.length > 1 ? ` +${box.items.length - 1}` : ''}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[9px] font-bold tracking-wider">
                  <span>PARADA {idx + 1} DE {stops.length}</span>
                  {isCurrent && <Navigation className="w-3 h-3 animate-pulse" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Franja de operación en vivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600 px-1">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${preview ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
          <strong className="text-[#006948]">{preview ? 'Vista previa:' : 'Operación en Vivo:'}</strong>
          {preview
            ? `Ruta sugerida según tu canasta · ${selectedMarket?.name} (${selectedMarket?.colonia})`
            : `Sincronización GPS Barrial conectada · ${selectedMarket?.name} (${selectedMarket?.colonia})`}
        </span>
        <span>
          Tiempo estimado de cruce: <strong className="text-slate-900">{walkMinutes} min</strong>
          {order && (
            <>
              {' '}| <span className="text-orange-700 font-semibold">Ficha Única: #{token}</span>
            </>
          )}
        </span>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCroquisPreview(false);
                setActiveView('mi_canasta');
              }}
              className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Mi Canasta
            </button>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] text-[10px] font-bold">RF-08 · MATRIZ ESPACIAL 2D</span>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-slate-600 text-[10px] font-semibold">
              Nave C · Cuadrantes 1 al {MARKET_AISLES.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Croquis y Ruteo de Recolección en {selectedMarket?.name}
          </h1>
          <p className="text-sm text-slate-600">
            Representación espacial 2D de cuadrícula de cubículos con ruteo visual interactivo para recolección de{' '}
            {order ? (
              <>pedido <strong className="text-slate-900">#{order.id}</strong>.</>
            ) : (
              <>tu canasta (vista previa).</>
            )}{' '}
            Sigue la traza verde para evitar embotellamientos de marchantes.
          </p>
        </div>

        <div className="flex lg:flex-col gap-2.5">
          <div className="flex-1 lg:w-48 p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-500">Paradas Listas</div>
              <div className="text-sm text-slate-600">
                <strong className="text-xl text-slate-900">{preview ? 0 : readyCount}</strong> / {stops.length}{' '}
                {stops.length === 1 ? 'cubículo' : 'cubículos'}
              </div>
            </div>
          </div>
          <div className="flex-1 lg:w-48 p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-500">Tiempo Estimado</div>
              <div className="text-sm text-slate-600">
                <strong className="text-xl text-slate-900">{remainingMinutes}</strong> minutos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de giro y controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Giro:</span>
          {GIRO_FILTERS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGiro(g.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                giro === g.id ? 'bg-[#006948] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="relative flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 self-end md:self-auto">
          <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center" aria-label="Acercar">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center" aria-label="Alejar">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center justify-center" aria-label="Ajustar">
            <Maximize className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={() => setShowLayers((v) => !v)} className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${showLayers ? 'bg-emerald-50 text-[#006948]' : 'text-[#006948] hover:bg-slate-100'}`}>
            <Layers className="w-4 h-4" /> Capas
          </button>
          {showLayers && (
            <div className="absolute right-0 top-full mt-2 w-60 p-3 rounded-xl bg-white border border-slate-200 shadow-xl z-30 space-y-2 text-xs">
              {(
                [
                  ['route', 'Ruta óptima calculada'],
                  ['regular', 'Comercio regular (sin pedido)'],
                  ['quadrants', 'Etiquetas de cuadrante'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={(e) => setLayers((l) => ({ ...l, [key]: e.target.checked }))}
                    className="accent-[#006948]"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
        {/* ------------ Croquis ------------ */}
        <div className="space-y-4 min-w-0">
          <section className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] p-3 sm:p-4">
            <div ref={outerRef} className="overflow-auto">
              <div style={{ width: baseSize.w ? baseSize.w * zoom : '100%', height: baseSize.h ? baseSize.h * zoom : 'auto' }} className="relative mx-auto">
                <div
                  ref={innerRef}
                  className="relative space-y-3"
                  style={{
                    width: baseSize.w || '100%',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    position: baseSize.w ? 'absolute' : 'relative',
                    top: 0,
                    left: 0,
                  }}
                >
                  {/* Acceso principal */}
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <div className="flex items-center gap-2.5">
                      <DoorOpen className="w-4 h-4 text-[#006948]" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Pasillo A · Acceso Principal</div>
                        <div className="text-[10px] text-slate-500">Calle Medellín · Entrada Afluencia General</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] text-[10px] font-semibold flex items-center gap-1.5">
                      <span ref={entranceRef} className="w-2.5 h-2.5 rounded-full bg-emerald-300 inline-block" /> Punto de Inicio de Recorrido
                    </span>
                  </div>

                  {MARKET_AISLES.map((a) => renderAisle(a))}

                  {/* Salida */}
                  <div className="flex items-center justify-between gap-2 px-2 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4 text-orange-700" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Salida Rápida · Calle Campeche</div>
                        <div className="text-[10px] text-slate-500">Puerta 4 Sur · Zona de lockers y entrega exprés</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-semibold flex items-center gap-1.5">
                      <span ref={exitRef} className="w-2.5 h-2.5 rounded-full bg-orange-300 inline-block" /> Fin de Trayecto
                    </span>
                  </div>

                  {/* Traza de ruta */}
                  {layers.route && baseSize.w > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" aria-hidden="true">
                      <style>{`@keyframes routeDash { to { stroke-dashoffset: -20; } }`}</style>
                      {segments.map((s, i) => (
                        <path
                          key={i}
                          d={s.d}
                          fill="none"
                          stroke={segColor[s.state]}
                          strokeWidth={s.state === 'current' ? 3 : 2.5}
                          strokeDasharray="7 5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={s.state === 'next' ? 0.85 : 1}
                          style={s.state === 'current' ? { animation: 'routeDash 1s linear infinite' } : undefined}
                        />
                      ))}
                      {startDot && (
                        <g>
                          <circle cx={startDot.x} cy={startDot.y} r={9} fill="#006948" opacity={0.18} />
                          <circle cx={startDot.x} cy={startDot.y} r={4.5} fill="#006948" />
                        </g>
                      )}
                      {dots.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={segColor[p.state]} stroke="#fff" strokeWidth={1.5} />
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#006948]" /> Puesto con Pedido</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Comercio Regular</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#006948]" /> Ruta Óptima Calculada</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500" /> Tramo pendiente</span>
              <span className="ml-auto">Plano oficial Dirección de Mercados Públicos CDMX</span>
            </div>
          </section>

          {/* Comercio justo */}
          <section className="p-4 rounded-2xl bg-[#eaedff]/70 border border-[#e2e7ff] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">Comercio Justo y Pesaje Transparente</div>
                  <div className="text-xs text-slate-600">Cada producto ha sido pre-pesado frente a comisionista de confianza vecinal.</div>
                </div>
              </div>
              <button
                onClick={() => setShowScales((v) => !v)}
                className="px-3 h-9 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 self-start sm:self-auto"
              >
                {showScales ? 'Ocultar Básculas' : 'Ver Básculas Certificadas'}
              </button>
            </div>
            {showScales && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stops.map((s) => (
                  <div key={s.location.stallId} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#006948]" />
                      Puesto {s.location.stallNumber} · {s.location.stallName}
                    </span>
                    <span className="text-[10px] font-semibold text-[#006948]">Verificada PROFECO 2026</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ------------ Panel lateral ------------ */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  allDone ? 'bg-emerald-100 text-[#006948]' : preview ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-800'
                }`}>
                  {allDone ? 'Recolección completada' : preview ? 'Vista previa de ruta' : 'Pedido en Curso'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1.5">Ruta #{routeId}</h2>
                <div className="text-xs text-slate-600">Cliente: {customerName} · {selectedMarket?.colonia}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#eaedff] flex flex-col items-center justify-center text-slate-700">
                <span className="text-[9px] font-semibold">EST</span>
                <span className="text-sm font-black leading-none">{remainingMinutes}m</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff] flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Token de retiro de barrio</div>
                <div className={`text-lg font-black font-mono tracking-wider ${order ? 'text-[#006948]' : 'text-slate-400'}`}>
                  #{token}
                </div>
                {!order && <div className="text-[10px] text-slate-500">Se genera al confirmar tu canasta</div>}
              </div>
              <button
                disabled={!order}
                onClick={() => setShowQr(true)}
                className="px-3 h-8 rounded-lg bg-[#006948] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#00553a] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <QrCode className="w-3.5 h-3.5" /> Ver QR
              </button>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Paradas Óptimas de Recolección</h3>
              <ol className="relative space-y-3 pl-6">
                <span className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" aria-hidden="true" />
                {stops.map((box, i) => {
                  const st = statusOf(box.location.stallId);
                  const isCurrent = guided && i === currentIdx;
                  const incident = route.incidents[box.location.stallId];
                  return (
                    <li key={box.location.stallId} className="relative">
                      <span className={`absolute -left-6 top-3 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white ${
                        st === 'recolectado' ? 'bg-[#006948] text-white' : isCurrent ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' : 'bg-white text-slate-700 ring-1 ring-slate-300'
                      }`}>
                        {st === 'recolectado' ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                      </span>
                      <div
                        onClick={() => setFocusedStop(box.location.stallId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          focusedStop === box.location.stallId || isCurrent ? 'border-[#006948] bg-emerald-50/40' : 'border-slate-200 bg-[#f9f9ff]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 leading-tight">
                              Puesto {box.location.stallNumber} · {box.location.stallName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {box.location.aisle.short} · Cuadrante {box.location.cell}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${STATUS_BADGE[st]}`}>
                            {st === 'listo' && i === stops.length - 1 ? 'Listo en barra' : STATUS_LABEL[st]}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {box.items.map(({ product, quantity }) => (
                            <div key={product.id} className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-slate-800 truncate">
                                {product.name} ({quantity} {product.unit})
                              </span>
                              <span className="font-bold text-[#006948] flex-shrink-0">{money(product.price * quantity)} MXN</span>
                            </div>
                          ))}
                        </div>

                        {st === 'en_bascula' && (
                          <p className="text-[10px] italic text-slate-500">{box.location.ownerName.split(' ')[0]} está terminando de pesar…</p>
                        )}
                        {st === 'preparando' && (
                          <p className="text-[10px] italic text-slate-500">Preparando tu caja · ~{box.location.prepMinutes} min</p>
                        )}
                        {order?.paymentMethod === 'efectivo' && st !== 'recolectado' && (
                          <p className="text-[10px] text-slate-500">Pagas en puesto: <strong className="text-slate-700">{money(box.subtotal)}</strong> en efectivo</p>
                        )}
                        {incident && (
                          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {incident} · Líder de pasillo notificado</span>
                            <button onClick={(e) => { e.stopPropagation(); resolveIncident(box); }} className="font-bold underline">Resuelto</button>
                          </div>
                        )}

                        {!preview && (
                          <div className="flex items-center gap-2 relative">
                            <button
                              disabled={st !== 'listo'}
                              onClick={(e) => {
                                e.stopPropagation();
                                markCollected(box);
                              }}
                              className={`px-2.5 h-7 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                st === 'recolectado'
                                  ? 'bg-[#006948] text-white cursor-default'
                                  : 'bg-white border border-[#006948] text-[#006948] hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> {st === 'recolectado' ? 'Recolectado' : 'Marcar recolectado'}
                            </button>
                            {st !== 'recolectado' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIncidentMenu(incidentMenu === box.location.stallId ? null : box.location.stallId);
                                }}
                                className="px-2.5 h-7 rounded-md text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                              >
                                Incidencia
                              </button>
                            )}
                            {incidentMenu === box.location.stallId && (
                              <div className="absolute left-0 top-full mt-1 w-56 p-1.5 rounded-xl bg-white border border-slate-200 shadow-xl z-20">
                                {INCIDENT_REASONS.map((reason) => (
                                  <button
                                    key={reason}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      reportIncident(box, reason);
                                    }}
                                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-red-50 hover:text-red-700"
                                  >
                                    {reason}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* CTA principal */}
            {preview ? (
              <button
                onClick={() => {
                  setCroquisPreview(false);
                  setActiveView('mi_canasta');
                }}
                className="w-full h-12 rounded-xl bg-[#006948] text-white font-bold text-sm hover:bg-[#00553a] flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Generar mi Ficha en Mi Canasta
              </button>
            ) : allDone ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-9 h-9 mx-auto text-[#006948]" />
                <div>
                  <div className="text-sm font-bold text-slate-900">¡Recolección completa!</div>
                  <div className="text-xs text-slate-600">
                    Validaste {stops.length} {stops.length === 1 ? 'puesto' : 'puestos'} con la ficha #{token}. Ahorraste {money(order!.totalSavings)} vs supermercado.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveOrderId(null);
                    setActiveView('comprador');
                  }}
                  className="w-full h-11 rounded-xl bg-[#006948] text-white font-bold text-sm hover:bg-[#00553a]"
                >
                  Finalizar y Volver al Mercado
                </button>
              </div>
            ) : !guided ? (
              <button
                onClick={() => {
                  setGuided(true);
                  if (currentIdx >= 0) setFocusedStop(stops[currentIdx].location.stallId);
                }}
                className="w-full h-12 rounded-xl bg-[#006948] text-white font-bold text-sm hover:bg-[#00553a] flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> {doneCount > 0 ? 'Continuar Recorrido Asistido' : 'Comenzar Recorrido Asistido'}
              </button>
            ) : (
              (() => {
                const cur = stops[currentIdx];
                const st = statusOf(cur.location.stallId);
                return (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#006948] animate-pulse flex-shrink-0" />
                      <span>
                        Dirígete al <strong>{cur.location.aisle.short}</strong>, cuadrante {cur.location.cell}: Puesto {cur.location.stallNumber} ({currentIdx + 1} de {stops.length}).
                      </span>
                    </div>
                    <button
                      disabled={st !== 'listo'}
                      onClick={() => {
                        markCollected(cur);
                        const nextIdx = stops.findIndex((s, i) => i > currentIdx && statusOf(s.location.stallId) !== 'recolectado');
                        setFocusedStop(nextIdx >= 0 ? stops[nextIdx].location.stallId : null);
                      }}
                      className="w-full min-h-12 py-2 rounded-xl bg-[#006948] text-white font-bold text-sm hover:bg-[#00553a] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {st === 'listo' ? (
                        <><CheckCircle2 className="w-4 h-4" /> Llegué · Validar ficha en Puesto {cur.location.stallNumber}</>
                      ) : st === 'incidencia' ? (
                        <><AlertTriangle className="w-4 h-4" /> Resuelve la incidencia del Puesto {cur.location.stallNumber}</>
                      ) : (
                        <><Clock className="w-4 h-4" /> Esperando báscula · Puesto {cur.location.stallNumber}</>
                      )}
                    </button>
                    <button onClick={() => setGuided(false)} className="w-full text-xs text-slate-500 hover:text-slate-700">
                      Pausar recorrido asistido
                    </button>
                  </div>
                );
              })()
            )}

            <a
              href={`tel:${(featured.phone || '5555555555').replace(/\s/g, '')}`}
              className="w-full h-10 rounded-xl bg-[#f2f3ff] text-slate-700 text-xs font-semibold hover:bg-[#eaedff] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Llamar al Líder de Pasillo (Mercado)
            </a>
          </section>

          {/* Locatario destacado */}
          <section className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-500">Locatario destacado</span>
              <span className="text-[#006948] normal-case">
                {18 + (parseInt(featured.stallNumber.replace(/\D/g, ''), 10) % 20)} años en {selectedMarket?.colonia}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {featured.avatar ? (
                <img src={featured.avatar} alt={featured.ownerName} className="w-11 h-11 rounded-xl object-cover" />
              ) : (
                <span className="w-11 h-11 rounded-xl bg-[#eaedff] flex items-center justify-center"><Store className="w-5 h-5 text-[#006948]" /></span>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">{featured.ownerName}</div>
                <div className="text-[11px] text-slate-600">
                  Puesto {featured.stallNumber} · "{stops[0].items[0].product.name} listo para comer hoy o para el fin de semana".
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Modal QR */}
      {showQr && order && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowQr(false)}>
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[10px] font-bold text-[#006948] uppercase tracking-widest">Ficha única de retiro (RF-14)</div>
              <div className="text-2xl font-black font-mono text-slate-900">#{token}</div>
              <div className="text-xs text-slate-500">Ruta #{order.id} · {order.customerName}</div>
            </div>
            <div className="mx-auto w-fit p-3 rounded-2xl border border-slate-200">
              <QrPattern value={`${order.id}-${token}`} />
            </div>
            <p className="text-xs text-slate-600">Muestra este código en cada puesto. El locatario lo escanea para validar la entrega de tu caja.</p>
            <div className="space-y-1.5 text-left">
              {stops.map((s) => {
                const st = statusOf(s.location.stallId);
                return (
                  <div key={s.location.stallId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#f2f3ff]">
                    <span>Puesto {s.location.stallNumber} · {s.location.stallName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_BADGE[st]}`}>{STATUS_LABEL[st]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
