import mongoose from 'mongoose';

const prayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // We will store "2026-01-07" directly to avoid Timezone headaches
    required: true
  },
  prayers: {
    fajr: { type: Boolean, default: false },
    dhuhr: { type: Boolean, default: false },
    asr: { type: Boolean, default: false },
    maghrib: { type: Boolean, default: false },
    isha: { type: Boolean, default: false }
  },
  mood: {
    type: String, // "Happy", "Sad", etc.
    default: null
  }
});

// Compound Index: Ensure a user can only have ONE log per Date
prayerSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('PrayerLog', prayerSchema);
