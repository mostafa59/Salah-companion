import mongoose from 'mongoose';

const qadaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One counter per user
  },
  // These numbers represent the MANUAL offset
  // (e.g., +10 means "I owe 10 extra", -5 means "I paid back 5")
  fajr: { type: Number, default: 0 },
  dhuhr: { type: Number, default: 0 },
  asr: { type: Number, default: 0 },
  maghrib: { type: Number, default: 0 },
  isha: { type: Number, default: 0 }
});

export default mongoose.model('Qada', qadaSchema);
