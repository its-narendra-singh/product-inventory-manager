import Product from '../models/product.model.js';
import AppError from '../utils/AppError.js';

const ALLOWED_SORT_FIELDS = new Set(['price', 'stock', 'createdAt']);

export const createProduct = async (data, userId) => {
  return Product.create({ ...data, createdBy: userId });
};

export const getProducts = async (userId, query) => {
  const { search, category, inStock, sortBy, order, page = 1, limit = 10 } = query;

  const filter = { createdBy: userId };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  } else if (inStock === 'false') {
    filter.stock = 0;
  }

  let sort;
  if (search && !sortBy) {
    sort = { score: { $meta: 'textScore' } };
  } else {
    const sortField = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    sort = { [sortField]: sortOrder };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getProductById = async (productId, userId) => {
  const product = await Product.findById(productId).lean();

  if (!product) throw new AppError('Product not found', 404);

  if (product.createdBy.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this product', 403);
  }

  return product;
};

export const updateProduct = async (productId, userId, data) => {
  const product = await Product.findById(productId);

  if (!product) throw new AppError('Product not found', 404);

  if (product.createdBy.toString() !== userId.toString()) {
    throw new AppError('Not authorized to update this product', 403);
  }

  Object.assign(product, data);
  await product.save();

  return product;
};

export const deleteProduct = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) throw new AppError('Product not found', 404);

  if (product.createdBy.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this product', 403);
  }

  await product.deleteOne();
};
