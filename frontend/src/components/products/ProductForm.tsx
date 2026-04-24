import { useState, useRef, type FormEvent } from 'react';
import { Button, Input } from '../ui';
import type { Product, ProductFormData } from '../../services/product.service';

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  stock?: string;
}

interface ProductFormProps {
  initial?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

function validate(name: string, price: string, category: string, stock: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = 'Product name is required';
  if (price === '') errors.price = 'Price is required';
  else if (isNaN(Number(price)) || Number(price) < 0) errors.price = 'Price must be 0 or more';
  if (!category.trim()) errors.category = 'Category is required';
  if (stock === '') errors.stock = 'Stock is required';
  else if (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    errors.stock = 'Stock must be a non-negative integer';
  return errors;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function ProductForm({
  initial,
  onSubmit,
  isLoading,
  submitLabel,
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [stock, setStock] = useState(initial?.stock !== undefined ? String(initial.stock) : '');
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.imageUrl ? `${BASE_URL}${initial.imageUrl}` : null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validate(name, price, category, stock);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setServerError('');
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        category: category.trim(),
        stock: Number(stock),
        sku: sku.trim() || undefined,
        image,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setServerError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            id="name"
            label="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
            placeholder="e.g. Wireless Mouse"
          />
        </div>

        <Input
          id="price"
          label="Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errors.price}
          required
          placeholder="0.00"
        />

        <Input
          id="stock"
          label="Stock"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          error={errors.stock}
          required
          placeholder="0"
        />

        <Input
          id="category"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          required
          placeholder="e.g. Electronics"
        />

        <Input
          id="sku"
          label="SKU (optional)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. WM-001"
        />

        <div className="sm:col-span-2 flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional product description"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Image (optional)</span>
          {preview && (
            <img
              src={preview}
              alt="Product preview"
              className="h-32 w-32 rounded-lg object-cover border border-gray-200"
            />
          )}
          <input
            ref={fileRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-fit text-sm text-blue-600 hover:underline"
          >
            {preview ? 'Change image' : 'Upload image'}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
