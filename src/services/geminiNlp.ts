import { GoogleGenAI } from '@google/genai';
import { VoiceInventoryParseResult } from '../types';

export async function parseMerchantAudioOrText(
  transcript: string,
  existingProductNames: { id: string; name: string }[]
): Promise<VoiceInventoryParseResult> {
  const normalized = transcript.toLowerCase();

  // Try Gemini API if API key is configured
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Eres el motor de lenguaje natural "MarchanteBot" para comerciantes de mercados y tianguis de la Ciudad de México.
Analiza la siguiente instrucción dictada por voz o WhatsApp por el locatario:
"${transcript}"

Productos disponibles en su puesto:
${existingProductNames.map((p) => `- ID: ${p.id}, Nombre: ${p.name}`).join('\n')}

Extrae la intención en este formato JSON exacto:
{
  "action": "ACTUALIZAR_PRECIO" | "MARCAR_AGOTADO" | "MARCAR_DISPONIBLE" | "AGREGAR_PRODUCTO",
  "productName": "nombre del producto identificado",
  "price": número o null,
  "unit": "kg" | "pieza" | "manojo" | "litro" | null,
  "matchedProductId": "id del producto si coincide exactamente, o null",
  "ambiguityDetected": booleano (true si hay más de una variedad como Manzana Gala vs Manzana Golden),
  "ambiguousOptions": [{"id": "...", "name": "..."}] (solo si ambiguityDetected es true),
  "explanation": "resumen amigable en español para el locatario"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          rawTranscript: transcript,
          action: parsed.action || 'ACTUALIZAR_PRECIO',
          productName: parsed.productName || 'Producto',
          variety: parsed.variety,
          price: parsed.price ? Number(parsed.price) : undefined,
          unit: parsed.unit || 'kg',
          confidence: 0.96,
          ambiguityDetected: !!parsed.ambiguityDetected,
          ambiguousOptions: parsed.ambiguousOptions || [],
          matchedProductId: parsed.matchedProductId,
          explanation: parsed.explanation || `Actualizado: ${parsed.productName} a $${parsed.price || ''}`,
        };
      }
    } catch (err) {
      console.warn('Gemini NLP fell back to deterministic rule parser:', err);
    }
  }

  // High-precision local deterministic Mexican merchant NLP parser (Zero-latency & Offline-first)
  return parseDeterministicMexicanSpanish(transcript, existingProductNames);
}

