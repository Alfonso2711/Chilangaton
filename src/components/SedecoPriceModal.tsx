import React, { useState } from 'react';
import { SedecoPriceItem } from '../types';
import { calculateSedecoPriceStats } from '../data/sedecoPricesData';
import {
  X,
  PlusCircle,
  Building2,
  Store,
  Truck,
  MapPin,
  TrendingDown,
  Calculator,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface SedecoPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SedecoPriceItem) => void;
  initialItem?: SedecoPriceItem | null;
}

export const SedecoPriceModal: React.FC<SedecoPriceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  if (!isOpen) return null;

  const [productName, setProductName] = useState(initialItem?.productName || '');
  const [category, setCategory] = useState(initialItem?.category || 'Frutas y Verduras');
  const [unit, setUnit] = useState(initialItem?.unit || 'kg');

  // Channel price ranges
  const [pubMin, setPubMin] = useState<number | ''>(initialItem?.mercadosPublicos.min ?? 20);
  const [pubMax, setPubMax] = useState<number | ''>(initialItem?.mercadosPublicos.max ?? 26);

  const [movMin, setMovMin] = useState<number | ''>(initialItem?.mercadosMoviles.min ?? 22);
  const [movMax, setMovMax] = useState<number | ''>(initialItem?.mercadosMoviles.max ?? 25);

  const [msrMin, setMsrMin] = useState<number | ''>(initialItem?.mercadosSobreRuedas.min ?? 18);
  const [msrMax, setMsrMax] = useState<number | ''>(initialItem?.mercadosSobreRuedas.max ?? 24);

  const [comMin, setComMin] = useState<number | ''>(initialItem?.centrosComerciales.min ?? 38);
  const [comMax, setComMax] = useState<number | ''>(initialItem?.centrosComerciales.max ?? 46);

  const [tendency, setTendency] = useState<'baja' | 'estable' | 'alta'>(
    initialItem?.tendency || 'estable'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live calculation of average
  const validPubMin = Number(pubMin) || 0;
  const validPubMax = Number(pubMax) || 0;
  const validMovMin = Number(movMin) || 0;
  const validMovMax = Number(movMax) || 0;
  const validMsrMin = Number(msrMin) || 0;
  const validMsrMax = Number(msrMax) || 0;
  const validComMin = Number(comMin) || 0;
  const validComMax = Number(comMax) || 0;

  const stats = calculateSedecoPriceStats(
    { min: validPubMin, max: validPubMax },
    { min: validMovMin, max: validMovMax },
    { min: validMsrMin, max: validMsrMax },
    { min: validComMin, max: validComMax }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg('Por favor ingresa el nombre del producto.');
      return;
    }
    if (validPubMin <= 0 || validPubMax <= 0 || validComMin <= 0 || validComMax <= 0) {
      setErrorMsg('Los precios deben ser mayores a cero.');
      return;
    }
    if (validPubMin > validPubMax || validMovMin > validMovMax || validMsrMin > validMsrMax || validComMin > validComMax) {
      setErrorMsg('El precio más bajo no puede ser mayor que el precio más alto en ningún canal.');
      return;
    }

    const newItem: SedecoPriceItem = {
      id: initialItem?.id || `sedeco-${Date.now()}`,
      productName: productName.trim(),
      category,
      unit,
      mercadosPublicos: { min: validPubMin, max: validPubMax },
      mercadosMoviles: { min: validMovMin, max: validMovMax },
      mercadosSobreRuedas: { min: validMsrMin, max: validMsrMax },
      centrosComerciales: { min: validComMin, max: validComMax },
      calculatedAverage: stats.calculatedAverage,
      spreadVsSupermarketPct: stats.spreadVsSupermarketPct,
      tendency,
      updatedAt: 'Hoy',
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950 to-slate-900 text-white rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {initialItem ? 'Editar Precios de Referencia' : 'Registrar Nuevo Producto en Canasta SEDECO'}
              </h3>
              <p className="text-xs text-purple-200/80">
                Padrón Oficial de Precios por Modalidad de Abasto CDMX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1.5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                placeholder="Ej. Jitomate Saladet, Huevo Blanco"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:border-purple-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:border-purple-600 focus:outline-none"
              >
                <option value="Frutas y Verduras">Frutas y Verduras</option>
                <option value="Carnes y Pollería">Carnes y Pollería</option>
                <option value="Abarrotes y Granos">Abarrotes y Granos</option>
                <option value="Cremería y Lácteos">Cremería y Lácteos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidad de Medida *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:border-purple-600 focus:outline-none"
              >
                <option value="kg">kg (Kilogramo)</option>
                <option value="pieza">pieza</option>
                <option value="cono (30 pzas)">cono (30 pzas de huevo)</option>
                <option value="manojo">manojo</option>
                <option value="litro">litro</option>
                <option value="docena">docena</option>
              </select>
            </div>
          </div>

          {/* 4 Channels Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Captura de Rangos de Precios por Modalidad de Abasto (MXN)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Mercados Públicos */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <span>1. Mercados Públicos (Fijos)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más bajo ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={pubMin}
                      onChange={(e) => setPubMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más alto ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={pubMax}
                      onChange={(e) => setPubMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Mercados Móviles */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Truck className="w-4 h-4 text-blue-700" />
                  <span>2. Mercados Móviles</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más bajo ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={movMin}
                      onChange={(e) => setMovMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más alto ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={movMax}
                      onChange={(e) => setMovMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Mercados Sobre Ruedas */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>3. Mercados Sobre Ruedas (Tianguis)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más bajo ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={msrMin}
                      onChange={(e) => setMsrMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más alto ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={msrMax}
                      onChange={(e) => setMsrMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Centros Comerciales */}
              <div className="p-3.5 bg-slate-100/90 border border-slate-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>4. Centros Comerciales (Supermercados)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más bajo ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={comMin}
                      onChange={(e) => setComMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Precio más alto ($)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={comMax}
                      onChange={(e) => setComMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Average Calculation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-emerald-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase text-purple-900 tracking-wider">
                  Cálculo Automatizado de Promedios
                </span>
                <div className="text-xs text-slate-600">
                  Media popular (Públicos + Móviles + Tianguis):{' '}
                  <strong className="text-emerald-700">${stats.popularAvg.toFixed(2)}</strong> vs C. Comerciales:{' '}
                  <strong className="text-slate-800">${stats.avgComerciales.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
              <div className="text-xs text-slate-500">Promedio General SEDECO:</div>
              <div className="text-xl font-black text-purple-900 font-mono">
                ${stats.calculatedAverage.toFixed(2)} <span className="text-xs font-bold text-slate-500">/{unit}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-900/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{initialItem ? 'Actualizar Producto' : 'Guardar y Calcular en Canasta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
