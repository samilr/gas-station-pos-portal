export interface IShift {
  shiftNumber: number;
  entryHour: string | null;
  departureHour: string | null;
  wrapsMidnight: boolean;
}

export interface ICreateShiftDto {
  shiftNumber: number;
  entryHour?: string | null;
  departureHour?: string | null;
}

export interface IUpdateShiftDto {
  entryHour?: string | null;
  departureHour?: string | null;
}
