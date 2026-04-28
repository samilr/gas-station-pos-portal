export interface IPeriodStaft {
  siteId: string;
  date: string;
  shift: number;
  staftId: number;
  isManager: boolean;
  entryHour: string;
  departureHour: string;
  terminalId: number | null;
  staftGroupId: number | null;
  sectorId: number | null;
  cashFund: number;
  statementNumber: number | null;
  closed: boolean;
  closedAt: string | null;
}

export interface ICreatePeriodStaftDto {
  siteId: string;
  date: string;
  shift: number;
  staftId: number;
  isManager: boolean;
  entryHour: string;
  departureHour: string;
  terminalId?: number | null;
  staftGroupId?: number | null;
  sectorId?: number | null;
  cashFund: number;
  statementNumber?: number | null;
}

export interface IUpdatePeriodStaftDto {
  isManager?: boolean;
  entryHour?: string;
  departureHour?: string;
  terminalId?: number | null;
  staftGroupId?: number | null;
  sectorId?: number | null;
  cashFund?: number;
  statementNumber?: number | null;
  closed?: boolean;
  closedAt?: string | null;
}

export interface IDuplicatePeriodStaftDto {
  siteId: string;
  sourceDate: string;
  targetDate: string;
  shift?: number | null;
  overwrite?: boolean;
}

export interface IDuplicatePeriodStaftResult {
  siteId: string;
  sourceDate: string;
  targetDate: string;
  shift: number | null;
  copied: number;
  skipped: number;
  replaced: number;
}

export interface IPeriodStaftFilters {
  siteId?: string;
  startDate?: string;
  endDate?: string;
  shift?: number;
}

export interface IShiftCandidate {
  staftId: number;
  terminalId: number | null;
  entryHour: string;
  departureHour: string;
}

export interface IShiftCandidatesResponse {
  transactionId: number;
  siteId: string | null;
  scheduleDate: string;
  effectiveScheduleDate?: string | null;
  fallbackApplied?: boolean;
  shift: number | null;
  currentStaftId: number | null;
  candidates: IShiftCandidate[];
  reason?: string;
}

export const SHIFT_LABELS: Record<number, string> = {
  1: 'Turno 1 (06-14)',
  2: 'Turno 2 (14-22)',
  3: 'Turno 3 (22-06)',
};
