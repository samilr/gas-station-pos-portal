import { buildApiUrl } from '../config/api';
import { apiPost, ApiResponse } from './apiInterceptor';

export interface ReconcileStaftRequest {
  siteId: string;
  startDate: string;
  endDate: string;
  pumpId?: number | null;
}

export interface ReconcileStaftResult {
  siteId: string;
  startDate: string;
  endDate: string;
  pumpId: number | null;
  totalCandidates: number;
  updated: number;
  noShiftFound: number;
  noAssignmentFound: number;
}

export const fuelTransactionReconcileService = {
  async reconcileStaft(
    body: ReconcileStaftRequest
  ): Promise<ApiResponse<ReconcileStaftResult>> {
    return apiPost<ReconcileStaftResult>(
      buildApiUrl('fuel-transactions/reconcile-staft'),
      {
        siteId: body.siteId,
        startDate: body.startDate,
        endDate: body.endDate,
        pumpId: body.pumpId ?? null,
      }
    );
  },
};
