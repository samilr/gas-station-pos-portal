import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { DataphoneSupplier } from '../../../services/dataphoneSupplierService';
import { store } from '../../../store';
import { dataphoneSuppliersApi } from '../../../store/api/dataphoneSuppliersApi';

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
  const result = await store.dispatch(dataphoneSuppliersApi.endpoints.listDataphoneSuppliers.initiate());
  return result.data ?? [];
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
