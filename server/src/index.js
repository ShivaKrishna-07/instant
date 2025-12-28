import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/AuthRoutes.js'

dotenv.config();

import pool from './db/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

await pool.query("SELECT 1");
console.log("DB ready");

app.use('/api/auth', authRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});