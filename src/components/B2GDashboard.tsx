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
} from 'lucide-react';

export const B2GDashboard: React.FC = () => {
  const [selectedAlcaldiaView, setSelectedAlcaldiaView] = useState<string>('todas');

  const alcaldiaActivity = [
    { name: 'Cuauhtémoc', mercados: 39, tianguis: 168, activeLocatarios: 890, salesMonth: '$3.4M MXN', fondesoQualified: 94 },
    { name: 'Iztapalapa', mercados: 68, tianguis: 342, activeLocatarios: 1120, salesMonth: '$4.1M MXN', fondesoQualified: 115 },
    { name: 'Venustiano Carranza', mercados: 42, tianguis: 145, activeLocatarios: 680, salesMonth: '$2.6M MXN', fondesoQualified: 58 },
    { name: 'Coyoacán', mercados: 22, tianguis: 112, activeLocatarios: 490, salesMonth: '$1.9M MXN', fondesoQualified: 42 },
    { name: 'Gustavo A. Madero', mercados: 51, tianguis: 280, activeLocatarios: 740, salesMonth: '$2.2M MXN', fondesoQualified: 68 },
    { name: 'Benito Juárez', mercados: 16, tianguis: 74, activeLocatarios: 380, salesMonth: '$1.5M MXN', fondesoQualified: 35 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Institucional B2G */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              Gobierno de la Ciudad de México · SEDECO & SAF
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dashboard B2G de Inteligencia Económica & Abasto Barrial
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Censo dinámico en tiempo real para diseño de políticas públicas, monitoreo de inflación de la canasta básica en los 339 mercados y 1,367 tianguis de la CDMX, y trazabilidad de inclusión financiera sin fiscalización punitiva.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-slate-300">Trazabilidad en Vivo</div>
              <div className="text-lg font-black text-emerald-400 font-mono">100% Anonimizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Macro Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mercados Públicos
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {B2G_METRICS.totalMercadosPublicos}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            2.0% del PIB local de CDMX
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tianguis Mapeados
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {B2G_METRICS.totalTianguisRegistrados.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            En las 16 alcaldías de la CDMX
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Ahorro Comprador vs Súper
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            -{B2G_METRICS.ahorroPromedioCompradorPct}%
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Contención de inflación barrial
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Microcréditos FONDESO
          </div>
          <div className="text-2xl font-black text-purple-800 font-mono">
            {B2G_METRICS.preCreditosFONDESOGenerados}
          </div>
          <div className="text-[11px] text-purple-700 font-medium">
            Pre-aprobados con historial digital
          </div>
        </div>
      </div>

      {/* SEDECO Multichannel Price Monitor & Averages Management */}
      <SedecoPriceTable />

      {/* Formalization Progress & SEDECO Heatmap Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formalization Ladder Stats (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                Inclusión Financiera Progresiva
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Transición de la Economía Informal
              </h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Nivel 1: Tiendas Básicas (WhatsApp + Efectivo)</span>
                <span className="font-mono text-slate-900 font-bold">{B2G_METRICS.tiendasEnNivel1} (59.4%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '59.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-900">Nivel 2: Tiendas Verificadas (Bancarizadas CoDi / DiMo)</span>
                <span className="font-mono text-blue-900 font-bold">{B2G_METRICS.tiendasEnNivel2Bancarizadas} (32.0%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-900">Nivel 3: Tiendas Oficiales (FONDESO / Constancia RFC)</span>
                <span className="font-mono text-emerald-900 font-bold">{B2G_METRICS.tiendasEnNivel3FONDESO} (8.5%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '8.5%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-2xl text-[11px] text-purple-900 leading-relaxed">
            <strong>Impacto para la Secretaría de Finanzas:</strong> El 32% de los locatarios ya ingresó al sistema financiero bancarizado de forma voluntaria gracias al "Sello de Confianza" y pagos CoDi, sin operativos de inspección ni fricción social.
          </div>
        </div>

        {/* Heatmap & Alcaldías Table (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mapeo Territorial
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                Densidad por Alcaldía (Muestra CDMX)
              </h3>
            </div>
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {alcaldiaActivity.map((alc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{alc.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {alc.mercados} mercados · {alc.tianguis} tianguis · {alc.activeLocatarios} puestos activos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 font-mono">{alc.salesMonth}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {alc.fondesoQualified} créditos FONDESO
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
