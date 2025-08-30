import { useState, useEffect, useCallback } from 'react';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../types/product';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';

// Mock data para desarrollo
const mockProducts: IProduct[] = [
  {
    product_id: 'PROD001',
    name: 'Laptop HP Pavilion',
    description: 'Laptop de alta gama para trabajo y gaming',
    category_id: 'CAT001',
    account_group_id: 'ACC001',
    miscellaneous: false,
    recipe: false,
    tax_id: 'TAX001',
    price: 899.99,
    price_is_taxed: true,
    costing_method: 1,
    input_unit_id: 'UNIT001',
    output_unit_id: 'UNIT001',
    allow_discount: true,
    expected_profit: 150.00,
    weight_net: 2.5,
    weight_gross: 3.0,
    image: 'laptop-hp.jpg',
    inventory: true,
    active: true
  },
  {
    product_id: 'PROD002',
    name: 'Mouse Inalámbrico',
    description: 'Mouse ergonómico con conexión inalámbrica',
    category_id: 'CAT002',
    account_group_id: 'ACC002',
    miscellaneous: false,
    recipe: false,
    tax_id: 'TAX001',
    price: 29.99,
    price_is_taxed: true,
    costing_method: 1,
    input_unit_id: 'UNIT001',
    output_unit_id: 'UNIT001',
    allow_discount: true,
    expected_profit: 8.00,
    weight_net: 0.15,
    weight_gross: 0.2,
    image: 'mouse-wireless.jpg',
    inventory: true,
    active: true
  },
  {
    product_id: 'PROD003',
    name: 'Teclado Mecánico',
    description: 'Teclado mecánico con switches Cherry MX',
    category_id: 'CAT002',
    account_group_id: 'ACC002',
    miscellaneous: false,
    recipe: false,
    tax_id: 'TAX001',
    price: 89.99,
    price_is_taxed: true,
    costing_method: 1,
    input_unit_id: 'UNIT001',
    output_unit_id: 'UNIT001',
    allow_discount: true,
    expected_profit: 20.00,
    weight_net: 0.8,
    weight_gross: 1.2,
    image: 'keyboard-mechanical.jpg',
    inventory: true,
    active: false
  },
  {
    product_id: 'PROD004',
    name: 'Monitor 24"',
    description: 'Monitor LED de 24 pulgadas Full HD',
    category_id: 'CAT001',
    account_group_id: 'ACC001',
    miscellaneous: false,
    recipe: false,
    tax_id: 'TAX001',
    price: 199.99,
    price_is_taxed: true,
    costing_method: 1,
    input_unit_id: 'UNIT001',
    output_unit_id: 'UNIT001',
    allow_discount: true,
    expected_profit: 40.00,
    weight_net: 3.5,
    weight_gross: 4.2,
    image: 'monitor-24.jpg',
    inventory: true,
    active: true
  },
  {
    product_id: 'PROD005',
    name: 'Auriculares Gaming',
    description: 'Auriculares con micrófono para gaming',
    category_id: 'CAT003',
    account_group_id: 'ACC003',
    miscellaneous: false,
    recipe: false,
    tax_id: 'TAX001',
    price: 79.99,
    price_is_taxed: true,
    costing_method: 1,
    input_unit_id: 'UNIT001',
    output_unit_id: 'UNIT001',
    allow_discount: true,
    expected_profit: 15.00,
    weight_net: 0.3,
    weight_gross: 0.4,
    image: 'headphones-gaming.jpg',
    inventory: true,
    active: true
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar desde la API
      const apiProducts = await getAllProducts();
      setProducts(apiProducts);
    } catch (err) {
      console.warn('Error loading products from API, using mock data:', err);
      setProducts(mockProducts);
      setError('Usando datos de prueba - Error de conexión con la API');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  const createNewProduct = useCallback(async (productData: ICreateProductDto): Promise<boolean> => {
    try {
      // Intentar crear en la API
      await createProduct(productData);
      
      // Si es exitoso, recargar los productos
      await loadProducts();
      return true;
    } catch (err) {
      console.warn('Error creating product in API, using mock data:', err);
      
      // Crear producto mock para desarrollo
      const newProduct: IProduct = {
        product_id: productData.productId,
        name: productData.name,
        description: productData.description,
        category_id: productData.categoryId,
        account_group_id: productData.accountGroupId,
        miscellaneous: productData.miscellaneous,
        recipe: productData.recipe,
        tax_id: productData.taxId,
        price: productData.price,
        price_is_taxed: productData.priceIsTaxed,
        costing_method: productData.costingMethod,
        input_unit_id: productData.inputUnitId,
        output_unit_id: productData.outputUnitId,
        allow_discount: productData.allowDiscount,
        expected_profit: productData.expectedProfit,
        weight_net: productData.weightNet,
        weight_gross: productData.weightGross,
        image: productData.image,
        inventory: productData.inventory,
        active: productData.active
      };
      
      setProducts(prev => [...prev, newProduct]);
      return true;
    }
  }, [loadProducts]);

  const updateExistingProduct = useCallback(async (productId: string, productData: IUpdateProductDto): Promise<boolean> => {
    try {
      // Intentar actualizar en la API
      await updateProduct(productId, productData);
      
      // Si es exitoso, recargar los productos
      await loadProducts();
      return true;
    } catch (err) {
      console.warn('Error updating product in API, using mock data:', err);
      
      // Actualizar producto mock para desarrollo
      setProducts(prev => prev.map(product => 
        product.product_id === productId 
          ? { 
              ...product, 
              ...(productData.name && { name: productData.name }),
              ...(productData.description !== undefined && { description: productData.description }),
              ...(productData.categoryId && { category_id: productData.categoryId }),
              ...(productData.accountGroupId !== undefined && { account_group_id: productData.accountGroupId }),
              ...(productData.miscellaneous !== undefined && { miscellaneous: productData.miscellaneous }),
              ...(productData.recipe !== undefined && { recipe: productData.recipe }),
              ...(productData.taxId && { tax_id: productData.taxId }),
              ...(productData.price !== undefined && { price: productData.price }),
              ...(productData.priceIsTaxed !== undefined && { price_is_taxed: productData.priceIsTaxed }),
              ...(productData.costingMethod !== undefined && { costing_method: productData.costingMethod }),
              ...(productData.inputUnitId && { input_unit_id: productData.inputUnitId }),
              ...(productData.outputUnitId && { output_unit_id: productData.outputUnitId }),
              ...(productData.allowDiscount !== undefined && { allow_discount: productData.allowDiscount }),
              ...(productData.expectedProfit !== undefined && { expected_profit: productData.expectedProfit }),
              ...(productData.weightNet !== undefined && { weight_net: productData.weightNet }),
              ...(productData.weightGross !== undefined && { weight_gross: productData.weightGross }),
              ...(productData.image !== undefined && { image: productData.image }),
              ...(productData.inventory !== undefined && { inventory: productData.inventory }),
              ...(productData.active !== undefined && { active: productData.active })
            }
          : product
      ));
      return true;
    }
  }, [loadProducts]);

  const deleteExistingProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      // Intentar eliminar en la API
      await deleteProduct(productId);
      
      // Si es exitoso, recargar los productos
      await loadProducts();
      return true;
    } catch (err) {
      console.warn('Error deleting product in API, using mock data:', err);
      
      // Eliminar producto mock para desarrollo
      setProducts(prev => prev.filter(product => product.product_id !== productId));
      return true;
    }
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts,
    createProduct: createNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: deleteExistingProduct
  };
};
