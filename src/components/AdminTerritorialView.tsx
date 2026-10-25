import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AdminAssignment,
  ComercioBarrialItem,
  BuyerReport,
} from '../types';
import {
  INITIAL_ADMIN_ASSIGNMENTS,
  INITIAL_COMERCIOS_BARRIALES,
  INITIAL_BUYER_REPORTS,
} from '../data/adminTerritorialData';
import { BuyerReportsModal } from './BuyerReportsModal';
import {
  Building2,
  Store,
  MapPin,
  Search,
  Filter,
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  BadgeAlert,
  ExternalLink,
  CheckCircle2,
  Layers,
  X,
  Users,
  Eye,
  Info,
} from 'lucide-react';

export const AdminTerritorialView: React.FC = () => {
  const { currentUser } = useApp();

  // Active administrator ID (fallback to 'user-admin-1' if not set)
  const activeAdminId = currentUser?.id || 'user-admin-1';

  // State for data
  const [adminAssignments] = useState<AdminAssignment[]>(INITIAL_ADMIN_ASSIGNMENTS);
  const [comercios, setComercios] = useState<ComercioBarrialItem[]>(INITIAL_COMERCIOS_BARRIALES);

  // State for Buyer Reports (Persisted locally)
  const [buyerReports, setBuyerReports] = useState<BuyerReport[]>(() => {
    try {
      const saved = localStorage.getItem('canasta_buyer_reports_v1');
      return saved ? JSON.parse(saved) : INITIAL_BUYER_REPORTS;
    } catch {
      return INITIAL_BUYER_REPORTS;
    }
  });

  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedAdminForReports, setSelectedAdminForReports] = useState<AdminAssignment | null>(null);

  const handleUpdateReportStatus = (reportId: string, newStatus: BuyerReport['status']) => {
    setBuyerReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r));
      try {
        localStorage.setItem('canasta_buyer_reports_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [alcaldiaFilter, setAlcaldiaFilter] = useState('Todas');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [asignacionFilter, setAsignacionFilter] = useState<'todos' | 'mios' | 'otros'>('todos');

  // Contact modal state for viewing administrator contact details
  const [selectedAdminContact, setSelectedAdminContact] = useState<{
    name: string;
    email: string;
    phone: string;
    zone: string;
    comercioName: string;
  } | null>(null);

  // Filtered comercios
  const filteredComercios = comercios.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.venueName.toLowerCase().includes(query) ||
      item.colonia.toLowerCase().includes(query) ||
      item.ownerName.toLowerCase().includes(query) ||
      item.assignedAdminName.toLowerCase().includes(query);

    const matchesAlcaldia = alcaldiaFilter === 'Todas' || item.alcaldia === alcaldiaFilter;
    const matchesTipo = tipoFilter === 'Todos' || item.type === tipoFilter;

    const isMine = item.assignedAdminId === activeAdminId;
    const matchesAsignacion =
      asignacionFilter === 'todos' ||
      (asignacionFilter === 'mios' && isMine) ||
      (asignacionFilter === 'otros' && !isMine);

    return matchesSearch && matchesAlcaldia && matchesTipo && matchesAsignacion;
  });

  // Calculate quick stats
  const totalComerciosMios = comercios.filter((c) => c.assignedAdminId === activeAdminId).length;
  const totalComerciosOtros = comercios.filter((c) => c.assignedAdminId !== activeAdminId).length;
  const totalMercadosSupervisados = adminAssignments.reduce(
    (acc, a) => acc + a.assignedMarkets.length,
    0
  );
  const totalTianguisSupervisados = adminAssignments.reduce(
    (acc, a) => acc + a.assignedTianguis.length,
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Institutional Banner */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              <span>SEDECO CDMX · Padrón Territorial de Abasto Popular</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Supervisión Territorial & Asignación de Comercio Barrial
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoreo y padrón de asignaciones territoriales para administradores públicos. Visualiza los mercados, tianguis y unidades de comercio barrial asignadas a tu supervisión institucional y consulta los datos de contacto del funcionario responsable para unidades en otras demarcaciones.
            </p>
          </div>

          {/* Current Admin Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full lg:w-auto text-center lg:text-right shrink-0">
            <div className="text-[10px] uppercase font-bold text-purple-300">
              Administrador Activo
            </div>
            <div className="text-base font-extrabold text-white">
              {currentUser?.name || 'Lic. Roberto Armenta'}
            </div>
            <div className="text-xs text-purple-200 font-mono">
              Zona Centro-Poniente (Cuauhtémoc)
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Comercios a Tu Cargo
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono">
            {totalComerciosMios}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Asignación directa a ti</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Comercios Otros Admins
          </div>
          <div className="text-2xl font-black text-slate-700 font-mono">
            {totalComerciosOtros}
          </div>
          <div className="text-[11px] text-slate-500">
            Contacto oficial disponible
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mercados en Red CDMX
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {totalMercadosSupervisados}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            339 mercados públicos fijos
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tianguis en Supervisión
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {totalTianguisSupervisados}
          </div>
          <div className="text-[11px] text-slate-500">
            Mercados sobre ruedas
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABLA 1: Asignaciones de Mercados y Tianguis por Administrador */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 uppercase tracking-wider">
              <Users className="w-4 h-4 text-purple-700" />
              <span>Tabla 1 · Padrón de Asignaciones Territoriales</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Mercados, Tianguis y Comercio Barrial Asignado a Cada Usuario Administrador
            </h2>
            <p className="text-xs text-slate-500">
              Distribución oficial de responsabilidades por demarcación territorial y circuitos de abasto en la Ciudad de México.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedAdminForReports(null);
                setIsReportsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Abrir bandeja completa de reportes de compradores"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ver Todos los Reportes ({buyerReports.length})</span>
            </button>
            <span className="px-3 py-2 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold font-mono">
              {adminAssignments.length} Supervisores
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 min-w-[200px]">Usuario Administrador</th>
                <th className="py-3 px-3.5 min-w-[180px]">Contacto Institucional SEDECO</th>
                <th className="py-3 px-3.5 min-w-[160px]">Demarcación / Zona</th>
                <th className="py-3 px-3.5 min-w-[220px] bg-emerald-50/40 text-emerald-950 border-x border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mercados Públicos Asignados</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 min-w-[220px] bg-amber-50/40 text-amber-950 border-r border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tianguis Asignados</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">Comercios a Cargo</th>
                <th className="py-3 px-3.5 text-center min-w-[140px] bg-red-50/60 text-red-950 border-x border-slate-200/60">
                  <div className="flex items-center justify-center gap-1 font-black">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Reportes</span>
                  </div>
                  <div className="text-[9px] font-normal text-slate-500 normal-case">
                    (clic para ver quejas)
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[100px]">Estatus</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {adminAssignments.map((admin) => {
                const isCurrentAdmin = admin.adminId === activeAdminId;

                return (
                  <tr
                    key={admin.id}
                    className={`transition-colors ${
                      isCurrentAdmin
                        ? 'bg-purple-50/40 hover:bg-purple-50/60 font-semibold'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Administrador */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCurrentAdmin
                              ? 'bg-purple-900 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {admin.adminName
                            .split(' ')
                            .slice(1, 3)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{admin.adminName}</span>
                            {isCurrentAdmin && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900 text-white font-extrabold uppercase">
                                Tú (Activo)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {admin.adminRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contacto Institucional */}
                    <td className="py-3.5 px-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                          <Mail className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span className="font-mono text-[11px]">{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{admin.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Alcaldía y Zona */}
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900 text-xs">{admin.alcaldia}</div>
                      <div className="text-[10px] text-slate-500">{admin.zone}</div>
                    </td>

                    {/* Mercados Públicos Asignados */}
                    <td className="py-3.5 px-3.5 bg-emerald-50/20 border-x border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {admin.assignedMarkets.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-semibold"
                          >
                            <Store className="w-2.5 h-2.5 text-emerald-700" />
                            <span>{m}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Tianguis Asignados */}
                    <td className="py-3.5 px-3.5 bg-amber-50/20 border-r border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {admin.assignedTianguis.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-semibold"
                          >
                            <MapPin className="w-2.5 h-2.5 text-amber-700" />
                            <span>{t}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Comercios */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-xs font-black font-mono text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full">
                        {admin.assignedComerciosCount} puestos
                      </span>
                    </td>

                    {/* Columna Reportes (REQUERIMIENTO CLAVE) */}
                    <td className="py-3.5 px-3.5 text-center bg-red-50/20 border-x border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAdminForReports(admin);
                          setIsReportsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-extrabold text-xs transition-all shadow-2xs hover:scale-105 active:scale-95 group/rep"
                        title={`Ver ${admin.reportsCount} reportes de compradores en esta demarcación`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 group-hover/rep:animate-bounce shrink-0" />
                        <span>{admin.reportsCount} reportes</span>
                      </button>
                    </td>

                    {/* Estatus */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          admin.status === 'al_corriente'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {admin.status === 'al_corriente' ? 'Al corriente' : 'Inspección'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* TABLA 2: Información Total del Comercio Barrial & Contacto    */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 uppercase tracking-wider">
              <Store className="w-4 h-4 text-purple-700" />
              <span>Tabla 2 · Directorio Integral de Comercio Barrial</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Catálogo General de Locatarios, Puestos y Comercios Populares de la CDMX
            </h2>
            <p className="text-xs text-slate-500">
              Si un comercio barrial no te pertenece directamente, la fila muestra la información de contacto completa del Administrador SEDECO responsable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">
              Mostrando <strong className="text-slate-900">{filteredComercios.length}</strong> de {comercios.length} comercios
            </span>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-1.5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por puesto, mercado, locatario o admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-purple-600 focus:outline-none shadow-inner"
              />
            </div>

            {/* Alcaldia Filter */}
            <div>
              <select
                value={alcaldiaFilter}
                onChange={(e) => setAlcaldiaFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-purple-600 focus:outline-none"
              >
                <option value="Todas">Todas las Alcaldías</option>
                <option value="Cuauhtémoc">Cuauhtémoc</option>
                <option value="Iztapalapa">Iztapalapa</option>
                <option value="Venustiano Carranza">Venustiano Carranza</option>
                <option value="Coyoacán">Coyoacán</option>
                <option value="Tlalpan">Tlalpan</option>
                <option value="Gustavo A. Madero">Gustavo A. Madero</option>
                <option value="Azcapotzalco">Azcapotzalco</option>
              </select>
            </div>

            {/* Tipo de Comercio Filter */}
            <div>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-purple-600 focus:outline-none"
              >
                <option value="Todos">Todos los Circuitos</option>
                <option value="Mercado Público">Mercados Públicos</option>
                <option value="Tianguis Sobre Ruedas">Tianguis Sobre Ruedas</option>
                <option value="Comercio Popular Local">Comercio Popular Local</option>
              </select>
            </div>

            {/* Asignación Filter */}
            <div>
              <select
                value={asignacionFilter}
                onChange={(e) => setAsignacionFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-purple-600 focus:outline-none"
              >
                <option value="todos">Toda la Ciudad (Todos)</option>
                <option value="mios">Solo Mis Asignados (Zona Centro)</option>
                <option value="otros">Asignados a Otros Administradores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 min-w-[200px]">Comercio Barrial / Puesto</th>
                <th className="py-3 px-3.5 min-w-[140px]">Tipo & Sede</th>
                <th className="py-3 px-3.5 min-w-[160px]">Ubicación Territorial</th>
                <th className="py-3 px-3.5 min-w-[150px]">Locatario(a) Responsable</th>
                <th className="py-3 px-3.5 min-w-[250px] bg-purple-50/50 text-purple-950 border-l border-slate-200/80">
                  <div className="flex items-center gap-1 font-black">
                    <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                    <span>Administrador Asignado & Contacto</span>
                  </div>
                  <div className="text-[9px] font-normal text-purple-800 normal-case">
                    (contacto directo si no te pertenece)
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">Inclusión</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredComercios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron comercios con los criterios de búsqueda especificados.
                  </td>
                </tr>
              ) : (
                filteredComercios.map((comercio) => {
                  const isMine = comercio.assignedAdminId === activeAdminId;

                  return (
                    <tr
                      key={comercio.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isMine ? 'bg-purple-50/15' : ''
                      }`}
                    >
                      {/* Nombre del comercio */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {comercio.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Giro: {comercio.category}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {comercio.stallNumber}
                        </div>
                      </td>

                      {/* Tipo y Sede */}
                      <td className="py-3.5 px-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mb-1 ${
                            comercio.type === 'Mercado Público'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comercio.type === 'Tianguis Sobre Ruedas'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {comercio.type}
                        </span>
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {comercio.venueName}
                        </div>
                      </td>

                      {/* Ubicación Territorial */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-800 text-xs">
                          {comercio.alcaldia}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Col. {comercio.colonia}
                        </div>
                      </td>

                      {/* Locatario Responsable */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-800 text-xs">
                          {comercio.ownerName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {comercio.phone}
                        </div>
                      </td>

                      {/* Administrador Asignado & Contacto (REQUERIMIENTO CLAVE) */}
                      <td className="py-3.5 px-3.5 bg-purple-50/30 border-l border-slate-100">
                        {isMine ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Asignado a tu supervisión</span>
                            </span>
                            <div className="text-[11px] text-slate-600 font-semibold pl-1">
                              {comercio.assignedAdminName} (Tú)
                            </div>
                          </div>
                        ) : (
                          /* Si NO le pertenece al administrador en sesión, se muestra la información de contacto */
                          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wide">
                                Otro Administrador Responsable:
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-950 font-bold">
                                {comercio.assignedAdminZone.split(' ')[0]}
                              </span>
                            </div>

                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                              <span>{comercio.assignedAdminName}</span>
                            </div>

                            <div className="space-y-0.5 text-[10px] text-slate-700">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-purple-700 shrink-0" />
                                <span className="font-mono text-purple-950 font-semibold">
                                  {comercio.assignedAdminEmail}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="font-mono text-slate-600 font-medium">
                                  {comercio.assignedAdminPhone}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Inclusión Financiera */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            comercio.trustLevel === 3
                              ? 'bg-purple-100 text-purple-800'
                              : comercio.trustLevel === 2
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Nivel {comercio.trustLevel}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-3 text-center">
                        {isMine ? (
                          <span className="text-[10px] font-bold text-emerald-700">
                            Activo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAdminContact({
                                name: comercio.assignedAdminName,
                                email: comercio.assignedAdminEmail,
                                phone: comercio.assignedAdminPhone,
                                zone: comercio.assignedAdminZone,
                                comercioName: comercio.name,
                              })
                            }
                            className="px-2 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                            title="Ver datos de contacto del Administrador"
                          >
                            Contacto
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Contacto Institucional */}
      {selectedAdminContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Ficha de Contacto SEDECO
                  </h4>
                  <p className="text-xs text-slate-500">
                    Supervisor Responsable del Comercio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdminContact(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-900">
                Comercio Consultado
              </span>
              <div className="font-extrabold text-sm text-slate-900">
                {selectedAdminContact.comercioName}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <UserCheck className="w-4 h-4 text-purple-700 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">
                    Funcionario a Cargo
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedAdminContact.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedAdminContact.zone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-4 h-4 text-purple-700 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">
                    Correo Institucional
                  </div>
                  <a
                    href={`mailto:${selectedAdminContact.email}`}
                    className="text-xs font-mono font-bold text-purple-900 hover:underline"
                  >
                    {selectedAdminContact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-purple-700 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">
                    Teléfono & Conmutador SEDECO
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {selectedAdminContact.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAdminContact(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reportes Ciudadanos de Compradores (REQUERIMIENTO CLAVE) */}
      <BuyerReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => {
          setIsReportsModalOpen(false);
          setSelectedAdminForReports(null);
        }}
        selectedAdmin={selectedAdminForReports}
        reports={buyerReports}
        onUpdateReportStatus={handleUpdateReportStatus}
      />
    </div>
  );
};
