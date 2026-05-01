import { ITransactionResume, TransactionStatus, PaymentType, CFStatus } from '../types/transaction';

/**
 * Obtiene el texto del estado de la transacción basado en cfStatus
 */
export const getStatusText = (cfStatus: number): string => {
  switch (cfStatus) {
    case CFStatus.PENDING:
      return 'Pendiente';
    case CFStatus.ACCEPTED:
    case CFStatus.ACCEPTED_ALT:
      return 'Aceptada';
    case CFStatus.REJECTED:
      return 'Rechazada';
    case CFStatus.PREPAID:
      return 'Prepagada';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el color del estado de la transacción basado en cfStatus
 */
export const getStatusColor = (cfStatus: number): string => {
  switch (cfStatus) {
    case CFStatus.ACCEPTED:
    case CFStatus.ACCEPTED_ALT:
      return 'bg-green-100 text-green-800';
    case CFStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case CFStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case CFStatus.PREPAID:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtiene el texto del tipo de pago
 */
export const getPaymentTypeText = (type: number): string => {
  switch (type) {
    case PaymentType.CASH:
      return 'Efectivo';
    case PaymentType.CARD:
      return 'Tarjeta';
    case PaymentType.TRANSFER:
      return 'Transferencia';
    case PaymentType.ZATACA:
      return 'Zataca';
    case PaymentType.OTHER:
      return 'Otro';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el color del tipo de pago
 */
export const getPaymentTypeColor = (type: number): string => {
  switch (type) {
    case PaymentType.CASH:
      return 'bg-green-100 text-green-800';
    case PaymentType.CARD:
      return 'bg-blue-100 text-blue-800';
    case PaymentType.TRANSFER:
      return 'bg-purple-100 text-purple-800';
    case PaymentType.ZATACA:
      return 'bg-orange-100 text-orange-800';
    case PaymentType.OTHER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtiene el texto del tipo de CF
 */
export const getCfTypeText = (cfType: string | number): string => {
  // Convertir a string y limpiar espacios
  const cleanCfType = String(cfType).trim();
  
  switch (cleanCfType) {
    case "31":
      return "Factura de Crédito Fiscal Electrónico";
    case "32":
      return "Factura de Consumo Electrónico";
    case "34":
      return "Factura de Nota de Crédito Electrónica";
    case "43":
      return "Factura de Gastos Menores Electrónico";
    case "44":
      return "Factura de Régimen Especial Electrónico";
    case "45":
      return "Factura Gubernamental Electrónico";
    default:
      return "Tipo no especificado";
  }
};

export const getTipoComprobante = (type: string) => {
  let typeDescription = "";
  switch (type) {
    case "31":
      typeDescription = "Factura de Crédito Fiscal Electrónico";
      break;
    case "32":
      typeDescription = "Factura de Consumo Electrónico";
      break;
    case "34":
      typeDescription = "Factura de Nota de Crédito Electrónica";
      break;
    case "43":
      typeDescription = "Factura de Gastos Menores Electrónico";
      break;
    case "44":
      typeDescription = "Factura de Régimen Especial Electrónico";
      break;
    case "45":
      typeDescription = "Factura Gubernamental Electrónico";
      break;
    default:
      typeDescription = "Tipo no especificado";
      break;
  }

  return typeDescription;
};

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Formatea una fecha ISO a solo fecha
 */
export const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha ISO a solo hora
 */
export const formatTimeOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

export const formatCurrencyInternational = (amount: number): string => {
  if (isNaN(amount)) return '0.00';
  
  return new Intl.NumberFormat('es-DO', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(amount);
}

/**
 * Filtra transacciones por término de búsqueda
 */
export const filterTransactionsBySearch = (
  transactions: ITransactionResume[],
  searchTerm: string
): ITransactionResume[] => {
  if (!searchTerm.trim()) return transactions;

  const term = searchTerm.toLowerCase();
  
  return transactions.filter(transaction => 
    (transaction.transNumber && transaction.transNumber.toLowerCase().includes(term)) ||
    (transaction.cfNumber && transaction.cfNumber.toLowerCase().includes(term)) ||
    (transaction.taxpayerName && transaction.taxpayerName.toLowerCase().includes(term)) ||
    (transaction.taxpayerId && transaction.taxpayerId.includes(term)) ||
    (transaction.staftName && transaction.staftName.toLowerCase().includes(term))
  );
};

/**
 * Filtra transacciones por estado basado en cfStatus
 */
export const filterTransactionsByStatus = (
  transactions: ITransactionResume[],
  cfStatus: number | ''
): ITransactionResume[] => {
  if (cfStatus === '') return transactions;
  
  return transactions.filter(transaction => transaction.cfStatus === cfStatus);
};

/**
 * Obtiene el total de productos en una transacción
 */
export const getTotalProducts = (transaction: ITransactionResume): number => {
  return transaction.prods.reduce((total, product) => total + product.quantity, 0);
};

/**
 * Verifica si una transacción es una devolución
 */
export const isReturnTransaction = (transaction: ITransactionResume): boolean => {
  return transaction.isReturn || transaction.cfType === '04';
};

/**
 * Obtiene el icono apropiado para el tipo de transacción
 */
export const getTransactionIcon = (transaction: ITransactionResume): string => {
  if (isReturnTransaction(transaction)) {
    return '🔄'; // Icono de devolución
  }
  
  switch (transaction.status) {
    case TransactionStatus.COMPLETED:
      return '✅';
    case TransactionStatus.PENDING:
      return '⏳';
    case TransactionStatus.FAILED:
      return '❌';
    case TransactionStatus.CANCELLED:
      return '🚫';
    default:
      return '📄';
  }
};

/**
 * Obtiene la fecha actual en zona horaria de Santo Domingo, República Dominicana
 */
export const getSantoDomingoDate = (): string => {
  const today = new Date();
  // Obtener la fecha en zona horaria de Santo Domingo
  const santoDomingoDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Santo_Domingo"}));
  
  // Formatear la fecha como YYYY-MM-DD
  const year = santoDomingoDate.getFullYear();
  const month = String(santoDomingoDate.getMonth() + 1).padStart(2, '0');
  const day = String(santoDomingoDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha a zona horaria de Santo Domingo
 */
export const convertToSantoDomingoTime = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(date.toLocaleString("en-US", {timeZone: "America/Santo_Domingo"}));
};

/**
 * Obtiene la fecha actual de Santo Domingo de forma más directa
 */
export const getCurrentSantoDomingoDate = (): string => {
  const now = new Date();
  
  // Usar Intl.DateTimeFormat para obtener la fecha en zona horaria de Santo Domingo
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // El formato 'en-CA' devuelve YYYY-MM-DD
  return formatter.format(now);
};
