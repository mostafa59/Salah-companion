import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  
  friendCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  },

  // ===== NEW FIELDS FOR PHASE 2 =====
  stats: {
    totalPrayers: { type: Number, default: 0 },
    thisMonthPrayers: { type: Number, default: 0 },
    thisWeekPrayers: { type: Number, default: 0 },
    onTimePercentage: { type: Number, default: 100 },
    longestStreak: { type: Number, default: 0 },
    averageMood: { type: String, default: 'neutral' }
  },

  challenges: {
    active: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    completed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }]
  },

  qada: {
    outstanding: {
      fajr: { type: Number, default: 0 },
      dhuhr: { type: Number, default: 0 },
      asr: { type: Number, default: 0 },
      maghrib: { type: Number, default: 0 },
      isha: { type: Number, default: 0 }
    },
    totalOwed: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },

  notificationPreferences: {
    enabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    reminderMinutes: { type: Number, default: 30 },
    reminderType: { type: String, enum: ['browser', 'toast', 'both'], default: 'both' }
  }
});

// Auto-generate friend code
userSchema.pre('save', function(next) {
  if (!this.friendCode) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.friendCode = code;
  }
  next();
});

export default mongoose.model('User', userSchema);
