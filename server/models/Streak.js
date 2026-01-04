import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    maxStreak: {
      type: Number,
      default: 0
    },
    lastLoggedDate: {
      type: Date,
      default: null
    },
    badges: [
      {
        name: String,
        unlockedAt: Date,
        icon: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Streak', streakSchema);
