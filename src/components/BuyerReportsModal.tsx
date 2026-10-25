import React, { useState } from 'react';
import { BuyerReport, AdminAssignment } from '../types';
import {
  X,
  AlertTriangle,
  Scale,
  DollarSign,
  AlertOctagon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  User,
  Store,
  MapPin,
  Phone,
  FileText,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';

interface BuyerReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAdmin: AdminAssignment | null;
  reports: BuyerReport[];
  onUpdateReportStatus?: (reportId: string, newStatus: BuyerReport['status']) => void;
}

export const BuyerReportsModal: React.FC<BuyerReportsModalProps> = ({
  isOpen,
  onClose,
  selectedAdmin,
  reports,
  onUpdateReportStatus,
}) => {
  if (!isOpen) return null;

  // Filter mode: 'admin' (only the clicked admin) or 'all' (all reports)
  const [filterMode, setFilterMode] = useState<'admin' | 'all'>(
    selectedAdmin ? 'admin' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [incidentFilter, setIncidentFilter] = useState<string>('todos');

  // Filter logic
  const filteredReports = reports.filter((rep) => {
    // Admin filter
    if (filterMode === 'admin' && selectedAdmin && rep.adminId !== selectedAdmin.adminId) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'todos' && rep.status !== statusFilter) {
      return false;
    }

    // Incident type filter
    if (incidentFilter !== 'todos' && rep.incidentType !== incidentFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        rep.folio.toLowerCase().includes(q) ||
        rep.buyerName.toLowerCase().includes(q) ||
        rep.vendorName.toLowerCase().includes(q) ||
        rep.venueName.toLowerCase().includes(q) ||
        rep.alcaldia.toLowerCase().includes(q) ||
        rep.description.toLowerCase().includes(q);

      if (!matchSearch) return false;
    }

    return true;
  });

  const getIncidentIcon = (type: BuyerReport['incidentType']) => {
    switch (type) {
      case 'Báscula no calibrada / Kilos incompletos':
        return <Scale className="w-4 h-4 text-red-600" />;
      case 'No respetar precio exhibido / Sobreprecio':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'Producto en mal estado / Falta de higiene':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-purple-600" />;
    }
  };

  const getSeverityBadge = (severity: BuyerReport['severity']) => {
    switch (severity) {
      case 'alta':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] uppercase border border-red-200">
            Severidad Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase border border-amber-200">
            Severidad Media
          </span>
        );
      case 'baja':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase border border-blue-200">
            Severidad Baja
          </span>
        );
    }
  };

  const getStatusBadge = (status: BuyerReport['status']) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] uppercase">
            ⏳ Pendiente
          </span>
        );
      case 'en_investigacion':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
            🔍 En Investigación
          </span>
        );
      case 'inspector_asignado':
        return (
          <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px] uppercase">
            👮 Inspector Asignado
          </span>
        );
      case 'resuelto':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase">
            ✓ Resuelto
          </span>
        );
      case 'sancionado':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-bold text-[10px] uppercase">
            🛑 Sancionado
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center shrink-0">
              <BadgeAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/80 border border-purple-700/60 text-purple-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                SEDECO CDMX · Sistema de Atención Ciudadana
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                Reportes Ciudadanos por Incumplimiento o Malas Prácticas
              </h3>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Quejas y denuncias presentadas por compradores barriales respecto a básculas, precios y calidad de servicio.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Mode Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Mode switch pills */}
            <div className="inline-flex p-1 bg-white rounded-xl shadow-xs border border-slate-200 w-full sm:w-auto">
              {selectedAdmin && (
                <button
                  type="button"
                  onClick={() => setFilterMode('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterMode === 'admin'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Zona {selectedAdmin.adminName.split(' ')[1]} ({reports.filter(r => r.adminId === selectedAdmin.adminId).length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Todos los Reportes CDMX ({reports.length})</span>
              </button>
            </div>

            {/* Quick stats note */}
            <div className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900">{filteredReports.length}</strong> de {reports.length} reportes registrados
            </div>
          </div>

          {/* Search and Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por folio, comprador, puesto o mercado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-purple-600 focus:outline-none"
              >
                <option value="todos">Todos los Estatus</option>
                <option value="pendiente">Pendientes</option>
                <option value="inspector_asignado">Inspector Asignado</option>
                <option value="en_investigacion">En Investigación</option>
                <option value="resuelto">Resueltos</option>
                <option value="sancionado">Sancionados</option>
              </select>
            </div>

            <div>
              <select
                value={incidentFilter}
                onChange={(e) => setIncidentFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-purple-600 focus:outline-none"
              >
                <option value="todos">Todas las Faltas</option>
                <option value="Báscula no calibrada / Kilos incompletos">Báscula / Kilos incompletos</option>
                <option value="No respetar precio exhibido / Sobreprecio">Precios / Sobreprecio</option>
                <option value="Producto en mal estado / Falta de higiene">Calidad / Falta de higiene</option>
                <option value="Negativa de venta o condicionamiento">Negativa de venta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Content List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">No se encontraron reportes con los filtros seleccionados.</p>
              <p className="text-xs">Los locatarios de esta demarcación operan sin incidencias activas reportadas.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 space-y-3.5"
              >
                {/* Header row: Folio, severity, date, and status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-purple-950 bg-purple-100 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      {report.folio}
                    </span>
                    {getSeverityBadge(report.severity)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{report.createdAt}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    {onUpdateReportStatus && (
                      <select
                        value={report.status}
                        onChange={(e) =>
                          onUpdateReportStatus(report.id, e.target.value as BuyerReport['status'])
                        }
                        className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-semibold text-slate-700"
                        title="Cambiar estatus de trámite"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="inspector_asignado">Asignar Inspector</option>
                        <option value="en_investigacion">En Investigación</option>
                        <option value="resuelto">Marcar Resuelto</option>
                        <option value="sancionado">Aplicar Sanción</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Second row: Venue, Vendor and Buyer details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {/* Puesto reportado */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Puesto / Vendedor Reportado
                    </div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      <span>{report.vendorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {report.stallNumber}
                    </div>
                  </div>

                  {/* Recinto y Alcaldía */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Mercado / Tianguis & Demarcación
                    </div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{report.venueName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Alcaldía {report.alcaldia}
                    </div>
                  </div>

                  {/* Comprador que denuncia */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Comprador Denunciante
                    </div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{report.buyerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{report.buyerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Third row: Incident Type Title */}
                <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-900">
                  {getIncidentIcon(report.incidentType)}
                  <span className="text-slate-800 uppercase tracking-wide text-[11px]">
                    Motivo: {report.incidentType}
                  </span>
                </div>

                {/* Fourth row: Description / Testimony (REQUERIMIENTO CLAVE) */}
                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-purple-900 tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>Descripción Detallada del Comprador:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic pl-1">
                    &ldquo;{report.description}&rdquo;
                  </p>
                </div>

                {/* Footer of card: Responsible admin */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span>Supervisor asignado:</span>
                    <strong className="text-slate-700 font-semibold">{report.adminName}</strong>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Canastita CDMX · Folio Oficial SEDECO
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            * Conforme al Reglamento de Mercados y Tianguis de la CDMX, los reportes por báscula o sobreprecio detonan visita de inspección en menos de 48 horas.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Cerrar Bandeja
          </button>
        </div>
      </div>
    </div>
  );
};
