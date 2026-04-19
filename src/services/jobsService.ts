import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPatch, ApiResponse } from './apiInterceptor';

export enum JobRunStatus {
  Idle = 0,
  Running = 1,
  Success = 2,
  Failed = 3,
  Timeout = 4,
  Cancelled = 5,
}

export enum JobTriggerType {
  Scheduled = 0,
  Manual = 1,
}

export interface ScheduledJob {
  jobId: number;
  name: string;
  displayName: string;
  description?: string | null;
  cronExpression: string;
  isEnabled: boolean;
  timeoutSeconds: number;
  lastRunAt?: string | null;
  lastRunStatus?: JobRunStatus | null;
  lastRunDurationMs?: number | null;
  lastRunError?: string | null;
  nextRunAt?: string | null;
  lockedBy?: string | null;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface JobExecution {
  executionId: number;
  jobId: number;
  jobName: string;
  startedAt: string;
  finishedAt?: string | null;
  status: JobRunStatus;
  triggerType: JobTriggerType;
  triggeredByUserId?: number | null;
  hostName?: string | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  outputSummary?: string | null;
}

export interface UpdateJobRequest {
  displayName?: string | null;
  description?: string | null;
  cronExpression?: string | null;
  isEnabled?: boolean | null;
  timeoutSeconds?: number | null;
}

export const jobsService = {
  async getJobs(): Promise<ApiResponse<ScheduledJob[]>> {
    return await apiGet<ScheduledJob[]>(buildApiUrl('jobs'));
  },

  async getJob(name: string): Promise<ApiResponse<ScheduledJob>> {
    return await apiGet<ScheduledJob>(buildApiUrl(`jobs/${encodeURIComponent(name)}`));
  },

  async getExecutions(name: string, take: number = 50): Promise<ApiResponse<JobExecution[]>> {
    return await apiGet<JobExecution[]>(
      buildApiUrl(`jobs/${encodeURIComponent(name)}/executions?take=${take}`)
    );
  },

  async getExecution(executionId: number): Promise<ApiResponse<JobExecution>> {
    return await apiGet<JobExecution>(buildApiUrl(`jobs/executions/${executionId}`));
  },

  async updateJob(name: string, data: UpdateJobRequest): Promise<ApiResponse<ScheduledJob>> {
    return await apiPatch<ScheduledJob>(buildApiUrl(`jobs/${encodeURIComponent(name)}`), data);
  },

  async runJob(name: string): Promise<ApiResponse<JobExecution>> {
    return await apiPost<JobExecution>(buildApiUrl(`jobs/${encodeURIComponent(name)}/run`), {});
  },
};

export const jobRunStatusLabels: Record<JobRunStatus, string> = {
  [JobRunStatus.Idle]: 'Nunca ejecutado',
  [JobRunStatus.Running]: 'En ejecución',
  [JobRunStatus.Success]: 'Exitoso',
  [JobRunStatus.Failed]: 'Falló',
  [JobRunStatus.Timeout]: 'Timeout',
  [JobRunStatus.Cancelled]: 'Cancelado',
};

export const jobTriggerLabels: Record<JobTriggerType, string> = {
  [JobTriggerType.Scheduled]: 'Automático',
  [JobTriggerType.Manual]: 'Manual',
};

export default jobsService;
