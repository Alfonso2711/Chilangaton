import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, StopStatus } from '../../types';
import {
  ShoppingBag,
  Wallet,
  Route,
  Receipt,
  Scale,
  PackageCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Bike,
  Store,
  Clock,
  Banknote,
  Smartphone,
  StickyNote,
} from 'lucide-react';

/**
 * Ventas y Pedidos del locatario. Las fichas de recolección (pick-up) se
 * sincronizan con el croquis del cliente: lo que el locatario marca aquí
 * (báscula, empacado, entrega validada) es lo que el vecino ve en su ruta.
 */

const STOP_LABEL: Record<StopStatus, string> = {
  pendiente: 'Pendiente',
  preparando: 'Por preparar',
  en_bascula: 'En báscula',
  listo: 'Empacado · esperando al vecino',
  recolectado: 'Entregado con ficha',
  incidencia: 'Incidencia reportada',
};

const STOP_TONE: Record<StopStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-600',
  preparando: 'bg-amber-100 text-amber-800',
  en_bascula: 'bg-orange-100 text-orange-800',
  listo: 'bg-emerald-100 text-[#006948]',
  recolectado: 'bg-[#006948] text-white',
  incidencia: 'bg-red-100 text-red-700',
};

const BICI_LABEL: Record<Order['status'], string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  en_camino: 'Con el bici-mensajero',
  entregado: 'Entregado',
};

const money = (n: number) => `$${n.toFixed(2)}`;
const normalizeToken = (t: string) => t.replace(/[^0-9a-z]/gi, '').toUpperCase();

