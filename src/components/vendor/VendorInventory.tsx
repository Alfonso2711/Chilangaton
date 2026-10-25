import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StallCategory } from '../../types';
import { exportProductsCsv, updateSource, isUpdatedToday } from './vendorUtils';
import {
  Plus,
  Archive,
  CheckCircle2,
  Ban,
  RefreshCcw,
  Search,
  Download,
  MessageSquareText,
  Bot,
  PencilLine,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AudioLines,
  ArrowRight,
  X,
} from 'lucide-react';

/** Gestor de inventario web (assets: canastalocal_gestor_de_inventario_web_1 / _2). */

const CATEGORIES: StallCategory[] = [
  'Frutas y Verduras',
  'Carnes y Pollería',
  'Abarrotes y Granos',
  'Cremería y Lácteos',
  'Chiles Secos y Especies',
  'Flores y Plantas',
  'Comida Preparada',
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

export const VendorInventory: React.FC = () => {
  const {
    merchantStall,
    products,
    updateProductPrice,
    toggleProductStock,
    addProduct,
    setActiveView,
    setRecentNotification,
  } = useApp();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('todas');
  const [status, setStatus] = useState<'todos' | 'activos' | 'agotados'>('todos');
  const [selected, setSelected] = useState<string[]>([]);
  const [manualIds, setManualIds] = useState<string[]>([]);
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({});
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const stallProducts = products.filter((p) => p.stallId === merchantStall.id);
  const available = stallProducts.filter((p) => p.inStock).length;
  const soldOut = stallProducts.length - available;
  const updatedToday = stallProducts.filter(isUpdatedToday).length;
  const viaVoice = stallProducts.filter((p) => isUpdatedToday(p) && updateSource(p, manualIds) === 'whatsapp').length;
  const categoriesCount = new Set(stallProducts.map((p) => p.category)).size;
  const pct = (n: number) => (stallProducts.length ? Math.round((n / stallProducts.length) * 100) : 0);

  const filtered = useMemo(
    () =>
      stallProducts.filter((p) => {
        const q = query.trim().toLowerCase();
        const matchesQ = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const matchesC = category === 'todas' || p.category === category;
        const matchesS = status === 'todos' || (status === 'activos' ? p.inStock : !p.inStock);
        return matchesQ && matchesC && matchesS;
      }),
    [stallProducts, query, category, status]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const notify = (msg: string) => {
    setRecentNotification(msg);
    window.setTimeout(() => setRecentNotification(null), 2800);
  };

  const commitPrice = (p: Product) => {
    const raw = draftPrices[p.id];
    if (raw === undefined) return;
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0 && num !== p.price) {
      updateProductPrice(p.id, num);
      setManualIds((ids) => (ids.includes(p.id) ? ids : [...ids, p.id]));
      notify(`${p.name}: precio actualizado a $${num.toFixed(2)}`);
    }
    setDraftPrices(({ [p.id]: _omit, ...rest }) => rest);
  };

  const toggleStock = (p: Product, value?: boolean) => {
    toggleProductStock(p.id, value);
    setManualIds((ids) => (ids.includes(p.id) ? ids : [...ids, p.id]));
  };

  const bulkSet = (inStock: boolean) => {
    stallProducts.filter((p) => selected.includes(p.id)).forEach((p) => toggleStock(p, inStock));
    notify(`${selected.length} productos marcados como ${inStock ? 'disponibles' : 'agotados'}`);
    setSelected([]);
  };

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((p) => selected.includes(p.id));

  const syncWhatsApp = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      notify('Inventario sincronizado con tus últimos mensajes de WhatsApp');
    }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Inventario de Productos</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#eaedff] text-xs font-semibold text-slate-700">
              {stallProducts.length} productos
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-[#006948] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sincronizado vía WhatsApp
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Gestiona los productos disponibles en tu puesto del {merchantStall.marketName}, ajusta precios en tiempo real y controla disponibilidad.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Agregar Producto Nuevo
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total catálogo', value: stallProducts.length, extra: '', sub: `${categoriesCount} categorías activas`, icon: Archive, tone: 'bg-[#eaedff] text-slate-700', color: 'text-slate-900' },
          { label: 'Disponibles', value: available, extra: `${pct(available)}%`, sub: 'Listos para entrega', icon: CheckCircle2, tone: 'bg-emerald-100 text-[#006948]', color: 'text-[#006948]' },
          { label: 'Agotados', value: soldOut, extra: `${pct(soldOut)}%`, sub: 'Requieren reabastecer', icon: Ban, tone: 'bg-red-100 text-red-600', color: 'text-red-600' },
          { label: 'Actualizados hoy', value: updatedToday, extra: '', sub: `${viaVoice} vía nota de voz`, icon: RefreshCcw, tone: 'bg-indigo-100 text-indigo-600', color: 'text-indigo-600' },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{k.label}</div>
              <div className={`text-3xl font-black ${k.color}`}>
                {k.value} {k.extra && <span className="text-xs font-bold">{k.extra}</span>}
              </div>
              <div className="text-xs text-slate-600">{k.sub}</div>
            </div>
            <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${k.tone}`}>
              <k.icon className="w-5 h-5" />
            </span>
          </div>
        ))}
      </div>

      {/* Filtros + tabla */}
      <section className="rounded-2xl bg-white border border-slate-200/80">
        <div className="p-3 sm:p-4 flex flex-col xl:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar producto por nombre o código..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#006948]"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status);
                setPage(1);
              }}
              className="h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="agotados">Agotados</option>
            </select>
            <button
              onClick={() => exportProductsCsv(filtered, `inventario-puesto-${merchantStall.stallNumber.replace('#', '')}.csv`)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button
              onClick={syncWhatsApp}
              className="h-10 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-[#006948] hover:bg-emerald-100 flex items-center justify-center gap-1.5"
            >
              <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sincronizar WhatsApp
            </button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mx-3 sm:mx-4 mb-3 px-3 py-2 rounded-xl bg-[#f2f3ff] text-xs flex flex-wrap items-center gap-2">
            <strong>{selected.length} seleccionados</strong>
            <button onClick={() => bulkSet(true)} className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-[#006948]">
              Marcar disponibles
            </button>
            <button onClick={() => bulkSet(false)} className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-red-600">
              Marcar agotados
            </button>
            <button onClick={() => setSelected([])} className="ml-auto text-slate-500 hover:text-slate-800">Limpiar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f2f3ff] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) =>
                      setSelected((ids) =>
                        e.target.checked
                          ? Array.from(new Set([...ids, ...pageItems.map((p) => p.id)]))
                          : ids.filter((id) => !pageItems.some((p) => p.id === id))
                      )
                    }
                    className="accent-[#006948]"
                    aria-label="Seleccionar página"
                  />
                </th>
                <th className="py-3 px-2">Producto</th>
                <th className="py-3 px-2">Categoría</th>
                <th className="py-3 px-2">Precio ($ MXN)</th>
                <th className="py-3 px-2">Disponibilidad</th>
                <th className="py-3 px-2">Última actualización</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {pageItems.map((p) => {
                const source = updateSource(p, manualIds);
                return (
                  <tr key={p.id} className={p.inStock ? '' : 'bg-slate-50/60'}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          setSelected((ids) => (e.target.checked ? [...ids, p.id] : ids.filter((id) => id !== p.id)))
                        }
                        className="accent-[#006948]"
                        aria-label={`Seleccionar ${p.name}`}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className={`w-11 h-11 rounded-lg object-cover ${p.inStock ? '' : 'grayscale'}`} />
                        <div className="min-w-0">
                          <div className={`font-semibold truncate ${p.inStock ? 'text-slate-900' : 'text-slate-500'}`}>{p.name}</div>
                          <div className="text-xs text-slate-500 truncate">{p.origin} · Por {p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-xs text-slate-700 whitespace-nowrap">{p.category}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={draftPrices[p.id] ?? p.price.toFixed(2)}
                          onChange={(e) => setDraftPrices((d) => ({ ...d, [p.id]: e.target.value }))}
                          onBlur={() => commitPrice(p)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          }}
                          className="w-full h-9 pl-6 pr-2 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-[#006948]"
                          aria-label={`Precio de ${p.name}`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => toggleStock(p)}
                        className="flex items-center gap-2"
                        role="switch"
                        aria-checked={p.inStock}
                        aria-label={`Disponibilidad de ${p.name}`}
                      >
                        <span className={`w-10 h-6 rounded-full p-0.5 transition-colors ${p.inStock ? 'bg-[#006948]' : 'bg-slate-200'}`}>
                          <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${p.inStock ? 'translate-x-4' : ''}`} />
                        </span>
                        <span className={`text-xs font-semibold ${p.inStock ? 'text-[#006948]' : 'text-red-600'}`}>
                          {p.inStock ? 'Activo' : 'Agotado'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${source === 'whatsapp' ? 'bg-emerald-50 text-[#006948]' : 'bg-[#f2f3ff] text-slate-600'}`}>
                          {source === 'whatsapp' ? <Bot className="w-3 h-3" /> : <PencilLine className="w-3 h-3" />}
                          {source === 'whatsapp' ? 'WhatsApp IA' : 'Manual'}
                        </span>
                        <span className="text-slate-600 whitespace-nowrap">{p.updatedAt}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center"
                        aria-label={`Acciones de ${p.name}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuFor === p.id && (
                        <div className="absolute right-4 top-11 w-52 p-1.5 rounded-xl bg-white border border-slate-200 shadow-xl z-20 text-left">
                          <button
                            onClick={() => {
                              toggleStock(p);
                              setMenuFor(null);
                            }}
                            className="w-full px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
                          >
                            {p.inStock ? 'Marcar como agotado' : 'Marcar como disponible'}
                          </button>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              setActiveView('whatsapp_bot');
                            }}
                            className="w-full px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                          >
                            <AudioLines className="w-3.5 h-3.5" /> Actualizar por voz
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Mostrando{' '}
            <strong>
              {filtered.length ? (page - 1) * pageSize + 1 : 0} a {Math.min(page * pageSize, filtered.length)}
            </strong>{' '}
            de <strong>{filtered.length}</strong> productos ·{' '}
            <span className="text-[#006948]">{available} activos</span> · {soldOut} agotados
          </div>
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-slate-200 bg-white"
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-2 rounded-lg border border-slate-200 disabled:opacity-40 flex items-center"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg font-semibold ${n === page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-2 rounded-lg border border-slate-200 disabled:opacity-40 flex items-center"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Tip */}
      <section className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </span>
          <div className="text-sm">
            <div className="font-bold text-slate-900">¿Sabías que puedes actualizar precios hablando por nota de voz?</div>
            <p className="text-xs text-slate-600">
              Envía un audio como <strong>“El jitomate subió a $28 y no me queda papa”</strong> a tu asistente y este panel se actualizará solo.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('vendedor_ia')}
          className="px-4 h-10 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 flex-shrink-0"
        >
          Configurar número <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            addProduct({
              ...data,
              stallId: merchantStall.id,
              stallName: merchantStall.name,
              marketId: merchantStall.marketId,
              marketName: merchantStall.marketName,
            });
            setShowAdd(false);
            setPage(1);
            notify(`${data.name} agregado a tu catálogo público`);
          }}
          defaultCategory={merchantStall.category}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */

