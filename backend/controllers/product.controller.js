import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../services/product.service.js';

export const create = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body, req.user._id);
  sendSuccess(res, { statusCode: 201, message: 'Product created successfully', data: product });
});

export const list = asyncHandler(async (req, res) => {
  const result = await getProducts(req.user._id, req.query);
  sendSuccess(res, { message: 'Products retrieved successfully', data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id, req.user._id);
  sendSuccess(res, { message: 'Product retrieved successfully', data: product });
});

export const update = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.user._id, req.body);
  sendSuccess(res, { message: 'Product updated successfully', data: product });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id, req.user._id);
  sendSuccess(res, { message: 'Product deleted successfully' });
});
