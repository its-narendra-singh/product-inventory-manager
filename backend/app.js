import fs from 'fs';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';

fs.mkdirSync('uploads', { recursive: true });

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Serve uploaded files with CORS headers for cross-origin access
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  next();
});
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorMiddleware);

export default app;
