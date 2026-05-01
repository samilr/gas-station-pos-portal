/**
 * Tipos del endpoint admin 360°: GET /api/fuel-transactions/admin
 *
 * Devuelve fuel_transactions enriquecidas con la `trans` promovida (si existe)
 * y los `cardPayments` vinculados (si los hay).
 *
 * Estados derivables del cliente:
 *  - `trans == null` → fuel_transaction pendiente (no promovida).
 *  - `trans != null && cardPayments.length === 0` → cerrada en efectivo.
 *  - `trans != null && cardPayments.length > 0` → cerrada con tarjeta.
 *
 * Los importes en `trans`/`products`/`payments` ya vienen en valor absoluto;
 * el flag `isReturn` decide si la operación es venta o devolución.
 */

export interface TransProductAdmin {
  productId: string;
  productName: string;
  categoryId: string;
  isReturn: boolean;
  quantity: number;
  price: number;
  tax: number;
  total: number;
}

export interface TransPaymentAdmin {
  paymentId: string;
  type: string;
  line: number;
  isReturn: boolean;
  total: number;
}

export interface TransAdmin {
  transNumber: string;
  returnTransNumber: string | null;
  cfNumber: string | null;
  cfType: string | null;
  cfStatus: number;
  cfValidity: string | null;
  cfQr: string | null;
  terminalId: number;
  transDate: string;
  shift: number;
  staftId: number | null;
  siteId: string;
  storeId: string;
  status: number;
  isReturn: boolean;
  subtotal: number;
  tax: number;
  total: number;
  payment: number;
  taxpayerId: string | null;
  customerId: string | null;
  createdAt: string;
  createdBy: string | null;
  products: TransProductAdmin[];
  payments: TransPaymentAdmin[];
}

export interface CardPaymentAdmin {
  cardPaymentId: string;
  status: number;
  linkedTransNumber: string | null;
  linkedTransPaymLine: number | null;
  siteId: string;
  terminalId: number;
  dataphoneId: number;
  amountCents: number;
  taxCents: number;
  currencyId: string;
  authorizationNumber: string | null;
  reference: number | null;
  host: number | null;
  batch: number | null;
  cardProduct: string | null;
  maskedPan: string | null;
  holderName: string | null;
  providerStatus: string | null;
  transactionDateTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FuelTransactionAdmin {
  transactionId: number;
  pump: number;
  nozzle: number;
  hardwareTransactionId: number;
  volume: number;
  amount: number;
  price: number;
  transactionDate: string;
  fuelGradeId: number;
  fuelGradeName: string;
  siteId: string | null;
  ptsId: string | null;
  tag: string | null;
  staftId: number | null;
  staftName: string | null;
  isOffline: boolean;
  createdAt: string;
  trans: TransAdmin | null;
  cardPayments: CardPaymentAdmin[];
}

export interface FuelAdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FuelAdminStats {
  totalTransactions: number;
  totalVolume: number;
  totalAmount: number;
  linkedToTransCount: number;
  withCardPaymentCount: number;
}

export interface FuelAdminResponse {
  successful: boolean;
  data: FuelTransactionAdmin[];
  pagination?: FuelAdminPagination;
  statistics?: FuelAdminStats;
  error?: string;
}

// 0=SinEnviar, 1=Enviado, 2=Aceptado, 3=AceptadoCondicional, 4=Rechazado,
// 5=Repetido, 6=ErrorProveedor, 7=ErrorInterno, 10=DatosInvalidos, 12=Prepagado.
const cfStatusMap: Record<number, string> = {
  0: 'Sin enviar',
  1: 'Enviado',
  2: 'Aceptado',
  3: 'Aceptado condicional',
  4: 'Rechazado',
  5: 'Repetido',
  6: 'Error proveedor',
  7: 'Error interno',
  10: 'Datos inválidos',
  12: 'Prepagado',
};

export const cfStatusLabel = (status: number): string =>
  cfStatusMap[status] ?? `Desconocido (${status})`;

export const cfStatusBadgeClass = (status: number): string => {
  switch (status) {
    case 2: return 'bg-green-100 text-green-700';
    case 3: return 'bg-emerald-100 text-emerald-700';
    case 1: return 'bg-yellow-100 text-yellow-700';
    case 0: return 'bg-gray-100 text-gray-700';
    case 4: case 6: case 7: case 10: return 'bg-red-100 text-red-700';
    case 5: return 'bg-orange-100 text-orange-700';
    case 12: return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// 0=Pending, 1=Approved, 2=Declined, 3=Failed, 4=Voided, 5=Refunded,
// 6=LinkedToTrans, 7=PreAuthorized, 8=Captured, 9=CheckInAnnulled.
// NOTA: una venta normal aprobada permanece en `Approved` (1) aunque tenga
// `linkedTransNumber` poblado — el status no muta a `LinkedToTrans` en
// reconciliación.
const cardPaymentStatusMap: Record<number, string> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Declined',
  3: 'Failed',
  4: 'Voided',
  5: 'Refunded',
  6: 'LinkedToTrans',
  7: 'PreAuthorized',
  8: 'Captured',
  9: 'CheckInAnnulled',
};

export const cardPaymentStatusLabel = (status: number): string =>
  cardPaymentStatusMap[status] ?? `Desconocido (${status})`;

export const cardPaymentStatusBadgeClass = (status: number): string => {
  switch (status) {
    case 1: case 8: return 'bg-green-100 text-green-700';
    case 6: return 'bg-blue-100 text-blue-700';
    case 0: case 7: return 'bg-yellow-100 text-yellow-700';
    case 4: case 9: return 'bg-gray-100 text-gray-700';
    case 5: return 'bg-purple-100 text-purple-700';
    case 2: case 3: return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
