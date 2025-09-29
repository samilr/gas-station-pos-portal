import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle, DollarSign, Scale, Tag } from 'lucide-react';

import ProductModal from './ProductModal';
import DeleteProductDialog from './DeleteProductDialog';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProducts } from '../../../hooks/useProducts';
import { IProduct } from '../../../types/product';
import { PermissionGate } from '../../common';
;

const ProductsSection: React.FC = () => {
  const { } = useAuth();
  const { products, loading, error, refreshProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product => {
    const matchesSearch = 
      (product.product_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && product.active) ||
      (statusFilter === 'inactive' && !product.active);
    
    const matchesCategory = categoryFilter === '' || 
      product.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
        result = await updateProduct(selectedProduct.product_id, data);
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
      const result = await deleteProduct(selectedProduct.product_id);
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

  const getStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Activo' : 'Inactivo';
  };

  // Calcular estadísticas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const inactiveProducts = products.filter(p => !p.active).length;
  const inventoryProducts = products.filter(p => p.inventory).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header con búsqueda y botones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Stats Cards */}
                <div className="flex items-center space-x-4">
                  {[
                    { label: "Total", value: totalProducts, icon: Package, color: "text-blue-500" },
                    { label: "Activos", value: activeProducts, icon: CheckCircle, color: "text-green-500" },
                    { label: "Inactivos", value: inactiveProducts, icon: XCircle, color: "text-red-500" },
                    { label: "Con Inventario", value: inventoryProducts, icon: Scale, color: "text-blue-500" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={`text-lg font-bold ${stat.label === 'Activos' ? 'text-green-600' : stat.label === 'Inactivos' ? 'text-red-600' : 'text-gray-900'}`}>
                          {stat.value}
                        </span>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </motion.button>
              <PermissionGate permissions={['products.create']}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateProduct}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </motion.button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gray-50 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {Array.from(new Set(products.map(p => p.category_id))).map(categoryId => (
                    <option key={categoryId} value={categoryId}>{categoryId}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Warning Message */}
      {error && error.includes('datos de prueba') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Configuración</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product, index) => (
                <motion.tr
                  key={product.product_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(product)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400">ID: {product.product_id}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 mt-1">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{product.category_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Scale className="w-3 h-3 mr-1" />
                        <span className="text-sm text-gray-500">
                          {product.inventory ? 'Con Inventario' : 'Sin Inventario'}
                        </span>
                      </div>
                      {product.miscellaneous && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Misceláneo
                        </span>
                      )}
                      {product.recipe && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Receta
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(product.active)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.active)}`}>
                        {getStatusText(product.active)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <PermissionGate permissions={['products.edit']}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-900" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </PermissionGate>
                      <PermissionGate permissions={['products.delete']}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product);
                          }}
                          className="p-1 text-red-600 hover:text-red-900" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </PermissionGate>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg"
        >
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span> de{' '}
            <span className="font-medium">{filteredProducts.length}</span> productos
            {filteredProducts.length !== products.length && (
              <span className="text-gray-500"> (filtrados de {products.length} total)</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Anterior
            </motion.button>
            
            {/* Números de página */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Mostrar solo algunas páginas para evitar demasiados botones
                if (totalPages <= 7 || 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <motion.button
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Siguiente
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
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
