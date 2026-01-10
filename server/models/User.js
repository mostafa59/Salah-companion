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
  }
});

// --- AUTO-GENERATE FRIEND CODE BEFORE SAVING ---
userSchema.pre('save', function(next) {
  if (!this.friendCode) {
    // Generate random 6-character code (e.g., PLAY3R)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.friendCode = code;
  }
  next();
});

export default mongoose.model('User', userSchema);
