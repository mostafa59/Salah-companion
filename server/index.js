import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import prayerRoutes from './routes/prayers.js';
import qadaRoutes from './routes/qada.js';
import friendRoutes from './routes/friends.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// --- MIDDLEWARE ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`🔔 [${req.method}] ${req.url}`);
  next();
});

// --- DATABASE CONNECTION ---
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch((err) => console.error("❌ DB Error:", err));
}

// --- ENHANCED SOCKET.IO LOGIC ---
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('\n⚡ === NEW SOCKET CONNECTION ===');
  console.log('🆔 Socket ID:', socket.id);
  console.log('🌐 Client IP:', socket.handshake.address);

  socket.on('join', (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    
    console.log('\n👤 === USER JOINED ROOM ===');
    console.log('🆔 User ID:', userId);
    console.log('🔌 Socket ID:', socket.id);
    console.log('🏠 User is now in rooms:', Array.from(socket.rooms));
    console.log('📊 Total online users:', onlineUsers.size);
    console.log('👥 Online users list:', Array.from(onlineUsers.keys()));
    console.log('=========================\n');
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log('\n👋 === USER DISCONNECTED ===');
        console.log('🆔 User ID:', userId);
        console.log('🔌 Socket ID:', socket.id);
        console.log('📊 Remaining online users:', onlineUsers.size);
        console.log('============================\n');
        break;
      }
    }
  });
});

// Make Socket.io accessible to routes
app.set('io', io);

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/qada', qadaRoutes);
app.use('/api/friends', friendRoutes); 
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Salah Companion Backend is Live! 🚀');
});

// --- SERVER START ---
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 ================================`);
    console.log(`🚀 Server & Socket.io running on port ${PORT}`);
    console.log(`🚀 ================================\n`);
  });
}

export default app;
