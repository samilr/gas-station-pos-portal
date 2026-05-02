import { ICreateProductDto, IUpdateProductDto } from '../types/product';
import {
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  IListProductsParams,
} from '../store/api/productsApi';
import { getErrorMessage } from '../store/api/baseApi';

export const useProducts = (params?: IListProductsParams) => {
  const { data, isLoading, isFetching, error, refetch } = useListProductsQuery(params ?? {});
  const [createMut] = useCreateProductMutation();
  const [updateMut] = useUpdateProductMutation();
  const [deleteMut] = useDeleteProductMutation();

  const createProduct = async (productData: ICreateProductDto) => {
    try {
      await createMut(productData).unwrap();
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al crear producto') ?? undefined };
    }
  };

  const updateProduct = async (productId: string, productData: IUpdateProductDto) => {
    try {
      await updateMut({ productId, body: productData }).unwrap();
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al actualizar producto') ?? undefined };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteMut(productId).unwrap();
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al eliminar producto') ?? undefined };
    }
  };

  return {
    products: data?.data ?? [],
    pagination: data?.pagination ?? null,
    loading: isLoading,
    fetching: isFetching,
    error: getErrorMessage(error, 'Error al cargar productos'),
    refreshProducts: refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
