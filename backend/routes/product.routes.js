import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from '../validators/product.validator.js';
import { create, list, getOne, update, remove } from '../controllers/product.controller.js';

const router = Router();

router.get('/', authenticate, validate(listProductsQuerySchema, 'query'), list);
router.post('/', authenticate, validate(createProductSchema), create);
router.get('/:id', authenticate, getOne);
router.put('/:id', authenticate, validate(updateProductSchema), update);
router.delete('/:id', authenticate, remove);

export default router;
