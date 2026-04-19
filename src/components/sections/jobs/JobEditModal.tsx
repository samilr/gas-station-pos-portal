import React, { useEffect, useState } from 'react';
import { Edit, Save, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsService, ScheduledJob, UpdateJobRequest } from '../../../services/jobsService';
import { CompactButton } from '../../ui';

interface JobEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ScheduledJob | null;
  onSuccess: () => void;
}

interface FormData {
  displayName: string;
  description: string;
  cronExpression: string;
  isEnabled: boolean;
  timeoutSeconds: number;
}

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

const CRON_PRESETS: { label: string; value: string }[] = [
  { label: 'Cada minuto', value: '*/1 * * * *' },
  { label: 'Cada 5 minutos', value: '*/5 * * * *' },
  { label: 'Cada hora', value: '0 * * * *' },
  { label: 'Diario 03:00 UTC', value: '0 3 * * *' },
  { label: 'Domingos 03:00 UTC', value: '0 3 * * 0' },
  { label: 'Primer día del mes', value: '0 0 1 * *' },
  { label: 'Lun-Vie 02:30 UTC', value: '30 2 * * 1-5' },
];

const JobEditModal: React.FC<JobEditModalProps> = ({ isOpen, onClose, job, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    description: '',
    cronExpression: '',
    isEnabled: true,
    timeoutSeconds: 300,
  });

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        displayName: job.displayName || '',
        description: job.description || '',
        cronExpression: job.cronExpression || '',
        isEnabled: job.isEnabled,
        timeoutSeconds: job.timeoutSeconds,
      });
    }
  }, [job, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? Number(value) :
              value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const payload: UpdateJobRequest = {};
    if (formData.displayName !== (job.displayName || '')) payload.displayName = formData.displayName;
    if (formData.description !== (job.description || '')) payload.description = formData.description;
    if (formData.cronExpression !== job.cronExpression) payload.cronExpression = formData.cronExpression;
    if (formData.isEnabled !== job.isEnabled) payload.isEnabled = formData.isEnabled;
    if (formData.timeoutSeconds !== job.timeoutSeconds) payload.timeoutSeconds = formData.timeoutSeconds;

    if (Object.keys(payload).length === 0) {
      toast('Sin cambios para guardar', { icon: 'ℹ️' });
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await jobsService.updateJob(job.name, payload);
      if (res.successful) {
        toast.success(`Job actualizado: ${formData.displayName}`, { duration: 4000 });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Error al actualizar job', { duration: 5000 });
      }
    } catch (err) {
      console.error('Error updating job:', err);
      toast.error('Error de conexión', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-100 rounded-sm flex items-center justify-center">
              <Edit className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Editar Job</h3>
              <p className="text-2xs text-text-muted font-mono">{job.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre visible</label>
            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className={inputCls} />
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2} />
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Expresión Cron (5 campos, UTC)</label>
            <div className="flex gap-2">
              <input type="text" name="cronExpression" value={formData.cronExpression} onChange={handleChange}
                className={`${inputCls} font-mono flex-1`} placeholder="*/5 * * * *" required />
              <select
                value={CRON_PRESETS.some(p => p.value === formData.cronExpression) ? formData.cronExpression : '__custom__'}
                onChange={(e) => {
                  if (e.target.value !== '__custom__') {
                    setFormData(prev => ({ ...prev, cronExpression: e.target.value }));
                  }
                }}
                className={`${inputCls} max-w-[200px]`}
              >
                {!CRON_PRESETS.some(p => p.value === formData.cronExpression) && (
                  <option value="__custom__">Personalizado</option>
                )}
                {CRON_PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <p className="text-2xs text-text-muted italic mt-0.5 px-0.5">
              Formato: minuto hora díaMes mes díaSemana. Se evalúa en UTC.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Timeout (segundos)</label>
              <input type="number" name="timeoutSeconds" value={formData.timeoutSeconds} onChange={handleChange}
                className={inputCls} min={1} required />
            </div>
            <label className="flex items-end h-full cursor-pointer">
              <div className="flex items-center justify-between px-2 h-7 w-full bg-gray-50 border border-gray-200 rounded-sm">
                <span className="text-xs text-text-primary">Habilitado</span>
                <input type="checkbox" name="isEnabled" checked={formData.isEnabled} onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </label>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-text-muted">Próxima corrida:</span><span className="font-medium">{formatDate(job.nextRunAt)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Última corrida:</span><span className="font-medium">{formatDate(job.lastRunAt)}</span></div>
            <div className="text-2xs text-text-muted italic pt-1 border-t border-gray-200">Fechas en GMT-4 (Santo Domingo).</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={loading}>
            {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default JobEditModal;
