import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import ProductForm from '../components/products/ProductForm';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useProduct, useUpdateProduct } from '../hooks/useProducts';
import type { ProductFormData } from '../services/product.service';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
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
            <p className="text-sm text-red-600">Product not found or you don't have access.</p>
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
