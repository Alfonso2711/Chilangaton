import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { SavingsComparator } from './SavingsComparator';
import { StallCategory } from '../types';
import {
  Store,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
} from 'lucide-react';

interface MarketplaceViewProps {
  onOpenStall: (stallId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onOpenStall }) => {
  const {
    products,
    stalls,
    selectedMarket,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setActiveView,
    frequentBaskets,
    loadFrequentBasket,
  } = useApp();

  const categories: string[] = [
    'Todas',
    'Frutas y Verduras',
    'Carnes y Pollería',
    'Cremería y Lácteos',
    'Chiles Secos y Especies',
    'Abarrotes y Granos',
  ];

  // Filter products by selected market, category, and search query
  const marketStalls = stalls.filter((s) => s.marketId === selectedMarket?.id);
  const marketStallIds = marketStalls.map((s) => s.id);

  const filteredProducts = products.filter((p) => {
    // If stalls exist for this market, match stall or marketId
    const matchesMarket = p.marketId === selectedMarket?.id || marketStallIds.includes(p.stallId);
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stallName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMarket && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* 1. Hero & Live Status */}
      <HeroBanner />

      {/* 1.1 Compras Recurrentes: Canasta Frecuente en 1 Clic */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Ahorra Tiempo · Compra en 1 Clic
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Canastas Frecuentes
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Los productos indispensables del tianguis, listos en tu carrito con 1 toque
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {frequentBaskets.map((basket) => (
            <div
              key={basket.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group border-l-4 border-l-emerald-600"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{basket.emoji}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {basket.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    Ahorras ${basket.savingsVsSuper}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {basket.tagline}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total estimado</div>
                  <div className="font-black text-base text-slate-900 font-mono">
                    ${basket.approxTotal} MXN
                  </div>
                </div>

                <button
                  onClick={() => loadFrequentBasket(basket.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#006948] hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <span>Pedir en 1 Clic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Puestos Activos en este Mercado */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              Puestos Tradicionales
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Puestos en {selectedMarket?.name}
            </h2>
          </div>
          <button
            onClick={() => setActiveView('mercados_mapa')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Cambiar de Mercado o Tianguis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketStalls.map((stall) => (
            <div
              key={stall.id}
              onClick={() => onOpenStall(stall.id)}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col"
            >
              <div className="relative h-28 rounded-xl overflow-hidden bg-slate-100 mb-3">
                <img
                  src={stall.bannerImage}
                  alt={stall.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                  {stall.stallNumber}
                </div>
              </div>

              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={stall.avatar}
                  alt={stall.ownerName}
                  className="w-9 h-9 rounded-xl object-cover border border-white shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {stall.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 truncate">
                    Por {stall.ownerName}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {stall.trustProfile.levelName.split(' ')[0]} {stall.trustProfile.levelName.split(' ')[1]}
                </span>
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {stall.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Savings Comparator (Interactive benchmark) */}
      <SavingsComparator />

      {/* 4. Category Filter Rail */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Alimentos Frescos
            </h2>
            <p className="text-xs text-slate-500">
              {filteredProducts.length} productos disponibles hoy con actualización en tiempo real
            </p>
          </div>

          {/* Category Chips Horizontal Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenStall={onOpenStall}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              No encontramos productos para "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Prueba buscando términos como "jitomate", "aguacate", "limón", "pechuga" o cambia de mercado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
