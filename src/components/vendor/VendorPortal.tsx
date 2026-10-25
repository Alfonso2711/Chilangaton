import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveAppView } from '../../types';
import { WhatsAppBotSimulator } from '../WhatsAppBotSimulator';
import { LocatarioDashboard } from '../LocatarioDashboard';
import { StallDetailModal } from '../StallDetailModal';
import { VendorHome } from './VendorHome';
import { VendorAISync } from './VendorAISync';
import { VendorInventory } from './VendorInventory';
import { VendorOrders } from './VendorOrders';
import {
  LayoutDashboard,
  MessageSquareText,
  Archive,
  ShoppingBag,
  Settings,
  Mic,
  ExternalLink,
  LogOut,
  Store,
  Bell,
} from 'lucide-react';

/**
 * Portal de negocios del vendedor (assets: dashboard_principal_locatario,
 * sincronizacion_whatsapp_ia, gestor_de_inventario_web_1/2).
 * Cada sección es una vista del rol vendedor (ver VENDEDOR_VIEWS).
 */

interface NavItem {
  view: ActiveAppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  sub?: boolean;
}

const NAV: NavItem[] = [
  { view: 'locatario', label: 'Dashboard Principal', icon: LayoutDashboard },
  { view: 'vendedor_ia', label: 'WhatsApp IA', icon: MessageSquareText, badge: 'IA Activa' },
  { view: 'whatsapp_bot', label: 'Simulador MarchanteBot', icon: Mic, sub: true },
  { view: 'vendedor_inventario', label: 'Inventario de Productos', icon: Archive },
  { view: 'vendedor_pedidos', label: 'Ventas y Pedidos', icon: ShoppingBag },
  { view: 'vendedor_ajustes', label: 'Ajustes y Créditos', icon: Settings },
];

const BREADCRUMB: Partial<Record<ActiveAppView, string>> = {
  locatario: 'Panel de Control',
  vendedor_ia: 'Sincronización por IA',
  whatsapp_bot: 'Simulador MarchanteBot',
  vendedor_inventario: 'Inventario de Productos',
  vendedor_pedidos: 'Ventas y Pedidos',
  vendedor_ajustes: 'Ajustes del Puesto',
};

export const VendorPortal: React.FC = () => {
  const { activeView, setActiveView, merchantStall, currentUser, logout, orders, pickupProgress } = useApp();
  const [showPublicStall, setShowPublicStall] = useState(false);

  const initials = (currentUser?.name || merchantStall.ownerName)
    .replace(/^Doña\s+/i, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const displayName = (currentUser?.name || merchantStall.ownerName).split(' ').slice(0, 2).join(' ');
  const stallNumber = merchantStall.stallNumber.replace('#', '');

  // Fichas que aún requieren acción del locatario
  const pendingCount = orders.filter((o) => {
    if (o.status === 'entregado') return false;
    if (!o.items.some((i) => i.product.stallId === merchantStall.id)) return false;
    if (o.deliveryType !== 'pickup') return true;
    const st = pickupProgress[o.id]?.statuses[merchantStall.id];
    return st !== 'recolectado';
  }).length;

  const renderSection = () => {
    switch (activeView) {
      case 'vendedor_ia':
        return <VendorAISync />;
      case 'whatsapp_bot':
        return <WhatsAppBotSimulator />;
      case 'vendedor_inventario':
        return <VendorInventory />;
      case 'vendedor_pedidos':
        return <VendorOrders />;
      case 'vendedor_ajustes':
        return <LocatarioDashboard />;
      case 'locatario':
      default:
        return <VendorHome onPreview={() => setShowPublicStall(true)} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
      {/* Menú lateral (escritorio) */}
      <aside className="hidden lg:flex flex-col justify-between sticky top-24 min-h-[calc(100vh-8rem)] rounded-2xl bg-white border border-slate-200/80 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center">
              <Store className="w-5 h-5" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">CanastaLocal</div>
              <div className="text-xs font-semibold text-[#006948]">Negocios</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#f2f3ff] flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#e2e7ff] text-slate-700 text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
              <div className="text-[11px] text-slate-500 truncate">
                Puesto #{stallNumber} · {merchantStall.marketName.replace('Mercado ', '')}
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center gap-2.5 rounded-xl text-left transition-colors ${
                    item.sub ? 'pl-8 pr-3 py-1.5 text-xs' : 'px-3 py-2.5 text-sm'
                  } ${
                    active
                      ? 'bg-[#006948] text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={item.sub ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#006948]'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.view === 'vendedor_pedidos' && pendingCount > 0 && (
                    <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? 'bg-white text-[#006948]' : 'bg-orange-500 text-white'}`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-100">
          <div className="px-3 py-2 rounded-xl bg-[#f2f3ff] text-xs text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En Línea · Puesto {stallNumber}
          </div>
          <button
            onClick={() => setShowPublicStall(true)}
            className="w-full px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
          >
            Ver puesto público <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Cambiar / Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0 space-y-4">
        {/* Navegación compacta (móvil / tablet) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  active ? 'bg-[#006948] text-white' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
                {item.view === 'vendedor_pedidos' && pendingCount > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Migas de pan */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-500">
            CanastaLocal <span className="mx-1">/</span>
            <span className="font-semibold text-slate-800">{BREADCRUMB[activeView] || 'Panel de Control'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPublicStall(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] text-xs font-semibold text-slate-700 hover:bg-[#eaedff] flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" /> Puesto Público
            </button>
            <button
              onClick={() => setActiveView('vendedor_pedidos')}
              className="relative w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
              aria-label="Pedidos pendientes"
              title={pendingCount ? `${pendingCount} pedidos por atender` : 'Sin pedidos pendientes'}
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />}
            </button>
          </div>
        </div>

        {renderSection()}
      </div>

      {showPublicStall && (
        <StallDetailModal stallId={merchantStall.id} onClose={() => setShowPublicStall(false)} />
      )}
    </div>
  );
};
