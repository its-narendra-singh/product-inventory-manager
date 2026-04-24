import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui';
import Modal from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import type { Product, ProductQuery } from '../services/product.service';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'stock', label: 'Stock' },
];

function buildQuery(params: URLSearchParams): ProductQuery {
  return {
    search: params.get('search') ?? undefined,
    category: params.get('category') ?? undefined,
    inStock: (params.get('inStock') as ProductQuery['inStock']) ?? undefined,
    sortBy: (params.get('sortBy') as ProductQuery['sortBy']) ?? undefined,
    order: (params.get('order') as ProductQuery['order']) ?? undefined,
    page: Number(params.get('page') ?? 1),
    limit: 10,
  };
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = buildQuery(searchParams);

  const { data, isLoading, isError } = useProducts(query);
  const deleteMutation = useDeleteProduct();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <Link to="/products/new">
            <Button variant="primary">+ Add product</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search products…"
              defaultValue={searchParams.get('search') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  setParam('search', (e.target as HTMLInputElement).value.trim());
              }}
              onBlur={(e) => setParam('search', e.target.value.trim())}
              className="flex-1 min-w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Category"
              defaultValue={searchParams.get('category') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  setParam('category', (e.target as HTMLInputElement).value.trim());
              }}
              onBlur={(e) => setParam('category', e.target.value.trim())}
              className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={searchParams.get('inStock') ?? ''}
              onChange={(e) => setParam('inStock', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All stock</option>
              <option value="true">In stock</option>
              <option value="false">Out of stock</option>
            </select>

            <select
              value={searchParams.get('sortBy') ?? ''}
              onChange={(e) => setParam('sortBy', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={searchParams.get('order') ?? 'desc'}
              onChange={(e) => setParam('order', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={6} />
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-red-600">
              Failed to load products. Please try again.
            </div>
          ) : !data?.products.length ? (
            <div className="p-16 text-center">
              <p className="text-gray-500 text-sm">No products found.</p>
              <Link
                to="/products/new"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={`${BASE_URL}${product.imageUrl}`}
                            alt={product.name}
                            className="h-9 w-9 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          product.stock > 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                        ].join(' ')}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${product._id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(product)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {data.page} of {data.totalPages} &mdash; {data.total} products
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setParam('page', String(data.page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setParam('page', String(data.page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">{deleteTarget?.name}</span>? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageLayout>
  );
}
