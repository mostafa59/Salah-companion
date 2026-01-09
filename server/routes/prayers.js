import express from 'express';
import PrayerLog from '../models/PrayerLog.js';

const router = express.Router();

// ---------------------------------------------
// 1. SPECIFIC ROUTES (MUST BE FIRST!) 🚨
// ---------------------------------------------

// GET: Get Monthly History (For Calendar)
// URL: /api/prayers/history/all?userId=123
router.get('/history/all', async (req, res) => {
  try {
    const { userId } = req.query;
    // Get ALL logs for this user (only return date & prayers to save bandwidth)
    const logs = await PrayerLog.find({ user: userId }).select('date prayers');
    
    // Transform into simple object: { "2026-01-07": "full", "2026-01-06": "partial" }
    const history = {};
    
    logs.forEach(log => {
        const p = log.prayers;
        if (!p) return;
        
        // Count how many prayers are TRUE
        const count = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length;
        
        if (count === 5) history[log.date] = 'full';
        else if (count > 0) history[log.date] = 'partial';
        else history[log.date] = 'none';
    });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Calculate Streak
router.get('/streak/count', async (req, res) => {
  try {
    const { userId, currentDate } = req.query;
    const logs = await PrayerLog.find({ user: userId }).sort({ date: -1 });

    let streak = 0;
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const checkDateString = checkDate.toISOString().split('T')[0];

        if (log.date === checkDateString) {
            const allPrayed = log.prayers.fajr && log.prayers.dhuhr && log.prayers.asr && log.prayers.maghrib && log.prayers.isha;
            if (allPrayed) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        } else if (log.date > checkDateString) {
             continue; 
        } else {
            break;
        }
    }

    // Check Today
    const todayLog = logs.find(l => l.date === currentDate);
    if (todayLog) {
        const todayDone = todayLog.prayers.fajr && todayLog.prayers.dhuhr && todayLog.prayers.asr && todayLog.prayers.maghrib && todayLog.prayers.isha;
        if (todayDone) streak++;
    }

    res.json({ streak: streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Toggle Prayer
router.post('/toggle', async (req, res) => {
  try {
    const { userId, date, prayerName, status } = req.body;
    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      log = new PrayerLog({
        user: userId,
        date: date,
        prayers: { [prayerName]: status }
      });
    } else {
      log.prayers[prayerName] = status;
    }
    await log.save();
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Update Mood
router.post('/mood', async (req, res) => {
  try {
    const { userId, date, mood } = req.body;
    let log = await PrayerLog.findOne({ user: userId, date: date });
    if (!log) {
      log = new PrayerLog({ user: userId, date: date, mood: mood });
    } else {
      log.mood = mood;
    }
    await log.save();
    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// ---------------------------------------------
// 2. GENERIC ROUTES (MUST BE LAST!) 
// ---------------------------------------------

// GET: Get Daily Log
router.get('/:date', async (req, res) => {
  try {
    const { userId } = req.query;
    const { date } = req.params;
    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      return res.json({ 
        prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false } 
      });
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
