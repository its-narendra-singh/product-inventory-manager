import Joi from 'joi';

const productFields = {
  name: Joi.string().trim().max(200).messages({
    'string.max': 'Product name cannot exceed 200 characters',
    'string.empty': 'Product name is required',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  category: Joi.string().trim().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
  stock: Joi.number().integer().min(0).messages({
    'number.base': 'Stock must be a number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock cannot be negative',
    'any.required': 'Stock is required',
  }),
  // empty string → undefined so sparse unique index on sku is not violated
  sku: Joi.string().trim().empty('').messages({
    'string.base': 'SKU must be a string',
  }),
  imageUrl: Joi.string().trim().empty('').messages({
    'string.base': 'Image URL must be a string',
  }),
};

export const listProductsQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''),
  category: Joi.string().trim().allow(''),
  inStock: Joi.string().valid('true', 'false').messages({
    'any.only': 'inStock must be "true" or "false"',
  }),
  sortBy: Joi.string().valid('price', 'stock', 'createdAt').messages({
    'any.only': 'sortBy must be one of: price, stock, createdAt',
  }),
  order: Joi.string().valid('asc', 'desc').messages({
    'any.only': 'order must be "asc" or "desc"',
  }),
  page: Joi.number().integer().min(1).messages({
    'number.base': 'page must be a number',
    'number.integer': 'page must be an integer',
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).messages({
    'number.base': 'limit must be a number',
    'number.integer': 'limit must be an integer',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit cannot exceed 100',
  }),
});

export const createProductSchema = Joi.object({
  name: productFields.name.required(),
  description: productFields.description,
  price: productFields.price.required(),
  category: productFields.category.required(),
  stock: productFields.stock.required(),
  sku: productFields.sku,
  imageUrl: productFields.imageUrl,
});

export const updateProductSchema = Joi.object({
  name: productFields.name,
  description: productFields.description,
  price: productFields.price,
  category: productFields.category,
  stock: productFields.stock,
  sku: productFields.sku,
  imageUrl: productFields.imageUrl,
}).min(1);
