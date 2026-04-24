import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import upload, { handleUploadError } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from '../validators/product.validator.js';
import { create, list, getOne, update, remove } from '../controllers/product.controller.js';

const router = Router();

router.get('/', authenticate, validate(listProductsQuerySchema, 'query'), list);
router.post(
  '/',
  authenticate,
  upload.single('image'),
  handleUploadError,
  validate(createProductSchema),
  create
);
router.get('/:id', authenticate, getOne);
router.put(
  '/:id',
  authenticate,
  upload.single('image'),
  handleUploadError,
  validate(updateProductSchema),
  update
);
router.delete('/:id', authenticate, remove);

export default router;
