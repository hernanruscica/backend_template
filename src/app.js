import express from 'express';
import userRoutes from './routes/userRoutes.js';
import businessRoutes from './routes/businessRoutes.js';

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
