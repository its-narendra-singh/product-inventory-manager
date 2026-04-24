import api from '../api/axios';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  sku?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  inStock?: 'true' | 'false' | '';
  sortBy?: 'price' | 'stock' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  sku?: string;
  image?: File | null;
}

function toFormData(data: ProductFormData): FormData {
  const fd = new FormData();
  fd.append('name', data.name);
  fd.append('price', String(data.price));
  fd.append('category', data.category);
  fd.append('stock', String(data.stock));
  if (data.description) fd.append('description', data.description);
  if (data.sku) fd.append('sku', data.sku);
  if (data.image) fd.append('image', data.image);
  return fd;
}

export async function getProductsApi(query: ProductQuery): Promise<ProductListResponse> {
  const params: Record<string, string> = {};
  if (query.search) params.search = query.search;
  if (query.category) params.category = query.category;
  if (query.inStock) params.inStock = query.inStock;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.order) params.order = query.order;
  if (query.page) params.page = String(query.page);
  if (query.limit) params.limit = String(query.limit);

  const { data } = await api.get<{ data: ProductListResponse }>('/api/products', { params });
  return data.data;
}

export async function getProductApi(id: string): Promise<Product> {
  const { data } = await api.get<{ data: Product }>(`/api/products/${id}`);
  return data.data;
}

export async function createProductApi(formData: ProductFormData): Promise<Product> {
  const { data } = await api.post<{ data: Product }>('/api/products', toFormData(formData), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateProductApi(id: string, formData: ProductFormData): Promise<Product> {
  const { data } = await api.put<{ data: Product }>(`/api/products/${id}`, toFormData(formData), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteProductApi(id: string): Promise<void> {
  await api.delete(`/api/products/${id}`);
}
