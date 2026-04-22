/**
 * Tipos y enums para el dominio de scheduled jobs.
 * Los métodos CRUD viven ahora en `src/store/api/jobsApi.ts` (RTK Query).
 */

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
