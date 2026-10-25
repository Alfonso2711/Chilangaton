import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  CheckCheck,
  Store,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

export const WhatsAppBotSimulator: React.FC = () => {
  const {
    whatsAppMessages,
    sendMerchantMessage,
    merchantStall,
    products,
    setActiveView,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [whatsAppMessages]);

  const handleSendText = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isProcessing) return;

    setInputVal('');
    setIsProcessing(true);
    await sendMerchantMessage(text, false);
    setIsProcessing(false);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecordingAndSend = async (sampleTranscript?: string) => {
    clearInterval(timerRef.current);
    setIsRecording(false);

    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    const transcript =
      sampleTranscript ||
      (recordingSeconds > 0
        ? '🎙️ "Bájame el kilo de jitomate saladet a 24 pesos y pon el aguacate en 52 que ya llegó nuevo de Michoacán."'
        : '🎙️ "Ya no me queda limón con semilla por hoy para que lo marques como agotado."');

    setIsProcessing(true);
    await sendMerchantMessage(transcript, true, durationStr);
    setIsProcessing(false);
    setRecordingSeconds(0);
  };

  const sampleVoicePresets = [
    {
      label: '🍅 Bajar jitomate a $24/kg',
      text: 'Oye mijo, bájame el jitomate saladet a 24 pesos el kilo que me llegó barato de Puebla.',
    },
    {
      label: '🥑 Subir aguacate a $55/kg',
      text: 'Sube el aguacate hass a 55 pesos el kilo por favor.',
    },
    {
      label: '🚫 Marcar cilantro agotado',
      text: 'Ya se me acabó el cilantro criollo de Xochimilco por hoy.',
    },
    {
      label: '🍎 Probar Desambiguación (Manzana)',
      text: 'Pon la manzana en 35 pesos el kilo.',
    },
  ];

  const stallProducts = products.filter((p) => p.stallId === merchantStall.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Explaining Zero-Friction & RNF1 */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Requerimiento Funcional RF-01 & RNF-01
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              MarchanteBot: Ingesta por Voz & WhatsApp IA (Cero Fricción)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              El <strong>69.4% de los comerciantes no usa herramientas digitales</strong> complejas. Con MarchanteBot, el locatario <strong>no instala apps ni llena formularios</strong>: solo manda una nota de voz o mensaje por WhatsApp para actualizar precios y existencias en tiempo real.
            </p>
          </div>

          <button
            onClick={() => setActiveView('comprador')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Ver Catálogo en Vivo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Main Dual Grid: WhatsApp Phone Simulator + Live Updated Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Phone Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b141a] rounded-[2.5rem] p-3 sm:p-4 shadow-2xl border-4 border-slate-800">
          {/* Phone Speaker Notch */}
          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

          {/* WhatsApp Window */}
          <div className="bg-[#efeae2] rounded-[1.75rem] overflow-hidden flex flex-col h-[560px] border border-slate-300/40">
            {/* WhatsApp Top Bar */}
            <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center font-bold text-sm border border-emerald-400/40">
                  MB
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    MarchanteBot · CanastaLocal
                    <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse"></span>
                  </div>
                  <div className="text-[11px] text-emerald-100/90 font-medium">
                    Doña Mary (Puesto #42, Mercado Medellín)
                  </div>
                </div>
              </div>
              <div className="text-[11px] bg-[#006a57] px-2.5 py-1 rounded-full text-emerald-100 font-mono">
                IA Activa
              </div>
            </div>

            {/* WhatsApp Messages Scroll */}
            <div
              className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3"
              style={{
                backgroundImage:
                  'radial-gradient(#d1c7b7 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="text-center my-1">
                <span className="bg-[#ffffffcc] text-slate-500 text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                  HOY · MERCADO MEDELLÍN
                </span>
              </div>

              {whatsAppMessages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs space-y-1.5 ${
                        isBot
                          ? 'bg-white text-slate-900 rounded-tl-xs'
                          : 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs'
                      }`}
                    >
                      {msg.type === 'audio' && (
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-100/60 mb-1 border border-emerald-200">
                          <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
                          <span className="font-semibold text-emerald-900 text-[11px]">
                            Nota de Voz del Locatario ({msg.audioDuration || '0:14'})
                          </span>
                        </div>
                      )}

                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </div>

                      {/* NLP Extracted Meta Badge if available */}
                      {msg.parsedData && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] font-mono bg-slate-50/70 p-1.5 rounded-lg text-slate-700 space-y-0.5">
                          <div className="text-emerald-700 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Extracción NLP: {msg.parsedData.action}
                          </div>
                          <div>Producto: <strong>{msg.parsedData.productName}</strong></div>
                          {msg.parsedData.price && (
                            <div>Precio: <strong>${msg.parsedData.price.toFixed(2)}/{msg.parsedData.unit || 'kg'}</strong></div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {!isBot && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl w-fit shadow-xs text-xs text-slate-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Procesando audio e impactando catálogo en vivo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Presets Bar */}
            <div className="bg-[#f0f2f5] p-2 border-t border-slate-200 overflow-x-auto scrollbar-none flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
                Probar Dictado:
              </span>
              {sampleVoicePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendText(preset.text)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:border-emerald-300 whitespace-nowrap shadow-xs transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* WhatsApp Input Bar */}
            <div className="bg-[#f0f2f5] p-2 sm:p-2.5 flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder={isRecording ? `Grabando nota de voz (${recordingSeconds}s)...` : "Escribe o dicta: ej. 'el jitomate a 24 pesos'"}
                disabled={isRecording}
                className="flex-1 h-10 px-3.5 rounded-full bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none border border-slate-200 focus:border-emerald-500"
              />

              {/* Mic / Record button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={() => stopVoiceRecordingAndSend()}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse shadow-md"
                  title="Detener y Enviar Audio"
                >
                  <MicOff className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center hover:bg-[#006a57] transition-all shadow-sm"
                  title="Grabar Nota de Voz por Micrófono"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {inputVal.trim() && !isRecording && (
                <button
                  type="button"
                  onClick={() => handleSendText()}
                  className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center hover:bg-[#006a57] transition-all shadow-sm"
                  title="Enviar Mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Inventory State of Doña Mary's Stall (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Catálogo B2C Impactado en Vivo
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {merchantStall.name} ({merchantStall.stallNumber})
                </h3>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Cualquier audio o texto procesado arriba actualiza esta tabla y el catálogo de compras de los vecinos <strong>en tiempo real</strong>.
            </p>

            {/* Mini Stock Table */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {stallProducts.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    p.inStock
                      ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                      : 'bg-red-50/40 border-red-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.origin.split('/')[0]} · {p.updatedAt}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {p.inStock ? (
                      <div>
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          ${p.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">/{p.unit}</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Prop for Hackathon Judges */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Impacto Social y Adopción Masiva:
            </div>
            <p className="leading-relaxed">
              Al no requerir descarga de apps ni alfabetización digital, el locatario continúa vendiendo normalmente en el mostrador mientras su inventario se mantiene sincronizado por voz con millones de compradores metropolitanos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
