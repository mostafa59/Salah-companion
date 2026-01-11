import express from 'express';
import PrayerLog from '../models/PrayerLog.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

const router = express.Router();

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
    const logs = await PrayerLog.find({ user: userId }).sort({ date: -1 });

    let streak = 0;
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1); 

    const toYMD = (d) => d.toISOString().split('T')[0];

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const targetDate = toYMD(checkDate);

        if (log.date === targetDate) {
            const allPrayed = log.prayers.fajr && log.prayers.dhuhr && log.prayers.asr && log.prayers.maghrib && log.prayers.isha;
            if (allPrayed) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        } else if (log.date > targetDate) {
             continue;
        } else {
            break;
        }
    }

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

// POST: Toggle Prayer (WITH CHALLENGE UPDATE)
router.post('/toggle', async (req, res) => {
  try {
    const { userId, date, prayerName, status, location, prayerStatus } = req.body;
    
    const pKey = prayerName.toLowerCase();

    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      const initialPrayers = { 
        fajr: false, 
        dhuhr: false, 
        asr: false, 
        maghrib: false, 
        isha: false 
      };
      initialPrayers[pKey] = status;
      
      const initialMeta = {
        fajr: { onTime: true, kaffarah: 0, location: 'home' },
        dhuhr: { onTime: true, kaffarah: 0, location: 'home' },
        asr: { onTime: true, kaffarah: 0, location: 'home' },
        maghrib: { onTime: true, kaffarah: 0, location: 'home' },
        isha: { onTime: true, kaffarah: 0, location: 'home' }
      };
      
      if (status && prayerStatus) {
        initialMeta[pKey] = {
          onTime: prayerStatus.onTime !== undefined ? prayerStatus.onTime : true,
          kaffarah: prayerStatus.kaffarah || 0,
          location: location || 'home'
        };
      }
      
      log = new PrayerLog({
        user: userId,
        date: date,
        prayers: initialPrayers,
        prayerMeta: initialMeta,
        mood: null
      });
    } else {
      log.set(`prayers.${pKey}`, status);
      
      if (!log.prayerMeta) {
        log.prayerMeta = {
          fajr: { onTime: true, kaffarah: 0, location: 'home' },
          dhuhr: { onTime: true, kaffarah: 0, location: 'home' },
          asr: { onTime: true, kaffarah: 0, location: 'home' },
          maghrib: { onTime: true, kaffarah: 0, location: 'home' },
          isha: { onTime: true, kaffarah: 0, location: 'home' }
        };
      }
      
      if (status && prayerStatus) {
        if (!log.prayerMeta[pKey]) {
          log.prayerMeta[pKey] = {};
        }
        
        log.prayerMeta[pKey].onTime = prayerStatus.onTime !== undefined ? prayerStatus.onTime : true;
        log.prayerMeta[pKey].kaffarah = prayerStatus.kaffarah || 0;
        log.prayerMeta[pKey].location = location || log.prayerMeta[pKey].location || 'home';
        
        log.markModified('prayerMeta');
      }
    }

    await log.save();

    // UPDATE CHALLENGES
    if (status === true) {
      const allCompleted = log.prayers.fajr && 
                          log.prayers.dhuhr && 
                          log.prayers.asr && 
                          log.prayers.maghrib && 
                          log.prayers.isha;

      if (allCompleted) {
        const challenges = await Challenge.find({ userId, status: 'active' });

        for (let challenge of challenges) {
          const lastCheckedStr = challenge.lastCheckedDate ? 
            new Date(challenge.lastCheckedDate).toISOString().split('T')[0] : 
            null;
          
          if (lastCheckedStr !== date) {
            challenge.daysCompleted += 1;
            challenge.completedCount += 5;
            challenge.progress = Math.min(
              (challenge.daysCompleted / challenge.targetDays) * 100, 
              100
            );
            challenge.lastCheckedDate = new Date(date);

            if (challenge.daysCompleted >= challenge.targetDays) {
              challenge.status = 'completed';
              challenge.completedDate = new Date();
              
              const user = await User.findById(userId);
              if (user) {
                user.challenges.active = user.challenges.active.filter(
                  c => c.toString() !== challenge._id.toString()
                );
                user.challenges.completed.push(challenge._id);
                await user.save();
              }
            }

            await challenge.save();
          }
        }
      }
    }

    res.json(log);
  } catch (err) {
    console.error("Error:", err);
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

// GET: Kaffarah Summary
router.get('/kaffarah/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const logs = await PrayerLog.find({ user: userId }).select('date prayerMeta');
    
    let totalKaffarah = 0;
    let delayedPrayers = 0;
    const history = [];
    
    logs.forEach(log => {
      if (log.prayerMeta) {
        ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
          if (log.prayerMeta[prayer]) {
            const meta = log.prayerMeta[prayer];
            if (!meta.onTime && meta.kaffarah > 0) {
              totalKaffarah += meta.kaffarah;
              delayedPrayers++;
              history.push({
                date: log.date,
                prayer: prayer,
                kaffarah: meta.kaffarah
              });
            }
          }
        });
      }
    });
    
    res.json({
      totalKaffarah,
      delayedPrayers,
      history: history.slice(-10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Daily Log
router.get('/:date', async (req, res) => {
  try {
    const { userId } = req.query;
    const { date } = req.params;
    let log = await PrayerLog.findOne({ user: userId, date: date });

    if (!log) {
      return res.json({ 
        prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
        mood: null,
        prayerMeta: null
      });
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Weekly Stats
router.get('/stats/weekly', async (req, res) => {
  try {
    const { userId } = req.query;
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs = await PrayerLog.find({
      user: userId,
      date: {
        $gte: sevenDaysAgo.toISOString().split('T')[0],
        $lte: today.toISOString().split('T')[0]
      }
    }).sort({ date: 1 });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    const dailyBreakdown = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);

      const completed = log ? Object.values(log.prayers).filter(Boolean).length : 0;

      weekData.push({
        day: days[d.getDay()],
        date: dateStr,
        completed
      });

      dailyBreakdown[dateStr] = {
        fajr: log?.prayers.fajr || false,
        dhuhr: log?.prayers.dhuhr || false,
        asr: log?.prayers.asr || false,
        maghrib: log?.prayers.maghrib || false,
        isha: log?.prayers.isha || false
      };
    }

    const totalCompleted = weekData.reduce((sum, d) => sum + d.completed, 0);

    res.json({
      weekData,
      dailyBreakdown,
      summary: {
        totalCompleted,
        percentage: ((totalCompleted / 35) * 100).toFixed(1)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Monthly Insights
router.get('/insights/monthly', async (req, res) => {
  try {
    const { userId, year, month } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || new Date().getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    const logs = await PrayerLog.find({
      user: userId,
      date: { $gte: firstDay, $lte: lastDay }
    }).sort({ date: 1 });

    let perfectDays = 0;
    logs.forEach(log => {
      const completed = Object.values(log.prayers).filter(Boolean).length;
      if (completed === 5) perfectDays++;
    });

    res.json({
      summary: {
        perfectDays,
        daysInMonth: logs.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Add Qada
router.post('/qada/add', async (req, res) => {
  try {
    const { userId, prayerName, amount } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    const pKey = prayerName.toLowerCase();
    user.qada.outstanding[pKey] = (user.qada.outstanding[pKey] || 0) + amount;
    user.qada.totalOwed += amount;

    await user.save();

    res.json({
      qada: user.qada,
      msg: `Added ${amount} ${prayerName} Qada`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Complete Qada
router.post('/qada/complete', async (req, res) => {
  try {
    const { userId, prayerName, amount } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    const pKey = prayerName.toLowerCase();
    const completed = Math.min(amount, user.qada.outstanding[pKey] || 0);

    user.qada.outstanding[pKey] = Math.max(0, (user.qada.outstanding[pKey] || 0) - completed);
    user.qada.totalOwed -= completed;
    user.qada.completed += completed;

    await user.save();

    res.json({
      qada: user.qada,
      msg: `Completed ${completed} ${prayerName} Qada`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Qada Status
router.get('/qada/status', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.qada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Start Challenge
router.post('/challenges/start', async (req, res) => {
  try {
    const { userId, title } = req.body;
    
    const challenge = new Challenge({
      userId,
      title,
      status: 'active',
      startDate: new Date(),
      daysCompleted: 0,
      completedCount: 0,
      progress: 0
    });

    await challenge.save();

    const user = await User.findById(userId);
    if (user) {
      if (!user.challenges) {
        user.challenges = { active: [], completed: [] };
      }
      user.challenges.active.push(challenge._id);
      await user.save();
    }

    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Check Challenge
router.post('/challenges/check', async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) return res.status(404).json({ msg: 'Challenge not found' });

    res.json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Active Challenges
router.get('/challenges/active', async (req, res) => {
  try {
    const { userId } = req.query;
    const challenges = await Challenge.find({
      userId,
      status: { $in: ['active', 'paused'] }
    }).sort({ startDate: -1 });

    res.json(challenges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// DELETE: Delete a Challenge
router.delete('/challenges/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.query;

    const challenge = await Challenge.findByIdAndDelete(challengeId);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    // Remove from user's challenge lists
    const user = await User.findById(userId);
    if (user) {
      user.challenges.active = user.challenges.active.filter(
        c => c.toString() !== challengeId
      );
      user.challenges.completed = user.challenges.completed.filter(
        c => c.toString() !== challengeId
      );
      await user.save();
    }

    res.json({ msg: 'Challenge deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
