import express from 'express';
import PrayerLog from '../models/PrayerLog.js';

const router = express.Router();

// ---------------------------------------------
// 1. SPECIFIC ROUTES
// ---------------------------------------------

// GET: Get Monthly History
router.get('/history/all', async (req, res) => {
  try {
    const { userId } = req.query;
    const logs = await PrayerLog.find({ user: userId }).select('date prayers');
    
    const history = {};
    logs.forEach(log => {
        const p = log.prayers;
        if (!p) return;
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
    // Find logs sorted by date descending (newest first)
    const logs = await PrayerLog.find({ user: userId }).sort({ date: -1 });

    let streak = 0;
    
    // Create check date (Start from Yesterday)
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1); 

    // Helper to format JS Date to YYYY-MM-DD
    const toYMD = (d) => d.toISOString().split('T')[0];

    // Check Yesterday backwards
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const targetDate = toYMD(checkDate);

        if (log.date === targetDate) {
            const allPrayed = log.prayers.fajr && log.prayers.dhuhr && log.prayers.asr && log.prayers.maghrib && log.prayers.isha;
            if (allPrayed) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); // Move back one day
            } else {
                break; // Streak broken
            }
        } else if (log.date > targetDate) {
             continue; // Skip logs from today/future
        } else {
            break; // Gap in dates -> Streak broken
        }
    }

    // Check Today separately (Bonus point)
    const todayLog = logs.find(l => l.date === currentDate);
    if (todayLog) {
        const todayDone = todayLog.prayers.fajr && todayLog.prayers.dhuhr && todayLog.prayers.asr && todayLog.prayers.maghrib && todayLog.prayers.isha;
        if (todayDone) streak++;
    }

    res.json({ streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Toggle Prayer (FIXED)
router.post('/toggle', async (req, res) => {
  try {
    const { userId, date, prayerName, status, location } = req.body;
    
    // Convert 'fajr' to lower case just in case
    const pKey = prayerName.toLowerCase();

    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      // Create new Log
      const initialPrayers = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
      initialPrayers[pKey] = status;
      
      log = new PrayerLog({
        user: userId,
        date: date,
        prayers: initialPrayers,
        mood: null
      });
    } else {
      // Update existing
      // IMPORTANT: Use .set() to ensure Mongoose tracks the change
      log.set(`prayers.${pKey}`, status);
      // If you want to log location later, store it similarly
    }

    await log.save();
    res.json(log);
  } catch (err) {
    console.error("Toggle Error:", err);
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
// 2. GENERIC ROUTES
// ---------------------------------------------

// GET: Get Daily Log
router.get('/:date', async (req, res) => {
  try {
    const { userId } = req.query;
    const { date } = req.params;
    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      // Return empty template if no log exists
      return res.json({ 
        prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
        mood: null
      });
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
