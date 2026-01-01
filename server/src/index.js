import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js'
import messagesRoutes from './routes/MessageRoutes.js'
import authMiddleware from './middlewares/AuthMiddleware.js';
import './config/firebaseAdmin.js';

dotenv.config();

import pool from './db/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());

await pool.query("SELECT 1");
console.log("DB ready");

// Public auth routes
app.use('/api/auth', authRoutes);

// Protect remaining API routes
app.use('/api', authMiddleware);
app.use('/api/messages', messagesRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

global.onlineUsers = new Map();

export { app, server };