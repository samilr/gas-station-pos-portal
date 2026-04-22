import { api, unwrapArray } from './baseApi';
import { ScheduledJob, JobExecution, UpdateJobRequest } from '../../services/jobsService';

export const jobsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listJobs: build.query<ScheduledJob[], void>({
      query: () => 'jobs',
      transformResponse: unwrapArray<ScheduledJob>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((j) => ({ type: 'Job' as const, id: j.jobId })),
              { type: 'Job' as const, id: 'LIST' },
            ]
          : [{ type: 'Job' as const, id: 'LIST' }],
    }),

    getJobExecutions: build.query<JobExecution[], { name: string; take?: number }>({
      query: ({ name, take = 50 }) => `jobs/${encodeURIComponent(name)}/executions?take=${take}`,
      transformResponse: unwrapArray<JobExecution>,
      providesTags: (_r, _e, arg) => [{ type: 'Job', id: `EXECS-${arg.name}` }],
    }),

    updateJob: build.mutation<unknown, { name: string; body: UpdateJobRequest }>({
      query: ({ name, body }) => ({ url: `jobs/${encodeURIComponent(name)}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }],
    }),

    runJob: build.mutation<JobExecution, string>({
      query: (name) => ({ url: `jobs/${encodeURIComponent(name)}/run`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, name) => [
        { type: 'Job', id: 'LIST' },
        { type: 'Job', id: `EXECS-${name}` },
      ],
    }),
  }),
});

export const {
  useListJobsQuery,
  useGetJobExecutionsQuery,
  useUpdateJobMutation,
  useRunJobMutation,
} = jobsApi;
