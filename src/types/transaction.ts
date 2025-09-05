export interface ITransactionResume {
  transNumber: string;
  cfNumber: string;
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
  REJECTED = 4    // Rechazada
}

export enum PaymentType {
  CASH = 1,
  CARD = 2,
  TRANSFER = 3,
  ZATACA = 4,
  OTHER = 5
}