type NewProductData = Omit<Product, 'id' | 'updatedAt' | 'stallId' | 'stallName' | 'marketId' | 'marketName'>;

const AddProductModal: React.FC<{
  onClose: () => void;
  onSave: (data: NewProductData) => void;
  defaultCategory: StallCategory;
}> = ({ onClose, onSave, defaultCategory }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StallCategory>(defaultCategory);
  const [price, setPrice] = useState('');
  const [superPrice, setSuperPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [origin, setOrigin] = useState('');
  const [stock, setStock] = useState('20');
  const [image, setImage] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || isNaN(p) || p <= 0) return;
    const sp = parseFloat(superPrice);
    const superValue = !isNaN(sp) && sp > 0 ? sp : +(p * 1.35).toFixed(2);
    onSave({
      name: name.trim(),
      category,
      price: p,
      supermarketPrice: superValue,
      conveniencePrice: +(superValue * 1.1).toFixed(2),
      unit,
      inStock: true,
      stockQty: parseInt(stock, 10) || undefined,
      origin: origin.trim() || 'Central de Abasto',
      badge: 'Fresco de Hoy',
      image: image.trim() || DEFAULT_IMAGE,
    });
  };

  const field = 'w-full h-10 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#006948]';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Agregar producto nuevo</h3>
            <p className="text-xs text-slate-500">Aparecerá de inmediato en tu puesto público de CanastaLocal.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Nombre del producto *</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Ej. Papaya Maradol" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Categoría</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as StallCategory)} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Unidad</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={field}>
              {['kg', 'medio kg', 'pieza', 'manojo', 'litro', 'penca'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Tu precio (MXN) *</span>
            <input required type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} className={field} placeholder="28.00" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Precio en súper (opcional)</span>
            <input type="number" min="0" step="0.5" value={superPrice} onChange={(e) => setSuperPrice(e.target.value)} className={field} placeholder="Para el comparador" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Origen</span>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={field} placeholder="Ej. Veracruz" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Existencia</span>
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={field} />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">URL de foto (opcional)</span>
          <input value={image} onChange={(e) => setImage(e.target.value)} className={field} placeholder="https://..." />
        </label>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancelar
          </button>
          <button type="submit" className="flex-1 h-11 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700">
            Guardar producto
          </button>
        </div>
      </form>
    </div>
  );
};
