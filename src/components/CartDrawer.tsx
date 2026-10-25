import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Bike,
  Store,
  QrCode,
  Banknote,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotalCanastaLocal,
    cartTotalSupermercado,
    cartSavingsPesos,
    cartSavingsPercent,
    isCartOpen,
    setIsCartOpen,
    createOrder,
    selectedMarket,
  } = useApp();

  const [deliveryType, setDeliveryType] = useState<'bici' | 'pickup'>('bici');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'codi_dimo' | 'spei'>('codi_dimo');
  const [customerName, setCustomerName] = useState('Vecino de la Roma');
  const [customerPhone, setCustomerPhone] = useState('55 4321 9876');
  const [deliveryAddress, setDeliveryAddress] = useState('Calle Coahuila 124, Depto 302, Roma Sur');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const deliveryFee = deliveryType === 'bici' ? 25 : 0;
  const grandTotal = cartTotalCanastaLocal + deliveryFee;

  // Group cart items by stall
  const itemsByStall = cart.reduce((acc, item) => {
    const stall = item.product.stallName;
    if (!acc[stall]) acc[stall] = [];
    acc[stall].push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const order = createOrder(
      deliveryType,
      paymentMethod,
      customerName,
      customerPhone,
      deliveryType === 'bici' ? deliveryAddress : undefined
    );

    setCompletedOrder(order);

    // Launch celebratory confetti for supporting local commerce
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f97316', '#34d399'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Tu Canasta de Barrio
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {selectedMarket?.name} · {cart.length} productos
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Order Success State */}
        {completedOrder ? (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                ¡Pedido Confirmado con Éxito!
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Folio: #{completedOrder.id}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Notificación enviada por WhatsApp a {completedOrder.pickupStalls.join(', ')}.
              </p>
            </div>

            {/* Savings Achievement Card */}
            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span>Tu Ahorro Barrial:</span>
                <span className="text-sm font-black text-emerald-700">
                  -${completedOrder.totalSavings.toFixed(2)} MXN
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 leading-relaxed">
                🎉 Pagaste <strong>${completedOrder.totalCanastaLocal.toFixed(2)} MXN</strong> en vez de <strong>${completedOrder.totalSupermercado.toFixed(2)} MXN</strong> en el súper.
              </div>
            </div>

            <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="font-bold text-slate-900">Detalles de Entrega:</div>
              <div>
                <strong>Modo:</strong>{' '}
                {completedOrder.deliveryType === 'bici' ? '🚲 Bicimensajería (45 min)' : '🏪 Recoger en cubículo'}
              </div>
              <div>
                <strong>Pago:</strong>{' '}
                {completedOrder.paymentMethod === 'codi_dimo'
                  ? '📲 CoDi / DiMo Banxico'
                  : completedOrder.paymentMethod === 'efectivo'
                  ? '💵 Efectivo contra entrega'
                  : '🏦 Transferencia SPEI'}
              </div>
              {completedOrder.deliveryAddress && (
                <div>
                  <strong>Dirección:</strong> {completedOrder.deliveryAddress}
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Regresar al Mercado
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Tu canasta está vacía</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Explora los puestos del mercado y agrega frutas, verduras o carnes frescas para comparar tu ahorro.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Explorar Puestos
            </button>
          </div>
        ) : (
          /* Active Cart with Items and Checkout */
          <form onSubmit={handleCheckout} className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Live Savings Alert Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">Ahorras -{cartSavingsPercent}% vs Supermercado</span>
                    <div className="text-[11px] text-emerald-700">Te ahorras ${cartSavingsPesos.toFixed(2)} MXN hoy</div>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                  -${cartSavingsPesos.toFixed(0)}
                </span>
              </div>

              {/* Items grouped by stall */}
              <div className="space-y-4">
                {Object.entries(itemsByStall).map(([stallName, items]) => (
                  <div
                    key={stallName}
                    className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stallName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {items.length} {items.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {items.map(({ product, quantity }) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-100"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-extrabold text-emerald-700">
                                ${(product.price * quantity).toFixed(2)}
                              </span>
                              <span>(${product.price}/{product.unit})</span>
                            </div>
                          </div>

                          {/* Quantity Counter */}
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, quantity - 1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, quantity + 1)}
                              className="w-6 h-6 rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Options */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Método de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('bici')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                      deliveryType === 'bici'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold ring-2 ring-emerald-600/10'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <Bike className="w-3.5 h-3.5 text-emerald-600" /> Bici-reparto
                      </span>
                      <span className="font-bold text-emerald-700">+$25 MXN</span>
                    </div>
                    <span className="text-[11px] text-slate-500">45 min directo a tu puerta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                      deliveryType === 'pickup'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold ring-2 ring-emerald-600/10'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <Store className="w-3.5 h-3.5 text-emerald-600" /> Pick-up
                      </span>
                      <span className="font-bold text-emerald-700">Gratis</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Recoge en los puestos</span>
                  </button>
                </div>
              </div>

              {/* Payment Methods (Focused on Social Inclusion: CoDi, DiMo, Cash) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Método de Pago (Sin comisiones abusivas)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('codi_dimo')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'codi_dimo'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>CoDi / DiMo</span>
                    <span className="text-[9px] text-emerald-600 font-mono">0% comisión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Efectivo</span>
                    <span className="text-[9px] text-slate-400">Contra entrega</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('spei')}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'spei'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>SPEI directo</span>
                    <span className="text-[9px] text-slate-400">Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-2.5 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Tu Nombre o Apodo
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="Ej. Carmen González"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Teléfono celular (para avisarte de tu mandado)
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                    placeholder="Ej. 55 1234 5678"
                  />
                </div>

                {deliveryType === 'bici' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Dirección de entrega (Roma, Condesa, Juárez, Centro)
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                      placeholder="Calle y número, depto, colonia"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Bottom Order Summary & CTA */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal en CanastaLocal:</span>
                  <span className="font-mono">${cartTotalCanastaLocal.toFixed(2)}</span>
                </div>
                {deliveryType === 'bici' && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Bicimensajería barrial (45 min):</span>
                    <span className="font-mono">+$25.00</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                  <span>Tu Ahorro vs Supermercado:</span>
                  <span className="font-bold">-${cartSavingsPesos.toFixed(2)} MXN (-{cartSavingsPercent}%)</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-slate-900 pt-1">
                  <span>Total a pagar:</span>
                  <span className="text-xl text-emerald-700 font-black font-mono">
                    ${grandTotal.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Hacer Pedido al Mercado</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
