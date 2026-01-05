import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js'
import messagesRoutes from './routes/MessageRoutes.js'
import conversationsRoutes from './routes/ConversationRoutes.js'
import authMiddleware from './middlewares/AuthMiddleware.js';
import { Server } from 'socket.io';
import './config/firebaseAdmin.js';

dotenv.config();

import pool from './db/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      process.env.CLIENT_ORIGIN || "http://localhost:3000",
      "http://10.88.50.119:3000", "https://1461e7126520.ngrok-free.app"
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

await pool.query("SELECT 1");
console.log("DB ready");

// Public auth routes
app.use('/api/auth', authRoutes);

// Protect remaining API routes
app.use('/api', authMiddleware);
app.use('/api/messages', messagesRoutes);
app.use('/api/conversations', conversationsRoutes);

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
  
  // WebRTC signaling: caller -> callee relay
  socket.on('call-user', (data) => {
    // data: { to, from, offer }
    const targetSocket = onlineUsers.get(data.to);
    if (targetSocket) {
      socket.to(targetSocket).emit('incoming-call', { from: data.from, offer: data.offer, fromMeta: data.fromMeta || null });
    }
  });

  socket.on('accept-call', (data) => {
    // data: { to, from, answer }
    const targetSocket = onlineUsers.get(data.to);
    if (targetSocket) {
      socket.to(targetSocket).emit('call-accepted', { from: data.from, answer: data.answer });
    }
  });

  socket.on('reject-call', (data) => {
    const targetSocket = onlineUsers.get(data.to);
    if (targetSocket) {
      socket.to(targetSocket).emit('call-rejected', { from: data.from });
    }
  });

  socket.on('ice-candidate', (data) => {
    // data: { to, from, candidate }
    const targetSocket = onlineUsers.get(data.to);
    if (targetSocket) {
      socket.to(targetSocket).emit('ice-candidate', { from: data.from, candidate: data.candidate });
    }
  });

  socket.on('end-call', (data) => {
    const targetSocket = onlineUsers.get(data.to);
    if (targetSocket) {
      socket.to(targetSocket).emit('call-ended', { from: data.from });
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