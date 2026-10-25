import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { MarketsExplorer } from './components/MarketsExplorer';
import { WhatsAppBotSimulator } from './components/WhatsAppBotSimulator';
import { LocatarioDashboard } from './components/LocatarioDashboard';
import { B2GDashboard } from './components/B2GDashboard';
import { CartDrawer } from './components/CartDrawer';
import { StallDetailModal } from './components/StallDetailModal';
import {
  Store,
  MapPin,
  MessageSquare,
  Building2,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, selectedStallId, setSelectedStallId } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e]">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {activeView === 'comprador' && (
          <MarketplaceView onOpenStall={(stallId) => setSelectedStallId(stallId)} />
        )}

        {activeView === 'mercados_mapa' && (
          <MarketsExplorer />
        )}

        {activeView === 'whatsapp_bot' && (
          <WhatsAppBotSimulator />
        )}

        {activeView === 'locatario' && (
          <LocatarioDashboard />
        )}

        {activeView === 'gobierno_b2g' && (
          <B2GDashboard />
        )}
      </main>

      {/* Bottom Sticky Mobile Navigation for Quick Role Switching */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex md:hidden items-center justify-around text-[10px] font-bold">
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

        <button
          onClick={() => setActiveView('whatsapp_bot')}
          className={`flex flex-col items-center gap-1 ${
            activeView === 'whatsapp_bot' ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>MarchanteBot</span>
        </button>

        <button
          onClick={() => setActiveView('locatario')}
          className={`flex flex-col items-center gap-1 ${
            activeView === 'locatario' ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Mi Puesto</span>
        </button>

        <button
          onClick={() => setActiveView('gobierno_b2g')}
          className={`flex flex-col items-center gap-1 ${
            activeView === 'gobierno_b2g' ? 'text-purple-700' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>SEDECO</span>
        </button>
      </div>

      {/* Global Modals & Drawers */}
      <CartDrawer />

      {selectedStallId && (
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
