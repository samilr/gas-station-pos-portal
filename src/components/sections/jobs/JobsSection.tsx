import React, { useEffect } from 'react';
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, Database, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import useJobs, { JobState } from '../../../hooks/useJobs';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-DO');
  } catch {
    return iso;
  }
};

interface JobCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  state: JobState;
  onRun: () => void | Promise<any>;
  cta: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, description, icon: Icon, state, onRun, cta }) => {
  const running = state.status === 'running';
  return (
    <div className="bg-white rounded-sm border border-table-border p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-2xs text-text-muted">
          <Clock className="w-3 h-3" />
          Última ejecución: <span className="font-medium text-text-secondary">{formatDate(state.lastRunAt)}</span>
        </div>
        <CompactButton variant="primary" onClick={onRun} disabled={running}>
          {running ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {running ? 'Ejecutando...' : cta}
        </CompactButton>
      </div>

      {state.status === 'success' && (
        <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-sm text-xs text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{state.message || 'Ejecución completada'}</span>
        </div>
      )}
      {state.status === 'error' && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error || 'Error desconocido'}</span>
        </div>
      )}
    </div>
  );
};

const JobsSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { encf, taxpayers, runEncfStatus, runDownloadTaxpayers } = useJobs();

  useEffect(() => {
    setSubtitle('Ejecución manual de jobs de background');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const handleEncf = async () => {
    const res = await runEncfStatus();
    if (res.successful) toast.success('Reconciliación DGII ejecutada');
    else toast.error(res.error || 'Error al ejecutar');
  };

  const handleDownload = async () => {
    const res = await runDownloadTaxpayers();
    if (res.successful) {
      toast.success(res.inserted !== undefined
        ? `${res.inserted.toLocaleString()} contribuyentes insertados`
        : 'Descarga completada');
    } else {
      toast.error(res.error || 'Error al ejecutar');
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <JobCard
          title="Reconciliación DGII"
          description="Ejecuta un ciclo completo de reconciliación del estado eNCF contra DGII. Los envíos automáticos corren cada 60s."
          icon={FileText}
          state={encf}
          onRun={handleEncf}
          cta="Ejecutar"
        />
        <JobCard
          title="Descargar contribuyentes"
          description="Descarga el ZIP de DGII y hace bulk-insert de los contribuyentes nuevos. El job automático corre cada 7 días."
          icon={Database}
          state={taxpayers}
          onRun={handleDownload}
          cta="Descargar"
        />
      </div>
    </div>
  );
};

export default JobsSection;
