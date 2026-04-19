import { useCallback, useEffect, useRef, useState } from 'react';
import { jobsService, ScheduledJob } from '../services/jobsService';

const AUTO_REFRESH_MS = 15000;

export const useScheduledJobs = (autoRefresh: boolean = true) => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const loadJobs = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await jobsService.getJobs();
      if (res.successful) {
        setJobs(res.data || []);
      } else {
        setError(res.error || 'Error al cargar jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar jobs');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => loadJobs(false), [loadJobs]);
  const silentRefresh = useCallback(() => loadJobs(true), [loadJobs]);

  useEffect(() => {
    loadJobs(false);
  }, [loadJobs]);

  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = window.setInterval(() => {
      loadJobs(true);
    }, AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, loadJobs]);

  return { jobs, loading, error, refresh, silentRefresh };
};

export default useScheduledJobs;
