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
import alarmRoutes from './routes/alarmRoutes.js';
import alarmLogsRoutes from './routes/alarmLogsRoutes.js';
import userAlarmRoutes from './routes/userAlarmRoutes.js'; 
import dataRoutes from './routes/dataRoutes.js';
import userBusinessRoutes from './routes/userBusinessRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(cors({ origin: process.env.BASE_URL_FRONT }));

// Limit requests from same API
const limiter = rateLimit({
  max: 200, // 100 requests from the same IP in 15 minutes
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);
app.use('/api', userRoutes);
app.use('/api', dataloggerRoutes);
app.use('/api', channelRoutes);
app.use('/api', dataRoutes);
app.use('/api', alarmRoutes);
app.use('/api', alarmLogsRoutes);
app.use('/api', solutionRoutes);
app.use('/api', userAlarmRoutes); 
app.use('/api', userBusinessRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(errorHandler);

export default app;
