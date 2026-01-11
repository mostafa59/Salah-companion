import mongoose from 'mongoose';

const prayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  prayers: {
    fajr: { type: Boolean, default: false },
    dhuhr: { type: Boolean, default: false },
    asr: { type: Boolean, default: false },
    maghrib: { type: Boolean, default: false },
    isha: { type: Boolean, default: false }
  },
  prayerMeta: {
    fajr: {
      onTime: { type: Boolean, default: true },
      kaffarah: { type: Number, default: 0 },
      location: { type: String, default: 'home' }
    },
    dhuhr: {
      onTime: { type: Boolean, default: true },
      kaffarah: { type: Number, default: 0 },
      location: { type: String, default: 'home' }
    },
    asr: {
      onTime: { type: Boolean, default: true },
      kaffarah: { type: Number, default: 0 },
      location: { type: String, default: 'home' }
    },
    maghrib: {
      onTime: { type: Boolean, default: true },
      kaffarah: { type: Number, default: 0 },
      location: { type: String, default: 'home' }
    },
    isha: {
      onTime: { type: Boolean, default: true },
      kaffarah: { type: Number, default: 0 },
      location: { type: String, default: 'home' }
    }
  },
  mood: {
    type: String,
    default: null
  },
  // ===== NEW FIELDS FOR PHASE 2 =====
  qada: {
    type: [String],
    default: []
  },
  qadaCompleted: {
    type: Boolean,
    default: false
  },
  insights: {
    missedPrayers: { type: Number, default: 0 },
    onTimePrayers: { type: Number, default: 0 },
    locationPattern: { type: String, default: null }
  }
}, { timestamps: true });

prayerSchema.index({ user: 1, date: 1 }, { unique: true });
prayerSchema.index({ user: 1 });

export default mongoose.model('PrayerLog', prayerSchema);
