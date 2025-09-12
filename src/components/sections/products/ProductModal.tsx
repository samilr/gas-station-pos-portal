import React, { useState, useEffect } from 'react';
import { X, Package, Save, Eye } from 'lucide-react';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../../../../types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICreateProductDto | IUpdateProductDto) => Promise<boolean>;
  product?: IProduct | null;
  mode: 'create' | 'edit' | 'view';
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  mode
}) => {
  const [formData, setFormData] = useState<ICreateProductDto>({
    productId: '',
    name: '',
    description: '',
    categoryId: '',
    accountGroupId: '',
    miscellaneous: false,
    recipe: false,
    taxId: '',
    price: 0,
    priceIsTaxed: false,
    costingMethod: 1,
    inputUnitId: '',
    outputUnitId: '',
    allowDiscount: false,
    expectedProfit: 0,
    weightNet: 0,
    weightGross: 0,
    image: '',
    inventory: false,
    active: true
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
        productId: '',
        name: '',
        description: '',
        categoryId: '',
        accountGroupId: '',
        miscellaneous: false,
        recipe: false,
        taxId: '',
        price: 0,
        priceIsTaxed: false,
        costingMethod: 1,
        inputUnitId: '',
        outputUnitId: '',
        allowDiscount: false,
        expectedProfit: 0,
        weightNet: 0,
        weightGross: 0,
        image: '',
        inventory: false,
        active: true
      });
    }
  }, [product, mode]);

  const handleInputChange = (field: keyof ICreateProductDto, value: any) => {
    if (mode === 'view') return; // No permitir cambios en modo vista
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = mode === 'view';

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Crear Nuevo Producto';
      case 'edit':
        return 'Editar Producto';
      case 'view':
        return 'Ver Detalles del Producto';
      default:
        return 'Producto';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'create':
        return 'Complete la información para crear un nuevo producto';
      case 'edit':
        return 'Modifique la información del producto';
      case 'view':
        return 'Información detallada del producto';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
              <p className="text-sm text-gray-500">{getModalDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Producto *
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isDisabled}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <input
                  type="text"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo de Cuenta
                </label>
                <input
                  type="text"
                  value={formData.accountGroupId}
                  onChange={(e) => handleInputChange('accountGroupId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Configuración */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Configuración
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Impuesto *
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Costeo *
                </label>
                <input
                  type="number"
                  value={formData.costingMethod}
                  onChange={(e) => handleInputChange('costingMethod', parseInt(e.target.value) || 1)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Entrada *
                </label>
                <input
                  type="text"
                  value={formData.inputUnitId}
                  onChange={(e) => handleInputChange('inputUnitId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Salida *
                </label>
                <input
                  type="text"
                  value={formData.outputUnitId}
                  onChange={(e) => handleInputChange('outputUnitId', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Opciones y Configuraciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Opciones
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.miscellaneous}
                    onChange={(e) => handleInputChange('miscellaneous', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Misceláneo</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recipe}
                    onChange={(e) => handleInputChange('recipe', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Receta</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.priceIsTaxed}
                    onChange={(e) => handleInputChange('priceIsTaxed', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Precio con Impuesto</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowDiscount}
                    onChange={(e) => handleInputChange('allowDiscount', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Permitir Descuento</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inventory}
                    onChange={(e) => handleInputChange('inventory', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inventario</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activo</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Adicional
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ganancia Esperada
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expectedProfit}
                  onChange={(e) => handleInputChange('expectedProfit', parseFloat(e.target.value) || 0)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Neto (kg)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={formData.weightNet}
                  onChange={(e) => handleInputChange('weightNet', parseFloat(e.target.value) || 0)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Bruto (kg)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={formData.weightGross}
                  onChange={(e) => handleInputChange('weightGross', parseFloat(e.target.value) || 0)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nombre del archivo de imagen"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                mode === 'view'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : mode === 'view' ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{mode === 'view' ? 'Cerrar' : isSubmitting ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
