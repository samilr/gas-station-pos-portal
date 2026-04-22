import React, { useEffect, useState } from 'react';
import { X, Plus, RefreshCw, Droplet, Edit, Trash2, AlertCircle, Container } from 'lucide-react';
import toast from 'react-hot-toast';
import { Nozzle } from '../../../services/nozzleService';
import { Dispenser } from '../../../services/dispensersConfigService';
import { store } from '../../../store';
import {
  nozzlesApi,
  useUpdateNozzleMutation,
  useDeleteNozzleMutation,
} from '../../../store/api/nozzlesApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import NozzleFormModal from './NozzleFormModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispenser: Dispenser | null;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const NozzlesModal: React.FC<Props> = ({ isOpen, onClose, dispenser }) => {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Nozzle | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Nozzle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [updateNozzle] = useUpdateNozzleMutation();
  const [deleteNozzle] = useDeleteNozzleMutation();

  const refresh = async () => {
    if (!dispenser) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await store
        .dispatch(
          nozzlesApi.endpoints.listNozzles.initiate(
            { dispenserId: dispenser.dispenserId },
            { forceRefetch: true }
          )
        )
        .unwrap();
      setNozzles(fresh ?? []);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar mangueras'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && dispenser) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dispenser]);

  const openCreate = () => { setSelected(null); setFormMode('create'); setFormOpen(true); };
  const openEdit = (n: Nozzle) => { setSelected(n); setFormMode('edit'); setFormOpen(true); };

  const toggleActive = async (n: Nozzle) => {
    try {
      await updateNozzle({ id: n.nozzleId, body: { active: !n.active } }).unwrap();
      toast.success(`Manguera ${n.active ? 'desactivada' : 'activada'}`, { duration: 3000 });
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al cambiar estado') ?? 'Error al cambiar estado');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteNozzle(confirmDelete.nozzleId).unwrap();
      toast.success(`Manguera #${confirmDelete.nozzleNumber} eliminada`, { duration: 3000 });
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al eliminar') ?? 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !dispenser) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-100 rounded-sm flex items-center justify-center">
                <Droplet className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Mangueras del Dispenser</h3>
                <p className="text-2xs text-text-muted">
                  {dispenser.siteId} · Bomba #{dispenser.pumpNumber}
                  {dispenser.name ? ` · ${dispenser.name}` : ''}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 h-10 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span>Total <strong className="text-text-primary">{nozzles.length}</strong></span>
              <span>Activas <strong className="text-green-600">{nozzles.filter(n => n.active).length}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </CompactButton>
              <CompactButton variant="primary" onClick={openCreate}>
                <Plus className="w-3 h-3" /> Nueva
              </CompactButton>
            </div>
          </div>

          {/* Body — table */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="m-3 bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  <th className="text-left px-2 font-medium text-gray-500">#</th>
                  <th className="text-left px-2 font-medium text-gray-500">Producto</th>
                  <th className="text-right px-2 font-medium text-gray-500">Precio</th>
                  <th className="text-left px-2 font-medium text-gray-500">Tanque</th>
                  <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                  <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
                  </td></tr>
                )}
                {!loading && nozzles.length === 0 && (
                  <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                    <Droplet className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                    No hay mangueras registradas en este dispenser.
                  </td></tr>
                )}
                {!loading && nozzles
                  .slice()
                  .sort((a, b) => a.nozzleNumber - b.nozzleNumber)
                  .map((n) => (
                    <tr key={n.nozzleId} className="h-8 border-b border-table-border hover:bg-row-hover">
                      <td className="px-2 text-sm font-medium text-text-primary whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Droplet className="w-3 h-3 text-orange-500" />
                          #{n.nozzleNumber}
                        </span>
                      </td>
                      <td className="px-2 text-sm text-text-primary truncate max-w-[220px]" title={n.productName ?? n.productId}>
                        {n.productName || <span className="text-text-muted">—</span>}
                        <span className="ml-1 text-2xs text-text-muted font-mono">{n.productId}</span>
                      </td>
                      <td className="px-2 text-sm text-right text-text-primary whitespace-nowrap tabular-nums">
                        {formatPrice(n.price)} <span className="text-2xs text-text-muted">DOP/L</span>
                      </td>
                      <td className="px-2 text-sm text-text-secondary whitespace-nowrap">
                        {n.tankNumber != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Container className="w-3 h-3 text-blue-500" />
                            Tanque #{n.tankNumber}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-2 text-sm">
                        <button onClick={() => toggleActive(n)} className="cursor-pointer" title="Click para cambiar estado">
                          <StatusDot color={n.active ? 'green' : 'gray'} label={n.active ? 'Activa' : 'Inactiva'} />
                        </button>
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <CompactButton variant="icon" onClick={() => openEdit(n)} title="Editar">
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                          </CompactButton>
                          <CompactButton variant="icon" onClick={() => setConfirmDelete(n)} title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </CompactButton>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cerrar</CompactButton>
          </div>
        </div>
      </div>

      <NozzleFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        dispenserId={dispenser.dispenserId}
        nozzle={selected}
        mode={formMode}
        onSuccess={refresh}
      />

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Manguera</h3>
              <p className="text-sm text-text-secondary text-center mb-4">
                ¿Eliminar <strong>Manguera #{confirmDelete.nozzleNumber}</strong>?
                <br />
                <span className="text-text-muted text-xs">
                  Producto: {confirmDelete.productName || confirmDelete.productId}
                </span>
                <br />
                <span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
              </p>
              <div className="flex gap-2">
                <CompactButton variant="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 justify-center">
                  Cancelar
                </CompactButton>
                <CompactButton variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1 justify-center">
                  {deleting ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</>) : 'Eliminar'}
                </CompactButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NozzlesModal;