function parseDeterministicMexicanSpanish(
  text: string,
  existingProducts: { id: string; name: string }[]
): VoiceInventoryParseResult {
  const lower = text.toLowerCase();

  // 1. Check for stock depletion (Agotado)
  const isAgotado =
    lower.includes('agot') ||
    lower.includes('se acabó') ||
    lower.includes('se me acabo') ||
    lower.includes('ya no hay') ||
    lower.includes('ya no me queda') ||
    lower.includes('se terminaron') ||
    lower.includes('se terminó') ||
    lower.includes('no hay');

  // 2. Check for stock replenishment (Disponible)
  const isDisponible =
    lower.includes('ya llegó') ||
    lower.includes('ya hay') ||
    lower.includes('surti') ||
    lower.includes('surtí') ||
    lower.includes('disponible') ||
    lower.includes('me llegaron');

  // 3. Extract price: e.g. "a 24 pesos", "en 50", "$35", "a 30 el kilo"
  const priceMatch =
    text.match(/\$?(\d+(?:\.\d{1,2})?)\s*(?:pesos|mxn|\$)?(?:\s*el\s*(?:kilo|kg|manojo|pieza))?/i) ||
    text.match(/(?:a|en|sube a|baja a)\s*\$?(\d+(?:\.\d{1,2})?)/i);

  let extractedPrice: number | undefined = undefined;
  if (priceMatch) {
    const rawVal = priceMatch[1] || priceMatch[0].replace(/[^0-9.]/g, '');
    const num = parseFloat(rawVal);
    if (!isNaN(num) && num > 0 && num < 2000) {
      extractedPrice = num;
    }
  }

  // 4. Product matching against inventory
  let matchedProduct = existingProducts.find((p) =>
    lower.includes(p.name.toLowerCase().split(' ')[0])
  );

  // Check ambiguity specifically for items with varieties (e.g. Manzana)
  const isManzana = lower.includes('manzana');
  const appleOptions = existingProducts.filter((p) => p.name.toLowerCase().includes('manzana'));

  if (isManzana && appleOptions.length > 1 && !lower.includes('golden') && !lower.includes('gala')) {
    return {
      rawTranscript: text,
      action: isAgotado ? 'MARCAR_AGOTADO' : isDisponible ? 'MARCAR_DISPONIBLE' : 'ACTUALIZAR_PRECIO',
      productName: 'Manzana',
      price: extractedPrice,
      unit: 'kg',
      confidence: 0.85,
      ambiguityDetected: true,
      ambiguousOptions: appleOptions.map((o) => ({ id: o.id, name: o.name })),
      explanation: 'Se detectaron múltiples variedades de Manzana (Golden vs Gala). ¿Cuál desea actualizar?',
    };
  }

  // Specific keywords matching
  let detectedName = 'Producto';
  if (lower.includes('jitomate') || lower.includes('tomate')) {
    detectedName = 'Jitomate Saladet';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('jitomate'));
  } else if (lower.includes('aguacate')) {
    detectedName = 'Aguacate Hass';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('aguacate'));
  } else if (lower.includes('limón') || lower.includes('limon')) {
    detectedName = 'Limón con Semilla';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('limón') || p.name.toLowerCase().includes('limon'));
  } else if (lower.includes('cebolla')) {
    detectedName = 'Cebolla Blanca';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('cebolla'));
  } else if (lower.includes('cilantro')) {
    detectedName = 'Cilantro Criollo';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('cilantro'));
  } else if (lower.includes('plátano') || lower.includes('platano')) {
    detectedName = 'Plátano Tabasco';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('plátano') || p.name.toLowerCase().includes('platano'));
  } else if (lower.includes('pollo') || lower.includes('pechuga')) {
    detectedName = 'Pechuga de Pollo';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('pollo') || p.name.toLowerCase().includes('pechuga'));
  } else if (lower.includes('bistec') || lower.includes('res') || lower.includes('carne')) {
    detectedName = 'Bistec de Res';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('bistec'));
  } else if (lower.includes('queso') || lower.includes('oaxaca')) {
    detectedName = 'Queso Oaxaca';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('queso'));
  } else if (lower.includes('huevo')) {
    detectedName = 'Huevo Blanco';
    matchedProduct = existingProducts.find((p) => p.name.toLowerCase().includes('huevo'));
  } else if (matchedProduct) {
    detectedName = matchedProduct.name;
  }

  const action = isAgotado
    ? 'MARCAR_AGOTADO'
    : isDisponible
    ? 'MARCAR_DISPONIBLE'
    : extractedPrice !== undefined
    ? 'ACTUALIZAR_PRECIO'
    : 'ACTUALIZAR_PRECIO';

  let explanation = '';
  if (action === 'MARCAR_AGOTADO') {
    explanation = `${detectedName} marcado como AGOTADO para los compradores del barrio.`;
  } else if (action === 'MARCAR_DISPONIBLE') {
    explanation = `${detectedName} marcado como DISPONIBLE con inventario activo.`;
  } else if (extractedPrice !== undefined) {
    explanation = `Precio de ${detectedName} actualizado a $${extractedPrice.toFixed(2)} MXN. Catálogo en vivo sincronizado.`;
  } else {
    explanation = `Instrucción procesada sobre ${detectedName}. Catálogo al día.`;
  }

  return {
    rawTranscript: text,
    action,
    productName: detectedName,
    price: extractedPrice,
    unit: lower.includes('manojo') ? 'manojo' : lower.includes('pieza') ? 'pieza' : 'kg',
    confidence: 0.95,
    ambiguityDetected: false,
    matchedProductId: matchedProduct?.id,
    explanation,
  };
}
