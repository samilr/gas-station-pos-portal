import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, MoreHorizontal, Download, Upload, Eye, EyeOff, Filter, X, Save, AlertCircle, CheckCircle, Package2, DollarSign, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Laptop HP Pavilion 15',
    description: 'Laptop HP Pavilion 15 con procesador Intel Core i5, 8GB RAM, 256GB SSD',
    sku: 'HP-PAV-15-001',
    category: 'Electrónicos',
    price: 749.99,
    cost: 550.00,
    stock: 25,
    minStock: 5,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    tags: ['laptop', 'hp', 'intel', 'ssd']
  },
  {
    id: 'PROD-002',
    name: 'Mouse Inalámbrico Logitech',
    description: 'Mouse inalámbrico ergonómico con sensor óptico de alta precisión',
    sku: 'LOG-MX-001',
    category: 'Accesorios',
    price: 29.99,
    cost: 18.00,
    stock: 150,
    minStock: 20,
    status: 'active',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    tags: ['mouse', 'logitech', 'inalámbrico']
  },
  {
    id: 'PROD-003',
    name: 'Teclado Mecánico RGB',
    description: 'Teclado mecánico gaming con retroiluminación RGB y switches Cherry MX',
    sku: 'KB-RGB-001',
    category: 'Gaming',
    price: 89.99,
    cost: 65.00,
    stock: 0,
    minStock: 10,
    status: 'out_of_stock',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    tags: ['teclado', 'gaming', 'rgb', 'mecánico']
  },
  {
    id: 'PROD-004',
    name: 'Monitor 24" Full HD',
    description: 'Monitor LED 24 pulgadas Full HD 1920x1080, 75Hz, HDMI/VGA',
    sku: 'MON-24-FHD-001',
    category: 'Monitores',
    price: 179.99,
    cost: 120.00,
    stock: 45,
    minStock: 8,
    status: 'active',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-13',
    tags: ['monitor', '24inch', 'fullhd', 'led']
  },
  {
    id: 'PROD-005',
    name: 'Auriculares Bluetooth Premium',
    description: 'Auriculares inalámbricos con cancelación de ruido activa y 30h de batería',
    sku: 'AUD-BT-PREM-001',
    category: 'Audio',
    price: 199.99,
    cost: 140.00,
    stock: 12,
    minStock: 15,
    status: 'inactive',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    tags: ['auriculares', 'bluetooth', 'premium', 'noise-cancelling']
  }
];

const categories = ['Todos', 'Electrónicos', 'Accesorios', 'Gaming', 'Monitores', 'Audio'];

const ProductsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [products, setProducts] = useState(mockProducts);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || categoryFilter === 'Todos' || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <EyeOff className="w-4 h-4 text-gray-500" />;
      case 'out_of_stock':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { color: 'text-red-600', label: 'Sin stock' };
    if (stock <= minStock) return { color: 'text-yellow-600', label: 'Stock bajo' };
    return { color: 'text-green-600', label: 'En stock' };
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' }
        : product
    ));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? { ...editingProduct, updatedAt: new Date().toISOString().split('T')[0] }
          : product
      ));
      setEditingProduct(null);
    }
  };

  const handleExportProducts = () => {
    const csvContent = [
      ['ID', 'Nombre', 'SKU', 'Categoría', 'Precio', 'Costo', 'Stock', 'Stock Mínimo', 'Estado'].join(','),
      ...filteredProducts.map(product => [
        product.id,
        `"${product.name}"`,
        product.sku,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.minStock,
        product.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const lowStockCount = products.filter(product => product.stock <= product.minStock && product.stock > 0).length;
  const outOfStockCount = products.filter(product => product.stock === 0).length;
  const activeProductsCount = products.filter(product => product.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
            <p className="text-gray-600">Administra tu inventario y catálogo de productos</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>
          <button
            onClick={handleExportProducts}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, SKU, descripción o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category === 'Todos' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="out_of_stock">Sin Stock</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Costo: ${product.cost.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.stock} unidades</div>
                        <div className={`text-sm ${stockStatus.color}`}>{stockStatus.label}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(product.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                          {product.status === 'active' ? 'Activo' : 
                           product.status === 'inactive' ? 'Inactivo' : 'Sin Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className="p-1 text-yellow-600 hover:text-yellow-900"
                          title={product.status === 'active' ? 'Desactivar' : 'Activar'}
                        >
                          {product.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalles del Producto</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.sku}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <span className="text-sm font-medium">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">SKU:</span>
                      <span className="text-sm font-medium font-mono">{selectedProduct.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Categoría:</span>
                      <span className="text-sm font-medium">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedProduct.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.status)}`}>
                          {selectedProduct.status === 'active' ? 'Activo' : 
                           selectedProduct.status === 'inactive' ? 'Inactivo' : 'Sin Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Precios e Inventario</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio de Venta:</span>
                      <span className="text-sm font-medium text-green-600">${selectedProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Costo:</span>
                      <span className="text-sm font-medium">${selectedProduct.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margen:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {(((selectedProduct.price - selectedProduct.cost) / selectedProduct.price) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock Actual:</span>
                      <span className="text-sm font-medium">{selectedProduct.stock} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock Mínimo:</span>
                      <span className="text-sm font-medium">{selectedProduct.minStock} unidades</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Creado:</span> {selectedProduct.createdAt}
                </div>
                <div>
                  <span className="font-medium">Actualizado:</span> {selectedProduct.updatedAt}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleEditProduct(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Editar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Editar Producto</h3>
                  <p className="text-sm text-gray-600">{editingProduct.sku}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(cat => cat !== 'Todos').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="out_of_stock">Sin Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.cost}
                    onChange={(e) => setEditingProduct({...editingProduct, cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({...editingProduct, minStock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Importar Productos</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">El archivo CSV debe contener las siguientes columnas:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Nombre</li>
                  <li>SKU</li>
                  <li>Descripción</li>
                  <li>Categoría</li>
                  <li>Precio</li>
                  <li>Costo</li>
                  <li>Stock</li>
                  <li>Stock Mínimo</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredProducts.length}</span> de{' '}
          <span className="font-medium">{products.length}</span> productos
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            Anterior
          </button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;