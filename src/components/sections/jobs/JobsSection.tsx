import React, { useEffect, useState } from 'react';
import {
  Play, RefreshCw, Edit, ClipboardList, PlayCircle,
  CheckCircle2, XCircle, AlertTriangle, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';
import useScheduledJobs from '../../../hooks/useJobs';
import {
  jobsService,
  ScheduledJob,
  JobRunStatus,
  jobRunStatusLabels,
} from '../../../services/jobsService';
import JobEditModal from './JobEditModal';
import JobExecutionsModal from './JobExecutionsModal';

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-DO', {
      timeZone: 'America/Santo_Domingo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
};

const formatDuration = (ms?: number | null): string => {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

interface StatusBadgeProps { job: ScheduledJob; }

const StatusBadge: React.FC<StatusBadgeProps> = ({ job }) => {
  if (job.lockedBy) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-2xs font-medium">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Corriendo
      </span>
    );
  }
  if (job.lastRunStatus == null) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 text-2xs font-medium">
        <Clock className="w-3 h-3" />
        Nunca ejecutado
      </span>
    );
  }
  switch (job.lastRunStatus) {
    case JobRunStatus.Success:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-2xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          OK
        </span>
      );
    case JobRunStatus.Failed:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 text-2xs font-medium" title={job.lastRunError || ''}>
          <XCircle className="w-3 h-3" />
          Falló
        </span>
      );
    case JobRunStatus.Timeout:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-700 text-2xs font-medium" title={job.lastRunError || ''}>
          <AlertTriangle className="w-3 h-3" />
          Timeout
        </span>
      );
    case JobRunStatus.Cancelled:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 text-2xs font-medium" title={job.lastRunError || ''}>
          Cancelado
        </span>
      );
    default:
      return <span className="text-2xs text-gray-500">{jobRunStatusLabels[job.lastRunStatus]}</span>;
  }
};

const JobsSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { jobs, loading, error, refresh, silentRefresh } = useScheduledJobs(true);
  const [search, setSearch] = useState('');
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [togglingJob, setTogglingJob] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<ScheduledJob | null>(null);
  const [executionsJob, setExecutionsJob] = useState<ScheduledJob | null>(null);

  useEffect(() => {
    setSubtitle('Gestión de jobs programados');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = jobs.filter(j => {
    const s = search.toLowerCase();
    return (
      j.name.toLowerCase().includes(s) ||
      j.displayName.toLowerCase().includes(s) ||
      (j.description || '').toLowerCase().includes(s)
    );
  });

  const enabledCount = jobs.filter(j => j.isEnabled).length;
  const runningCount = jobs.filter(j => j.lockedBy != null).length;
  const failedCount = jobs.filter(j => j.lastRunStatus === JobRunStatus.Failed || j.lastRunStatus === JobRunStatus.Timeout).length;

  const handleRun = async (job: ScheduledJob) => {
    if (runningJob) return;
    setRunningJob(job.name);
    const toastId = toast.loading(`Ejecutando ${job.displayName}...`);
    try {
      const res = await jobsService.runJob(job.name);
      if (res.successful && res.data) {
        const ex = res.data;
        if (ex.status === JobRunStatus.Success) {
          toast.success(`${job.displayName} ejecutado (${formatDuration(ex.durationMs)})${ex.outputSummary ? `\n${ex.outputSummary}` : ''}`, { id: toastId, duration: 5000 });
        } else if (ex.status === JobRunStatus.Cancelled) {
          toast(ex.errorMessage?.includes('lock held') ? 'Ya se está ejecutando, espera a que termine' : 'Ejecución cancelada', { id: toastId, icon: 'ℹ️', duration: 5000 });
        } else if (ex.status === JobRunStatus.Timeout) {
          toast.error(`Timeout: excedió ${job.timeoutSeconds}s`, { id: toastId, duration: 6000 });
        } else {
          toast.error(ex.errorMessage || `Falló: status ${ex.status}`, { id: toastId, duration: 6000 });
        }
      } else {
        toast.error(res.error || 'Error al ejecutar', { id: toastId, duration: 5000 });
      }
    } catch (err) {
      console.error('Error running job:', err);
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setRunningJob(null);
      silentRefresh();
    }
  };

  const handleToggleEnabled = async (job: ScheduledJob) => {
    if (togglingJob) return;
    setTogglingJob(job.name);
    try {
      const res = await jobsService.updateJob(job.name, { isEnabled: !job.isEnabled });
      if (res.successful) {
        toast.success(`${job.displayName}: ${!job.isEnabled ? 'habilitado' : 'deshabilitado'}`);
        silentRefresh();
      } else {
        toast.error(res.error || 'Error al cambiar estado');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setTogglingJob(null);
    }
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar jobs..."
        chips={[
          { label: 'Total', value: jobs.length, color: 'blue' },
          { label: 'Habilitados', value: enabledCount, color: 'green' },
          { label: 'Corriendo', value: runningCount, color: 'blue' },
          { label: 'Con errores', value: failedCount, color: 'red' },
        ]}
      >
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
      </Toolbar>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Job</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Cron</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Habilitado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Última corrida</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Duración</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Próxima</th>
                <th className="text-right px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && jobs.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-text-muted">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Cargando jobs...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-text-muted">
                  <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {search ? 'Sin resultados' : 'Sin jobs registrados'}
                </td></tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.jobId} className="h-9 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{job.displayName}</span>
                        <span className="text-2xs text-text-muted font-mono">{job.name}</span>
                      </div>
                    </td>
                    <td className="px-2 text-xs font-mono text-gray-700 whitespace-nowrap">{job.cronExpression}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={job.isEnabled}
                          onChange={() => handleToggleEnabled(job)}
                          disabled={togglingJob === job.name}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap"><StatusBadge job={job} /></td>
                    <td className="px-2 text-xs whitespace-nowrap text-gray-700">{formatDate(job.lastRunAt)}</td>
                    <td className="px-2 text-xs whitespace-nowrap text-gray-700">{formatDuration(job.lastRunDurationMs)}</td>
                    <td className="px-2 text-xs whitespace-nowrap text-gray-700">{formatDate(job.nextRunAt)}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <CompactButton
                          variant="icon"
                          onClick={() => setExecutionsJob(job)}
                          title="Ver historial"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-gray-600" />
                        </CompactButton>
                        <CompactButton
                          variant="icon"
                          onClick={() => setEditJob(job)}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                        <CompactButton
                          variant="primary"
                          onClick={() => handleRun(job)}
                          disabled={runningJob === job.name || job.lockedBy != null}
                          title={job.lockedBy != null ? 'Ya se está ejecutando' : 'Ejecutar ahora'}
                        >
                          {runningJob === job.name ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Ejecutar
                        </CompactButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-2xs text-text-muted px-1">
        Fechas mostradas en GMT-4 (Santo Domingo). Los cron se evalúan en UTC. Se actualiza cada 15 segundos.
      </p>

      <JobEditModal
        isOpen={!!editJob}
        onClose={() => setEditJob(null)}
        job={editJob}
        onSuccess={silentRefresh}
      />

      <JobExecutionsModal
        isOpen={!!executionsJob}
        onClose={() => setExecutionsJob(null)}
        job={executionsJob}
      />
    </div>
  );
};

export default JobsSection;
