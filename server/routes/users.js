import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📥 Fetching user with ID:', id);
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('✅ User found:', user.name);
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      friendCode: user.friendCode,
      streak: user.streak
    });
    
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
