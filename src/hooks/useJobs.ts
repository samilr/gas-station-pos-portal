import { useCallback, useState } from 'react';
import jobsService from '../services/jobsService';

export type JobStatus = 'idle' | 'running' | 'success' | 'error';

export interface JobState {
  status: JobStatus;
  message?: string;
  error?: string;
  lastRunAt?: string;
}

const initial: JobState = { status: 'idle' };

export function useJobs() {
  const [encf, setEncf] = useState<JobState>(initial);
  const [taxpayers, setTaxpayers] = useState<JobState>(initial);

  const runEncfStatus = useCallback(async () => {
    setEncf({ status: 'running' });
    const res = await jobsService.getEncfStatus();
    const now = new Date().toISOString();
    if (res.successful) {
      setEncf({ status: 'success', message: res.message, lastRunAt: now });
    } else {
      setEncf({ status: 'error', error: res.error || 'Error al ejecutar el job', lastRunAt: now });
    }
    return res;
  }, []);

  const runDownloadTaxpayers = useCallback(async () => {
    setTaxpayers({ status: 'running' });
    const res = await jobsService.downloadTaxpayers();
    const now = new Date().toISOString();
    if (res.successful) {
      setTaxpayers({
        status: 'success',
        message: res.inserted !== undefined
          ? `${res.inserted.toLocaleString()} contribuyentes insertados`
          : 'Descarga completada',
        lastRunAt: now,
      });
    } else {
      setTaxpayers({ status: 'error', error: res.error || 'Error al ejecutar el job', lastRunAt: now });
    }
    return res;
  }, []);

  return { encf, taxpayers, runEncfStatus, runDownloadTaxpayers };
}

export default useJobs;
