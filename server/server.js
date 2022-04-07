import express from 'express';
import Cors from 'cors';
import { start } from './startScript.js';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(Cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use('/api/users/', userRoutes);
app.use('/api/auth', authRoutes);

export default app;
start();
