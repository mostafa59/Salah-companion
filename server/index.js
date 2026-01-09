import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import prayerRoutes from './routes/prayers.js';
import qadaRoutes from './routes/qada.js';

dotenv.config();

const app = express();

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
// Note: In Serverless (Vercel), we check connection status to avoid multiple connections
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB Connected!"))
      .catch((err) => console.error("❌ DB Error:", err));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/qada', qadaRoutes);

app.get('/', (req, res) => {
  res.send('Salah Companion Backend is Live!');
});

// ---------------------------------------------------------
// VERCEL CONFIGURATION
// ---------------------------------------------------------

// If we are running locally (npm run dev), use app.listen
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless
export default app;
