import React from 'react';
import { useApp } from '../context/AppContext';
import { groupItemsByStall } from '../data/marketLayout';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Store,
  ArrowRight,
  ShoppingBag,
  HeartHandshake,
  Lock,
  ListX,
  Route,
} from 'lucide-react';

/**
 * Vista rápida del carrito (asset: canastalocal_carrito_sheet_lateral).
 * El checkout completo vive en la pantalla "Mi Canasta Local" (MiCanastaView),
 * desde donde se elige modalidad de entrega y se genera la ficha de recolección.
 */
export const CartDrawer: React.FC = () => {
  const {
    cart,
    stalls,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalCanastaLocal,
    cartTotalSupermercado,
    cartSavingsPercent,
    isCartOpen,
    setIsCartOpen,
    selectedMarket,
    setActiveView,
    activeOrder,
    setCroquisPreview,
    saveCurrentCartAsBasket,
  } = useApp();

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const boxes = groupItemsByStall(cart, stalls);
  const pendingPickup =
    activeOrder && activeOrder.deliveryType === 'pickup' && activeOrder.status !== 'entregado'
      ? activeOrder
      : undefined;

  const handleClose = () => setIsCartOpen(false);

  const goTo = (view: 'mi_canasta' | 'croquis_ruteo' | 'comprador') => {
    setIsCartOpen(false);
    if (view === 'croquis_ruteo') setCroquisPreview(false);
    setActiveView(view);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#faf8ff] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">Mi Canasta Local</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-[#005137] text-xs font-bold">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="w-9 h-9 rounded-full hover:bg-slate-200/70 text-slate-500 flex items-center justify-center"
                title="Vaciar canasta"
                aria-label="Vaciar canasta"
              >
                <ListX className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-slate-600 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-5">
          <div className="px-3 py-2 rounded-xl bg-[#f2f3ff] text-xs text-slate-700 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#006948] flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4" />
            </span>
            <span className="truncate">
              <strong>{selectedMarket?.name}</strong> · {selectedMarket?.colonia}{' '}
              <span className="text-[#006948]">(Recolección o Bici-reparto barrial)</span>
            </span>
          </div>
        </div>

        {pendingPickup && (
          <div className="px-4 sm:px-5 pt-3">
            <button
              onClick={() => goTo('croquis_ruteo')}
              className="w-full px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center justify-between gap-2 hover:bg-orange-100"
            >
              <span className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-orange-600" /> Recolección en curso #{pendingPickup.id}
              </span>
              <span className="font-bold">Ver croquis</span>
            </button>
          </div>
        )}

        {cart.length === 0 ? (
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
              onClick={() => goTo('comprador')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Explorar Puestos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {boxes.flatMap((box) =>
                box.items.map(({ product, quantity }) => (
                  <div key={product.id} className="p-3 rounded-2xl bg-[#f2f3ff] flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 leading-tight truncate">{product.name}</h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-600/80 hover:text-red-700 flex-shrink-0"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        {box.location.stallName} · Puesto {box.location.stallNumber.replace('#', '')} ({quantity} {product.unit})
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#006948]">${(product.price * quantity).toFixed(2)} MXN</span>
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded bg-[#eaedff] text-slate-700 hover:bg-[#e2e7ff] flex items-center justify-center"
                            aria-label="Quitar uno"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded bg-[#eaedff] text-slate-700 hover:bg-[#e2e7ff] flex items-center justify-center"
                            aria-label="Agregar uno"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Apoyo al comercio local */}
              <div className="p-4 rounded-2xl bg-[#eaedff] space-y-3">
                <div className="flex items-center gap-2 text-[#006948] font-bold text-sm">
                  <HeartHandshake className="w-5 h-5" /> ¡Estás apoyando al comercio local!
                </div>
                <p className="text-xs text-slate-700">
                  Comprando directamente a familias locatarias de tu colonia sin comisiones ni intermediarios corporativos.
                </p>
                <div className="p-3 rounded-xl bg-white flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] text-slate-400 line-through">Supermercado: ${cartTotalSupermercado.toFixed(2)} MXN</div>
                    <div className="text-lg font-bold text-slate-900">Tu costo: ${cartTotalCanastaLocal.toFixed(2)}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-xs font-bold text-center leading-tight">
                    Ahorras
                    <br />
                    {cartSavingsPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-200/70 bg-white space-y-2">
                <button
                  onClick={() => goTo('mi_canasta')}
                  className="w-full h-12 rounded-xl bg-[#006948] text-white font-bold text-base hover:bg-[#00553a] active:scale-[0.98] transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
                >
                  Confirmar Pedido <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => saveCurrentCartAsBasket('Mi Canasta Semanal')}
                  className="w-full h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>⭐ Guardar esta compra como Canasta Frecuente</span>
                </button>
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pago contra entrega o SPEI · Recolección en cubículo o envío 100% ecológico
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
