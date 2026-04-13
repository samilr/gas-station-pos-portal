import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Phone, Mail, DollarSign, Settings } from 'lucide-react';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../../../../types/site';

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICreateSiteDto | IUpdateSiteDto) => Promise<boolean>;
  site?: ISite | null;
  mode: 'create' | 'edit' | 'view';
}

const SiteModal: React.FC<SiteModalProps> = ({ isOpen, onClose, onSave, site, mode }) => {
  const [formData, setFormData] = useState<ICreateSiteDto>({
    siteId: '',
    name: '',
    siteNumber: 0,
    countryId: 'DO',
    currencyId: 'DOP',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    storeId: '',
    managerId: undefined,
    headOffice: false,
    pos: false,
    posLevelPrice: 1,
    posDeliveryTypes: '',
    posDeliveryType: false,
    posCashFund: 0,
    posIsRestaurant: false,
    posUseTip: false,
    useSector: false,
    productListType: false,
    active: true,
    status: true
  });

  const [loading, setLoading] = useState(false);

  // Función helper para determinar si los campos deben estar deshabilitados
  const isDisabled = mode === 'view';

  useEffect(() => {
    if (site && (mode === 'edit' || mode === 'view')) {
      setFormData({
        siteId: site.site_id,
        name: site.name,
        siteNumber: site.site_number,
        countryId: site.country_id,
        currencyId: site.currency_id || 'DOP',
        phone: site.phone || '',
        email: site.email || '',
        address1: site.address1 || '',
        address2: site.address2 || '',
        storeId: site.store_id || '',
        managerId: site.manager_id,
        headOffice: site.head_office,
        pos: site.pos,
        posLevelPrice: site.pos_level_price,
        posDeliveryTypes: site.pos_delivery_types || '',
        posDeliveryType: site.pos_delivery_type,
        posCashFund: site.pos_cash_fund || 0,
        posIsRestaurant: site.pos_is_restaurant,
        posUseTip: site.pos_use_tip,
        useSector: site.use_sector,
        productListType: site.product_list_type,
        active: site.active,
        status: site.status
      });
    } else if (mode === 'create') {
      // Reset form for new site
      setFormData({
        siteId: '',
        name: '',
        siteNumber: 0,
        countryId: 'DO',
        currencyId: 'DOP',
        phone: '',
        email: '',
        address1: '',
        address2: '',
        storeId: '',
        managerId: undefined,
        headOffice: false,
        pos: false,
        posLevelPrice: 1,
        posDeliveryTypes: '',
        posDeliveryType: false,
        posCashFund: 0,
        posIsRestaurant: false,
        posUseTip: false,
        useSector: false,
        productListType: false,
        active: true,
        status: true
      });
    }
  }, [site, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si está en modo vista, solo cerrar el modal
    if (mode === 'view') {
      onClose();
      return;
    }

    setLoading(true);

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving site:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {mode === 'edit' ? 'Editar Sucursal' : mode === 'view' ? 'Ver Sucursal' : 'Nueva Sucursal'}
              </h3>
              <p className="text-xs text-text-muted">
                {mode === 'edit' ? 'Modifica los datos de la sucursal' : mode === 'view' ? 'Información detallada de la sucursal' : 'Completa los datos de la nueva sucursal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Información Básica */}
          <div className="bg-gray-50 p-3 rounded-sm">
            <h4 className="text-2xs uppercase tracking-wide text-gray-500 mb-3 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Información Básica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  ID de Sucursal *
                </label>
                <input
                  type="text"
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ej: SITE001"
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Nombre de la sucursal"
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Número de Sucursal *
                </label>
                <input
                  type="number"
                  name="siteNumber"
                  value={formData.siteNumber}
                  onChange={handleInputChange}
                  required
                  min="1"
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  País *
                </label>
                <select
                  name="countryId"
                  value={formData.countryId}
                  onChange={handleInputChange}
                  required
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="DO">República Dominicana</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Moneda
                </label>
                <select
                  name="currencyId"
                  value={formData.currencyId}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="DOP">Peso Dominicano (DOP)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Store ID
                </label>
                <input
                  type="text"
                  name="storeId"
                  value={formData.storeId}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ej: STORE001"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-50 p-3 rounded-sm">
            <h4 className="text-2xs uppercase tracking-wide text-gray-500 mb-3 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Información de Contacto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="+1-809-555-0101"
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="sucursal@empresa.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Dirección 1
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Dirección principal"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Dirección 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ciudad, provincia"
                />
              </div>
            </div>
          </div>

          {/* Configuración POS */}
          <div className="bg-gray-50 p-3 rounded-sm">
            <h4 className="text-2xs uppercase tracking-wide text-gray-500 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Configuración POS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pos"
                  checked={formData.pos}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Habilitar POS
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="posIsRestaurant"
                  checked={formData.posIsRestaurant}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Es Restaurante
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="posUseTip"
                  checked={formData.posUseTip}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Usar Propinas
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="posDeliveryType"
                  checked={formData.posDeliveryType}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Habilitar Delivery
                </label>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Nivel de Precio POS
                </label>
                <select
                  name="posLevelPrice"
                  value={formData.posLevelPrice}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={1}>Nivel 1</option>
                  <option value={2}>Nivel 2</option>
                  <option value={3}>Nivel 3</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Fondo de Caja
                </label>
                <input
                  type="number"
                  name="posCashFund"
                  value={formData.posCashFund}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Tipos de Delivery
                </label>
                <select
                  name="posDeliveryTypes"
                  value={formData.posDeliveryTypes}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="PICKUP">Recoger en tienda</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="BOTH">Ambos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración General */}
          <div className="bg-gray-50 p-3 rounded-sm">
            <h4 className="text-2xs uppercase tracking-wide text-gray-500 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configuración General
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="headOffice"
                  checked={formData.headOffice}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Oficina Principal
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="useSector"
                  checked={formData.useSector}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Usar Sectores
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="productListType"
                  checked={formData.productListType}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Lista de Productos
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Activa
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <label className={`ml-2 block text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  Estado Activo
                </label>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  ID del Manager
                </label>
                <input
                  type="number"
                  name="managerId"
                  value={formData.managerId || ''}
                  onChange={handleInputChange}
                  disabled={isDisabled}
                  className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="ID del gerente"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 h-7 px-3 text-sm rounded-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteModal;
