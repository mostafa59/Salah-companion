import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  
  // --- NEW FIELD: THE FAJR CLUB ID ---
  friendCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  }
});

export default mongoose.model('User', userSchema);
