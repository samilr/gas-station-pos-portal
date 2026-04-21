import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import dataphoneSupplierService, { DataphoneSupplier } from '../../../services/dataphoneSupplierService';

interface DataphoneSupplierAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: DataphoneSupplier | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchSuppliers = async (): Promise<DataphoneSupplier[]> => {
  const res = await dataphoneSupplierService.list();
  return res.successful ? res.data : [];
};

const DataphoneSupplierAutocomplete: React.FC<DataphoneSupplierAutocompleteProps> = (props) => (
  <EntityAutocomplete<DataphoneSupplier, number>
    {...props}
    cacheKey="dataphoneSuppliers"
    fetchOptions={fetchSuppliers}
    getValue={(s) => s.dataphoneSupplierId}
    getLabel={(s) => `${s.dataphoneSupplierId} - ${s.name}`}
    placeholder={props.placeholder ?? 'Selecciona un proveedor'}
    emptyText="No hay proveedores"
  />
);

export default DataphoneSupplierAutocomplete;
