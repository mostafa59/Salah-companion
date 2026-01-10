import express from 'express';
import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import PrayerLog from '../models/PrayerLog.js';
import { generateFriendCode } from '../utils/codeGenerator.js';

const router = express.Router();

// --- ENDPOINT 0: Get All Friends (Simple List) ---
router.get('/', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name friendCode');
    
    const friends = friendships.map(f => {
      const friend = f.requester._id.toString() === userId ? f.recipient : f.requester;
      return {
        id: friend._id,
        name: friend.name,
        code: friend.friendCode
      };
    });
    
    res.json(friends);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

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

// --- ENDPOINT 4: Accept Friend Request ---
router.post('/accept', async (req, res) => {
  const { userId, friendId } = req.body;
  
  try {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });
    
    if (!friendship) {
      return res.status(404).json({ msg: "Friendship not found" });
    }
    
    friendship.status = 'accepted';
    await friendship.save();
    
    res.json({ msg: "Friendship accepted!", friendship });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ENDPOINT 5: Nudge Friend ---
router.post('/nudge', async (req, res) => {
  const { fromUserId, toUserId } = req.body;
  
  try {
    const fromUser = await User.findById(fromUserId).select('name');
    const toUser = await User.findById(toUserId).select('name');
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    const friendship = await Friendship.findOne({
      $or: [
        { requester: fromUserId, recipient: toUserId },
        { requester: toUserId, recipient: fromUserId }
      ],
      status: 'accepted'
    });
    
    if (!friendship) {
      return res.status(403).json({ msg: "You can only nudge friends" });
    }
    
    console.log(`🔔 ${fromUser.name} nudged ${toUser.name}!`);
    
    const io = req.app.get('io');
    io.to(toUserId).emit('receive_nudge', {
      message: `⏰ استيقظ! ${fromUser.name} ينتظرك لصلاة الفجر! 🕌`,
      from: fromUser.name,
      fromId: fromUserId
    });
    
    res.json({ 
      msg: `تم إيقاظ ${toUser.name}! 🔔`,
      success: true 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ENDPOINT 6: Get Pending Requests ---
router.get('/requests', async (req, res) => {
  const { userId } = req.query;
  
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'pending'
    }).populate('requester recipient', 'name friendCode');
    
    const incoming = [];
    const outgoing = [];
    
    friendships.forEach(f => {
      if (f.recipient._id.toString() === userId) {
        incoming.push({
          id: f._id,
          from: {
            id: f.requester._id,
            name: f.requester.name,
            code: f.requester.friendCode
          },
          createdAt: f.createdAt
        });
      } else {
        outgoing.push({
          id: f._id,
          to: {
            id: f.recipient._id,
            name: f.recipient.name,
            code: f.recipient.friendCode
          },
          createdAt: f.createdAt
        });
      }
    });
    
    res.json({ incoming, outgoing });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- ENDPOINT 7: Respond to Friend Request ---
router.post('/respond', async (req, res) => {
  const { userId, friendshipId, action } = req.body;
  
  try {
    const friendship = await Friendship.findById(friendshipId);
    
    if (!friendship) {
      return res.status(404).json({ msg: "Request not found" });
    }
    
    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({ msg: "You can only respond to requests sent to you" });
    }
    
    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      res.json({ msg: "Friend request accepted! 🎉", friendship });
    } else if (action === 'reject') {
      await friendship.deleteOne();
      res.json({ msg: "Friend request rejected", success: true });
    } else {
      res.status(400).json({ msg: "Invalid action" });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router; // ← THIS IS THE CRITICAL LINE!
