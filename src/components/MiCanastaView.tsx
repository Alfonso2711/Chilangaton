import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { groupItemsByStall, describeAisles } from '../data/marketLayout';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Leaf,
  Map as MapIcon,
  Minus,
  NotebookPen,
  PiggyBank,
  Plus,
  PlusCircle,
  QrCode,
  Receipt,
  RefreshCw,
  Route,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';

type DeliveryType = 'bici' | 'pickup';
type PaymentMethod = 'efectivo' | 'codi_dimo' | 'spei';

const BICI_FEE = 25;
const NOTE_CHIPS = ['Recolecto en 20 min', 'Traigo mi bolsa ecológica', 'Aguacates para hoy'];
const CASH_BILLS = [200, 500];

const money = (n: number) => `$${n.toFixed(2)}`;

export const MiCanastaView: React.FC = () => {
  const {
    cart,
    stalls,
    selectedMarket,
    updateCartQuantity,
    removeFromCart,
    cartTotalCanastaLocal,
    cartTotalSupermercado,
    cartSavingsPesos,
    cartSavingsPercent,
    createOrder,
    setActiveView,
    setActiveOrderId,
    activeOrder,
    setCroquisPreview,
    currentUser,
  } = useApp();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashTendered, setCashTendered] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Vecina de la Roma');
  const [customerPhone, setCustomerPhone] = useState('55 4321 9876');
  const [deliveryAddress, setDeliveryAddress] = useState('Calle Coahuila 124, Depto 302, Roma Sur');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Folio provisional que se muestra antes de confirmar
  const [draftFolio] = useState(() => `ML-${Date.now().toString().slice(-4)}`);

  const boxes = useMemo(() => groupItemsByStall(cart, stalls), [cart, stalls]);
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryFee = deliveryType === 'bici' ? BICI_FEE : 0;
  const grandTotal = cartTotalCanastaLocal + deliveryFee;
  const aislesText = describeAisles(boxes);
  const familiesShare = deliveryType === 'bici' && grandTotal > 0
    ? Math.round((cartTotalCanastaLocal / grandTotal) * 100)
    : 100;
  const maxPrep = boxes.reduce((m, b) => Math.max(m, b.location.prepMinutes), 0);
  const change = cashTendered !== null ? cashTendered - grandTotal : null;
  const pendingPickup =
    activeOrder && activeOrder.deliveryType === 'pickup' && activeOrder.status !== 'entregado'
      ? activeOrder
      : undefined;

  const addNoteChip = (chip: string) => {
    setNotes((prev) => (prev.includes(chip) ? prev : prev ? `${prev}. ${chip}` : chip));
  };

  const openCroquisPreview = () => {
    setCroquisPreview(true);
    setActiveView('croquis_ruteo');
  };

  const shareWhatsApp = () => {
    const lines = boxes.map(
      (b) =>
        `• Puesto ${b.location.stallNumber} ${b.location.stallName} (${b.location.aisle.short}): ` +
        b.items.map((i) => `${i.quantity} ${i.product.unit} ${i.product.name}`).join(', ')
    );
    const text =
      `Mi Canasta Local · ${selectedMarket?.name}\n${lines.join('\n')}\n` +
      `Total: ${money(grandTotal)} MXN · Ruta: ${aislesText}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const celebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006948', '#10b981', '#fd761a', '#34d399'],
      });
    } catch {
      // confetti no soportado
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = createOrder(
      deliveryType,
      paymentMethod,
      customerName,
      customerPhone,
      deliveryType === 'bici' ? deliveryAddress : undefined,
      { notes, cashTendered: cashTendered ?? undefined }
    );
    celebrate();

    if (deliveryType === 'pickup') {
      // Flujo RF-08: la ficha de recolección abre el croquis con la ruta óptima
      setActiveOrderId(order.id);
      setCroquisPreview(false);
      setActiveView('croquis_ruteo');
      return;
    }
    setCompletedOrder(order);
  };

  /* ---------------- Pedido con bici-reparto confirmado ---------------- */
  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto py-6 space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-[#006948] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#006948] uppercase tracking-widest">
            ¡Pedido confirmado con éxito!
          </span>
          <h2 className="text-3xl font-black text-slate-900">Folio #{completedOrder.id}</h2>
          <p className="text-sm text-slate-600">
            Avisamos por WhatsApp a {completedOrder.pickupStalls.join(', ')}. Tu bici-mensajero sale en cuanto los puestos empaquen.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1.5">
          <div className="flex items-center justify-between text-sm font-semibold text-emerald-900">
            <span>Tu ahorro barrial</span>
            <span className="font-black text-[#006948]">-{money(completedOrder.totalSavings)} MXN</span>
          </div>
          <p className="text-xs text-emerald-800">
            Pagaste <strong>{money(completedOrder.totalCanastaLocal)} MXN</strong> en vez de{' '}
            <strong>{money(completedOrder.totalSupermercado)} MXN</strong> en el súper.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left text-sm space-y-1.5">
          <div className="font-bold text-slate-900">Detalles de entrega</div>
          <div><strong>Modo:</strong> 🚲 Bicimensajero local (35–45 min)</div>
          <div>
            <strong>Pago:</strong>{' '}
            {completedOrder.paymentMethod === 'efectivo'
              ? `💵 Efectivo contra entrega${completedOrder.cashTendered ? ` (pagas con $${completedOrder.cashTendered})` : ''}`
              : completedOrder.paymentMethod === 'codi_dimo'
              ? '📲 CoDi / DiMo Banxico'
              : '🏦 Transferencia SPEI'}
          </div>
          {completedOrder.deliveryAddress && (
            <div><strong>Dirección:</strong> {completedOrder.deliveryAddress}</div>
          )}
          {completedOrder.notes && (
            <div><strong>Notas:</strong> {completedOrder.notes}</div>
          )}
        </div>

        <button
          onClick={() => {
            setCompletedOrder(null);
            setActiveView('comprador');
          }}
          className="w-full h-12 rounded-xl bg-[#006948] text-white font-bold hover:bg-[#00553a] transition-colors"
        >
          Regresar al Mercado
        </button>
      </div>
    );
  }

  /* ---------------- Canasta vacía ---------------- */
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Tu canasta está vacía</h2>
        <p className="text-sm text-slate-500">
          Explora los puestos del mercado y agrega frutas, verduras o carnes frescas para comparar tu ahorro.
        </p>
        {pendingPickup && (
          <button
            onClick={() => {
              setCroquisPreview(false);
              setActiveView('croquis_ruteo');
            }}
            className="w-full h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006948] font-bold text-sm flex items-center justify-center gap-2"
          >
            <Route className="w-4 h-4" /> Ver mi recolección en curso #{pendingPickup.id}
          </button>
        )}
        <button
          onClick={() => setActiveView('comprador')}
          className="px-5 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
        >
          Explorar Puestos
        </button>
      </div>
    );
  }

  /* ---------------- Canasta activa ---------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveView('comprador')}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-600 flex items-center justify-center"
            aria-label="Regresar al mercado"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mi Canastita</h1>
          <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-slate-700 text-xs font-semibold">
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006948] text-xs font-semibold flex items-center gap-1.5">
            {deliveryType === 'pickup' ? <Store className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
            {selectedMarket?.name} ·{' '}
            {deliveryType === 'pickup'
              ? `${boxes.length} ${boxes.length === 1 ? 'cubículo seleccionado' : 'cubículos seleccionados'} (Recolección presencial)`
              : `${selectedMarket?.colonia} (Bici-reparto express)`}
          </span>
        </div>
        <span className="text-xs text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#006948]" /> Despacho directo desde puestos físicos
        </span>
      </div>

      {/* Banner RF-12 */}
      <div className="px-4 py-2.5 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <RefreshCw className="w-4 h-4 text-[#006948] flex-shrink-0" />
          <span>
            <strong className="text-slate-900">Carrito Multivendedor Sincronizado (RF-12):</strong> Pedido distribuido
            automáticamente a cada cubículo. Precios directos de báscula sin comisión abusiva.
          </span>
        </div>
        <span className="text-[#006948] font-semibold flex items-center gap-1.5 flex-shrink-0">
          {boxes.length} {boxes.length === 1 ? 'cubículo listo' : 'cubículos listos'}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </span>
      </div>

      {pendingPickup && (
        <button
          type="button"
          onClick={() => {
            setCroquisPreview(false);
            setActiveView('croquis_ruteo');
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center justify-between gap-2 hover:bg-orange-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Route className="w-4 h-4 text-orange-600" />
            Tienes una recolección en curso <strong>#{pendingPickup.id}</strong> · Ficha {pendingPickup.pickupToken}
          </span>
          <span className="font-bold flex items-center gap-1">Ver croquis <ArrowRight className="w-3.5 h-3.5" /></span>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* ------------ Columna izquierda ------------ */}
        <div className="space-y-5 min-w-0">
          {/* Modalidad de entrega RF-03 */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#006948]" /> Modalidad de Entrega (RF-03)
              </h2>
              {deliveryType === 'pickup' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] text-[11px] font-semibold">
                  Predeterminado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all space-y-1.5 ${
                  deliveryType === 'pickup'
                    ? 'border-[#006948] bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">Recolección en Cubículo</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#006948] text-white text-[11px] font-bold">$0.00 MXN</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pick-up presencial con croquis digital interactivo de pasillos. Retiras en cada puesto con tu ficha QR única.
                </p>
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    openCroquisPreview();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      openCroquisPreview();
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#006948] hover:underline cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5" /> Ver croquis de {aislesText}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('bici')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all space-y-1.5 ${
                  deliveryType === 'bici'
                    ? 'border-[#006948] bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">Bicimensajero Local</span>
                  <span className="text-xs font-bold text-slate-700">+${BICI_FEE}.00 MXN</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bicitaxi barrial consolidado. Cobertura hasta 3.5 km del {selectedMarket?.name} (Roma, Condesa, Doctores).
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Entrega estimada en 35–45 min
                </span>
              </button>
            </div>

            {/* Datos de contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Nombre para la ficha</span>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#f2f3ff] border border-[#e2e7ff] rounded-lg focus:outline-none focus:border-[#006948]"
                  placeholder="Ej. Carmen González"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Celular (avisos por WhatsApp)</span>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#f2f3ff] border border-[#e2e7ff] rounded-lg focus:outline-none focus:border-[#006948] font-mono"
                  placeholder="Ej. 55 1234 5678"
                />
              </label>
              {deliveryType === 'bici' && (
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Dirección de entrega (Roma, Condesa, Doctores)
                  </span>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#f2f3ff] border border-[#e2e7ff] rounded-lg focus:outline-none focus:border-[#006948]"
                    placeholder="Calle y número, depto, colonia"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Cajas por cubículo físico RF-12 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                Cajas por cubículo físico ({boxes.length})
                <span className="px-1.5 py-0.5 rounded bg-[#eaedff] text-[10px] text-slate-600 normal-case">RF-12</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveView('comprador')}
                className="text-xs font-semibold text-[#006948] flex items-center gap-1 hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Seguir agregando del mercado
              </button>
            </div>

            {boxes.map((box) => (
              <div
                key={box.location.stallId}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] overflow-hidden"
              >
                <div className="px-4 py-3 bg-[#f2f3ff] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-white border border-[#e2e7ff] text-xs font-extrabold text-slate-800 flex items-center justify-center flex-shrink-0">
                      {box.location.stallNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {box.location.stallName}
                        <span className="font-normal text-xs text-slate-500">
                          {' '}· {box.location.aisle.short} (Puesto {box.location.stallNumber.replace('#', '')})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#006948]" />
                        Confirmado en mostrador · Preparación ~{box.location.prepMinutes} min
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Subtotal cubículo</div>
                    <div className="text-lg font-extrabold text-[#006948]">{money(box.subtotal)} MXN</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {box.items.map(({ product, quantity }) => (
                    <div key={product.id} className="p-3 sm:p-4 flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1 rounded bg-slate-900/70 text-white text-[9px] font-bold">
                          {box.location.stallNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-[#006948] flex items-center gap-1">
                          {product.badge === 'Oferta Barrial' ? (
                            <Star className="w-3 h-3 text-orange-600" />
                          ) : product.badge === 'Orgánico Local' ? (
                            <Sprout className="w-3 h-3" />
                          ) : (
                            <Leaf className="w-3 h-3" />
                          )}
                          <span className={product.badge === 'Oferta Barrial' ? 'text-orange-700' : ''}>
                            {product.badge || 'Cosecha directa'} · {product.origin}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                          {product.name}
                        </h4>
                        <div className="text-xs text-slate-600">
                          {quantity} {product.unit} ({money(product.price)}/{product.unit}) ·{' '}
                          <span className="font-bold text-[#006948]">{money(product.price * quantity)} MXN</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                          aria-label="Quitar uno"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                          aria-label="Agregar uno"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="hidden sm:block w-20 text-right">
                        <div className="text-sm font-bold text-slate-900">{money(product.price * quantity)}</div>
                        <div className="text-[10px] text-slate-500">MXN</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center flex-shrink-0"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Método de liquidación RF-13 */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#006948]" /> Método de Liquidación (RF-13)
              </h2>
              <span className="text-xs text-slate-500">Elige cómo liquidar</span>
            </div>

            <div
              onClick={() => setPaymentMethod('efectivo')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2.5 ${
                paymentMethod === 'efectivo' ? 'border-[#006948] bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Efectivo presencial contra entrega{deliveryType === 'pickup' ? ' al recolectar' : ''}
                </span>
                <Banknote className="w-5 h-5 text-[#006948]" />
              </div>
              <p className="text-xs text-slate-600">
                {deliveryType === 'pickup'
                  ? 'Pagas directamente al locatario de cada puesto al retirar tu producto. Desglose de cambio exacto por puesto con tu token impreso o digital.'
                  : 'Pagas al bici-mensajero al recibir tu huacal. Lleva cambio para billetes de hasta $500.'}
              </p>
              {paymentMethod === 'efectivo' && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">¿Con cuánto pagarás? (Opcional para cambio):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CASH_BILLS.map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        disabled={bill < grandTotal}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCashTendered(cashTendered === bill ? null : bill);
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          cashTendered === bill
                            ? 'bg-[#006948] text-white border-[#006948]'
                            : 'bg-[#f2f3ff] text-slate-700 border-[#e2e7ff] hover:bg-[#eaedff]'
                        }`}
                      >
                        Billete ${bill}
                      </button>
                    ))}
                    {change !== null && change >= 0 && (
                      <span className="text-[#006948] font-bold">Cambio: {money(change)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              onClick={() => paymentMethod === 'efectivo' && setPaymentMethod('codi_dimo')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2.5 ${
                paymentMethod !== 'efectivo' ? 'border-[#006948] bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-slate-900">Pago digital anticipado (CoDi / DiMo / SPEI)</span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CreditCard className="w-4 h-4" />
                  <QrCode className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Transferencia Banxico sin comisión y reserva garantizada de stock. Muestras tu token digital y recoges sin hacer filas ni manipular efectivo.
              </p>
              {paymentMethod !== 'efectivo' && (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'codi_dimo', label: 'CoDi / DiMo', hint: '0% comisión' },
                      { id: 'spei', label: 'SPEI directo', hint: 'Transferencia' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod(opt.id);
                      }}
                      className={`p-2 rounded-lg border text-xs text-left transition-colors ${
                        paymentMethod === opt.id
                          ? 'bg-white border-[#006948] font-bold text-slate-900'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {opt.label}
                      <span className="block text-[10px] font-normal text-[#006948]">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Notas para locatarios */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-[#006948]" /> Notas para los Locatarios de Puesto
              </h2>
              <span className="text-xs text-slate-500">Opcional</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {NOTE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => addNoteChip(chip)}
                  className="px-2.5 py-1 rounded-full bg-[#eaedff] text-xs text-slate-700 hover:bg-[#e2e7ff]"
                >
                  + {chip}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs bg-[#f2f3ff] border border-[#e2e7ff] rounded-xl focus:outline-none focus:border-[#006948] resize-none"
              placeholder="Ej. Recolecto a la 1:30 PM, traer bolsa de tela o huacal retornable..."
            />
          </section>
        </div>

        {/* ------------ Columna derecha ------------ */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          {/* Apoyas al comercio local */}
          <section className="p-5 rounded-2xl bg-[#eaedff]/70 border border-[#e2e7ff] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] text-[11px] font-bold">
                  <Heart className="w-3 h-3 fill-[#006948]" /> Comercio Barrial Activo
                </span>
                <h3 className="text-xl font-bold text-slate-900">¡Apoyas al comercio local!</h3>
              </div>
              <span className="w-11 h-11 rounded-xl bg-[#006948] text-white flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comprando directamente a <strong className="text-slate-900">{boxes.length} {boxes.length === 1 ? 'familia locataria' : 'familias locatarias'}</strong> del{' '}
              {selectedMarket?.name} sin intermediarios corporativos ni márgenes especulativos.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Supermercado</div>
                <div className="text-lg font-bold text-slate-400 line-through">{money(cartTotalSupermercado)}</div>
                <div className="text-[10px] text-slate-500">Cadena comercial con merma inflada</div>
              </div>
              <div className="p-3 rounded-xl bg-white">
                <div className="text-[10px] font-semibold text-[#006948] uppercase tracking-wider">Tu Canasta Local</div>
                <div className="text-lg font-extrabold text-[#006948]">{money(cartTotalCanastaLocal)}</div>
                <div className="text-[10px] text-[#006948]">Cosecha directa del tianguis</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Ahorro Directo de Bolsillo</div>
                  <div className="text-[10px] text-slate-500">Sin comisiones de retail extranjero</div>
                </div>
              </div>
              <div className="text-right">
                <div className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 font-extrabold">
                  -{money(cartSavingsPesos)}
                </div>
                <div className="text-[10px] font-bold text-orange-700 mt-0.5">{cartSavingsPercent}% MENOS</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Impacto Económico Barrial</span>
                <span className="font-bold text-[#006948]">100% en tu colonia</span>
              </div>
              <div className="h-2 rounded-full bg-white overflow-hidden flex">
                <div className="h-full bg-[#006948]" style={{ width: `${familiesShare}%` }} />
                <div className="h-full bg-emerald-300" style={{ width: `${100 - familiesShare}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{familiesShare}% para las familias locatarias</span>
                <span>{deliveryType === 'bici' ? `${100 - familiesShare}% bici-mensajero` : '0% intermediarios'}</span>
              </div>
            </div>
          </section>

          {/* Resumen de compra */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Resumen de Compra
                <span className="px-1.5 py-0.5 rounded bg-[#eaedff] text-[10px] text-slate-600 font-semibold">RF-12</span>
              </h3>
              <span className="text-xs text-slate-500">Pedido #{draftFolio}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {boxes.map((b) => (
                <div key={b.location.stallId} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-700 min-w-0">
                    <span className="px-1 rounded bg-[#eaedff] text-[10px] font-bold">{b.location.stallNumber.replace('#', '')}</span>
                    <span className="truncate">Puesto {b.location.stallNumber.replace('#', '')} · {b.location.stallName}</span>
                  </span>
                  <span className="font-semibold text-slate-900 flex-shrink-0">{money(b.subtotal)} MXN</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {deliveryType === 'pickup' ? <Store className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                  Modalidad: {deliveryType === 'pickup' ? 'Recolección en cubículos' : 'Bicimensajero local'}
                </span>
                <span className="font-bold text-[#006948]">{deliveryType === 'pickup' ? '$0.00 MXN' : `+${money(BICI_FEE)} MXN`}</span>
              </div>
              {deliveryType === 'pickup' && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <QrCode className="w-3.5 h-3.5" /> Ficha y Croquis de Pasillos Digital
                  </span>
                  <span className="text-slate-500">Incluido ($0)</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Receipt className="w-3.5 h-3.5" /> Comisión por intermediación
                </span>
                <span className="font-bold text-[#006948]">$0.00 MXN</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f2f3ff] flex items-end justify-between gap-2">
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {deliveryType === 'pickup' ? 'Total a liquidar' : 'Total a pagar'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {deliveryType === 'pickup' ? 'Directo a locatarios' : 'Incluye bici-reparto barrial'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-[#006948] leading-none">{money(grandTotal)}</div>
                <div className="text-[10px] text-slate-500">MXN</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-12 py-3 px-4 rounded-xl bg-[#006948] text-white font-bold text-sm hover:bg-[#00553a] active:scale-[0.98] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
              {deliveryType === 'pickup' ? (
                <>
                  <QrCode className="w-4 h-4 flex-shrink-0" />
                  <span>Generar Orden y Ficha de Recolección (Token/QR)</span>
                </>
              ) : (
                <span>Confirmar y Enviar Pedido</span>
              )}
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>

            <button
              type="button"
              onClick={shareWhatsApp}
              className="w-full h-10 rounded-xl bg-[#f2f3ff] text-slate-700 text-xs font-semibold hover:bg-[#eaedff] flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              {deliveryType === 'pickup' ? 'Compartir lista y croquis por WhatsApp' : 'Compartir esta canasta por WhatsApp'}
            </button>

            <ul className="space-y-1.5 text-[11px] text-slate-600">
              {deliveryType === 'pickup' ? (
                <>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                    <span><strong className="text-slate-800">Ficha RF-14:</strong> Genera código QR de validación física por puesto.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span><strong className="text-slate-800">Tiempo de preparación:</strong> ~{maxPrep} min en pasillos.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#006948]" />
                    <span><strong className="text-slate-800">Impacto cero huella:</strong> Consumo de hiperproximidad.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                    <span><strong className="text-slate-800">Pago contra entrega o SPEI:</strong> pagas al recibir tu huacal.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span><strong className="text-slate-800">Tiempo estimado:</strong> 35–45 min directo de los puestos.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#006948]" />
                    <span><strong className="text-slate-800">Envío 100% ecológico en bicicleta:</strong> cero huella de carbono.</span>
                  </li>
                </>
              )}
            </ul>
          </section>

          {/* Garantía de frescura */}
          <section className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#eaedff] text-[#006948] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">Garantía de Frescura de Barrio</div>
              <p className="text-[11px] text-slate-600">
                Si algún producto no viene en su punto óptimo, el locatario te lo repone sin costo en tu siguiente pedido.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
};
