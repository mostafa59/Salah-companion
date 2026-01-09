import mongoose from 'mongoose';

const prayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    prayerName: {
      type: String,
      enum: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    logged: {
      type: Boolean,
      default: false
    },
    mood: {
      type: String,
      enum: ['Happy', 'Sad', 'Neutral', null],
      default: null
    },
    tags: {
      type: [String],
      enum: ['On-time', 'Late', 'Rushed', 'Focused', 'Community'],
      default: []
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

prayerSchema.index({ userId: 1, date: 1 });
prayerSchema.index({ userId: 1, prayerName: 1, date: 1 });
// ... (Your existing GET and POST routes stay here) ...

// GET: Calculate Streak
// URL: /api/prayers/streak?userId=123&currentDate=2026-01-07
router.get('/streak/count', async (req, res) => {
  try {
    const { userId, currentDate } = req.query;

    // 1. Get all logs for this user, sorted by Date (Newest first)
    // "Select * from PrayerLogs where user = ID order by date DESC"
    const logs = await PrayerLog.find({ user: userId }).sort({ date: -1 });

    let streak = 0;
    
    // 2. We need to check dates going backward from "Yesterday"
    // (Because "Today" might not be finished yet, so it shouldn't break the streak)
    
    // Create a generic Date object for "Today"
    let checkDate = new Date(currentDate);
    
    // Move pointer to "Yesterday" first
    checkDate.setDate(checkDate.getDate() - 1);

    // Loop through our database logs
    // SysAdmin Analogy: We are parsing a log file line-by-line looking for "SUCCESS" flags
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        
        // Helper: Format our checkDate to "YYYY-MM-DD" to match DB string
        const checkDateString = checkDate.toISOString().split('T')[0];

        // If the log date matches the date we are checking
        if (log.date === checkDateString) {
            // Check if ALL prayers are true
            const allPrayed = log.prayers.fajr && log.prayers.dhuhr && log.prayers.asr && log.prayers.maghrib && log.prayers.isha;
            
            if (allPrayed) {
                streak++; // Server Uptime +1 Day
                checkDate.setDate(checkDate.getDate() - 1); // Move to day before
            } else {
                break; // Uptime broken! Stop counting.
            }
        } else if (log.date > checkDateString) {
             // This is a log from the future (or today), skip it
             continue;
        } else {
            // Gap in logs! Use logic: The log date is OLDER than what we expect.
            // Means we are missing a log for 'checkDate'. Streak broken.
            break;
        }
    }

    // BONUS: Check "Today" separately. 
    // If we finished today, add 1. If not, don't reset to 0.
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

export default router;


