import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui';
import Modal from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import type { Product, ProductQuery } from '../services/product.service';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className: string;
}

function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div className={`${className} bg-gray-100`} />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
}

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

function hasActiveFilters(params: URLSearchParams) {
  return ['search', 'category', 'inStock'].some((k) => params.get(k));
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = buildQuery(searchParams);

  // Controlled local state for text inputs — debounced before hitting the URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [categoryInput, setCategoryInput] = useState(searchParams.get('category') ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedCategory = useDebounce(categoryInput, 400);

  // Skip the initial mount fire — only sync to URL when the value actually changes
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) return;
    setParam('search', debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isMounted.current) return;
    setParam('category', debouncedCategory);
  }, [debouncedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMounted.current = true;
  }, []);

  const { data, isLoading, isError, refetch } = useProducts(query);
  const deleteMutation = useDeleteProduct();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function setParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true }
    );
  }

  function clearFilters() {
    setSearchInput('');
    setCategoryInput('');
    setSearchParams({}, { replace: true });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  const filtersActive = hasActiveFilters(searchParams);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            {!isLoading && data && (
              <p className="mt-0.5 text-sm text-gray-500">{data.total} total</p>
            )}
          </div>
          <Link to="/products/new">
            <Button variant="primary">+ Add product</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            {/* Debounced search */}
            <div className="relative flex-1 min-w-48">
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs leading-none"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Debounced category */}
            <div className="relative w-40">
              <input
                type="text"
                placeholder="Category"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {categoryInput && (
                <button
                  onClick={() => setCategoryInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs leading-none"
                  aria-label="Clear category"
                >
                  ✕
                </button>
              )}
            </div>

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

            {filtersActive && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={6} />
            </div>
          ) : isError ? (
            /* Error state */
            <div className="p-16 flex flex-col items-center gap-4 text-center">
              <p className="text-2xl">⚠️</p>
              <div>
                <p className="font-medium text-gray-900">Failed to load products</p>
                <p className="mt-1 text-sm text-gray-500">
                  Something went wrong. Please try again.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !data?.products.length ? (
            filtersActive ? (
              /* Empty state — filters active */
              <div className="p-16 flex flex-col items-center gap-3 text-center">
                <p className="text-2xl">🔍</p>
                <div>
                  <p className="font-medium text-gray-900">No results found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                </div>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Empty state — no products at all */
              <div className="p-16 flex flex-col items-center gap-3 text-center">
                <p className="text-4xl">📦</p>
                <div>
                  <p className="font-medium text-gray-900">No products yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your first product to start managing your inventory.
                  </p>
                </div>
                <Link to="/products/new">
                  <Button variant="primary" size="sm">
                    + Add product
                  </Button>
                </Link>
              </div>
            )
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
                          <ImageWithFallback
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
