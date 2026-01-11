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
// ADD TO BOTTOM OF YOUR server/routes/users.js

router.get('/:userId/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/:userId/notification-preferences', async (req, res) => {
  try {
    const { soundEnabled, reminderMinutes, reminderType } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        'notificationPreferences.soundEnabled': soundEnabled,
        'notificationPreferences.reminderMinutes': reminderMinutes,
        'notificationPreferences.reminderType': reminderType
      },
      { new: true }
    );

    res.json(user.notificationPreferences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.get('/:userId/qada', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.qada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
