import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppMessage } from '../../types';
import {
  RefreshCw,
  Send,
  MessageSquareText,
  Smartphone,
  Mic,
  MessageSquare,
  Camera,
  Clock,
  CheckCircle2,
  PauseCircle,
  AudioLines,
  BadgeCheck,
  Timer,
  RefreshCcw,
} from 'lucide-react';

/** Historial de sincronización por IA (asset: canastalocal_sincronizaci_n_whatsapp_ia). */

type EventKind = 'voz' | 'texto' | 'pizarra' | 'horario';

interface SyncEvent {
  id: string;
  kind: EventKind;
  when: string;
  processing: string;
  content: string;
  detection: string;
  detectionStruck?: string;
  status: 'ok' | 'pausa' | 'revision';
  duration?: string;
}

const FILTERS: { id: 'todos' | EventKind; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'voz', label: 'Notas de voz' },
  { id: 'texto', label: 'Textos' },
  { id: 'pizarra', label: 'Fotos de pizarra' },
  { id: 'horario', label: 'Cambios de horario' },
];

const ACTION_LABEL: Record<string, string> = {
  ACTUALIZAR_PRECIO: 'Actualizar precio en catálogo público',
  MARCAR_AGOTADO: 'Marcar producto como agotado',
  MARCAR_DISPONIBLE: 'Marcar producto como disponible',
  AGREGAR_PRODUCTO: 'Agregar producto nuevo al catálogo',
  CONSULTAR: 'Consulta de catálogo',
};

// Eventos históricos de ejemplo que no provienen del simulador (foto de pizarra y cambio de horario)
const SEED_EVENTS: SyncEvent[] = [
  {
    id: 'EVT-9812',
    kind: 'horario',
    when: 'Ayer a las 06:15 PM',
    processing: 'Procesado en 0.8s',
    content: 'Ya cerré el local, hasta mañana temprano Dios mediante',
    detection: '[Acción: Cambiar estado] [Estado nuevo: Puesto Cerrado] [Horario de reapertura: Mañana 07:30 AM]',
    status: 'pausa',
  },
  {
    id: 'EVT-9750',
    kind: 'pizarra',
    when: 'Hace 2 días',
    processing: 'Procesamiento multimodal OCR',
    content: 'Foto de caballete de madera con lista de 6 precios escritos con tiza blanca y naranja.',
    detection: '[OCR Pizarra: 6 productos identificados y actualizados en 4.2 segundos] [Jitomate $22/kg, Cebolla $18/kg, Papa $26/kg +3 más]',
    status: 'ok',
  },
];

const messageToEvent = (m: WhatsAppMessage, idx: number): SyncEvent | null => {
  if (m.sender !== 'locatario') return null;
  const p = m.parsedData;
  const parts: string[] = [];
  if (p) {
    if (p.productName) parts.push(`[Producto: ${p.productName}${p.variety ? ` ${p.variety}` : ''}]`);
    if (p.price !== undefined) parts.push(`[Precio nuevo: $${p.price.toFixed(2)} MXN${p.unit ? `/${p.unit}` : ''}]`);
    parts.push(`[Acción: ${ACTION_LABEL[p.action] || p.action}]`);
    parts.push(`[Confianza: ${Math.round(p.confidence * 100)}%]`);
  }
  return {
    id: `EVT-${9900 + idx}`,
    kind: m.type === 'audio' ? 'voz' : 'texto',
    when: `Hoy a las ${m.timestamp}`,
    processing: m.type === 'audio' ? `Procesado en 1.4s · Ruido ambiental filtrado` : 'Procesado en 0.8s',
    content: m.content.replace(/^🎙️\s*/, '').replace(/^"|"$/g, ''),
    detection: p ? parts.join(' ') : 'Procesando con Gemini…',
    status: !p || m.status === 'procesando' ? 'revision' : p.ambiguityDetected ? 'revision' : 'ok',
    duration: m.audioDuration,
  };
};

const KIND_META: Record<EventKind, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  voz: { label: 'Nota de voz', icon: Mic, tone: 'bg-emerald-100 text-[#006948]' },
  texto: { label: 'Mensaje de texto', icon: MessageSquare, tone: 'bg-[#eaedff] text-slate-700' },
  pizarra: { label: 'Foto de pizarra', icon: Camera, tone: 'bg-[#eaedff] text-slate-700' },
  horario: { label: 'Cambio de horario', icon: Clock, tone: 'bg-orange-100 text-orange-800' },
};

