import React, { useState, useEffect } from 'react';
import { X, Save, Building2, RefreshCw } from 'lucide-react';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../../../../types/site';
import { CompactButton } from '../../ui';

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ICreateSiteDto | IUpdateSiteDto) => Promise<boolean>;
  site?: ISite | null;
  mode: 'create' | 'edit' | 'view';
}

const SiteModal: React.FC<SiteModalProps> = ({ isOpen, onClose, onSave, site, mode }) => {
  const [formData, setFormData] = useState<ICreateSiteDto>({
    siteId: '', name: '', siteNumber: 0, countryId: 'DO', currencyId: 'DOP',
    phone: '', email: '', address1: '', address2: '', storeId: '', managerId: undefined,
    headOffice: false, pos: false, posLevelPrice: 1, posDeliveryTypes: '',
    posDeliveryType: false, posCashFund: 0, posIsRestaurant: false, posUseTip: false,
    useSector: false, productListType: false, active: true, status: true
  });

  const [loading, setLoading] = useState(false);
  const isDisabled = mode === 'view';

  useEffect(() => {
    if (site && (mode === 'edit' || mode === 'view')) {
      setFormData({
        siteId: site.site_id, name: site.name, siteNumber: site.site_number,
        countryId: site.country_id, currencyId: site.currency_id || 'DOP',
        phone: site.phone || '', email: site.email || '',
        address1: site.address1 || '', address2: site.address2 || '',
        storeId: site.store_id || '', managerId: site.manager_id,
        headOffice: site.head_office, pos: site.pos,
        posLevelPrice: site.pos_level_price, posDeliveryTypes: site.pos_delivery_types || '',
        posDeliveryType: site.pos_delivery_type, posCashFund: site.pos_cash_fund || 0,
        posIsRestaurant: site.pos_is_restaurant, posUseTip: site.pos_use_tip,
        useSector: site.use_sector, productListType: site.product_list_type,
        active: site.active, status: site.status
      });
    } else if (mode === 'create') {
      setFormData({
        siteId: '', name: '', siteNumber: 0, countryId: 'DO', currencyId: 'DOP',
        phone: '', email: '', address1: '', address2: '', storeId: '', managerId: undefined,
        headOffice: false, pos: false, posLevelPrice: 1, posDeliveryTypes: '',
        posDeliveryType: false, posCashFund: 0, posIsRestaurant: false, posUseTip: false,
        useSector: false, productListType: false, active: true, status: true
      });
    }
  }, [site, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }
    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) onClose();
    } catch (error) {
      console.error('Error saving site:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const checkboxItem = (name: string, label: string, checked: boolean) => (
    <label className="flex items-center gap-2 text-sm text-text-primary">
      <input type="checkbox" name={name} checked={checked} onChange={handleInputChange} disabled={isDisabled}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {mode === 'edit' ? 'Editar Sucursal' : mode === 'view' ? 'Ver Sucursal' : 'Nueva Sucursal'}
              </h3>
              <p className="text-2xs text-text-muted">
                {mode === 'edit' ? 'Modifica los datos' : mode === 'view' ? 'Información detallada' : 'Completa los datos'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información Básica</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID de Sucursal *</label>
                <input type="text" name="siteId" value={formData.siteId} onChange={handleInputChange} required disabled={isDisabled} className={inputCls} placeholder="Ej: SITE001" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Número *</label>
                <input type="number" name="siteNumber" value={formData.siteNumber} onChange={handleInputChange} required min="1" disabled={isDisabled} className={inputCls} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">País *</label>
                <select name="countryId" value={formData.countryId} onChange={handleInputChange} required disabled={isDisabled} className={inputCls}>
                  <option value="DO">República Dominicana</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Moneda</label>
                <select name="currencyId" value={formData.currencyId} onChange={handleInputChange} disabled={isDisabled} className={inputCls}>
                  <option value="DOP">Peso Dominicano (DOP)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Store ID</label>
                <input type="text" name="storeId" value={formData.storeId} onChange={handleInputChange} disabled={isDisabled} className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Contacto</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isDisabled} className={inputCls} placeholder="+1-809-555-0101" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isDisabled} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Dirección 1</label>
                <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} disabled={isDisabled} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Dirección 2</label>
                <input type="text" name="address2" value={formData.address2} onChange={handleInputChange} disabled={isDisabled} className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Configuración POS</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {checkboxItem('pos', 'Habilitar POS', formData.pos)}
              {checkboxItem('posIsRestaurant', 'Es Restaurante', formData.posIsRestaurant)}
              {checkboxItem('posUseTip', 'Usar Propinas', formData.posUseTip)}
              {checkboxItem('posDeliveryType', 'Habilitar Delivery', formData.posDeliveryType)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nivel de Precio POS</label>
                <select name="posLevelPrice" value={formData.posLevelPrice} onChange={handleInputChange} disabled={isDisabled} className={inputCls}>
                  <option value={1}>Nivel 1</option>
                  <option value={2}>Nivel 2</option>
                  <option value={3}>Nivel 3</option>
                </select>
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fondo de Caja</label>
                <input type="number" name="posCashFund" value={formData.posCashFund} onChange={handleInputChange} step="0.01" min="0" disabled={isDisabled} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipos de Delivery</label>
                <select name="posDeliveryTypes" value={formData.posDeliveryTypes} onChange={handleInputChange} disabled={isDisabled} className={inputCls}>
                  <option value="">Seleccionar</option>
                  <option value="PICKUP">Recoger en tienda</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="BOTH">Ambos</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Configuración General</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {checkboxItem('headOffice', 'Oficina Principal', formData.headOffice)}
              {checkboxItem('useSector', 'Usar Sectores', formData.useSector)}
              {checkboxItem('productListType', 'Lista de Productos', formData.productListType)}
              {checkboxItem('active', 'Activa', formData.active)}
              {checkboxItem('status', 'Estado Activo', formData.status)}
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Manager</label>
              <input type="number" name="managerId" value={formData.managerId || ''} onChange={handleInputChange} disabled={isDisabled} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>{mode === 'view' ? 'Cerrar' : 'Cancelar'}</CompactButton>
          {mode !== 'view' && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default SiteModal;
