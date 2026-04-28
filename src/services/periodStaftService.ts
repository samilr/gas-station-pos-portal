import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import {
  IPeriodStaft,
  ICreatePeriodStaftDto,
  IUpdatePeriodStaftDto,
  IDuplicatePeriodStaftDto,
  IDuplicatePeriodStaftResult,
  IPeriodStaftFilters,
} from '../types/periodStaft';

const toDatePath = (date: string): string => {
  // La API acepta YYYY-MM-DD. Si viene ISO datetime, recortamos la fecha.
  if (!date) return date;
  return date.length >= 10 ? date.substring(0, 10) : date;
};

const pkPath = (siteId: string, date: string, shift: number, staftId: number): string =>
  `period-staft/${encodeURIComponent(siteId)}/${toDatePath(date)}/${shift}/${staftId}`;

export const periodStaftService = {
  async list(filters?: IPeriodStaftFilters): Promise<ApiResponse<IPeriodStaft[]>> {
    const qs = new URLSearchParams();
    if (filters?.siteId) qs.append('siteId', filters.siteId);
    if (filters?.startDate) qs.append('startDate', toDatePath(filters.startDate));
    if (filters?.endDate) qs.append('endDate', toDatePath(filters.endDate));
    if (filters?.shift !== undefined && filters.shift !== null) qs.append('shift', String(filters.shift));
    const url = buildApiUrl(`period-staft${qs.toString() ? `?${qs.toString()}` : ''}`);
    const res = await apiGet<any>(url);
    const raw = res.data;
    const items: IPeriodStaft[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];
    return { successful: res.successful, data: items, error: res.error };
  },

  async getOne(siteId: string, date: string, shift: number, staftId: number): Promise<ApiResponse<IPeriodStaft>> {
    return apiGet<IPeriodStaft>(buildApiUrl(pkPath(siteId, date, shift, staftId)));
  },

  async create(data: ICreatePeriodStaftDto): Promise<ApiResponse<IPeriodStaft>> {
    const body = { ...data, date: toDatePath(data.date) };
    return apiPost<IPeriodStaft>(buildApiUrl('period-staft'), body);
  },

  async update(
    siteId: string,
    date: string,
    shift: number,
    staftId: number,
    data: IUpdatePeriodStaftDto,
  ): Promise<ApiResponse<IPeriodStaft>> {
    return apiPut<IPeriodStaft>(buildApiUrl(pkPath(siteId, date, shift, staftId)), data);
  },

  async remove(siteId: string, date: string, shift: number, staftId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(pkPath(siteId, date, shift, staftId)));
  },

  async duplicate(data: IDuplicatePeriodStaftDto): Promise<ApiResponse<IDuplicatePeriodStaftResult>> {
    const body = {
      ...data,
      sourceDate: toDatePath(data.sourceDate),
      targetDate: toDatePath(data.targetDate),
    };
    return apiPost<IDuplicatePeriodStaftResult>(buildApiUrl('period-staft/duplicate'), body);
  },
};
