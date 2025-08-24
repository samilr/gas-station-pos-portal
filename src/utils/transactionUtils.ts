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
    case '01':
    case '1':
      return 'Factura Consumidor Final';
    case '02':
    case '2':
      return 'Factura de Crédito Fiscal';
    case '03':
    case '3':
      return 'Nota de Débito';
    case '04':
    case '4':
      return 'Nota de Crédito';
    default:
      console.warn(`Tipo de CF no reconocido: "${cfType}" (tipo: ${typeof cfType})`);
      return `Tipo ${cleanCfType}`;
  }
};

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea una fecha ISO a solo fecha
 */
export const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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
