import React, { useEffect, useState } from 'react';
import { Package, Save, X, Edit, Plus, RefreshCw, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import categoryService, { Category } from '../../../services/categoryService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  categoryId: string;
  name: string;
  ctrlCategoryId: string;
  unitId: string;
  inputUnitId: string;
  outputUnitId: string;
  priceIsTaxed: boolean;
  costingMethod: number;
  allowDiscount: boolean;
  active: boolean;
  image: string;
}

const EMPTY: FormState = {
  categoryId: '', name: '', ctrlCategoryId: '', unitId: 'UND',
  inputUnitId: 'UND', outputUnitId: 'UND',
  priceIsTaxed: true, costingMethod: 0, allowDiscount: true, active: true, image: '',
};

const UNITS = ['UND', 'KG', 'LB', 'GAL', 'L', 'CAJ', 'PAQ'];
const COSTING_METHODS = [
  { value: 0, label: 'Promedio' },
  { value: 1, label: 'FIFO' },
  { value: 2, label: 'LIFO' },
  { value: 3, label: 'Estándar' },
];

const CategoryModal: React.FC<Props> = ({ isOpen, onClose, category, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (!isOpen) return;
    if (category && (isEditing || isViewing)) {
      setForm({
        categoryId: category.categoryId,
        name: category.categoryName,
        ctrlCategoryId: category.ctrlCategoryId ?? category.categoryId,
        unitId: category.unitId ?? 'UND',
        inputUnitId: category.inputUnitId ?? category.unitId ?? 'UND',
        outputUnitId: category.outputUnitId ?? category.unitId ?? 'UND',
        priceIsTaxed: category.priceIsTaxed ?? true,
        costingMethod: category.costingMethod ?? 0,
        allowDiscount: category.allowDiscount ?? true,
        active: category.active ?? true,
        image: category.image ?? '',
      });
    } else setForm(EMPTY);
  }, [isOpen, category, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    setLoading(true);
    try {
      if (isCreating) {
        if (!form.categoryId || !form.name) {
          toast.error('Completa los campos obligatorios');
          setLoading(false);
          return;
        }
        const payload = {
          categoryId: form.categoryId.toUpperCase(),
          name: form.name,
          ctrlCategoryId: form.ctrlCategoryId || form.categoryId.toUpperCase(),
          unitId: form.unitId,
          inputUnitId: form.inputUnitId || form.unitId,
          outputUnitId: form.outputUnitId || form.unitId,
          priceIsTaxed: form.priceIsTaxed,
          costingMethod: form.costingMethod,
          allowDiscount: form.allowDiscount,
          active: form.active,
          image: form.image || null,
        };
        const res = await categoryService.create(payload);
        if (res.successful) { toast.success(`Categoría creada: ${payload.name}`); onSuccess(); onClose(); }
        else toast.error(res.error || 'Error al crear');
      } else if (isEditing && category) {
        const payload = {
          name: form.name,
          ctrlCategoryId: form.ctrlCategoryId,
          unitId: form.unitId,
          inputUnitId: form.inputUnitId,
          outputUnitId: form.outputUnitId,
          priceIsTaxed: form.priceIsTaxed,
          costingMethod: form.costingMethod,
          allowDiscount: form.allowDiscount,
          active: form.active,
          image: form.image || null,
        };
        const res = await categoryService.update(category.categoryId, payload);
        if (res.successful) { toast.success('Categoría actualizada'); onSuccess(); onClose(); }
        else toast.error(res.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Package : Plus;
  const headerColor = isEditing ? 'green' : 'blue';
  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;
  const sectionHeader = 'text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? 'Ver Categoría' : isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <p className="text-2xs text-text-muted">
                {category ? `${category.categoryId} · ${category.categoryName}` : 'Completa el formulario'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className={sectionHeader}><Package className="w-3 h-3" /> Identidad</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Category ID *</label>
                <input type="text" value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value.toUpperCase())}
                  disabled={isViewing || isEditing} required maxLength={10}
                  className={inputCls(isViewing || isEditing)} placeholder="BEBI" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
                <input type="text" value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  disabled={isViewing} required maxLength={100}
                  className={inputCls(isViewing)} placeholder="Bebidas Alcohólicas" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Ctrl Category ID</label>
                <input type="text" value={form.ctrlCategoryId}
                  onChange={(e) => update('ctrlCategoryId', e.target.value.toUpperCase())}
                  disabled={isViewing} maxLength={10}
                  className={inputCls(isViewing)} placeholder="(Por defecto = Category ID)" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">URL de imagen</label>
                <input type="text" value={form.image}
                  onChange={(e) => update('image', e.target.value)}
                  disabled={isViewing}
                  className={inputCls(isViewing)} placeholder="https://..." />
              </div>
            </div>
            {form.image && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-sm">
                <ImageIcon className="w-3 h-3 text-text-muted" />
                <span className="text-2xs text-text-muted">Preview:</span>
                <img src={form.image} alt="preview" className="h-10 w-10 object-cover rounded border border-gray-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div>
            <h4 className={sectionHeader}>Unidades</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Unidad base</label>
                <select value={form.unitId} onChange={(e) => update('unitId', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Entrada</label>
                <select value={form.inputUnitId} onChange={(e) => update('inputUnitId', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Salida</label>
                <select value={form.outputUnitId} onChange={(e) => update('outputUnitId', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className={sectionHeader}>Configuración</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Método de costeo</label>
                <select value={form.costingMethod}
                  onChange={(e) => update('costingMethod', parseInt(e.target.value, 10))}
                  disabled={isViewing} className={inputCls(isViewing)}>
                  {COSTING_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Precio con impuesto incluido</span>
                <input type="checkbox" checked={form.priceIsTaxed}
                  onChange={(e) => update('priceIsTaxed', e.target.checked)}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Permite descuento</span>
                <input type="checkbox" checked={form.allowDiscount}
                  onChange={(e) => update('allowDiscount', e.target.checked)}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Activa</span>
                <input type="checkbox" checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            {isViewing ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!isViewing && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>) : (<><Save className="w-3 h-3" /> Guardar</>)}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default CategoryModal;
