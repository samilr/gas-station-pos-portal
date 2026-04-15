import { buildApiUrl } from '../config/api';
import { apiGet, apiPost } from './apiInterceptor';

export interface EncfStatusJobResult {
  successful: boolean;
  message?: string;
  error?: string;
}

export interface DownloadTaxpayersJobResult {
  successful: boolean;
  inserted?: number;
  error?: string;
}

class JobsService {
  async getEncfStatus(): Promise<EncfStatusJobResult> {
    const res = await apiGet<any>(buildApiUrl('jobs/getEncfStatus'));
    const raw: any = res.data;
    return {
      successful: res.successful,
      message: raw?.message ?? (res.successful ? 'Reconciliación DGII ejecutada' : undefined),
      error: res.error,
    };
  }

  async downloadTaxpayers(): Promise<DownloadTaxpayersJobResult> {
    const res = await apiPost<any>(buildApiUrl('jobs/downloadTaxpayers'));
    const raw: any = res.data;
    return {
      successful: res.successful,
      inserted: typeof raw?.inserted === 'number' ? raw.inserted : undefined,
      error: res.error,
    };
  }
}

const jobsService = new JobsService();
export default jobsService;
