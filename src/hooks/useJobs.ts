import { useListJobsQuery } from '../store/api/jobsApi';
import { getErrorMessage } from '../store/api/baseApi';

const AUTO_REFRESH_MS = 15000;

export const useScheduledJobs = (autoRefresh: boolean = true) => {
  const { data, isLoading, error, refetch } = useListJobsQuery(undefined, {
    pollingInterval: autoRefresh ? AUTO_REFRESH_MS : 0,
  });

  return {
    jobs: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar jobs'),
    refresh: refetch,
    silentRefresh: refetch,
  };
};

export default useScheduledJobs;
