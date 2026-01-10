import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; // NEW
import { Server } from 'socket.io'; // NEW
import authRoutes from './routes/auth.js';
import prayerRoutes from './routes/prayers.js';
import qadaRoutes from './routes/qada.js';
import friendRoutes from './routes/friends.js';

dotenv.config();

const app = express();
const httpServer = createServer(app); // NEW: Wrap Express

// NEW: Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`🔔 [${req.method}] ${req.url}`);
  next();
});

// Database
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB Connected!"))
      .catch((err) => console.error("❌ DB Error:", err));
}

// NEW: Socket.io Logic
const onlineUsers = new Map(); // Track online users: userId -> socketId

io.on('connection', (socket) => {
  console.log('⚡ Socket Connected:', socket.id);

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} joined room ${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from tracking
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`👋 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// IMPORTANT: Make 'io' accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/qada', qadaRoutes);
app.use('/api/friends', friendRoutes);

app.get('/', (req, res) => {
  res.send('Salah Companion Backend is Live!');
});

// ---------------------------------------------------------
// VERCEL CONFIGURATION
// ---------------------------------------------------------

// If we are running locally (npm run dev), use httpServer.listen (CHANGED)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => { // CHANGED from app.listen
      console.log(`🚀 Server & Socket.io running on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless
export default app;
