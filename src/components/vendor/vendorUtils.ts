import { Product } from '../../types';

/** Descarga el catálogo del puesto como CSV (abre en Excel con acentos correctos). */
export const exportProductsCsv = (products: Product[], fileName: string) => {
  const header = ['Producto', 'Categoría', 'Precio MXN', 'Unidad', 'Precio Súper MXN', 'Disponible', 'Origen', 'Última actualización'];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = products.map((p) =>
    [p.name, p.category, p.price.toFixed(2), p.unit, p.supermarketPrice.toFixed(2), p.inStock ? 'Sí' : 'No', p.origin, p.updatedAt]
      .map(escape)
      .join(',')
  );
  const csv = '﻿' + [header.map(escape).join(','), ...rows].join('\n');
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // descarga no soportada en este entorno
  }
};

/** Fuente de la última actualización de un producto (para la columna del inventario). */
export const updateSource = (p: Product, manualIds: string[]): 'whatsapp' | 'manual' =>
  manualIds.includes(p.id) ? 'manual' : /min|Justo|hora|WhatsApp/i.test(p.updatedAt) ? 'whatsapp' : 'manual';

export const isUpdatedToday = (p: Product) => /min|Justo|hora|Hoy/i.test(p.updatedAt);
