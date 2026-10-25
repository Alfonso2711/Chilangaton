import React, { useState } from 'react';
import { B2G_METRICS } from '../data/mockData';
import { SedecoPriceTable } from './SedecoPriceTable';
import {
  Building2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  BarChart3,
  Layers,
  ArrowUpRight,
  Download,
  Filter,
  DollarSign,
  Users,
  Scale,
  Sparkles,
} from 'lucide-react';

interface PriceComparisonItem {
  name: string;
  mercadoPrice: number;
  superPrice: number;
  unit: string;
}

export const B2GDashboard: React.FC = () => {
  const [selectedAlcaldia, setSelectedAlcaldia] = useState<string>('todas');

  const PRICE_COMPARISON: PriceComparisonItem[] = [
    { name: 'Jitomate Saladet', mercadoPrice: 24, superPrice: 42.5, unit: 'kg' },
    { name: 'Aguacate Hass', mercadoPrice: 52, superPrice: 89.9, unit: 'kg' },
    { name: 'Limón con Semilla', mercadoPrice: 28, superPrice: 49.0, unit: 'kg' },
    { name: 'Pechuga de Pollo', mercadoPrice: 120, superPrice: 175.0, unit: 'kg' },
    { name: 'Queso Oaxaca', mercadoPrice: 140, superPrice: 198.0, unit: 'kg' },
    { name: 'Cebolla Blanca', mercadoPrice: 22, superPrice: 38.0, unit: 'kg' },
  ];

  const ALCALDIAS_DATA: Record<string, { mercados: number; tianguis: number; locatarios: number; ventas: string; ahorro: string }> = {
    todas: { mercados: 339, tianguis: 1367, locatarios: 4200, ventas: '$15.7M MXN', ahorro: '-38.4%' },
    cuauhtemoc: { mercados: 39, tianguis: 168, locatarios: 890, ventas: '$3.4M MXN', ahorro: '-39.1%' },
    iztapalapa: { mercados: 68, tianguis: 342, locatarios: 1120, ventas: '$4.1M MXN', ahorro: '-42.0%' },
    coyoacan: { mercados: 22, tianguis: 112, locatarios: 490, ventas: '$1.9M MXN', ahorro: '-36.5%' },
    benito_juarez: { mercados: 16, tianguis: 74, locatarios: 380, ventas: '$1.5M MXN', ahorro: '-34.8%' },
    gam: { mercados: 51, tianguis: 280, locatarios: 740, ventas: '$2.2M MXN', ahorro: '-40.2%' },
  };

  const currentStats = ALCALDIAS_DATA[selectedAlcaldia] || ALCALDIAS_DATA.todas;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. Encabezado Ejecutivo B2G                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600/50 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              Tablero Institucional SEDECO · Gobierno CDMX
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Monitoreo Económico de Abasto Barrial
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Métricas en tiempo real de canasta básica, diferenciales de precios frente a supermercados e inclusión financiera en mercados públicos y tianguis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-300">Monitoreo CDMX</div>
              <div className="text-base font-black text-emerald-400 font-mono">16 Alcaldías Activas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Filtro de Alcaldías Interactivo                            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
          Alcaldía:
        </span>
        {[
          { id: 'todas', label: 'Toda la CDMX' },
          { id: 'cuauhtemoc', label: 'Cuauhtémoc' },
          { id: 'iztapalapa', label: 'Iztapalapa' },
          { id: 'coyoacan', label: 'Coyoacán' },
          { id: 'benito_juarez', label: 'Benito Juárez' },
          { id: 'gam', label: 'Gustavo A. Madero' },
        ].map((alc) => (
          <button
            key={alc.id}
            onClick={() => setSelectedAlcaldia(alc.id)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedAlcaldia === alc.id
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {alc.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Tarjetas de Alto Impacto (Hero KPIs)                       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Ahorro Ciudadano */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ahorro Ciudadano
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {currentStats.ahorro}
          </div>
          <div className="text-xs text-slate-500">
            Frente a cadenas privadas
          </div>
        </div>

        {/* Derrama Local */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Derrama Barrial
            </span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {currentStats.ventas}
          </div>
          <div className="text-xs text-slate-500">
            Retenida directamente en colonias
          </div>
        </div>

        {/* Puntos de Abasto */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Puntos de Abasto
            </span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {currentStats.mercados + currentStats.tianguis}
          </div>
          <div className="text-xs text-slate-500">
            {currentStats.mercados} mercados y {currentStats.tianguis} tianguis
          </div>
        </div>

        {/* Cumplimiento Báscula */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Báscula Verificada
            </span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            98.2%
          </div>
          <div className="text-xs text-slate-500">
            Kilo por kilo sin incidencias
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Gráfico Visual Comparativo: Tianguis vs Supermercado       */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              Comparativo Visual de Precios
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Diferencial Canasta Básica: Tianguis / Mercado vs Supermercados
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-md bg-[#006948]" />
              Tianguis / Mercado
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-300" />
              Supermercado
            </span>
          </div>
        </div>

        {/* Barras Visuales Comparativas */}
        <div className="space-y-4 pt-1">
          {PRICE_COMPARISON.map((prod, idx) => {
            const spread = Math.round(((prod.mercadoPrice - prod.superPrice) / prod.superPrice) * 100);
            const maxVal = 200;
            const mercadoWidth = Math.min(100, Math.round((prod.mercadoPrice / maxVal) * 100));
            const superWidth = Math.min(100, Math.round((prod.superPrice / maxVal) * 100));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{prod.name} ({prod.unit})</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-mono">${prod.mercadoPrice.toFixed(2)}</span>
                    <span className="text-slate-400 line-through font-mono">${prod.superPrice.toFixed(2)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] text-[11px] font-black">
                      {spread}%
                    </span>
                  </div>
                </div>

                {/* Barras gemelas */}
                <div className="space-y-1">
                  {/* Barra Mercado */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex items-center">
                    <div
                      className="bg-[#006948] h-full rounded-full transition-all duration-500"
                      style={{ width: `${mercadoWidth}%` }}
                    />
                  </div>
                  {/* Barra Súper */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex items-center">
                    <div
                      className="bg-slate-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${superWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. Inclusión Financiera y Supervisión Territorial             */}
      {/* ------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Escalafón de Bancarización (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                Inclusión Financiera Banxico
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Formalización Progresiva Voluntaria
              </h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Nivel 1: Efectivo / Libreta</span>
                <span className="font-mono text-slate-900 font-bold">59.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '59.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-900">Nivel 2: Cuentas CoDi / DiMo</span>
                <span className="font-mono text-blue-900 font-bold">32.0%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-900">Nivel 3: Pre-calificados FONDESO</span>
                <span className="font-mono text-emerald-900 font-bold">8.6%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '8.6%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 leading-relaxed">
            <strong>Impacto de Inclusión:</strong> 1 de cada 3 comerciantes ya recibe pagos digitales directos mediante CoDi sin requerir terminal bancaria privada ni pagar comisiones bancarias.
          </div>
        </div>

        {/* Resumen por Alcaldía (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mapeo Territorial
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Abasto y Microcréditos por Alcaldía
              </h3>
            </div>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {[
              { name: 'Cuauhtémoc', mercados: 39, tianguis: 168, ventas: '$3.4M MXN', fondeso: 94 },
              { name: 'Iztapalapa', mercados: 68, tianguis: 342, ventas: '$4.1M MXN', fondeso: 115 },
              { name: 'Venustiano Carranza', mercados: 42, tianguis: 145, ventas: '$2.6M MXN', fondeso: 58 },
              { name: 'Coyoacán', mercados: 22, tianguis: 112, ventas: '$1.9M MXN', fondeso: 42 },
              { name: 'Gustavo A. Madero', mercados: 51, tianguis: 280, ventas: '$2.2M MXN', fondeso: 68 },
              { name: 'Benito Juárez', mercados: 16, tianguis: 74, ventas: '$1.5M MXN', fondeso: 35 },
            ].map((alc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{alc.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {alc.mercados} mercados · {alc.tianguis} tianguis
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 font-mono">{alc.ventas}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {alc.fondeso} créditos FONDESO
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. Tabla Multicanal SEDECO (Canasta Básica)                   */}
      {/* ------------------------------------------------------------- */}
      <SedecoPriceTable />
    </div>
  );
};
