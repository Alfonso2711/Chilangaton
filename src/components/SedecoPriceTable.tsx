import React, { useState, useEffect } from 'react';
import { SedecoPriceItem } from '../types';
import { INITIAL_SEDECO_PRICES } from '../data/sedecoPricesData';
import { SedecoPriceModal } from './SedecoPriceModal';
import {
  TrendingDown,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Store,
  Truck,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  DollarSign,
  Download,
} from 'lucide-react';

export const SedecoPriceTable: React.FC = () => {
  // Load prices from localStorage or fallback to INITIAL_SEDECO_PRICES
  const [prices, setPrices] = useState<SedecoPriceItem[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_sedeco_prices_v1');
      return saved ? JSON.parse(saved) : INITIAL_SEDECO_PRICES;
    } catch {
      return INITIAL_SEDECO_PRICES;
    }
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SedecoPriceItem | null>(null);

  // Save to localStorage whenever prices change
  useEffect(() => {
    localStorage.setItem('canasta_sedeco_prices_v1', JSON.stringify(prices));
  }, [prices]);

  const handleSaveProduct = (item: SedecoPriceItem) => {
    setPrices((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === item.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = item;
        return copy;
      }
      return [item, ...prev];
    });
    setEditingItem(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Deseas eliminar este producto del monitoreo de precios SEDECO?')) {
      setPrices((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredPrices = prices.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate overall basket stats
  const totalItems = filteredPrices.length;
  const overallSedecoAverage =
    totalItems > 0
      ? filteredPrices.reduce((acc, p) => acc + p.calculatedAverage, 0) / totalItems
      : 0;

  const overallSupermarketAverage =
    totalItems > 0
      ? filteredPrices.reduce(
          (acc, p) => acc + (p.centrosComerciales.min + p.centrosComerciales.max) / 2,
          0
        ) / totalItems
      : 0;

  const overallPopularAverage =
    totalItems > 0
      ? filteredPrices.reduce((acc, p) => {
          const pub = (p.mercadosPublicos.min + p.mercadosPublicos.max) / 2;
          const mov = (p.mercadosMoviles.min + p.mercadosMoviles.max) / 2;
          const msr = (p.mercadosSobreRuedas.min + p.mercadosSobreRuedas.max) / 2;
          return acc + (pub + mov + msr) / 3;
        }, 0) / totalItems
      : 0;

  const overallSavingsPct =
    overallSupermarketAverage > 0
      ? Math.round(
          ((overallSupermarketAverage - overallPopularAverage) / overallSupermarketAverage) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls and Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Promedio Canasta Popular (CDMX)
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            ${overallPopularAverage.toFixed(2)} MXN
          </div>
          <p className="text-[11px] text-slate-500">
            Mercados Públicos, Móviles y Sobre Ruedas
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Promedio Centros Comerciales
          </span>
          <div className="text-2xl font-black text-slate-700 font-mono">
            ${overallSupermarketAverage.toFixed(2)} MXN
          </div>
          <p className="text-[11px] text-slate-500">
            Cadenas de autoservicio (Walmart / Chedraui / Soriana)
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs space-y-1 bg-purple-50/40">
          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
            Brecha de Ahorro Barrial SEDECO
          </span>
          <div className="text-2xl font-black text-purple-900 font-mono flex items-center gap-1.5">
            <TrendingDown className="w-6 h-6 text-emerald-600" />
            <span>-{overallSavingsPct}% Ahorro</span>
          </div>
          <p className="text-[11px] text-purple-700 font-semibold">
            {totalItems} productos esenciales monitoreados
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>Dirección General de Abasto y Comercio Popular · SEDECO CDMX</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Monitoreo Multicanal de Precios & Cálculo de Promedios
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa estricta de precios más bajos y más altos en los 4 circuitos de distribución de alimentos de la Ciudad de México.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar / Crear Producto</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-purple-600 focus:outline-none"
            >
              <option value="Todas">Todas las Categorías</option>
              <option value="Frutas y Verduras">Frutas y Verduras</option>
              <option value="Carnes y Pollería">Carnes y Pollería</option>
              <option value="Abarrotes y Granos">Abarrotes y Granos</option>
              <option value="Cremería y Lácteos">Cremería y Lácteos</option>
            </select>
          </div>
        </div>

        {/* The Multichannel Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 min-w-[170px]">Productos</th>
                <th className="py-3 px-3.5 min-w-[150px] bg-emerald-50/50 text-emerald-900 border-x border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mercados Públicos</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 normal-case">
                    (precio más bajo y más alto)
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[150px] bg-blue-50/50 text-blue-900 border-r border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Mercados Móviles</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 normal-case">
                    (precio más bajo y más alto)
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[150px] bg-amber-50/50 text-amber-900 border-r border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Mercados Sobre Ruedas</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 normal-case">
                    (precio más bajo y más alto)
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[150px] bg-slate-100/70 text-slate-800 border-r border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Centros Comerciales</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 normal-case">
                    (precio más bajo y más alto)
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">
                  Unidad de Medida
                </th>
                <th className="py-3 px-3.5 min-w-[140px] bg-purple-50/80 text-purple-900 text-right">
                  <div className="flex items-center justify-end gap-1 font-black">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Promedio SEDECO</span>
                  </div>
                  <div className="text-[9px] font-normal text-purple-700 normal-case">
                    (cálculo automatizado)
                  </div>
                </th>
                <th className="py-3 px-2.5 text-center min-w-[70px]">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Producto */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.category}
                        </div>
                      </td>

                      {/* 2. Mercados Públicos */}
                      <td className="py-3.5 px-3.5 bg-emerald-50/20 border-x border-slate-100">
                        <div className="font-mono text-xs">
                          <span className="font-bold text-emerald-800">
                            ${item.mercadosPublicos.min.toFixed(2)}
                          </span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="font-bold text-slate-700">
                            ${item.mercadosPublicos.max.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-emerald-700 font-semibold">
                          Media: ${((item.mercadosPublicos.min + item.mercadosPublicos.max) / 2).toFixed(2)}
                        </div>
                      </td>

                      {/* 3. Mercados Móviles */}
                      <td className="py-3.5 px-3.5 bg-blue-50/20 border-r border-slate-100">
                        <div className="font-mono text-xs">
                          <span className="font-bold text-blue-800">
                            ${item.mercadosMoviles.min.toFixed(2)}
                          </span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="font-bold text-slate-700">
                            ${item.mercadosMoviles.max.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-blue-700 font-semibold">
                          Media: ${((item.mercadosMoviles.min + item.mercadosMoviles.max) / 2).toFixed(2)}
                        </div>
                      </td>

                      {/* 4. Mercados Sobre Ruedas */}
                      <td className="py-3.5 px-3.5 bg-amber-50/20 border-r border-slate-100">
                        <div className="font-mono text-xs">
                          <span className="font-bold text-amber-800">
                            ${item.mercadosSobreRuedas.min.toFixed(2)}
                          </span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="font-bold text-slate-700">
                            ${item.mercadosSobreRuedas.max.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-amber-700 font-semibold">
                          Media: ${((item.mercadosSobreRuedas.min + item.mercadosSobreRuedas.max) / 2).toFixed(2)}
                        </div>
                      </td>

                      {/* 5. Centros Comerciales */}
                      <td className="py-3.5 px-3.5 bg-slate-100/40 border-r border-slate-100">
                        <div className="font-mono text-xs">
                          <span className="text-slate-600 font-medium">
                            ${item.centrosComerciales.min.toFixed(2)}
                          </span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="font-bold text-slate-900">
                            ${item.centrosComerciales.max.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Media: ${((item.centrosComerciales.min + item.centrosComerciales.max) / 2).toFixed(2)}
                        </div>
                      </td>

                      {/* 6. Unidad de Medida */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                          {item.unit}
                        </span>
                      </td>

                      {/* 7. Promedio SEDECO */}
                      <td className="py-3.5 px-3.5 bg-purple-50/30 text-right">
                        <div className="font-mono font-black text-purple-900 text-sm">
                          ${item.calculatedAverage.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-extrabold flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          <span>{item.spreadVsSupermarketPct}% vs Súper</span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Editar Precios"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar del Padrón"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <div>
            * Fuente: Monitoreo permanente SEDECO CDMX y red de inspectores barriales en tianguis y mercados públicos.
          </div>
          <div className="text-slate-500 font-semibold mt-1 sm:mt-0">
            Fórmula: Promedio = (Media Mercados Públicos + Media Mercados Móviles + Media Tianguis + Media C. Comerciales) / 4
          </div>
        </div>
      </section>

      {/* Creation / Edit Modal */}
      <SedecoPriceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveProduct}
        initialItem={editingItem}
      />
    </div>
  );
};
