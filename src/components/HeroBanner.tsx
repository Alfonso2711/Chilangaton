import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  TrendingDown,
  Store,
  Bike,
  PiggyBank,
  Mic,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { selectedMarket, setActiveView, cartSavingsPesos, cartSavingsPercent } = useApp();

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* 1. Barra Superior en Directo */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 w-full sm:w-auto">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-bold text-emerald-800">
            Precios del día actualizados por los marchantes
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedMarket?.name}</span>
            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded font-mono">
              {selectedMarket?.alcaldia}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006948] text-white font-bold shadow-xs">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Ahorras ~38% vs Súper</span>
          </div>
        </div>
      </section>

      {/* 2. Tarjeta Principal Limpia y Amigable */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold backdrop-blur-md">
            <span>Abasto Barrial CDMX</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              El tianguis y mercado de tu colonia, en tu mano.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Pide directo a los puestos locales: frutas y hortalizas frescas, quesos de rancho y carnes selectas. Recoge con tu ficha en cubículo o recibe en bici.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => setActiveView('mercados_mapa')}
              className="h-10 px-4 rounded-xl bg-white text-emerald-950 font-extrabold text-xs hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ver Mercados y Tianguis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveView('croquis_ruteo')}
              className="h-10 px-4 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 text-white font-bold text-xs transition-all border border-emerald-500/30 flex items-center gap-2 active:scale-95"
            >
              <Store className="w-3.5 h-3.5 text-emerald-300" />
              <span>Ver Croquis de Pasillos</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
