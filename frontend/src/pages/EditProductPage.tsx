import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Button } from '../components/ui';
import ProductForm from '../components/products/ProductForm';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useProduct, useUpdateProduct } from '../hooks/useProducts';
import type { ProductFormData } from '../services/product.service';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProduct(id!);
  const { mutateAsync, isPending } = useUpdateProduct(id!);

  async function handleSubmit(data: ProductFormData) {
    await mutateAsync(data);
    navigate('/products');
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">
            ← Back to products
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Edit product</h1>
        </div>

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
            <ProductForm
              initial={product}
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel="Save changes"
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
