import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IPayment, ICreatePaymentDto, IUpdatePaymentDto } from '../types/payment';

export const paymentService = {
  async getPayments(): Promise<ApiResponse<IPayment[]>> {
    return apiGet<IPayment[]>(buildApiUrl('payments'));
  },
  async getPaymentById(paymentId: string): Promise<ApiResponse<IPayment>> {
    return apiGet<IPayment>(buildApiUrl(`payments/${encodeURIComponent(paymentId)}`));
  },
  async createPayment(data: ICreatePaymentDto): Promise<ApiResponse<IPayment>> {
    return apiPost<IPayment>(buildApiUrl('payments'), data);
  },
  async updatePayment(paymentId: string, data: IUpdatePaymentDto): Promise<ApiResponse<IPayment>> {
    return apiPut<IPayment>(buildApiUrl(`payments/${encodeURIComponent(paymentId)}`), data);
  },
  async deletePayment(paymentId: string): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`payments/${encodeURIComponent(paymentId)}`));
  },
};
