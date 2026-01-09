import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import prayerRoutes from './routes/prayers.js'; // <-- 1. IMPORT IT
import qadaRoutes from './routes/qada.js';


dotenv.config();

const app = express();

// Enable CORS (Cross-Origin Resource Sharing)
// This is like opening port 80/443 on a firewall to allow traffic
app.use(cors({
  origin: '*', // "Allow All" (Easiest for development)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed actions
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`🔔 Incoming Request: [${req.method}] ${req.url}`);
  next();
});

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes); // <-- 2. MOUNT IT (This creates the /api/prayers URL)
app.use('/api/qada', qadaRoutes); 

app.get('/', (req, res) => {
  res.send('Server is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
