import React, { useState } from 'react';
import { Market, DayOfWeek } from '../types';
import { MapPin, Navigation, Store, Calendar, Clock, Star, ArrowRight } from 'lucide-react';

interface InteractiveMarketMapProps {
  markets: Market[];
  selectedMarketId: string;
  onSelectMarket: (marketId: string) => void;
  activeDay: DayOfWeek | 'todos';
}

export const InteractiveMarketMap: React.FC<InteractiveMarketMapProps> = ({
  markets,
  selectedMarketId,
  onSelectMarket,
  activeDay,
}) => {
  const [hoveredMarketId, setHoveredMarketId] = useState<string | null>(null);

  // CDMX approximate bounding box: Lat 19.20 to 19.55, Lng -99.35 to -98.95
  const minLat = 19.30;
  const maxLat = 19.46;
  const minLng = -99.25;
  const maxLng = -99.00;

  const projectToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 500;
    return {
      x: Math.max(40, Math.min(760, x)),
      y: Math.max(40, Math.min(460, y)),
    };
  };

  const activeMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm">
      {/* Encabezado del Mapa */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-800 text-xs font-bold shadow-xs">
        <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>Mercados y Tianguis en CDMX</span>
      </div>

      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-slate-600 text-xs font-semibold shadow-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
        <span>Mercado Fijo</span>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2"></span>
        <span>Tianguis ({activeDay === 'todos' ? 'Toda la semana' : activeDay.toUpperCase()})</span>
      </div>

      {/* SVG del Mapa de CDMX en Modo Claro Cálido */}
      <div className="w-full h-80 sm:h-96 md:h-[420px] relative">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full object-cover select-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, #fbfbfc 0%, #f1f5f9 100%)' }}
        >
          {/* Cuadrícula sutil de plano cartográfico */}
          <defs>
            <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeOpacity="0.6" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#lightGrid)" />

          {/* Contornos abstractos de Alcaldías en tonos suaves */}
          <g opacity="0.6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5">
            {/* Cuauhtémoc & Benito Juárez */}
            <polygon points="350,150 430,160 440,240 370,260 330,210" fill="#e2e8f0" />
            {/* Miguel Hidalgo */}
            <polygon points="260,170 350,150 330,210 270,250 240,190" />
            {/* Coyoacán */}
            <polygon points="370,260 450,250 430,340 340,330" />
            {/* Iztapalapa */}
            <polygon points="450,250 590,260 620,350 490,360 430,340" fill="#f1f5f9" />
            {/* Venustiano Carranza / GAM */}
            <polygon points="430,160 550,130 570,220 450,250 440,240" />
            {/* Tlalpan / Xochimilco */}
            <polygon points="340,330 490,360 470,460 320,440" />
          </g>

          {/* Avenidas arteriales de la CDMX (Insurgentes, Tlalpan, Circuito) */}
          <path d="M 370,40 L 370,460" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
          <path d="M 180,240 L 640,250" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />

          {/* Marcadores Interactivos de Mercados */}
          {markets.map((m) => {
            const { x, y } = projectToSvg(m.coordinates.lat, m.coordinates.lng);
            const isSelected = m.id === selectedMarketId;
            const isHovered = m.id === hoveredMarketId;
            const isTianguis = m.type === 'tianguis';

            return (
              <g
                key={m.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectMarket(m.id)}
                onMouseEnter={() => setHoveredMarketId(m.id)}
                onMouseLeave={() => setHoveredMarketId(null)}
              >
                {/* Ping de selección */}
                {isSelected && (
                  <circle
                    r="20"
                    fill={isTianguis ? '#f59e0b' : '#059669'}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Círculo exterior con sombra */}
                <circle
                  r={isSelected || isHovered ? '14' : '10'}
                  fill={isTianguis ? '#f59e0b' : '#006948'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all drop-shadow-md"
                />

                {/* Punto central */}
                <circle
                  r={isSelected || isHovered ? '6' : '4'}
                  fill="#ffffff"
                />

                {/* Rótulo de nombre */}
                <text
                  y={isSelected ? -18 : -14}
                  textAnchor="middle"
                  className={`text-[11px] font-extrabold select-none pointer-events-none ${
                    isSelected ? 'fill-slate-900 font-black' : 'fill-slate-700'
                  }`}
                  style={{ textShadow: '0 1px 3px rgba(255,255,255,0.9)' }}
                >
                  {m.name.split(' (')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tarjeta Flotante Clara del Mercado Seleccionado */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 text-slate-900 shadow-xl flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      activeMarket.type === 'tianguis'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-[#006948]'
                    }`}
                  >
                    {activeMarket.type}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeMarket.alcaldia} · a {activeMarket.distanceKm} km
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {activeMarket.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{activeMarket.rating}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {activeMarket.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {activeMarket.schedule}
              </span>
              <span className="font-bold text-[#006948]">
                {activeMarket.stallsCount} puestos activos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
