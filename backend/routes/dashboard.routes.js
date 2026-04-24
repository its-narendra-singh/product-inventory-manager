import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import { stats } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', authenticate, stats);

export default router;
