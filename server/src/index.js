import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js'
import messagesRoutes from './routes/MessageRoutes.js'
import authMiddleware from './middlewares/AuthMiddleware.js';
import { Server } from 'socket.io';
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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
})

global.onlineUsers = new Map();

io.on('connection', (socket) => {
  global.chatSocket = socket;
  
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
    // broadcast to others that this user is online
    try {
      io.emit('user-online', userId);
    } catch (e) {
      console.error('emit user-online failed', e);
    }
  });

  // respond to inquiries about whether a user is online (uses callback acknowledgement)
  socket.on('is-online', (userId, callback) => {
    try {
      const online = onlineUsers && onlineUsers.has(userId);
      if (typeof callback === 'function') callback({ online: !!online });
    } catch (e) {
      if (typeof callback === 'function') callback({ online: false });
    }
  });
  
  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-receive", {
        from: data.from,
        message: data.message
      });
    }
  });
  
  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        try {
          io.emit('user-offline', userId);
        } catch (e) {
          console.error('emit user-offline failed', e);
        }
        break;
      }
    }
  });
});

export { app, server, io };