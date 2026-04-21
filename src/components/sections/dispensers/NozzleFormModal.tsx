import React, { useEffect, useState } from 'react';
import { Save, X, Edit, Plus, RefreshCw, Droplet, Container, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import nozzleService, { Nozzle } from '../../../services/nozzleService';
import { getProductsByCategory, IProductByCategory } from '../../../services/productService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispenserId: number;
  nozzle?: Nozzle | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

interface FormState {
  nozzleNumber: number | '';
  productId: string;
  tankNumber: number | '';
  unassignTank: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  nozzleNumber: '',
  productId: '',
  tankNumber: '',
  unassignTank: false,
  active: true,
};

const fromNozzle = (n: Nozzle): FormState => ({
  nozzleNumber: n.nozzleNumber,
  productId: n.productId,
  tankNumber: n.tankNumber ?? '',
  unassignTank: false,
  active: n.active,
});

const NozzleFormModal: React.FC<Props> = ({ isOpen, onClose, dispenserId, nozzle, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<IProductByCategory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (!isOpen) return;
    if (nozzle && isEditing) setForm(fromNozzle(nozzle));
    else setForm(EMPTY);
  }, [isOpen, nozzle, isEditing]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingProducts(true);
    getProductsByCategory('COMB')
      .then((list) => { if (!cancelled) setProducts(list); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoadingProducts(false); });
    return () => { cancelled = true; };
  }, [isOpen]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTankChange = (value: string) => {
    if (value === '__UNASSIGN__') {
      setForm((f) => ({ ...f, tankNumber: '', unassignTank: true }));
    } else if (value === '') {
      setForm((f) => ({ ...f, tankNumber: '', unassignTank: false }));
    } else {
      setForm((f) => ({ ...f, tankNumber: parseInt(value, 10), unassignTank: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId) {
      toast.error('Selecciona un producto');
      return;
    }

    setLoading(true);
    try {
      if (isCreating) {
        if (form.nozzleNumber === '') {
          toast.error('El número de manguera es obligatorio');
          setLoading(false);
          return;
        }
        const payload = {
          dispenserId,
          nozzleNumber: Number(form.nozzleNumber),
          productId: form.productId,
          tankNumber: form.tankNumber === '' ? null : Number(form.tankNumber),
        };
        const res = await nozzleService.create(payload);
        if (res.successful) {
          toast.success(`Manguera #${payload.nozzleNumber} creada`, { duration: 4000 });
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || 'Error al crear manguera');
        }
      } else if (isEditing && nozzle) {
        const payload = {
          productId: form.productId,
          tankNumber: form.tankNumber === '' ? null : Number(form.tankNumber),
          unassignTank: form.unassignTank,
          active: form.active,
        };
        const res = await nozzleService.update(nozzle.nozzleId, payload);
        if (res.successful) {
          toast.success('Manguera actualizada', { duration: 4000 });
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || 'Error al actualizar');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : Plus;
  const headerColor = isEditing ? 'green' : 'blue';

  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const sectionHeader = 'text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1';

  const tankSelectValue = form.unassignTank
    ? '__UNASSIGN__'
    : (form.tankNumber === '' ? '' : String(form.tankNumber));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isEditing ? 'Editar' : 'Nueva'}
              </h3>
              <p className="text-2xs text-text-muted">
                Dispenser #{dispenserId}{nozzle ? ` · Manguera #${nozzle.nozzleNumber}` : ''}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Identidad */}
          <div>
            <h4 className={sectionHeader}><Droplet className="w-3 h-3" /> Identificación</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Número *</label>
                <input
                  type="number"
                  value={form.nozzleNumber}
                  onChange={(e) => update('nozzleNumber', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isEditing}
                  required
                  min={1}
                  className={inputCls(isEditing)}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tanque</label>
                <select
                  value={tankSelectValue}
                  onChange={(e) => handleTankChange(e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="">{isEditing ? '— No cambiar —' : '— Sin asignar —'}</option>
                  {isEditing && <option value="__UNASSIGN__">— Desasignar tanque —</option>}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>Tanque #{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Producto */}
          <div>
            <h4 className={sectionHeader}><Package className="w-3 h-3" /> Producto (combustible) *</h4>
            <select
              value={form.productId}
              onChange={(e) => update('productId', e.target.value)}
              required
              disabled={loadingProducts}
              className={inputCls(loadingProducts)}
            >
              <option value="">
                {loadingProducts ? 'Cargando combustibles...' : 'Selecciona un producto'}
              </option>
              {products.map((p) => {
                const price = p.price != null ? ` · ${Number(p.price).toFixed(2)} DOP` : '';
                return (
                  <option key={p.productId} value={p.productId}>
                    {p.product}{price}
                  </option>
                );
              })}
            </select>
            <p className="text-2xs text-text-muted mt-1 flex items-start gap-1">
              <Container className="w-3 h-3 flex-shrink-0 mt-0.5" />
              El precio se lee del producto automáticamente. No se guarda en la manguera.
            </p>
          </div>

          {/* Estado (solo edit) */}
          {isEditing && (
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Activa</span>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={loading}>
            {loading
              ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>)
              : (<><Save className="w-3 h-3" /> Guardar</>)}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default NozzleFormModal;
