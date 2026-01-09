import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    // 1. Log the incoming data
    console.log("📦 Body Received:", req.body);

    const { name, email, password } = req.body;

    // 2. Validation
    if (!email || !password || !name) {
      console.log("❌ Missing fields!");
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // 3. Check User
    console.log("🔍 Checking if user exists...");
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists!");
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 4. Hash Password
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User
    console.log("👤 Creating user document...");
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    // 6. Save to DB
    console.log("💾 Saving to MongoDB...");
    await user.save();
    console.log("✅ User Saved Successfully!");

    // 7. Create Token
    console.log("🔑 Generating Token...");
    const payload = { user: { id: user.id } };
    
    // Check if Secret exists
    if (!process.env.JWT_SECRET) {
      console.error("❌ FATAL ERROR: JWT_SECRET is missing in .env file!");
      return res.status(500).send('Server Configuration Error');
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error("❌ Token Generation Failed:", err);
        throw err;
      }
      console.log("🚀 Success! Sending response.");
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });

  } catch (err) {
    console.error("❌ CRASH ERROR:", err.message);
    res.status(500).send('Server Error');
  }
});

// Login Route (Keeping this for you too)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
