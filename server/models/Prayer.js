import mongoose from 'mongoose';

const prayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    prayerName: {
      type: String,
      enum: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    logged: {
      type: Boolean,
      default: false
    },
    mood: {
      type: String,
      enum: ['Happy', 'Sad', 'Neutral', null],
      default: null
    },
    tags: {
      type: [String],
      enum: ['On-time', 'Late', 'Rushed', 'Focused', 'Community'],
      default: []
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

prayerSchema.index({ userId: 1, date: 1 });
prayerSchema.index({ userId: 1, prayerName: 1, date: 1 });

export default mongoose.model('Prayer', prayerSchema);
