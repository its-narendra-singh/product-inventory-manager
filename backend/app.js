import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(errorMiddleware);

export default app;
