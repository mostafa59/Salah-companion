import React, { useState, useEffect } from 'react';

// Helper to parse "05:12 AM" into a Date object for today
const parseTime = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
};

export default function PrayerCountdown({ prayers }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [nextPrayerName, setNextPrayerName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let nextPrayer = null;

      // Find the first prayer that is in the future
      for (let p of prayers) {
        const pTime = parseTime(p.time);
        if (pTime > now) {
          nextPrayer = { ...p, timeObj: pTime };
          break;
        }
      }

      // If no prayers left today (e.g. after Isha), target Fajr tomorrow
      if (!nextPrayer) {
        const fajr = prayers[0]; // Assuming first is Fajr
        const fajrTime = parseTime(fajr.time);
        fajrTime.setDate(fajrTime.getDate() + 1); // Tomorrow
        nextPrayer = { ...fajr, timeObj: fajrTime };
      }

      setNextPrayerName(nextPrayer.name);

      // Calculate difference
      const diff = nextPrayer.timeObj - now;
      
      // Convert ms to HH:MM:SS
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [prayers]);

  return (
    <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white p-6 rounded-2xl shadow-lg text-center mb-6 relative overflow-hidden">
      {/* Decorative Circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      
      <p className="text-teal-100 text-sm font-medium mb-1">الصلاة القادمة</p>
      <h2 className="text-3xl font-bold mb-2">{nextPrayerName}</h2>
      
      <div className="inline-block bg-black bg-opacity-20 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/10">
        <span className="text-2xl font-mono font-bold tracking-widest" dir="ltr">
          {timeLeft || "--:--:--"}
        </span>
      </div>
      
      <p className="text-xs text-teal-200 mt-2">الوقت المتبقي</p>
    </div>
  );
}
