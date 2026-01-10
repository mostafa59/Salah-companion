import express from 'express';
import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import PrayerLog from '../models/PrayerLog.js';
import { generateFriendCode } from '../utils/codeGenerator.js';

const router = express.Router();

// --- ENDPOINT 1: Generate Friend Code ---
router.post('/generate-code', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    if (user.friendCode) {
      return res.json({ code: user.friendCode });
    }
    
    user.friendCode = generateFriendCode(user.name);
    await user.save();
    
    res.json({ code: user.friendCode });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ENDPOINT 2: Add Friend by Code ---
router.post('/add', async (req, res) => {
  const { userId, friendCode } = req.body;
  
  try {
    const friend = await User.findOne({ friendCode: friendCode });
    
    if (!friend) {
      return res.status(404).json({ msg: "Friend code not found" });
    }
    
    if (friend._id.toString() === userId) {
      return res.status(400).json({ msg: "You cannot add yourself" });
    }
    
    const existing = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friend._id },
        { requester: friend._id, recipient: userId }
      ]
    });
    
    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ msg: "Already friends!" });
      }
      return res.status(400).json({ msg: "Request already pending" });
    }
    
    const newFriendship = new Friendship({
      requester: userId,
      recipient: friend._id,
      status: 'pending'
    });
    
    await newFriendship.save();
    
    res.json({ 
      msg: "Friend request sent!", 
      friendName: friend.name 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ENDPOINT 3: Get Friends with Status ---
router.get('/status', async (req, res) => {
  const { userId, date } = req.query;
  
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });
    
    const friendIds = friendships.map(f => 
      f.requester.toString() === userId ? f.recipient : f.requester
    );
    
    const statusList = await Promise.all(
      friendIds.map(async (friendId) => {
        const friendUser = await User.findById(friendId).select('name friendCode');
        const friendLog = await PrayerLog.findOne({ user: friendId, date: date });
        
        const hasPrayedFajr = friendLog ? friendLog.prayers.fajr : false;
        
        return {
          id: friendUser._id,
          name: friendUser.name,
          code: friendUser.friendCode,
          status: hasPrayedFajr ? 'Prayed 🤲' : 'Sleeping 😴',
          isFajrDone: hasPrayedFajr
        };
      })
    );
    
    res.json(statusList);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
