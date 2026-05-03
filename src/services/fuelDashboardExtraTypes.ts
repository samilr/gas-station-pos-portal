/**
 * Tipos para los 6 endpoints nuevos de dashboard fuel-based:
 *  - GET /api/fuel-transactions/dashboard/payment-methods
 *  - GET /api/fuel-transactions/dashboard/by-staft
 *  - GET /api/fuel-transactions/dashboard/by-staft-by-day
 *  - GET /api/fuel-transactions/dashboard/period-comparison
 *  - GET /api/fuel-transactions/dashboard/heatmap
 *  - GET /api/fuel-transactions/dashboard/by-shift
 *
 * Todos comparten el envelope { successful, filters, data } y los query params
 * `startDate`, `endDate`, `siteId`, `excludeOffline`.
 */

export interface PaymentMethodRow {
  paymentId: string;
  paymentName: string;
  txCount: number;
  amount: number;
  sharePct: number;
}

export interface ByStaftRow {
  staftId: number | null;
  staftName: string | null;
  txCount: number;
  volume: number;
  amount: number;
  avgTicket: number;
}

export interface ByStaftByDayRow {
  date: string;
  staftId: number | null;
  staftName: string | null;
  txCount: number;
  volume: number;
  amount: number;
}

export interface PeriodKpis {
  txCount: number;
  totalVolume: number;
  totalAmount: number;
  avgTicket: number;
  uniquePumps: number;
  uniqueSites: number;
}

export interface PeriodRange {
  startDate: string;
  endDate: string;
  siteId: string | null;
  excludeOffline: boolean;
}

export interface PeriodComparisonResult {
  current: PeriodKpis;
  previous: PeriodKpis;
  currentRange: PeriodRange;
  previousRange: PeriodRange;
  change: {
    txCountChangePct: number | null;
    volumeChangePct: number | null;
    amountChangePct: number | null;
    avgTicketChangePct: number | null;
  };
}

export interface HeatmapCell {
  /** 0 = lunes, 6 = domingo */
  dayOfWeek: number;
  /** 0..23 */
  hour: number;
  txCount: number;
  amount: number;
}

export interface ByShiftRow {
  shiftNumber: number;
  /** "HHMMSS" — ej. "060000" = 06:00 */
  entryHour: string | null;
  /** "HHMMSS" */
  departureHour: string | null;
  txCount: number;
  volume: number;
  amount: number;
  avgTicket: number;
  topStaftId: number | null;
  topStaftName: string | null;
  topStaftAmount: number;
}
