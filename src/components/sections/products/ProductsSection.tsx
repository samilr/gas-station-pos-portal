import React, { useState, useEffect } from 'react';
import { Package, Filter, RefreshCw, Plus, Edit, Trash2, DollarSign, Scale, Tag } from 'lucide-react';

import ProductModal from './ProductModal';
import DeleteProductDialog from './DeleteProductDialog';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProducts } from '../../../hooks/useProducts';
import { IProduct } from '../../../types/product';
import { PermissionGate } from '../../common';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
;

const ProductsSection: React.FC = () => {
  const { } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce: el server hace el filtro por nombre/productId, no queremos
  // disparar una request por cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { products, pagination, loading, fetching, error, refreshProducts, createProduct, updateProduct, deleteProduct } =
    useProducts({ page: currentPage, limit: itemsPerPage, search: debouncedSearch });
  usePermissions();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const productList = Array.isArray(products) ? products : [];
  const hasLocalFilters = statusFilter !== '' || categoryFilter !== '';

  // Búsqueda por nombre/productId la hace el server vía `search`. Aquí solo
  // aplicamos los filtros que siguen siendo locales (estado y categoría).
  const filteredProducts = productList.filter(product => {
    const matchesStatus = statusFilter === '' ||
      (statusFilter === 'active' && product.active) ||
      (statusFilter === 'inactive' && !product.active);

    const matchesCategory = categoryFilter === '' ||
      product.categoryId === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refreshProducts();
    setCurrentPage(1);
  };

  const handleViewDetails = (product: IProduct) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowModal(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleSaveProduct = async (data: any) => {
    try {
      let result;

      if (modalMode === 'edit' && selectedProduct) {
        result = await updateProduct(selectedProduct.productId, data);
        if (result.successful) {
          toast.success('Producto actualizado correctamente');
        } else {
          toast.error(result.message || 'Error al actualizar producto');
        }
      } else if (modalMode === 'create') {
        result = await createProduct(data);
        if (result.successful) {
          toast.success('Producto creado correctamente');
        } else {
          toast.error(result.message || 'Error al crear producto');
        }
      }

      return result?.successful || false;
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar producto');
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    setDeleteLoading(true);
    try {
      const result = await deleteProduct(selectedProduct.productId);
      if (result.successful) {
        toast.success('Producto eliminado correctamente');
        setShowDeleteDialog(false);
        setSelectedProduct(null);
      } else {
        toast.error(result.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats: el total real proviene del API; el resto son sobre la página cargada.
  const totalProducts = pagination?.total ?? productList.length;
  const activeProducts = productList.filter(p => p.active).length;
  const inactiveProducts = productList.filter(p => !p.active).length;
  const inventoryProducts = productList.filter(p => p.inventory).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar productos..."
        chips={[
          { label: 'Total', value: totalProducts, color: 'blue' },
          { label: 'Activos', value: activeProducts, color: 'green' },
          { label: 'Inactivos', value: inactiveProducts, color: 'red' },
          { label: 'Inventario', value: inventoryProducts, color: 'blue' },
        ]}
      >
        <CompactButton
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          {showFilters ? 'Ocultar Filtros' : 'Filtros'}
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={handleRefresh}
          disabled={fetching}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <PermissionGate permissions={['products.create']}>
          <CompactButton
            variant="primary"
            onClick={handleCreateProduct}
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </CompactButton>
        </PermissionGate>
      </Toolbar>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {Array.from(new Set(productList.map(p => p.category_id))).map(categoryId => (
                  <option key={categoryId} value={categoryId}>{categoryId}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {error && error.includes('datos de prueba') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Producto</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Categoría</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Precio</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Configuración</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.productId}
                  className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(product)}
                >
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap">{product.name}</span>
                      <span className="text-xs text-gray-400">({product.productId})</span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-900">{product.categoryId}</span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3 text-green-500" />
                      <span className="font-medium text-gray-900">
                        {product.price ? `${product.price.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Scale className="w-3 h-3" />
                        {product.inventory ? 'Inv.' : 'Sin Inv.'}
                      </span>
                      {product.miscellaneous && (
                        <StatusDot color="purple" label="Misc." />
                      )}
                      {product.recipe && (
                        <StatusDot color="orange" label="Receta" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={product.active ? 'green' : 'red'}
                      label={product.active ? 'Activo' : 'Inactivo'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <PermissionGate permissions={['products.edit']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                      </PermissionGate>
                      <PermissionGate permissions={['products.delete']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </CompactButton>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (server-side: API devuelve page/limit/total/totalPages) */}
        <Pagination
          currentPage={pagination?.page ?? currentPage}
          totalPages={pagination?.totalPages ?? 1}
          totalItems={pagination?.total ?? productList.length}
          pageSize={pagination?.limit ?? itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="productos"
          filteredTotal={hasLocalFilters ? filteredProducts.length : undefined}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteProductDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductsSection;
