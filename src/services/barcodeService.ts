import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IBarcode, ICreateBarcodeDto, IUpdateBarcodeDto } from '../types/barcode';

export const barcodeService = {
  async getBarcodes(): Promise<ApiResponse<IBarcode[]>> {
    return apiGet<IBarcode[]>(buildApiUrl('barcodes'));
  },
  async getBarcodeById(barcodeId: string): Promise<ApiResponse<IBarcode>> {
    return apiGet<IBarcode>(buildApiUrl(`barcodes/${barcodeId}`));
  },
  async createBarcode(data: ICreateBarcodeDto): Promise<ApiResponse<IBarcode>> {
    return apiPost<IBarcode>(buildApiUrl('barcodes'), data);
  },
  async updateBarcode(barcodeId: string, data: IUpdateBarcodeDto): Promise<ApiResponse<IBarcode>> {
    return apiPut<IBarcode>(buildApiUrl(`barcodes/${encodeURIComponent(barcodeId)}`), data);
  },
  async deleteBarcode(barcodeId: string): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`barcodes/${encodeURIComponent(barcodeId)}`));
  },
};
