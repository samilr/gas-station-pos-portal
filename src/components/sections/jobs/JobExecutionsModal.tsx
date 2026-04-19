import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, X, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import {
  jobsService,
  JobExecution,
  JobRunStatus,
  JobTriggerType,
  jobRunStatusLabels,
  jobTriggerLabels,
  ScheduledJob,
} from '../../../services/jobsService';
import { CompactButton } from '../../ui';

interface JobExecutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ScheduledJob | null;
}

const statusColor = (s: JobRunStatus): string => {
  switch (s) {
    case JobRunStatus.Success: return 'text-green-600 bg-green-50 border-green-200';
    case JobRunStatus.Failed: return 'text-red-600 bg-red-50 border-red-200';
    case JobRunStatus.Timeout: return 'text-orange-600 bg-orange-50 border-orange-200';
    case JobRunStatus.Running: return 'text-blue-600 bg-blue-50 border-blue-200';
    case JobRunStatus.Cancelled: return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

const formatDuration = (ms?: number | null): string => {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

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

const JobExecutionsModal: React.FC<JobExecutionsModalProps> = ({ isOpen, onClose, job }) => {
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    try {
      const res = await jobsService.getExecutions(job.name, 100);
      if (res.successful) {
        setExecutions(res.data || []);
      } else {
        setError(res.error || 'Error al cargar ejecuciones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejecuciones');
    } finally {
      setLoading(false);
    }
  }, [job]);

  useEffect(() => {
    if (isOpen && job) {
      setExpandedId(null);
      load();
    }
  }, [isOpen, job, load]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Historial de ejecuciones</h3>
              <p className="text-2xs text-text-muted">{job.displayName} · <span className="font-mono">{job.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CompactButton variant="ghost" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </CompactButton>
            <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-3 p-2 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700">{error}</div>
          )}

          {loading && executions.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-text-muted">
              <ClipboardList className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Sin ejecuciones registradas</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border sticky top-0">
                  <th className="w-6"></th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Inicio</th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Tipo</th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Duración</th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Host</th>
                  <th className="text-left px-2 text-xs font-medium text-gray-500">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((ex) => {
                  const isExpanded = expandedId === ex.executionId;
                  const hasDetail = ex.errorMessage || ex.outputSummary;
                  return (
                    <React.Fragment key={ex.executionId}>
                      <tr
                        className={`h-8 border-b border-table-border hover:bg-row-hover transition-colors ${hasDetail ? 'cursor-pointer' : ''}`}
                        onClick={() => hasDetail && setExpandedId(isExpanded ? null : ex.executionId)}
                      >
                        <td className="px-1 text-center">
                          {hasDetail && (isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />)}
                        </td>
                        <td className="px-2 text-xs whitespace-nowrap font-mono">{formatDate(ex.startedAt)}</td>
                        <td className="px-2 text-xs whitespace-nowrap">
                          <span className={`inline-block px-1.5 py-0.5 rounded border text-2xs font-medium ${statusColor(ex.status)}`}>
                            {jobRunStatusLabels[ex.status]}
                          </span>
                        </td>
                        <td className="px-2 text-xs whitespace-nowrap text-gray-700">
                          {jobTriggerLabels[ex.triggerType as JobTriggerType]}
                        </td>
                        <td className="px-2 text-xs whitespace-nowrap text-gray-700">{formatDuration(ex.durationMs)}</td>
                        <td className="px-2 text-xs whitespace-nowrap text-gray-500 font-mono">{ex.hostName || '—'}</td>
                        <td className="px-2 text-xs text-gray-700 max-w-[200px] truncate">
                          {ex.errorMessage ? <span className="text-red-600">{ex.errorMessage}</span> : (ex.outputSummary || '—')}
                        </td>
                      </tr>
                      {isExpanded && hasDetail && (
                        <tr className="bg-gray-50 border-b border-table-border">
                          <td colSpan={7} className="p-3">
                            {ex.errorMessage && (
                              <div className="mb-2">
                                <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">Error</div>
                                <pre className="p-2 bg-red-50 border border-red-200 rounded-sm text-2xs text-red-800 whitespace-pre-wrap overflow-x-auto max-h-48">{ex.errorMessage}</pre>
                              </div>
                            )}
                            {ex.outputSummary && (
                              <div>
                                <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">Resumen</div>
                                <pre className="p-2 bg-gray-100 border border-gray-200 rounded-sm text-2xs text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-48">{ex.outputSummary}</pre>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 h-10 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <span className="text-2xs text-text-muted">{executions.length} ejecuciones mostradas (máx 100)</span>
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cerrar</CompactButton>
        </div>
      </div>
    </div>
  );
};

export default JobExecutionsModal;
