import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/userRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dataloggerRoutes from './routes/dataloggerRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import solutionRoutes from './routes/solutionRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(cors({ origin: process.env.BASE_URL_FRONT }));

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests from the same IP in 15 minutes
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/dataloggers', dataloggerRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/solutions', solutionRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

export default app;
