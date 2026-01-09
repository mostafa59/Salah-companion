import express from 'express';
import Qada from '../models/Qada.js'; // Stores the "Manual Offset"
import PrayerLog from '../models/PrayerLog.js';
import User from '../models/User.js';

const router = express.Router();

// GET: Calculate Total Missed (Auto + Manual)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // 1. Get Manual Offset (Debt from before app started)
    let offset = await Qada.findOne({ user: userId });
    if (!offset) {
      offset = new Qada({ user: userId });
      await offset.save();
    }

    // 2. Calculate "Auto" Missed (Since Registration)
    // We count how many times you actually prayed 'Fajr' = true
    // And compare it to how many days have passed.
    
    const startDate = new Date(user.createdAt);
    const today = new Date();
    
    // Calculate days passed (including today)
    const diffTime = Math.abs(today - startDate);
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Get ALL logs for this user where specific prayers were done
    const logs = await PrayerLog.find({ user: userId });

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const result = {};

    prayers.forEach(p => {
        // Count how many 'true' logs exist for this prayer
        // Note: Our PrayerLog structure is { prayers: { fajr: true, ... } }
        const doneCount = logs.filter(l => l.prayers && l.prayers[p] === true).length;
        
        // Expected = Days Passed since registration
        // (If registered today, expected is 1. If yesterday, 2.)
        const expected = daysPassed; 
        
        // Auto Missed cannot be negative (in case of time zone weirdness)
        const autoMissed = Math.max(0, expected - doneCount);
        
        // Total = Manual Offset + Auto Missed
        result[p] = (offset[p] || 0) + autoMissed;
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Update Manual Offset (Pay Back or Add Old Debt)
router.post('/update', async (req, res) => {
  try {
    const { userId, prayerName, amount } = req.body; 
    // amount = -1 (Paid back one)
    // amount = +1 (Added a manual debt)

    let offset = await Qada.findOne({ user: userId });
    if (!offset) offset = new Qada({ user: userId });

    // We modify the OFFSET. 
    // If Auto says 5 missed, and I pay 1 back, I set offset to -1.
    // Total = 5 + (-1) = 4. Correct.
    offset[prayerName] = (offset[prayerName] || 0) + amount;

    await offset.save();
    res.json(offset); // Just return success, frontend will reload total
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
