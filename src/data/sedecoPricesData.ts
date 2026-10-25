import { PriceRange, SedecoPriceItem } from '../types';

export function calculateSedecoPriceStats(
  mercadosPublicos: PriceRange,
  mercadosMoviles: PriceRange,
  mercadosSobreRuedas: PriceRange,
  centrosComerciales: PriceRange
) {
  const avgPublicos = (mercadosPublicos.min + mercadosPublicos.max) / 2;
  const avgMoviles = (mercadosMoviles.min + mercadosMoviles.max) / 2;
  const avgMSR = (mercadosSobreRuedas.min + mercadosSobreRuedas.max) / 2;
  const avgComerciales = (centrosComerciales.min + centrosComerciales.max) / 2;

  // Promedio global SEDECO (media de los 4 canales de abasto de la CDMX)
  const calculatedAverage = Number(
    ((avgPublicos + avgMoviles + avgMSR + avgComerciales) / 4).toFixed(2)
  );

  // Promedio del circuito popular barrial (Públicos, Móviles y Sobre Ruedas)
  const popularAvg = (avgPublicos + avgMoviles + avgMSR) / 3;

  // Diferencial de ahorro popular frente a centros comerciales
  const spreadVsSupermarketPct =
    avgComerciales > 0
      ? Number((((popularAvg - avgComerciales) / avgComerciales) * 100).toFixed(1))
      : 0;

  return {
    calculatedAverage,
    spreadVsSupermarketPct,
    avgPublicos,
    avgMoviles,
    avgMSR,
    avgComerciales,
    popularAvg,
  };
}

export const INITIAL_SEDECO_PRICES: SedecoPriceItem[] = [
  {
    id: 'sedeco-1',
    productName: 'Jitomate Saladet',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 20.0, max: 26.0 },
    mercadosMoviles: { min: 22.0, max: 25.0 },
    mercadosSobreRuedas: { min: 18.0, max: 24.0 },
    centrosComerciales: { min: 38.9, max: 46.5 },
    calculatedAverage: 27.05,
    spreadVsSupermarketPct: -49.6,
    tendency: 'baja',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-2',
    productName: 'Aguacate Hass',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 48.0, max: 58.0 },
    mercadosMoviles: { min: 50.0, max: 55.0 },
    mercadosSobreRuedas: { min: 45.0, max: 54.0 },
    centrosComerciales: { min: 79.9, max: 98.0 },
    calculatedAverage: 61.11,
    spreadVsSupermarketPct: -42.7,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-3',
    productName: 'Limón con Semilla',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 25.0, max: 32.0 },
    mercadosMoviles: { min: 26.0, max: 30.0 },
    mercadosSobreRuedas: { min: 22.0, max: 28.0 },
    centrosComerciales: { min: 46.0, max: 56.0 },
    calculatedAverage: 33.63,
    spreadVsSupermarketPct: -46.7,
    tendency: 'alta',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-4',
    productName: 'Pechuga de Pollo Fresca',
    category: 'Carnes y Pollería',
    unit: 'kg',
    mercadosPublicos: { min: 110.0, max: 125.0 },
    mercadosMoviles: { min: 115.0, max: 122.0 },
    mercadosSobreRuedas: { min: 108.0, max: 120.0 },
    centrosComerciales: { min: 159.0, max: 185.0 },
    calculatedAverage: 130.5,
    spreadVsSupermarketPct: -32.2,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-5',
    productName: 'Huevo Blanco Fresco',
    category: 'Abarrotes y Granos',
    unit: 'cono (30 pzas)',
    mercadosPublicos: { min: 74.0, max: 80.0 },
    mercadosMoviles: { min: 75.0, max: 78.0 },
    mercadosSobreRuedas: { min: 72.0, max: 78.0 },
    centrosComerciales: { min: 92.0, max: 103.0 },
    calculatedAverage: 81.5,
    spreadVsSupermarketPct: -22.7,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-6',
    productName: 'Papa Blanca Alpha',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 26.0, max: 34.0 },
    mercadosMoviles: { min: 28.0, max: 32.0 },
    mercadosSobreRuedas: { min: 24.0, max: 30.0 },
    centrosComerciales: { min: 44.0, max: 52.0 },
    calculatedAverage: 33.75,
    spreadVsSupermarketPct: -39.6,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-7',
    productName: 'Cebolla Blanca',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 18.0, max: 24.0 },
    mercadosMoviles: { min: 20.0, max: 22.0 },
    mercadosSobreRuedas: { min: 16.0, max: 22.0 },
    centrosComerciales: { min: 36.0, max: 45.0 },
    calculatedAverage: 25.56,
    spreadVsSupermarketPct: -49.8,
    tendency: 'baja',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-8',
    productName: 'Queso Oaxaca Artesanal',
    category: 'Cremería y Lácteos',
    unit: 'kg',
    mercadosPublicos: { min: 130.0, max: 145.0 },
    mercadosMoviles: { min: 135.0, max: 140.0 },
    mercadosSobreRuedas: { min: 125.0, max: 140.0 },
    centrosComerciales: { min: 182.0, max: 215.0 },
    calculatedAverage: 152.44,
    spreadVsSupermarketPct: -32.3,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-9',
    productName: 'Plátano Tabasco / Chiapas',
    category: 'Frutas y Verduras',
    unit: 'kg',
    mercadosPublicos: { min: 18.0, max: 24.0 },
    mercadosMoviles: { min: 19.0, max: 22.0 },
    mercadosSobreRuedas: { min: 16.0, max: 22.0 },
    centrosComerciales: { min: 32.0, max: 39.0 },
    calculatedAverage: 24.0,
    spreadVsSupermarketPct: -43.2,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
  {
    id: 'sedeco-10',
    productName: 'Frijol Negro San Luis / Pinto',
    category: 'Abarrotes y Granos',
    unit: 'kg',
    mercadosPublicos: { min: 38.0, max: 44.0 },
    mercadosMoviles: { min: 40.0, max: 42.0 },
    mercadosSobreRuedas: { min: 36.0, max: 42.0 },
    centrosComerciales: { min: 54.0, max: 62.0 },
    calculatedAverage: 45.0,
    spreadVsSupermarketPct: -31.6,
    tendency: 'estable',
    updatedAt: '25 Oct 2026',
  },
];
