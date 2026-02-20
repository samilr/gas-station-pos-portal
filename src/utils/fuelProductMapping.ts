/**
 * Tabla de mapeo de productos de combustible
 * Mapea los códigos de producto que vienen de la API a nombres internos
 */
export const FUEL_PRODUCT_MAPPING: Record<string, string> = {
  '1-025': 'GASOLINA V-POWER',
  '1-001': 'GASOLINA REGULAR',
  '2-025': 'DISEL V-POWER',
  '2-001': 'DISEL REGULAR',
};

/**
 * Reemplaza el nombre del producto según la tabla de mapeo
 * Si el producto no está en la tabla, retorna el nombre original
 * 
 * @param productName - Nombre del producto original
 * @returns Nombre del producto mapeado o el original si no existe mapeo
 */
export const mapFuelProductName = (productName: string | undefined | null): string => {
  if (!productName) return '';
  
  // Buscar en la tabla de mapeo
  const mappedName = FUEL_PRODUCT_MAPPING[productName.trim()];
  
  // Si existe mapeo, retornar el nombre mapeado, sino retornar el original
  return mappedName || productName;
};


