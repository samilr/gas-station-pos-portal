/**
 * Tabla de mapeo de productos de combustible
 * Mapea los códigos de producto (FuelGradeName del PTS) a nombres legibles
 */
export const FUEL_PRODUCT_MAPPING: Record<string, string> = {
  '1-001': 'GASOLINA REGULAR',
  '1-025': 'GASOLINA V-POWER',
  '2-001': 'DIESEL REGULAR',
  '2-025': 'DIESEL V-POWER',
};

/**
 * Reemplaza el código del producto según la tabla de mapeo
 * Si el producto no está en la tabla, retorna el nombre original
 *
 * @param productCode - Código del producto (ej: "1-025")
 * @returns Nombre del producto legible (ej: "GASOLINA V-POWER")
 */
export const mapFuelProductName = (productCode: string | undefined | null): string => {
  if (!productCode) return '';

  const mappedName = FUEL_PRODUCT_MAPPING[productCode.trim()];
  return mappedName || productCode;
};
