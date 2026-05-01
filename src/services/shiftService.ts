import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IShift, ICreateShiftDto, IUpdateShiftDto } from '../types/shift';

export const shiftService = {
  async listShifts(): Promise<ApiResponse<IShift[]>> {
    return apiGet<IShift[]>(buildApiUrl('shifts'));
  },
  async getShift(shiftNumber: number): Promise<ApiResponse<IShift>> {
    return apiGet<IShift>(buildApiUrl(`shifts/${shiftNumber}`));
  },
  async createShift(data: ICreateShiftDto): Promise<ApiResponse<IShift>> {
    return apiPost<IShift>(buildApiUrl('shifts'), data);
  },
  async updateShift(shiftNumber: number, data: IUpdateShiftDto): Promise<ApiResponse<IShift>> {
    return apiPut<IShift>(buildApiUrl(`shifts/${shiftNumber}`), data);
  },
  async deleteShift(shiftNumber: number): Promise<ApiResponse<unknown>> {
    return apiDelete(buildApiUrl(`shifts/${shiftNumber}`));
  },
};
