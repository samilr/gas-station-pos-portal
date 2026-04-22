/**
 * Tipos para el dominio de fuel transactions.
 * Los métodos CRUD viven ahora en:
 *   - `src/store/api/fuelTransactionsApi.ts` (lista + assign staft + shift candidates)
 *   - `src/store/api/fuelDashboardApi.ts` (endpoints de dashboard de combustible)
 */

export interface FuelTransaction {
  transactionId: number;
  pump: number;
  nozzle: number;
  hardwareTransactionId: number;
  volume: number;
  amount: number;
  price: number;
  totalVolume: number;
  totalAmount: number;
  transactionDate: string;
  transactionDateStart: string;
  tag: string | null;
  ptsId: string;
  fuelGradeId: number;
  fuelGradeName: string;
  tank: number;
  userId: number;
  tcVolume: number;
  flowRate: number;
  isOffline: boolean;
  pumpTransactionsUploaded: number;
  pumpTransactionsTotal: number;
  configurationId: string;
  createdAt: string;
  staftId?: number | null;
  siteId?: string | null;
}

export interface FuelTransactionsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FuelStats {
  totalTransactions: number;
  totalVolume: number;
  totalAmount: number;
}

export interface FuelTransactionsResponse {
  successful: boolean;
  data: FuelTransaction[];
  pagination?: FuelTransactionsPagination;
  statistics?: FuelStats;
  error?: string;
}

// ============================================================
// Dashboard de combustible
// ============================================================

export interface FuelDashboardFilters {
  startDate?: string;
  endDate?: string;
  siteId?: string | null;
  excludeOffline?: boolean;
}

export interface FuelSummary {
  txCount: number;
  totalVolume: number;
  totalAmount: number;
  avgTicket: number;
  uniquePumps: number;
  uniqueSites: number;
}

export interface FuelDailyTrendRow {
  date: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelByPumpRow {
  pump: number;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelByFuelGradeRow {
  fuelGradeId: number;
  fuelGradeName: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelHourlyRow {
  hour: number;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelBySiteRow {
  siteId: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelTopTransactionRow {
  transactionId: number;
  pump: number;
  nozzle: number;
  fuelGradeName: string;
  volume: number;
  amount: number;
  price: number;
  transactionDate: string;
  siteId: string | null;
  ptsId: string | null;
}
