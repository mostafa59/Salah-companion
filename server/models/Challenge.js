import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    enum: [
      'صلِّ الخمس',
      'أسبوع متكامل',
      'الفجر الباكر',
      'تحدي التركيز',
      'بدون تأخير'
    ],
    required: true
  },

  description: String,

  targetDays: { type: Number, default: 7 },
  daysCompleted: { type: Number, default: 0 },
  
  targetPrayers: { type: Number, default: 5 },
  completedCount: { type: Number, default: 0 },

  progress: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused'],
    default: 'active'
  },

  startDate: { type: Date, default: Date.now },
  endDate: Date,
  completedDate: Date,

  reward: {
    points: { type: Number, default: 100 },
    badge: String
  },

  lastCheckedDate: Date
}, { timestamps: true });

challengeSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Challenge', challengeSchema);
