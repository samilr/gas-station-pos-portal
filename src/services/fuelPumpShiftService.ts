import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import {
  IFuelPumpShift,
  ICreateFuelPumpShiftDto,
  ISubstituteFuelPumpShiftDto,
  IUpdateFuelPumpShiftDto,
  ICloseFuelPumpShiftDto,
} from '../types/fuelPumpShift';

export interface FuelPumpShiftListFilters {
  siteId: string;
  date: string;
  pumpId?: number;
}

const pkPath = (siteId: string, date: string, pumpId: number, shift: number, line?: number) => {
  const base = `fuel-pump-shifts/${encodeURIComponent(siteId)}/${date}/${pumpId}/${shift}`;
  return line === undefined ? base : `${base}/${line}`;
};

export const fuelPumpShiftService = {
  async list(filters: FuelPumpShiftListFilters): Promise<ApiResponse<IFuelPumpShift[]>> {
    const params = new URLSearchParams();
    params.append('siteId', filters.siteId);
    params.append('date', filters.date);
    if (filters.pumpId !== undefined && filters.pumpId !== null) {
      params.append('pumpId', String(filters.pumpId));
    }
    return apiGet<IFuelPumpShift[]>(buildApiUrl(`fuel-pump-shifts?${params.toString()}`));
  },

  async getOne(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    line: number
  ): Promise<ApiResponse<IFuelPumpShift>> {
    return apiGet<IFuelPumpShift>(buildApiUrl(pkPath(siteId, date, pumpId, shift, line)));
  },

  async create(data: ICreateFuelPumpShiftDto): Promise<ApiResponse<IFuelPumpShift>> {
    return apiPost<IFuelPumpShift>(buildApiUrl('fuel-pump-shifts'), data);
  },

  async substitute(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    data: ISubstituteFuelPumpShiftDto
  ): Promise<ApiResponse<IFuelPumpShift>> {
    return apiPost<IFuelPumpShift>(
      buildApiUrl(`${pkPath(siteId, date, pumpId, shift)}/substitute`),
      data
    );
  },

  async update(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    line: number,
    data: IUpdateFuelPumpShiftDto
  ): Promise<ApiResponse<IFuelPumpShift>> {
    return apiPut<IFuelPumpShift>(buildApiUrl(pkPath(siteId, date, pumpId, shift, line)), data);
  },

  async close(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    data: ICloseFuelPumpShiftDto
  ): Promise<ApiResponse<IFuelPumpShift>> {
    return apiPost<IFuelPumpShift>(
      buildApiUrl(`${pkPath(siteId, date, pumpId, shift)}/close`),
      data
    );
  },

  async reopen(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    line: number
  ): Promise<ApiResponse<IFuelPumpShift>> {
    return apiPost<IFuelPumpShift>(
      buildApiUrl(`${pkPath(siteId, date, pumpId, shift, line)}/reopen`)
    );
  },

  async remove(
    siteId: string,
    date: string,
    pumpId: number,
    shift: number,
    line: number
  ): Promise<ApiResponse<unknown>> {
    return apiDelete(buildApiUrl(pkPath(siteId, date, pumpId, shift, line)));
  },
};
