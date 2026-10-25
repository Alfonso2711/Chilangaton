import React from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMarketMap } from './InteractiveMarketMap';
import { DayOfWeek } from '../types';
import {
  Store,
  MapPin,
  Calendar,
  Clock,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';

export const MarketsExplorer: React.FC = () => {
  const {
    markets,
    selectedMarketId,
    setSelectedMarketId,
    selectedDay,
    setSelectedDay,
    selectedAlcaldia,
    setSelectedAlcaldia,
    setActiveView,
  } = useApp();

  const days: { key: DayOfWeek | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Toda la Semana' },
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  const alcaldias = [
    'todas',
    'Cuauhtémoc',
    'Coyoacán',
    'Iztapalapa',
    'Venustiano Carranza',
    'Benito Juárez',
    'Miguel Hidalgo',
    'Tlalpan',
  ];

  // Filter markets by day and alcaldía
  const filteredMarkets = markets.filter((m) => {
    const matchesDay = selectedDay === 'todos' || m.activeDays.includes(selectedDay as DayOfWeek);
    const matchesAlcaldia = selectedAlcaldia === 'todas' || m.alcaldia.toLowerCase() === selectedAlcaldia.toLowerCase();
    return matchesDay && matchesAlcaldia;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Stat Context (SEDECO & Congreso CDMX Data) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Reto 1 · Comercio Popular y Barrial CDMX
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Directorio Unificado de Mercados Públicos & Tianguis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Integramos en una sola plataforma viva la ubicación, días de operación, horarios y locales de los <strong>339 mercados públicos</strong> y <strong>1,367 tianguis</strong> registrados por SEDECO en las 16 alcaldías de la Ciudad de México.
            </p>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="text-lg font-black text-slate-900 leading-tight">339</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Mercados Públicos</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-center">
              <div className="text-lg font-black text-amber-900 leading-tight">1,367</div>
              <div className="text-[10px] text-amber-700 font-semibold uppercase">Tianguis Registrados</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-center col-span-2 sm:col-span-1">
              <div className="text-lg font-black text-emerald-900 leading-tight">7 Millones</div>
              <div className="text-[10px] text-emerald-700 font-semibold uppercase">Clientes / Semana</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters: Day of the Week & Alcaldía */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Day of week filter chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Filtrar por Día de Operación
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedDay === 'todos' ? 'Mostrando todos los días' : `Tianguis y mercados abiertos el ${selectedDay}`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {days.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDay === d.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alcaldía select rail */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alcaldía:
          </span>
          {alcaldias.map((alc) => (
            <button
              key={alc}
              onClick={() => setSelectedAlcaldia(alc)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedAlcaldia === alc
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {alc === 'todas' ? 'Todas las Alcaldías' : alc}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Map Component */}
      <InteractiveMarketMap
        markets={filteredMarkets}
        selectedMarketId={selectedMarketId}
        onSelectMarket={(id) => setSelectedMarketId(id)}
        activeDay={selectedDay}
      />

      {/* Grid of Filtered Markets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Puntos de Abasto ({filteredMarkets.length} encontrados)
          </h2>
          <span className="text-xs text-slate-500">
            Haz clic en un mercado para entrar y hacer tu mandado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMarkets.map((market) => {
            const isSelected = market.id === selectedMarketId;
            return (
              <article
                key={market.id}
                className={`group flex flex-col rounded-2xl bg-white p-4 sm:p-5 border transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-600 shadow-md ring-2 ring-emerald-600/10'
                    : 'border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                  <img
                    src={market.image}
                    alt={market.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold">
                    {market.distanceKm} km
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-200 text-[10px] font-bold backdrop-blur-xs">
                    {market.schedule}
                  </div>
                </div>

                <div className="flex flex-col flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        market.type === 'tianguis'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {market.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{market.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {market.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {market.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      {market.stallsCount} puestos disponibles
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {market.alcaldia}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMarketId(market.id);
                      setActiveView('comprador');
                    }}
                    className={`mt-3 w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>Hacer mandado en este mercado</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
