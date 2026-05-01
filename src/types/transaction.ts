export interface ITransactionResume {
  categoryId: string;
  transNumber: string;
  cfNumber: string;
  returnCfNumber: string,
  returnTransNUmber: string,
  cfValidity: string;
  cfType: string; 
  transDate: string;
  siteId: string;
  siteName: string;
  shift: number;
  terminalId: number;
  status: number;
  cfStatus: number; // Nueva propiedad para el estado del CF
  isReturn: boolean;
  subtotal: number;
  tax: number;
  total: number;
  taxpayerName: string | null;
  taxpayerId: string;
  staftId: number;
  staftName: string;
  cfQr: string | null;
  cfSecurityCode: string | null;
  digitalSignatureDate: string | null;
  prods: IProductResume[];
  payms: IPaymentResume[];
  zataca?: IZatacaData;
}

export interface IProductResume {
  productId: string;
  categoryId: string;
  isReturn: boolean;
  productName: string;
  quantity: number;
  price: number;
  tax: number;
  total: number;
}

export interface IPaymentResume {
  paymentId: string;
  isReturn: boolean;
  type: number;
  total: number;
}

export interface IZatacaData {
  operator: string;              
  amount: number;                
  localReferenceNumber: string; 
  phoneNumber: string;
  zProductId: string;          
}

// Tipos auxiliares para el estado de la transacción
export enum TransactionStatus {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
  CANCELLED = 3
}

// Nuevo enum para el estado del CF según la API
export enum CFStatus {
  PENDING = 0,    // Pendiente
  ACCEPTED = 2,   // Aceptada
  ACCEPTED_ALT = 3, // Aceptada (alternativo)
  REJECTED = 4,   // Rechazada
  PREPAID = 12    // Prepagada (Shell Card / Tickets — no se reporta a DGII)
}

export enum PaymentType {
  CASH = 1,
  CARD = 2,
  TRANSFER = 3,
  ZATACA = 4,
  OTHER = 5
}

// Interfaces para paginación y estadísticas del servidor
export interface IPaginationMeta {
  page: number;           // Página actual
  limit: number;          // Resultados por página
  total: number;          // Total de registros
  totalPages: number;     // Total de páginas
  hasNext: boolean;       // ¿Hay página siguiente?
  hasPrev: boolean;       // ¿Hay página anterior?
}

export interface ITransactionStatistics {
  totalTransactions: number;           // Total de transacciones
  totalSalesTransactions: number;      // Cantidad de ventas (isReturn = false)
  totalReturnTransactions: number;     // Cantidad de retornos (isReturn = true)
  totalSales: number;                  // Suma total de ventas
  totalReturn: number;                  // Suma total de retornos
  dgiiAcceptedTransactions: number;     // Transacciones aceptadas por DGII (cfStatus: 2, 3)
  dgiiRejectedTransactions: number;     // Transacciones rechazadas por DGII (cfStatus: 4)
  dgiiPendingTransactions: number;      // Transacciones pendientes (cfStatus: 0, 1, 5, 6, 7, 8 o NULL)
}

export interface IPaginatedTransactionsResponse {
  successful: boolean;
  data: ITransactionResume[];
  pagination: IPaginationMeta;
  statistics: ITransactionStatistics;
}

// Interfaces para el Dashboard
export interface ISalesAndReturnsSummary {
  totalSales: number;        // Total de ventas
  totalReturn: number;        // Total de retornos
  countSales: number;         // Cantidad de transacciones de ventas
  countReturns: number;       // Cantidad de transacciones de retornos
}

export interface IDailySales {
  dayOfMonth: string;         // Fecha en formato DATE (YYYY-MM-DD)
  totalSales: number;         // Total de ventas del día
}

export interface ITopTransaction {
  transNumber: string;         // Número de transacción
  cfNumber: string;            // Número de e-NCF
  transType: number;           // Tipo de transacción
  total: number;               // Monto total
  taxpayerId: string;          // RNC/Cédula del contribuyente
  taxpayerName: string | null; // Nombre del contribuyente
  siteId: string;              // ID de la sucursal
  siteName: string;            // Nombre de la sucursal
  date: string;                // Fecha de la transacción
}

export interface ITopProduct {
  productName: string;          // Nombre del producto
  total: number;               // Total vendido (monto)
  quantity: number;            // Cantidad vendida
}

export interface ISalesBySite {
  siteId: string;              // ID de la sucursal
  siteName: string;            // Nombre de la sucursal
  total: number;               // Total de ventas de la sucursal
}