import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useProduct } from '../hooks/useProducts';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function ViewProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, refetch } = useProduct(id!);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/products" className="text-sm text-blue-600 hover:underline">
              ← Back to products
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Product details</h1>
          </div>

          {product && (
            <Link to={`/products/${product._id}/edit`}>
              <Button variant="primary">Edit</Button>
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError || !product ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="font-medium text-gray-900">Product not found</p>
              <p className="text-sm text-gray-500">
                It may have been deleted or you don't have access.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
                <Link to="/products">
                  <Button variant="primary" size="sm">
                    Back to products
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image */}
              {product.imageUrl && (
                <img
                  src={`${BASE_URL}${product.imageUrl}`}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              )}

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Name" value={product.name} />
                <Detail label="Category" value={product.category} />
                <Detail label="Price" value={`$${product.price.toFixed(2)}`} />
                <Detail
                  label="Stock"
                  value={
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
                      ].join(' ')}
                    >
                      {product.stock}
                    </span>
                  }
                />
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}

              {/* SKU */}
              {product.sku && <Detail label="SKU" value={product.sku} />}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

/* Small reusable component */
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
