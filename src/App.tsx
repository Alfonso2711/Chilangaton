import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { MarketplaceView } from './components/MarketplaceView';
import { MarketsExplorer } from './components/MarketsExplorer';
import { B2GDashboard } from './components/B2GDashboard';
import { AdminTerritorialView } from './components/AdminTerritorialView';
import { CartDrawer } from './components/CartDrawer';
import { StallDetailModal } from './components/StallDetailModal';
import { MiCanastaView } from './components/MiCanastaView';
import { CroquisRuteoView } from './components/CroquisRuteoView';
import { VendorPortal } from './components/vendor/VendorPortal';
import { VENDEDOR_VIEWS } from './types';
import {
  Store,
  MapPin,
  MessageSquare,
  Building2,
  ShieldCheck,
  Heart,
  Users,
  ShoppingBag,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, activeView, setActiveView, selectedStallId, setSelectedStallId, cart, setIsCartOpen } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cada cambio de pantalla inicia desde arriba (va antes del return temprano por las reglas de hooks)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // If no user is logged in, show the Login screen
  if (!currentUser) {
    return <LoginView />;
  }

  const isCliente = currentUser.role === 'cliente';
  const isVendedor = currentUser.role === 'vendedor';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e]">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Area segregated by user role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* CLIENTE VIEWS */}
        {isCliente && (
          <>
            {activeView === 'comprador' && (
              <MarketplaceView onOpenStall={(stallId) => setSelectedStallId(stallId)} />
            )}
            {activeView === 'mercados_mapa' && (
              <MarketsExplorer />
            )}
            {/* RF-12: Carrito multivendedor en pantalla completa */}
            {activeView === 'mi_canasta' && (
              <MiCanastaView />
            )}
            {/* RF-08: Croquis 2D y ruteo de recolección en cubículos */}
            {activeView === 'croquis_ruteo' && (
              <CroquisRuteoView />
            )}
          </>
        )}

        {/* VENDEDOR VIEWS */}
        {/* Portal de negocios: Dashboard, WhatsApp IA, Inventario, Ventas y Pedidos, Ajustes */}
        {isVendedor && VENDEDOR_VIEWS.includes(activeView) && (
          <VendorPortal />
        )}

        {/* ADMIN VIEWS */}
        {isAdmin && (
          <>
            {activeView === 'gobierno_b2g' && (
              <B2GDashboard />
            )}
            {activeView === 'admin_territorial' && (
              <AdminTerritorialView />
            )}
          </>
        )}
      </main>

      {/* Bottom Sticky Mobile Navigation - Adapted to role */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex md:hidden items-center justify-around text-[10px] font-bold">
        {isCliente && (
          <>
            <button
              onClick={() => setActiveView('comprador')}
              className={`flex flex-col items-center gap-1 ${
                activeView === 'comprador' ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Comprar</span>
            </button>

            <button
              onClick={() => setActiveView('mercados_mapa')}
              className={`flex flex-col items-center gap-1 ${
                activeView === 'mercados_mapa' ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Tianguis</span>
            </button>

            {/* Acceso móvil al carrito (en móvil el botón del header queda fuera de pantalla) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative flex flex-col items-center gap-1 ${
                activeView === 'mi_canasta' || activeView === 'croquis_ruteo' ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Canastita</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}

        {isVendedor && (
          <>
            <button
              onClick={() => setActiveView('locatario')}
              className={`flex flex-col items-center gap-1 ${
                activeView !== 'whatsapp_bot' ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mi Puesto</span>
            </button>

            <button
              onClick={() => setActiveView('whatsapp_bot')}
              className={`flex flex-col items-center gap-1 ${
                activeView === 'whatsapp_bot' ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>MarchanteBot</span>
            </button>
          </>
        )}

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveView('gobierno_b2g')}
              className={`flex flex-col items-center gap-1 ${
                activeView === 'gobierno_b2g' ? 'text-purple-700' : 'text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>SEDECO B2G</span>
            </button>

            <button
              onClick={() => setActiveView('admin_territorial')}
              className={`flex flex-col items-center gap-1 ${
                activeView === 'admin_territorial' ? 'text-purple-700' : 'text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Padrón Barrial</span>
            </button>
          </>
        )}
      </div>

      {/* Global Modals & Drawers - Cart is only for Cliente */}
      {isCliente && <CartDrawer />}

      {isCliente && selectedStallId && (
        <StallDetailModal
          stallId={selectedStallId}
          onClose={() => setSelectedStallId(null)}
        />
      )}

      {/* Institutional CDMX Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Canasta<span className="text-emerald-400">Local</span> CDMX
              </span>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Tecnología e Innovación Social para el Comercio Popular y Barrial. Hackatón Chilangatón · Reto 1.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                339 Mercados · 1,367 Tianguis
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/40">
                87.8% Operación Efectivo Integrada
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              Fuentes oficiales: SEDECO CDMX (Padrón de Tianguis y Mercados Públicos) · INEGI DENUE · FONDESO · SAF.
            </div>
            <div className="flex items-center gap-1">
              Desarrollado con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para los barrios y marchantes de la Ciudad de México.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
