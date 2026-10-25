import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Store,
  MapPin,
  Search,
  MessageSquare,
  BarChart3,
  User,
  X,
  ChevronDown,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Building2,
  LogOut,
  Users,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    markets,
    selectedMarket,
    setSelectedMarketId,
    activeView,
    setActiveView,
    cart,
    cartTotalCanastaLocal,
    cartSavingsPercent,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    recentNotification,
  } = useApp();

  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCliente = currentUser?.role === 'cliente';
  const isVendedor = currentUser?.role === 'vendedor';
  const isAdmin = currentUser?.role === 'admin';

  // Global keyboard shortcut CMD+K or Ctrl+K to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleBrandClick = () => {
    if (isAdmin) {
      setActiveView('gobierno_b2g');
    } else if (isVendedor) {
      setActiveView('locatario');
    } else {
      setActiveView('comprador');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Recent Toast Notification */}
      {recentNotification && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-2 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{recentNotification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Role-specific Subtitle */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 text-left group"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-all ${
                isAdmin
                  ? 'bg-purple-900 group-hover:bg-purple-800 shadow-purple-900/20'
                  : isVendedor
                  ? 'bg-amber-600 group-hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-emerald-600 group-hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isAdmin ? (
                <Building2 className="w-5 h-5" />
              ) : isVendedor ? (
                <Store className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1">
                <span>Canastita</span>
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                  isAdmin ? 'bg-purple-100 text-purple-800' : isVendedor ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#006948]'
                }`}>
                  CDMX
                </span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isAdmin
                      ? 'bg-purple-600'
                      : isVendedor
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                ></span>
                {isAdmin
                  ? 'CDMX · Portal SEDECO B2G'
                  : isVendedor
                  ? 'CDMX · Portal Locatarios'
                  : 'CDMX · Abasto Popular'}
              </span>
            </div>
          </button>

          {/* Market Selector Pill (Shown only for Cliente) */}
          {isCliente && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all border border-slate-200/60"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[170px] truncate">{selectedMarket?.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">({selectedMarket?.alcaldia})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMarketDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Seleccionar Mercado o Tianguis
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {markets.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMarketId(m.id);
                          setIsMarketDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          m.id === selectedMarket?.id
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            {m.name}
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${
                              m.type === 'tianguis' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {m.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">{m.colonia}, {m.alcaldia}</div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{m.distanceKm} km</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Search Bar (Only shown for Cliente) */}
        {isCliente && (
          <div className="flex-1 max-w-md mx-1 sm:mx-2 hidden sm:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar jitomate, aguacate, pechuga, queso..."
                className="w-full h-10 pl-10 pr-16 bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-3 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* Navigation Modes Switcher - Filtered strictly by User Role */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* CLIENTE ROLE VIEWS */}
          {isCliente && (
            <>
              <button
                onClick={() => setActiveView('comprador')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'comprador'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Comprar</span>
              </button>

              <button
                onClick={() => setActiveView('mercados_mapa')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'mercados_mapa'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mercados & Tianguis</span>
              </button>

              {/* Cart Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 h-10 px-3 sm:px-3.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    ${cartTotalCanastaLocal.toFixed(0)}
                  </span>
                  {totalCartItems > 0 && (
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </div>
                {cartSavingsPercent > 0 && (
                  <span className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-700/80 px-1.5 py-0.5 rounded-md text-emerald-100">
                    <TrendingDown className="w-3 h-3" />
                    -{cartSavingsPercent}%
                  </span>
                )}
              </button>
            </>
          )}

          {/* VENDEDOR ROLE VIEWS */}
          {isVendedor && (
            <>
              <button
                onClick={() => setActiveView('locatario')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView !== 'whatsapp_bot'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Gestor de Mi Puesto e Inventario"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mi Puesto</span>
              </button>

              <button
                onClick={() => setActiveView('whatsapp_bot')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'whatsapp_bot'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
                title="MarchanteBot: Actualización de precios por voz y WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span className="hidden sm:inline">MarchanteBot (Voz/IA)</span>
              </button>
            </>
          )}

          {/* ADMIN ROLE VIEWS */}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveView('gobierno_b2g')}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'gobierno_b2g'
                    ? 'bg-purple-900 text-white shadow-sm shadow-purple-900/20'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
                title="Panel de Inteligencia Económica para SEDECO CDMX"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>SEDECO B2G</span>
              </button>

              <button
                onClick={() => setActiveView('admin_territorial')}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeView === 'admin_territorial'
                    ? 'bg-purple-900 text-white shadow-sm shadow-purple-900/20'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
                title="Padrón y Supervisión Territorial de Mercados, Tianguis y Comercio Barrial"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Padrón Barrial</span>
              </button>
            </>
          )}

          {/* User Profile Pill & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isAdmin
                      ? 'text-purple-700'
                      : isVendedor
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {currentUser.badgeText}
                </span>
              </div>

              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
              />

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Cerrar sesión / Cambiar de usuario"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

