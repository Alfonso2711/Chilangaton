import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportProductsCsv } from './vendorUtils';
import {
  BadgeCheck,
  Eye,
  MessageSquareText,
  ListChecks,
  CheckCircle2,
  AudioLines,
  PencilLine,
  ClipboardList,
  Package,
  Flame,
  TrendingUp,
  Leaf,
  Timer,
  Bike,
  HeartHandshake,
  Bot,
  Mic,
  Route,
  ArrowRight,
} from 'lucide-react';

/** Dashboard principal del locatario (asset: canastalocal_dashboard_principal_locatario). */
export const VendorHome: React.FC<{ onPreview: () => void }> = ({ onPreview }) => {
  const {
    currentUser,
    merchantStall,
    products,
    whatsAppMessages,
    orders,
    pickupProgress,
    setActiveView,
    setRecentNotification,
  } = useApp();

  const [storeActive, setStoreActive] = useState(true);

  const stallProducts = products.filter((p) => p.stallId === merchantStall.id);
  const outOfStock = stallProducts.filter((p) => !p.inStock).length;
  const active = stallProducts.length - outOfStock;
  const confirmedToday = stallProducts.filter((p) => p.inStock && /min|Justo|hora/i.test(p.updatedAt)).length;
  const greetingName = (currentUser?.name || merchantStall.ownerName).split(' ').slice(0, 2).join(' ');

  const lastMerchantMsg = [...whatsAppMessages].reverse().find((m) => m.sender === 'locatario');
  const lastMsgText = lastMerchantMsg
    ? lastMerchantMsg.content.replace(/^🎙️\s*/, '').replace(/^"|"$/g, '')
    : 'Aún no hay mensajes';

  const stallOrders = orders.filter((o) => o.items.some((i) => i.product.stallId === merchantStall.id));
  const pendingPickups = stallOrders.filter(
    (o) =>
      o.deliveryType === 'pickup' &&
      o.status !== 'entregado' &&
      pickupProgress[o.id]?.statuses[merchantStall.id] !== 'recolectado'
  );
  const visits = 142 + stallOrders.length * 3;

  // Producto "más buscado": el de mayor ahorro frente al súper
  const topProduct = [...stallProducts].sort(
    (a, b) => b.supermarketPrice - b.price - (a.supermarketPrice - a.price)
  )[0];

  const toggleStore = () => {
    setStoreActive((v) => !v);
    setRecentNotification(
      storeActive ? 'Tu puesto aparece como "En pausa" para los vecinos' : '¡Tu puesto vuelve a estar activo en Canastita!'
    );
    window.setTimeout(() => setRecentNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <section className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006948] uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" /> Puesto verificado de barrio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Hola, {greetingName} 👋</h1>
          <p className="text-sm text-slate-600">
            {merchantStall.name} · {merchantStall.marketName} · {merchantStall.cubiculoCoords.section}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleStore}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors ${
              storeActive ? 'bg-emerald-100 text-[#006948]' : 'bg-orange-100 text-orange-800'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full ${storeActive ? 'bg-[#006948]' : 'bg-orange-500'}`} />
            {storeActive ? 'Tienda Activa' : 'Tienda en Pausa'}
          </button>
          <button
            onClick={onPreview}
            className="px-3 py-1.5 rounded-full bg-[#f2f3ff] text-xs font-semibold text-slate-700 hover:bg-[#eaedff] flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Vista previa
          </button>
        </div>
      </section>

      {/* Fichas pendientes (vínculo con el croquis del cliente) */}
      {pendingPickups.length > 0 && (
        <button
          onClick={() => setActiveView('vendedor_pedidos')}
          className="w-full p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-3 text-left hover:bg-orange-100 transition-colors"
        >
          <span className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
              <Route className="w-5 h-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-orange-950">
                {pendingPickups.length} {pendingPickups.length === 1 ? 'vecino viene' : 'vecinos vienen'} a recoger a tu cubículo
              </span>
              <span className="block text-xs text-orange-800">
                Prepara y pesa sus productos: el cliente ve tu avance en vivo en su croquis de pasillos.
              </span>
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-orange-700 flex-shrink-0" />
        </button>
      )}

      {/* Dos formas de actualizar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
          <div className="h-1.5 bg-emerald-400" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <span className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                <MessageSquareText className="w-6 h-6" />
              </span>
              <span className="px-2 py-1 rounded-md bg-emerald-100 text-[#006948] text-[10px] font-bold uppercase">
                Recomendado para el día a día
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Actualizar por WhatsApp (IA)</h2>
              <p className="text-sm text-slate-600 mt-1">
                Solo manda un mensaje de voz o texto con tus nuevos precios y la Inteligencia Artificial hará el resto.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#f2f3ff] flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#006948] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">Último mensaje recibido:</div>
                <p className="text-xs italic text-slate-600 line-clamp-2">“{lastMsgText}”</p>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {lastMerchantMsg?.timestamp ? `Hoy ${lastMerchantMsg.timestamp}` : '—'} ·{' '}
                  <span className="font-semibold text-[#006948]">Sincronizado</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveView('vendedor_ia')}
                className="px-4 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center gap-2"
              >
                <AudioLines className="w-4 h-4" /> Ver historial de mensajes
              </button>
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> IA en espera
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
          <div className="h-1.5 bg-[#006948]" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <span className="w-12 h-12 rounded-xl bg-[#eaedff] text-slate-700 flex items-center justify-center">
                <ListChecks className="w-6 h-6" />
              </span>
              <span className="px-2 py-1 rounded-md bg-[#eaedff] text-slate-600 text-[10px] font-bold uppercase">
                Control detallado
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Actualización Manual</h2>
              <p className="text-sm text-slate-600 mt-1">
                Edita tu catálogo, ajusta inventario y agrega productos nuevos desde esta plataforma.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#f2f3ff] flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <ClipboardList className="w-4 h-4" /> {stallProducts.length} productos dados de alta
              </span>
              {outOfStock > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold">{outOfStock} sin stock</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveView('vendedor_inventario')}
                className="px-4 h-10 rounded-xl bg-[#006948] hover:bg-[#00553a] text-white text-sm font-bold flex items-center gap-2"
              >
                <PencilLine className="w-4 h-4" /> Abrir Gestor Web
              </button>
              <button
                onClick={() => exportProductsCsv(stallProducts, `inventario-puesto-${merchantStall.stallNumber.replace('#', '')}.csv`)}
                className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
              >
                Exportar lista
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Rendimiento de hoy */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rendimiento de hoy</h3>
          <span className="text-xs text-slate-500">Actualizado en tiempo real</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              Visitas a tu perfil hoy
              <span className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center"><Eye className="w-4 h-4" /></span>
            </div>
            <div className="text-4xl font-black text-slate-900">{visits}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#006948]" />
              <span className="font-semibold text-[#006948]">+24% vs. ayer</span> · {stallOrders.length} pedidos generados
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              Productos activos
              <span className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center"><Package className="w-4 h-4" /></span>
            </div>
            <div className="text-4xl font-black text-slate-900">{active}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006948]" /> {confirmedToday} con precio confirmado hoy
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              Precio más buscado
              <span className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center"><Flame className="w-4 h-4 text-orange-600" /></span>
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{topProduct ? topProduct.name.split(' ')[0] : '—'}</div>
            {topProduct && (
              <div className="text-xs text-slate-600">
                <span className="font-bold text-[#006948]">${topProduct.price.toFixed(2)} MXN</span> · 48 consultas de vecinos
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Frescura */}
      <section className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 sm:p-6 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaedff] text-xs font-semibold text-slate-700">
            <Leaf className="w-3.5 h-3.5 text-orange-600" /> Cosecha matutina confirmada
          </span>
          <h3 className="text-xl font-bold text-slate-900">La frescura de tu pasillo ahora llega en segundos a la colonia</h3>
          <p className="text-sm text-slate-600">
            Tus clientes habituales ya pueden revisar tu pizarra digital desde su celular antes de salir de casa, recoger en tu cubículo con su ficha o pedir entrega con los bicirepartidores de guardia.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700">
            <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-[#006948]" /> Actualización en 3s</span>
            <span className="flex items-center gap-1.5"><Bike className="w-4 h-4 text-[#006948]" /> 3 Repartidores activos</span>
            <span className="flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-[#006948]" /> Trato directo sin comisiones</span>
          </div>
        </div>
        <img src={merchantStall.bannerImage} alt={merchantStall.name} className="w-full h-48 md:h-full object-cover" />
      </section>

      {/* Asistente IA */}
      <section className="p-5 rounded-2xl bg-[#f2f3ff] border border-[#e2e7ff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-[#006948] text-white flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5" />
          </span>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              Tu asistente de IA está escuchando al número
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006948] font-mono text-xs">{merchantStall.phone}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Puedes dictar precios mientras atiendes a tus clientes en el puesto. La IA transcribe, ajusta las unidades y sincroniza tu catálogo público.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('whatsapp_bot')}
          className="px-4 h-11 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 flex-shrink-0"
        >
          <Mic className="w-4 h-4 text-[#006948]" /> Probar enviando audio de prueba
        </button>
      </section>
    </div>
  );
};
