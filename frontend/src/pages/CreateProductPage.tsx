import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import ProductForm from '../components/products/ProductForm';
import { useCreateProduct } from '../hooks/useProducts';
import type { ProductFormData } from '../services/product.service';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProduct();

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
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Add product</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ProductForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create product" />
        </div>
      </div>
    </PageLayout>
  );
}
