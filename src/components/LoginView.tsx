import React, { useState } from 'react';
import { useApp, MOCK_USERS } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShoppingBag,
  Building2,
  ShieldCheck,
  Store,
  MapPin,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  Info,
  BadgePercent,
  Layers,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [emailInput, setEmailInput] = useState(MOCK_USERS.cliente.email);
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [mode, setMode] = useState<'quick' | 'form'>('quick');

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmailInput(MOCK_USERS[role].email);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  const roleCards = [
    {
      role: 'admin' as UserRole,
      title: 'Administrador (Gobierno)',
      name: MOCK_USERS.admin.name,
      org: MOCK_USERS.admin.organization,
      badge: 'SEDECO CDMX',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      accentColor: 'from-purple-600 to-indigo-700',
      borderHover: 'hover:border-purple-500 focus:border-purple-600',
      icon: Building2,
      accessBadge: 'Pantallas: SEDECO B2G & Padrón Barrial',
      screens: [
        'Panel B2G: Precios Multicanal & Canasta Básica',
        'Padrón Territorial: Mercados, Tianguis y Comercio Barrial',
        'Directorio con datos de contacto de supervisores SEDECO',
      ],
      description:
        'Perfil institucional para funcionarios y analistas de desarrollo económico del Gobierno de la CDMX.',
    },
    {
      role: 'cliente' as UserRole,
      title: 'Usuario Cliente (Consumidor)',
      name: MOCK_USERS.cliente.name,
      org: MOCK_USERS.cliente.organization,
      badge: 'Vecina Compradora',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accentColor: 'from-emerald-600 to-teal-700',
      borderHover: 'hover:border-emerald-500 focus:border-emerald-600',
      icon: ShoppingBag,
      accessBadge: 'Pantallas: Comprar, Mercados & Tianguis, Mi Canasta y Croquis',
      screens: [
        'Catálogo de productos frescos directo de marchantes',
        'Directorio y Mapa Georreferenciado de Mercados/Tianguis',
        'Carrito con Comparador de Ahorro frente al Súper',
        'Ficha QR y croquis de pasillos para recoger en cubículo',
      ],
      description:
        'Perfil para el consumidor barrial que busca calidad, mejores precios locales y bici-reparto sustentable.',
    },
    {
      role: 'vendedor' as UserRole,
      title: 'Usuario Vendedor (Locatario)',
      name: MOCK_USERS.vendedor.name,
      org: MOCK_USERS.vendedor.organization,
      badge: 'Puesto 42 · Medellín',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      accentColor: 'from-amber-600 to-orange-600',
      borderHover: 'hover:border-amber-500 focus:border-amber-600',
      icon: Store,
      accessBadge: 'Pantallas: Dashboard, WhatsApp IA, Inventario y Ventas',
      screens: [
        'Portal de gestión de puesto: catálogo e inventario',
        'Ventas y Pedidos: prepara y valida fichas de recolección',
        'Simulador WhatsApp / Ingesta de voz con MarchanteBot IA',
        'Buró de Crédito Barrial & Inclusión Financiera',
      ],
      description:
        'Perfil para el comerciante de mercado o tianguis que gestiona su catálogo sin complicaciones técnicas.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8ff] via-[#f1f5f9] to-[#ecfdf5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Banner */}
      <div className="max-w-4xl w-full mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4 shadow-sm animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Hackatón Chilangatón · Plataforma Oficial de Comercio Popular</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Canasta<span className="text-emerald-600">Local</span> CDMX
          </h1>
        </div>

        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Sistema modular con control de accesos segregado por perfil. Selecciona un usuario para ingresar a su espacio de trabajo correspondiente.
        </p>

        {/* Tab switcher: Quick Access vs Simulated Form */}
        <div className="inline-flex p-1 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'quick'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Acceso Rápido por Perfil (1-Clic)
          </button>
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              mode === 'form'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Formulario Tradicional Simulado
          </button>
        </div>
      </div>

      {/* Main Mode 1: Quick Role Selection Cards */}
      {mode === 'quick' ? (
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {roleCards.map((card) => {
            const IconComponent = card.icon;
            const isSelected = selectedRole === card.role;

            return (
              <div
                key={card.role}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header & Avatar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.accentColor} text-white flex items-center justify-center shadow-md`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Role Title and Name */}
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {card.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-700">{card.name}</span>
                    <span className="text-[11px] text-slate-400">· {card.org}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Access Scope Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{card.accessBadge}</span>
                    </div>

                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {card.screens.map((sc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{sc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Login Action Button */}
                <button
                  type="button"
                  onClick={() => login(card.role)}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    card.role === 'admin'
                      ? 'bg-purple-900 hover:bg-purple-800 text-white shadow-purple-900/20'
                      : card.role === 'vendedor'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <span>Ingresar como {card.badge}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Main Mode 2: Simulated Form */
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Selecciona Perfil de Usuario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cliente', 'vendedor', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all text-center ${
                      selectedRole === r
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'admin' ? 'Administrador' : r === 'cliente' ? 'Cliente' : 'Vendedor'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Este login es una simulación visual con fines de evaluación. Al dar clic en Iniciar Sesión accederás a las pantallas correspondientes al rol de{' '}
                <strong className="text-slate-900 uppercase">{selectedRole}</strong>.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <span>Iniciar Sesión Simulado</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Institutional note footer */}
      <div className="text-center mt-10 text-xs text-slate-400">
        CanastaLocal CDMX · Proyecto para la Inclusión Digital y Financiera del Comercio Popular
      </div>
    </div>
  );
};
