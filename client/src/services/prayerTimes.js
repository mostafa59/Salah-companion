// client/src/services/prayerTimes.js

/**
 * Fetch prayer times from Aladhan API
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {string} date - YYYY-MM-DD format (optional, defaults to today)
 * @returns {object} Prayer times object { fajr, dhuhr, asr, maghrib, isha }
 */
export const getPrayerTimes = async (latitude = 30.0444, longitude = 31.2357, date = null) => {
  try {
    // Default: Cairo coordinates
    const today = date || new Date().toISOString().split('T')[0];
    const [year, month, day] = today.split('-');

    const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=5`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 200) {
      throw new Error('Failed to fetch prayer times');
    }

    const timings = data.data.timings;

    return {
      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha
    };
  } catch (err) {
    console.error('Prayer times API error:', err);
    return null;
  }
};

/**
 * Convert HH:MM to minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to HH:MM
 */
export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Get notification times for a prayer
 * @param {string} prayerTime - Prayer time in "HH:MM" format
 * @returns {object} { prep, adhan, urgent }
 */
export const getNotificationTimes = (prayerTime) => {
  const prayerMinutes = timeToMinutes(prayerTime);

  return {
    prep: minutesToTime(prayerMinutes - 15),    // 15 mins before
    adhan: prayerTime,                          // At prayer time
    urgent: minutesToTime(prayerMinutes + 20)   // 20 mins after
  };
};