export const VendorAISync: React.FC = () => {
  const { whatsAppMessages, merchantStall, currentUser, setActiveView, setRecentNotification } = useApp();
  const [filter, setFilter] = useState<'todos' | EventKind>('todos');
  const [refreshing, setRefreshing] = useState(false);

  const events = useMemo(() => {
    const live = whatsAppMessages
      .map((m, i) => messageToEvent(m, i))
      .filter((e): e is SyncEvent => e !== null)
      .reverse();
    return [...live, ...SEED_EVENTS];
  }, [whatsAppMessages]);

  const visible = filter === 'todos' ? events : events.filter((e) => e.kind === filter);
  const todayCount = events.filter((e) => e.when.startsWith('Hoy')).length;
  const senderName = (currentUser?.name || merchantStall.ownerName).split(' ').slice(0, 2).join(' ');

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setRecentNotification('Registros sincronizados con MarchanteBot');
      window.setTimeout(() => setRecentNotification(null), 2500);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]" /> Motor Whisper + Gemini
            </span>
            <span className="text-slate-500">Versión 2.4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sincronización por Inteligencia Artificial (WhatsApp)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Historial en vivo de actualizaciones de precios e inventario procesadas automáticamente mediante notas de voz y mensajes de WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={refresh}
            className="px-4 h-11 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refrescar registros
          </button>
          <button
            onClick={() => setActiveView('whatsapp_bot')}
            className="px-4 h-11 rounded-xl bg-[#006948] hover:bg-[#00553a] text-white text-sm font-bold flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Enviar mensaje de prueba
          </button>
        </div>
      </div>

      {/* Número conectado */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-emerald-100 text-[#006948] flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tu número de WhatsApp está conectado al{' '}
              <span className="text-[#006948] underline decoration-emerald-300">{merchantStall.phone}</span>
            </h2>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] text-[11px] font-semibold">Canal activo</span>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Reconoce notas de voz de hasta 2 minutos con ruido ambiental de mercado, fotos de pizarras escritas a gis y mensajes de texto informales.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-[#006948] text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse" /> Escuchando en vivo
          </span>
          <button
            onClick={() => {
              setRecentNotification('Para cambiar el número vinculado, comunícate con tu líder de mercado');
              window.setTimeout(() => setRecentNotification(null), 3000);
            }}
            className="px-3 py-1.5 rounded-full bg-[#f2f3ff] text-xs font-semibold text-slate-700 hover:bg-[#eaedff] flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" /> Configurar número vinculado
          </button>
        </div>
      </section>

      {/* Historial */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Historial de Operaciones en Vivo
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-xs font-semibold text-slate-600">{todayCount} eventos hoy</span>
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#f2f3ff] overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  filter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-sm text-slate-500">
            No hay eventos de este tipo todavía.
          </div>
        )}

        {visible.map((ev) => {
          const meta = KIND_META[ev.kind];
          const Icon = meta.icon;
          return (
            <article key={ev.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.tone}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                      <strong>{senderName}</strong>
                      <span className="text-xs text-slate-500">(+52 {merchantStall.phone})</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${meta.tone}`}>
                        {ev.kind === 'voz' && <AudioLines className="w-3 h-3" />}
                        {meta.label}
                        {ev.duration ? ` (${ev.duration})` : ''}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {ev.when} · {ev.processing}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap ${
                    ev.status === 'ok'
                      ? 'bg-emerald-100 text-[#006948]'
                      : ev.status === 'pausa'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ev.status === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  {ev.status === 'ok' ? 'Sincronizado con éxito' : ev.status === 'pausa' ? 'Tienda en pausa' : 'Requiere confirmación'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f2f3ff]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {ev.kind === 'voz'
                    ? 'Transcripción Whisper AI'
                    : ev.kind === 'pizarra'
                    ? 'Captura recibida vía WhatsApp'
                    : 'Mensaje SMS / WhatsApp directo'}
                </div>
                <p className="text-sm text-slate-800 italic mt-0.5">“{ev.content}”</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800 text-[11px] font-mono text-emerald-300 space-y-1.5">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-white font-bold ${ev.status === 'pausa' ? 'bg-orange-700' : 'bg-[#006948]'}`}>
                    IA Detectó
                  </span>
                  <span className="text-slate-100">{ev.detection}</span>
                </div>
                <div className="text-slate-400">ID: {ev.id}</div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BadgeCheck, value: '99.4%', label: 'Precisión en voz y dialectos locales', tone: 'bg-emerald-100 text-[#006948]' },
          { icon: Timer, value: '1.8 seg', label: 'Tiempo promedio de sincronización', tone: 'bg-[#eaedff] text-slate-700' },
          { icon: RefreshCcw, value: `${42 + events.length} sincronizaciones`, label: 'Realizadas con éxito este mes', tone: 'bg-orange-100 text-orange-700' },
        ].map((m) => (
          <div key={m.label} className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-4">
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.tone}`}>
              <m.icon className="w-6 h-6" />
            </span>
            <div>
              <div className="text-2xl font-black text-slate-900">{m.value}</div>
              <div className="text-xs text-slate-600">{m.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