export const VendorOrders: React.FC = () => {
  const { orders, merchantStall, pickupProgress, setStopStatus, reportStopIncident, updateOrderStatus, setRecentNotification } = useApp();
  const [tab, setTab] = useState<'pendientes' | 'historial'>('pendientes');
  const [tokenInput, setTokenInput] = useState<Record<string, string>>({});
  const [tokenError, setTokenError] = useState<string | null>(null);

  const stallOrders = orders
    .filter((o) => o.items.some((i) => i.product.stallId === merchantStall.id))
    .map((o) => {
      const items = o.items.filter((i) => i.product.stallId === merchantStall.id);
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const stopStatus: StopStatus | undefined =
        o.deliveryType === 'pickup' ? pickupProgress[o.id]?.statuses[merchantStall.id] || 'preparando' : undefined;
      const done = o.deliveryType === 'pickup' ? stopStatus === 'recolectado' : o.status === 'entregado';
      return { order: o, items, subtotal, stopStatus, done, incident: pickupProgress[o.id]?.incidents[merchantStall.id] };
    });

  const pending = stallOrders.filter((x) => !x.done);
  const history = stallOrders.filter((x) => x.done);
  const salesTotal = stallOrders.reduce((s, x) => s + x.subtotal, 0);
  const pickupsPending = pending.filter((x) => x.order.deliveryType === 'pickup').length;
  const avgTicket = stallOrders.length ? salesTotal / stallOrders.length : 0;
  const list = tab === 'pendientes' ? pending : history;

  const notify = (msg: string) => {
    setRecentNotification(msg);
    window.setTimeout(() => setRecentNotification(null), 3000);
  };

  const validateToken = (o: Order) => {
    const typed = normalizeToken(tokenInput[o.id] || '');
    const real = normalizeToken(o.pickupToken || '');
    // Se acepta la ficha completa (CDMX1234) o solo sus 4 dígitos
    if (typed && (typed === real || real.endsWith(typed)) && typed.length >= 4) {
      setStopStatus(o.id, merchantStall.id, 'recolectado');
      setTokenError(null);
      setTokenInput(({ [o.id]: _omit, ...rest }) => rest);
      notify(`Ficha #${o.pickupToken} validada · entrega registrada en tu historial de ventas`);
    } else {
      setTokenError(o.id);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Ventas y Pedidos</h1>
        <p className="text-sm text-slate-600 mt-1">
          Prepara los pedidos de tus vecinos. En las fichas de recolección, cada cambio que marques se refleja al instante en el croquis de pasillos del cliente.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Ventas registradas hoy', value: money(salesTotal), icon: Wallet, tone: 'bg-emerald-100 text-[#006948]' },
          { label: 'Pedidos del puesto', value: String(stallOrders.length), icon: ShoppingBag, tone: 'bg-[#eaedff] text-slate-700' },
          { label: 'Fichas por atender', value: String(pickupsPending), icon: Route, tone: 'bg-orange-100 text-orange-700' },
          { label: 'Ticket promedio', value: money(avgTicket), icon: Receipt, tone: 'bg-indigo-100 text-indigo-600' },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{k.label}</div>
              <div className="text-2xl font-black text-slate-900">{k.value}</div>
            </div>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.tone}`}>
              <k.icon className="w-5 h-5" />
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#f2f3ff] w-fit">
        {(
          [
            ['pendientes', `Por atender (${pending.length})`],
            ['historial', `Historial (${history.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold ${tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
          <div className="text-sm font-semibold text-slate-800">
            {tab === 'pendientes' ? 'No tienes pedidos por atender' : 'Aún no hay entregas registradas'}
          </div>
          <p className="text-xs text-slate-500">
            Los pedidos aparecen aquí cuando un vecino compra productos de tu puesto (entra como Cliente y genera una ficha de recolección para probarlo).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(({ order: o, items, subtotal, stopStatus, incident }) => {
            const isPickup = o.deliveryType === 'pickup';
            return (
              <article key={o.id} className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
                <div className="px-4 py-3 bg-[#f2f3ff] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPickup ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-[#006948]'}`}>
                      {isPickup ? <Store className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                    </span>
                    <strong className="font-mono">#{o.id}</strong>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {o.createdAt}
                    </span>
                    <span className="text-xs text-slate-600">
                      · {isPickup ? 'Recolección en cubículo' : 'Bicimensajero local'}
                    </span>
                    {isPickup && o.pickupToken && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-700">
                        Ficha #{o.pickupToken}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold w-fit ${
                      isPickup && stopStatus ? STOP_TONE[stopStatus] : o.status === 'entregado' ? 'bg-[#006948] text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isPickup && stopStatus ? STOP_LABEL[stopStatus] : BICI_LABEL[o.status]}
                  </span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-600">
                      Cliente: <strong className="text-slate-900">{o.customerName}</strong> · {o.customerPhone}
                    </div>
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {items.map((i) => (
                        <div key={i.product.id} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 min-w-0">
                            <img src={i.product.image} alt={i.product.name} className="w-8 h-8 rounded-md object-cover" />
                            <span className="truncate">
                              <strong>{i.quantity} {i.product.unit}</strong> · {i.product.name}
                            </span>
                          </span>
                          <span className="font-semibold text-slate-900 flex-shrink-0">{money(i.product.price * i.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>
                        Subtotal de tu puesto: <strong className="text-[#006948] text-sm">{money(subtotal)} MXN</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        {o.paymentMethod === 'efectivo' ? <Banknote className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                        {o.paymentMethod === 'efectivo'
                          ? isPickup
                            ? `Cobra ${money(subtotal)} en efectivo al entregar`
                            : 'Efectivo contra entrega (lo cobra el bici-mensajero)'
                          : `Pagado por ${o.paymentMethod === 'spei' ? 'SPEI' : 'CoDi / DiMo'}`}
                      </span>
                    </div>
                    {o.notes && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {o.notes}
                      </div>
                    )}
                    {incident && (
                      <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> El vecino reportó: {incident}
                        </span>
                        <button
                          onClick={() => {
                            reportStopIncident(o.id, merchantStall.id, null);
                            notify('Incidencia resuelta · el pedido vuelve a "Empacado"');
                          }}
                          className="font-bold underline"
                        >
                          Marcar resuelta
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Acciones del locatario */}
                  <div className="space-y-2">
                    {isPickup && stopStatus ? (
                      <>
                        <ol className="space-y-1.5 text-xs">
                          {(['preparando', 'en_bascula', 'listo', 'recolectado'] as StopStatus[]).map((st, idx) => {
                            const order = ['preparando', 'en_bascula', 'listo', 'recolectado'];
                            const currentIdx = order.indexOf(stopStatus === 'incidencia' ? 'listo' : stopStatus);
                            const reached = idx <= currentIdx;
                            return (
                              <li key={st} className={`flex items-center gap-2 ${reached ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${reached ? 'bg-[#006948] text-white' : 'bg-slate-200'}`}>
                                  {reached && <CheckCircle2 className="w-3 h-3" />}
                                </span>
                                {STOP_LABEL[st]}
                              </li>
                            );
                          })}
                        </ol>

                        {stopStatus === 'preparando' && (
                          <button
                            onClick={() => setStopStatus(o.id, merchantStall.id, 'en_bascula')}
                            className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <Scale className="w-4 h-4" /> Pasar a báscula
                          </button>
                        )}
                        {stopStatus === 'en_bascula' && (
                          <button
                            onClick={() => {
                              setStopStatus(o.id, merchantStall.id, 'listo');
                              notify(`Pedido #${o.id} empacado · avisamos a ${o.customerName}`);
                            }}
                            className="w-full h-10 rounded-xl bg-[#006948] hover:bg-[#00553a] text-white text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <PackageCheck className="w-4 h-4" /> Marcar empacado
                          </button>
                        )}
                        {stopStatus === 'listo' && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                              <QrCode className="w-3.5 h-3.5" /> Valida la ficha que muestra el vecino
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                value={tokenInput[o.id] || ''}
                                onChange={(e) => {
                                  setTokenInput((t) => ({ ...t, [o.id]: e.target.value }));
                                  setTokenError(null);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && validateToken(o)}
                                placeholder="CDMX-0000"
                                className={`flex-1 min-w-0 h-10 px-3 rounded-xl border font-mono text-sm uppercase focus:outline-none ${
                                  tokenError === o.id ? 'border-red-400' : 'border-slate-200 focus:border-[#006948]'
                                }`}
                              />
                              <button
                                onClick={() => validateToken(o)}
                                className="px-3 h-10 rounded-xl bg-[#006948] hover:bg-[#00553a] text-white text-sm font-bold"
                              >
                                Validar
                              </button>
                            </div>
                            {tokenError === o.id && (
                              <p className="text-[11px] text-red-600">La ficha no coincide. Revisa el código en el celular del vecino.</p>
                            )}
                          </div>
                        )}
                        {stopStatus === 'recolectado' && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 text-xs text-[#006948] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Entrega validada con la ficha #{o.pickupToken}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {o.status !== 'entregado' ? (
                          <button
                            onClick={() =>
                              updateOrderStatus(
                                o.id,
                                o.status === 'recibido' ? 'preparando' : o.status === 'preparando' ? 'en_camino' : 'entregado'
                              )
                            }
                            className="w-full h-10 rounded-xl bg-[#006948] hover:bg-[#00553a] text-white text-sm font-bold"
                          >
                            {o.status === 'recibido'
                              ? 'Empezar a preparar'
                              : o.status === 'preparando'
                              ? 'Entregar al bici-mensajero'
                              : 'Confirmar entrega'}
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-emerald-50 text-xs text-[#006948] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Pedido entregado
                          </div>
                        )}
                        {o.deliveryAddress && <p className="text-[11px] text-slate-500">Destino: {o.deliveryAddress}</p>}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
