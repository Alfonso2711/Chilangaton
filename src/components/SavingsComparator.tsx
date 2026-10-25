import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingDown,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SavingsComparator: React.FC = () => {
  const { cart, cartTotalCanastaLocal, cartTotalSupermercado, cartTotalConvenience, cartSavingsPesos, cartSavingsPercent, setIsCartOpen } = useApp();

  // If cart is empty, show benchmark basket
  const hasCartItems = cart.length > 0;
  const localPrice = hasCartItems ? cartTotalCanastaLocal : 396;
  const superPrice = hasCartItems ? cartTotalSupermercado : 635;
  const oxxoPrice = hasCartItems ? cartTotalConvenience : 720;
  const savings = hasCartItems ? cartSavingsPesos : 239;
  const savingsPct = hasCartItems ? cartSavingsPercent : 38;

  return (
    <section className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Módulo de Ahorro Barrial (RF-04)
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Comparador de Canasta Básica Popular
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {hasCartItems
              ? `Comparativa en tiempo real de los ${cart.length} productos en tu canasta actual`
              : 'Canasta tipo de 7 productos esenciales de la semana en la CDMX'}
          </p>
        </div>

        {/* Savings Big Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            -{savingsPct}%
          </div>
          <div>
            <div className="text-xs text-emerald-900 font-semibold">Ahorro en tu bolsillo</div>
            <div className="text-xl font-black text-emerald-700 leading-tight">
              ${savings.toFixed(2)} MXN
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">
              Frente a cadenas de supermercados
            </div>
          </div>
        </div>
      </div>

      {/* 3 Channels Visual Comparison Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        {/* CanastaLocal */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white shadow-md border border-emerald-500">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-extrabold uppercase">
            Más Fresco & Económico
          </div>
          <div className="text-xs text-emerald-100 font-semibold mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Mercados & Tianguis
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mb-2">
            ${localPrice.toFixed(2)} <span className="text-xs font-normal text-emerald-200">MXN</span>
          </div>
          <div className="text-xs text-emerald-100/90 leading-relaxed space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Cosecha directa:</span>
              <span className="font-bold">Mismo día</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Comisión a intermediarios:</span>
              <span className="font-bold">0%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Beneficio a tu barrio:</span>
              <span className="font-bold">100% familiar</span>
            </div>
          </div>
        </div>

        {/* Supermercados Corporativos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Supermercados (Walmart / Chedraui)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
            ${superPrice.toFixed(2)} <span className="text-xs font-normal text-slate-500">MXN</span>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Sobreprecio estimado:</span>
              <span className="font-bold text-red-600">+${(superPrice - localPrice).toFixed(0)} MXN</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Días en refrigeración:</span>
              <span>4 a 7 días</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Margen corporativo:</span>
              <span>45% a 60%</span>
            </div>
          </div>
        </div>

        {/* Tiendas de Conveniencia */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Tiendas de Conveniencia (OXXO / 7-Eleven)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
            ${oxxoPrice.toFixed(2)} <span className="text-xs font-normal text-slate-500">MXN</span>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Sobreprecio estimado:</span>
              <span className="font-bold text-red-600">+${(oxxoPrice - localPrice).toFixed(0)} MXN</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Variedad de frescos:</span>
              <span>Muy limitada</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Impacto económico local:</span>
              <span>Extractivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Annual Projection Callout */}
      <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Impacto en la economía familiar:</strong> Comprar en mercados y tianguis representa un ahorro anual acumulado de más de <strong>$12,400 MXN</strong> por familia en la CDMX, frenando la caída del 42.8% en ventas del comercio popular reportada por el Congreso local.
          </span>
        </div>
        <button
          onClick={() => setIsCartOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Ver mi Canasta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
