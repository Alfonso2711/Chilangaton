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
    <div className="w-full space-y-4 sm:space-y-6">
      {/* 1. Top Live Status Bar */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 w-full lg:w-auto border border-slate-100">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-700 whitespace-nowrap">
              En Directo
            </span>
            <span className="text-xs text-slate-600 truncate">
              Precios y existencias actualizados al instante vía audio de WhatsApp por los propios marchantes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end flex-wrap text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200/60">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedMarket?.name}</span>
            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded font-mono">
              {selectedMarket?.alcaldia}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>
              Ahorro hoy: ~38% vs Supermercados (hasta -$275 MXN/canasta)
            </span>
          </div>
        </div>
      </section>

      {/* 2. Hero Visual Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 lg:p-10 shadow-lg">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-orange-500/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Chilangatón · Innovación Social para el Comercio Popular
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              El mercado y tianguis de tu colonia, <span className="text-emerald-300 underline decoration-orange-400 decoration-wavy decoration-2">ahora digital.</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
              Pide directo a los puestos de tu barrio: verduras de Xochimilco, carnes selectas y abarrotes frescos con entrega en bici en 45 min o pick-up en cubículo. Cero comisiones a corporaciones, 100% apoyo a la economía popular.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setActiveView('mercados_mapa')}
              className="h-11 px-5 rounded-xl bg-white text-emerald-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              Ver Mapa de Mercados y Tianguis CDMX
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('whatsapp_bot')}
              className="h-11 px-4 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all border border-emerald-500/30 flex items-center gap-2 active:scale-95"
            >
              <Mic className="w-4 h-4 text-emerald-300" />
              ¿Eres locatario? Prueba actualización por voz
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-white leading-tight">
                  {selectedMarket?.stallsCount || 18} puestos activos
                </span>
                <span className="text-xs text-emerald-200/80 truncate">
                  En {selectedMarket?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-300 flex-shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-white leading-tight">
                  -$275 MXN ahorro
                </span>
                <span className="text-xs text-emerald-200/80 truncate">
                  Frente a Walmart/Chedraui
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 flex-shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-white leading-tight">
                  45 min en Bici
                </span>
                <span className="text-xs text-emerald-200/80 truncate">
                  Repartidores locales del barrio
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
