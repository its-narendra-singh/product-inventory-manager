import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import upload, { handleUploadError } from '../middlewares/upload.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', authenticate, upload.single('image'), handleUploadError, uploadImage);

export default router;
