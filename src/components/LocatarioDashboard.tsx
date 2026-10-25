import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Award,
  DollarSign,
  QrCode,
  Sparkles,
  Mic,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  PackageCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LocatarioDashboard: React.FC = () => {
  const {
    merchantStall,
    products,
    updateProductPrice,
    toggleProductStock,
    updateTrustProfile,
    orders,
    updateOrderStatus,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventario' | 'credito' | 'pedidos'>('inventario');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [showFondesoModal, setShowFondesoModal] = useState(false);
  const [showCodiModal, setShowCodiModal] = useState(false);

  const stallProducts = products.filter((p) => p.stallId === merchantStall.id);
  const trust = merchantStall.trustProfile;

  const handleSavePrice = (productId: string) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num > 0) {
      updateProductPrice(productId, num);
    }
    setEditingPriceId(null);
  };

  const handleLinkCodi = () => {
    updateTrustProfile({
      level: 2,
      levelName: 'Tienda Verificada (Bancarizada)',
      score: Math.min(100, trust.score + 10),
      acceptsDigitalPayments: true,
      selloComercioSeguro: true,
      bankAccountLinked: 'Cuenta Nivel 2 Banxico (CoDi / DiMo vinculada)',
    });
    setShowCodiModal(false);
    try {
      confetti({ particleCount: 50, spread: 60, colors: ['#059669', '#3b82f6'] });
    } catch {}
  };

  const handleUnlockFondeso = () => {
    updateTrustProfile({
      level: 3,
      levelName: 'Tienda Oficial (Pre-candidata FONDESO)',
      score: 98,
      hasRFC: true,
      preQualifiedCreditAmount: 25000,
    });
    setShowFondesoModal(false);
    try {
      confetti({ particleCount: 100, spread: 80, colors: ['#f59e0b', '#10b981', '#3b82f6'] });
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Card */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={merchantStall.avatar}
              alt={merchantStall.ownerName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Puesto {merchantStall.stallNumber} · {merchantStall.marketName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {trust.levelName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Portal de {merchantStall.ownerName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {merchantStall.name} · {merchantStall.cubiculoCoords.section}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setActiveView('whatsapp_bot')}
              className="flex-1 md:flex-initial h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              <span>Actualizar por Voz / WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Metrics Cards: Trazabilidad, Score y Crédito */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sales Traceability */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Ventas Registradas (Mes)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ${trust.registeredSalesMonth.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {trust.monthlyOrdersCount} pedidos registrados (Trazabilidad barrial activa)
          </p>
        </div>

        {/* Score de Confianza Barrial */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Score de Confianza</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
              {trust.score}/100
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase">Excelente</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Calculado con puntualidad, precios al día y valoraciones de vecinos
          </p>
        </div>

        {/* Pre-Credit FONDESO CDMX */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Microcrédito Pre-Aprobado
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md font-mono">
              FONDESO
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
            ${trust.preQualifiedCreditAmount.toLocaleString()} <span className="text-xs font-normal text-amber-700">MXN</span>
          </div>
          <button
            onClick={() => setShowFondesoModal(true)}
            className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1 mt-1"
          >
            <span>Ver requisitos de liberación de apoyo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventario'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventario en Vivo ({stallProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('credito')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'credito'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Inclusión Financiera & FONDESO</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'pedidos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Pedidos de Vecinos ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: Live Inventory Management */}
      {activeTab === 'inventario' && (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Productos del Puesto #{merchantStall.stallNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Cambia el precio o disponibilidad aquí o directamente por voz en MarchanteBot
              </p>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200">
              {merchantStall.lastVoiceUpdate}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Origen</th>
                  <th className="py-2.5 px-3">Precio en CanastaLocal</th>
                  <th className="py-2.5 px-3">Precio en Súper</th>
                  <th className="py-2.5 px-3">Disponibilidad</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stallProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      />
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {p.origin}
                    </td>
                    <td className="py-3 px-3">
                      {editingPriceId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-16 h-7 px-1.5 bg-white border border-emerald-500 rounded text-xs font-mono font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(p.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPriceId(p.id);
                            setTempPrice(p.price.toString());
                          }}
                          className="font-bold text-emerald-700 font-mono text-sm hover:underline"
                          title="Clic para editar precio"
                        >
                          ${p.price.toFixed(2)} /{p.unit}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono line-through">
                      ${p.supermarketPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleProductStock(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          p.inStock
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-red-50 hover:text-red-700'
                            : 'bg-red-100 text-red-800 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {p.inStock ? '✓ Disponible' : '✕ Agotado'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingPriceId(p.id);
                          setTempPrice(p.price.toString());
                        }}
                        className="text-[11px] font-bold text-slate-600 hover:text-emerald-700"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: Inclusion Financiera & "Buró de Crédito del Barrio" */}
      {activeTab === 'credito' && (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Estrategia: Inclusión Financiera y Empoderamiento de Datos
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Semáforo de Crecimiento & Verificación Barrial
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mt-1">
              Aquí no existen estigmas de "formal o informal". Tu historial de ventas en CanastaLocal crea tu <strong>Score de Confianza</strong> que te abre las puertas a microcréditos del Gobierno de la CDMX (FONDESO) sin pedirte estados de cuenta bancarios tradicionales.
            </p>
          </div>

          {/* 3 Verification Levels Gamification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1: Tienda Básica */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                trust.level >= 1
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Nivel 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tienda Básica de Barrio</h4>
              <p className="text-xs text-slate-600 mt-1">
                Solo requiere un número de WhatsApp. Puede subir productos por voz y cobrar en efectivo.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-800">
                ✓ Estado: Completado
              </div>
            </div>

            {/* Level 2: Tienda Verificada */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                trust.level >= 2
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                  Nivel 2
                </span>
                {trust.level >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[11px] font-bold text-amber-600">Pendiente</span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tienda Verificada (Bancarizada)</h4>
              <p className="text-xs text-slate-600 mt-1">
                Vincula CoDi o DiMo (Banxico sin comisiones). Obtén el <strong>Sello de Comercio Seguro</strong> que atrae más compradores.
              </p>
              {trust.level >= 2 ? (
                <div className="mt-3 text-[11px] font-semibold text-emerald-800">
                  ✓ {trust.bankAccountLinked || 'CoDi/DiMo activo'}
                </div>
              ) : (
                <button
                  onClick={() => setShowCodiModal(true)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                >
                  Vincular CoDi sin comisión
                </button>
              )}
            </div>

            {/* Level 3: Tienda Oficial & FONDESO */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                trust.level >= 3
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Nivel 3
                </span>
                {trust.level >= 3 ? (
                  <Sparkles className="w-4 h-4 text-amber-600" />
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Pre-Candidato
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tienda Oficial (FONDESO)</h4>
              <p className="text-xs text-slate-600 mt-1">
                Tus ventas demuestran un negocio sólido. Acceso a microcréditos de <strong>$10,000 a $25,000 MXN</strong> del Gobierno de la CDMX.
              </p>
              {trust.level >= 3 ? (
                <div className="mt-3 text-[11px] font-semibold text-amber-900">
                  ★ Crédito FONDESO Aprobado ($25,000 MXN)
                </div>
              ) : (
                <button
                  onClick={() => setShowFondesoModal(true)}
                  className="mt-3 w-full py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                >
                  Liberar Microcrédito FONDESO
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: Incoming Neighborhood Orders */}
      {activeTab === 'pedidos' && (
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Pedidos Entrantes para el Puesto #{merchantStall.stallNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Revisa qué preparar para los repartidores en bici o vecinos que recogen en el cubículo
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {orders.length} pedidos hoy
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aún no hay pedidos registrados hoy. ¡Haz un pedido de prueba desde la vista de Comprador!
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        Folio #{ord.id}
                      </span>
                      <span className="text-slate-400">· {ord.createdAt}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === 'entregado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'preparando'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium">
                      Cliente: <strong>{ord.customerName}</strong> ({ord.customerPhone})
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Modo: {ord.deliveryType === 'bici' ? '🚲 Bicimensajería' : '🏪 Recolección en puesto'} · Pago: {ord.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="font-black text-slate-900 font-mono text-base">
                      ${ord.totalCanastaLocal.toFixed(2)}
                    </span>
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          ord.id,
                          ord.status === 'recibido'
                            ? 'preparando'
                            : ord.status === 'preparando'
                            ? 'entregado'
                            : 'entregado'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                    >
                      {ord.status === 'recibido'
                        ? 'Marcar Preparando'
                        : ord.status === 'preparando'
                        ? 'Listo para Entrega'
                        : 'Completado ✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal: Vincular CoDi / DiMo */}
      {showCodiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Vincular Cobro Digital CoDi / DiMo
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                El Banco de México permite recibir transferencias inmediatas por celular sin ninguna comisión (0% vs 3.5% que cobran terminales privadas).
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div><strong>Locatario:</strong> María del Carmen Pérez</div>
              <div><strong>Número celular:</strong> 55 1234 5678</div>
              <div><strong>Cuenta Nivel 2:</strong> Tarjeta Débito / Clabe Interbancaria</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCodiModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkCodi}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                Confirmar Vinculación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: FONDESO CDMX Microcrédito */}
      {showFondesoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Fondo para el Desarrollo Social de la CDMX (FONDESO)
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mt-0.5">
                ¡Felicidades Doña Mary! Microcrédito Pre-Calificado
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tus ventas continuas de más de <strong>$18,450 MXN</strong> este mes en CanastaLocal demuestran que tu puesto de frutas es un negocio sólido y confiable. Tienes acceso prioritario a financiamiento con tasa preferencial del 0% al 6% anual para comprar mercancía y báscula digital.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-1.5 text-amber-950">
              <div className="font-bold">Monto disponible para liberar:</div>
              <div className="text-2xl font-black font-mono text-amber-900">$25,000 MXN</div>
              <p className="text-[11px] text-amber-800">
                Para el desembolso institucional de SEDECO y emisión de constancia, solo confirmas tus datos de locataria oficial en el padrón de mercados públicos de la CDMX.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowFondesoModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Después
              </button>
              <button
                onClick={handleUnlockFondeso}
                className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-md"
              >
                Aceptar Microcrédito FONDESO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
