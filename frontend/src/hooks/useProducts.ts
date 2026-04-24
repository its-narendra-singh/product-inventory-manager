import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductsApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  type ProductQuery,
  type ProductFormData,
} from '../services/product.service';
import { DASHBOARD_KEY } from './useDashboard';

export const PRODUCTS_KEY = 'products';

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, query],
    queryFn: () => getProductsApi(query),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => getProductApi(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => createProductApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => updateProductApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}
