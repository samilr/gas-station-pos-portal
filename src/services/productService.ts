import { buildApiUrl } from '../config/api';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../types/product';

export const getAllProducts = async (): Promise<IProduct[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl('products'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (productData: ICreateProductDto): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl('products'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, productData: IUpdateProductDto): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl(`products/${productId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl(`products/${productId}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
