import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const connectDB = async () => {
  try {
    // Comment out MongoDB للتجربة
    // await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Disabled (Demo Mode)');
  } catch (error) {
    console.log('❌ MongoDB Connection Error:', error.message);
    // لا نوقّف السيرفر، نستمر بدون DB
    console.log('🚀 Server continues without DB (Demo Mode)');
  }
};


app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
