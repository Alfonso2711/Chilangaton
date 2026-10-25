import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import {
  X,
  Store,
  Phone,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Mic,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface StallDetailModalProps {
  stallId: string;
  onClose: () => void;
}

export const StallDetailModal: React.FC<StallDetailModalProps> = ({ stallId, onClose }) => {
  const { stalls, products, markets } = useApp();

  const stall = stalls.find((s) => s.id === stallId) || stalls[0];
  const market = markets.find((m) => m.id === stall.marketId);
  const stallProducts = products.filter((p) => p.stallId === stall.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Banner with Cover */}
        <div className="relative h-36 sm:h-48 w-full bg-slate-900 overflow-hidden flex-shrink-0">
          <img
            src={stall.bannerImage}
            alt={stall.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all border border-white/20 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Stall Header Content */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={stall.avatar}
                alt={stall.ownerName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
              />
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-[11px] font-extrabold uppercase">
                    Puesto {stall.stallNumber}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {market?.name} · {stall.cubiculoCoords.section} ({stall.cubiculoCoords.booth})
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {stall.name}
                </h2>
                <div className="text-xs text-slate-300">
                  Atendido por <strong>{stall.ownerName}</strong>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-amber-400 font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{stall.rating} (140+ reseñas del barrio)</span>
            </div>
          </div>
        </div>

        {/* Verification & Gamification Strip (Estrategia de Inclusión Financiera) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap text-xs flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sello Comercio Seguro
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              {stall.trustProfile.levelName}
            </span>
            {stall.trustProfile.bankAccountLinked && (
              <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                Acepta CoDi / DiMo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">{stall.lastVoiceUpdate}</span>
          </div>
        </div>

        {/* Products Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Productos Frescos del Día ({stallProducts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Precios directos de puesto sin sobreprecio corporativo
              </p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Horario: {stall.schedule}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {stallProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {stallProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Este puesto aún no tiene productos registrados hoy.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contacto directo del locatario: <strong className="text-slate-800">{stall.phone}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
