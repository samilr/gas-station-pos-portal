import React, { useState, useEffect } from 'react';
import { X, Package, Save, RefreshCw } from 'lucide-react';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../../../../types/product';
import { CompactButton } from '../../ui';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICreateProductDto | IUpdateProductDto) => Promise<boolean>;
  product?: IProduct | null;
  mode: 'create' | 'edit' | 'view';
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, mode }) => {
  const [formData, setFormData] = useState<ICreateProductDto>({
    productId: '', name: '', description: '', categoryId: '', accountGroupId: '',
    miscellaneous: false, recipe: false, taxId: '', price: 0, priceIsTaxed: false,
    costingMethod: 1, inputUnitId: '', outputUnitId: '', allowDiscount: false,
    expectedProfit: 0, weightNet: 0, weightGross: 0, image: '', inventory: false, active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        productId: product.product_id,
        name: product.name,
        description: product.description || '',
        categoryId: product.category_id,
        accountGroupId: product.account_group_id || '',
        miscellaneous: product.miscellaneous,
        recipe: product.recipe,
        taxId: product.tax_id,
        price: product.price || 0,
        priceIsTaxed: product.price_is_taxed,
        costingMethod: product.costing_method,
        inputUnitId: product.input_unit_id,
        outputUnitId: product.output_unit_id,
        allowDiscount: product.allow_discount,
        expectedProfit: product.expected_profit || 0,
        weightNet: product.weight_net || 0,
        weightGross: product.weight_gross || 0,
        image: product.image || '',
        inventory: product.inventory,
        active: product.active
      });
    } else if (mode === 'create') {
      setFormData({
        productId: '', name: '', description: '', categoryId: '', accountGroupId: '',
        miscellaneous: false, recipe: false, taxId: '', price: 0, priceIsTaxed: false,
        costingMethod: 1, inputUnitId: '', outputUnitId: '', allowDiscount: false,
        expectedProfit: 0, weightNet: 0, weightGross: 0, image: '', inventory: false, active: true
      });
    }
  }, [product, mode]);

  const handleInputChange = (field: keyof ICreateProductDto, value: any) => {
    if (mode === 'view') return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = mode === 'view';

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nuevo Producto';
      case 'edit': return 'Editar Producto';
      case 'view': return 'Ver Detalles del Producto';
      default: return 'Producto';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'create': return 'Complete la información para crear';
      case 'edit': return 'Modifique la información del producto';
      case 'view': return 'Información detallada';
      default: return '';
    }
  };

  if (!isOpen) return null;

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-4xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{getModalTitle()}</h3>
              <p className="text-2xs text-text-muted">{getModalDescription()}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información Básica</h4>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Producto *</label>
                <input type="text" value={formData.productId} onChange={(e) => handleInputChange('productId', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Descripción</label>
                <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} disabled={isDisabled} rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Categoría *</label>
                <input type="text" value={formData.categoryId} onChange={(e) => handleInputChange('categoryId', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Grupo de Cuenta</label>
                <input type="text" value={formData.accountGroupId} onChange={(e) => handleInputChange('accountGroupId', e.target.value)} disabled={isDisabled} className={inputCls} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Configuración</h4>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID de Impuesto *</label>
                <input type="text" value={formData.taxId} onChange={(e) => handleInputChange('taxId', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Precio</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Método de Costeo *</label>
                <input type="number" value={formData.costingMethod} onChange={(e) => handleInputChange('costingMethod', parseInt(e.target.value) || 1)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Unidad de Entrada *</label>
                <input type="text" value={formData.inputUnitId} onChange={(e) => handleInputChange('inputUnitId', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Unidad de Salida *</label>
                <input type="text" value={formData.outputUnitId} onChange={(e) => handleInputChange('outputUnitId', e.target.value)} disabled={isDisabled} className={inputCls} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Opciones</h4>
              {[
                { k: 'miscellaneous', l: 'Misceláneo' },
                { k: 'recipe', l: 'Receta' },
                { k: 'priceIsTaxed', l: 'Precio con Impuesto' },
                { k: 'allowDiscount', l: 'Permitir Descuento' },
                { k: 'inventory', l: 'Inventario' },
                { k: 'active', l: 'Activo' },
              ].map(({ k, l }) => (
                <label key={k} className="flex items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={(formData as any)[k]} onChange={(e) => handleInputChange(k as any, e.target.checked)}
                    disabled={isDisabled} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100" />
                  {l}
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información Adicional</h4>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Ganancia Esperada</label>
                <input type="number" step="0.01" value={formData.expectedProfit} onChange={(e) => handleInputChange('expectedProfit', parseFloat(e.target.value) || 0)} disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Peso Neto (kg)</label>
                <input type="number" step="0.0000001" value={formData.weightNet} onChange={(e) => handleInputChange('weightNet', parseFloat(e.target.value) || 0)} disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Peso Bruto (kg)</label>
                <input type="number" step="0.0000001" value={formData.weightGross} onChange={(e) => handleInputChange('weightGross', parseFloat(e.target.value) || 0)} disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Imagen</label>
                <input type="text" value={formData.image} onChange={(e) => handleInputChange('image', e.target.value)} disabled={isDisabled} className={inputCls} placeholder="Nombre del archivo" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> {mode === 'view' ? 'Cerrar' : 'Guardar'}</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default ProductModal;
