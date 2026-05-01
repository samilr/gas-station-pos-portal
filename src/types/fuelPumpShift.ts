export interface IFuelPumpShift {
  companyId: number;
  siteId: string;
  date: string;
  pumpId: number;
  shift: number;
  line: number;
  staftId: number;
  isOpen: boolean;
  openedAt: string;
  closedAt: string | null;
  closedByStaftId: number | null;
}

export interface ICreateFuelPumpShiftDto {
  siteId: string;
  date: string;
  pumpId: number;
  shift: number;
  staftId: number;
}

export interface ISubstituteFuelPumpShiftDto {
  newStaftId: number;
  closedByStaftId: number;
}

export interface IUpdateFuelPumpShiftDto {
  staftId: number;
}

export interface ICloseFuelPumpShiftDto {
  closedByStaftId: number;
}
