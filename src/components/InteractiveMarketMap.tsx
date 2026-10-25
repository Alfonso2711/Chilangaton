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
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs font-semibold">
        <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Capa Geoespacial SEDECO · 16 Alcaldías</span>
      </div>

      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-slate-300 text-xs font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
        <span>Mercado Fijo</span>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2"></span>
        <span>Tianguis ({activeDay === 'todos' ? 'Semana' : activeDay.toUpperCase()})</span>
      </div>

      {/* Stylized SVG Map of CDMX Basin */}
      <div className="w-full h-80 sm:h-96 md:h-[420px] relative">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full object-cover select-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' }}
        >
          {/* Subtle grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid)" />

          {/* CDMX Alcaldías Contours (Abstract geometric stylization) */}
          <g opacity="0.25" fill="#334155" stroke="#64748b" strokeWidth="1">
            {/* Cuauhtémoc & Benito Juárez */}
            <polygon points="350,150 430,160 440,240 370,260 330,210" />
            {/* Miguel Hidalgo */}
            <polygon points="260,170 350,150 330,210 270,250 240,190" />
            {/* Coyoacán */}
            <polygon points="370,260 450,250 430,340 340,330" />
            {/* Iztapalapa */}
            <polygon points="450,250 590,260 620,350 490,360 430,340" />
            {/* Venustiano Carranza / GAM */}
            <polygon points="430,160 550,130 570,220 450,250 440,240" />
            {/* Tlalpan / Xochimilco */}
            <polygon points="340,330 490,360 470,460 320,440" />
          </g>

          {/* Major avenues arterial lines (Insurgentes, Tlalpan, Circuito Interior) */}
          <path d="M 370,40 L 370,460" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4" />
          <path d="M 180,240 L 640,250" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4" />

          {/* Interactive Market Markers */}
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
                {/* Ping animation on selected */}
                {isSelected && (
                  <circle
                    r="18"
                    fill={isTianguis ? '#f59e0b' : '#10b981'}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Outer ring */}
                <circle
                  r={isSelected || isHovered ? '13' : '9'}
                  fill={isTianguis ? '#f59e0b' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all"
                />

                {/* Icon inside */}
                <circle
                  r={isSelected || isHovered ? '6' : '4'}
                  fill="#ffffff"
                />

                {/* Label text */}
                <text
                  y={isSelected ? -18 : -14}
                  textAnchor="middle"
                  className={`text-[11px] font-bold select-none pointer-events-none ${
                    isSelected ? 'fill-emerald-300 font-extrabold' : 'fill-slate-300'
                  }`}
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                >
                  {m.name.split(' (')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Market Card Overlay at Bottom of Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 text-white shadow-2xl flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      activeMarket.type === 'tianguis'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {activeMarket.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeMarket.alcaldia} · {activeMarket.distanceKm} km
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mt-1">
                  {activeMarket.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-slate-800 px-2 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{activeMarket.rating}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {activeMarket.description}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {activeMarket.schedule}
              </span>
              <span className="font-semibold text-emerald-400">
                {activeMarket.stallsCount} puestos activos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
