import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomTabs from '../components/BottomTabs'; // ✅ Imported

const ARABIC_NAMES = {
  Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء'
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- STATE ---
  // Note: We keep currentDate here just for the API, but "Next/Previous" buttons are gone
  const [currentDate] = useState(new Date()); 
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--'
  });
  const [prayers, setPrayers] = useState({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
  const [mood, setMood] = useState(null);
  const [streak, setStreak] = useState(0); 
  const [nextPrayer, setNextPrayer] = useState({ name: '...', timeLeft: '--:--' });

  const formattedDate = currentDate.toLocaleDateString('en-CA'); 

  // --- API 1: Get Times ---
  useEffect(() => {
    axios.get(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=30.0444&longitude=31.2357&method=5`)
      .then(res => {
        const t = res.data.data.timings;
        setPrayerTimes({ Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
      })
      .catch(console.error);
  }, [formattedDate]);

  // --- API 2: Get User Data ---
  useEffect(() => {
    if (user) {
      authService.getTodayPrayers(user.id, formattedDate).then(data => {
        if (data && data.prayers) {
            setPrayers({
                Fajr: data.prayers.fajr, Dhuhr: data.prayers.dhuhr, Asr: data.prayers.asr,
                Maghrib: data.prayers.maghrib, Isha: data.prayers.isha
            });
            setMood(data.mood || null);
        } else {
             setPrayers({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
             setMood(null);
        }
      });

      authService.getStreak(user.id, formattedDate).then(data => {
        setStreak(data.streak || 0);
      });
    }
  }, [user, formattedDate]);

  // --- TIMER LOGIC (Simplified for "Today Only") ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let found = false;
      
      for (const [key, time] of Object.entries(prayerTimes)) {
        if (!ARABIC_NAMES[key] || time === '--:--') continue;
        
        const [h, m] = time.split(':').map(Number);
        const pDate = new Date(); // Use REAL Today (Now)
        pDate.setHours(h, m, 0);
        
        if (pDate > now) {
          const diff = pDate - now;
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          
          setNextPrayer({ 
            name: ARABIC_NAMES[key], 
            timeLeft: `${hrs}:${mins < 10 ? '0'+mins : mins}:${secs < 10 ? '0'+secs : secs}` 
          });
          found = true;
          break;
        }
      }
      
      if (!found && prayerTimes.Fajr !== '--:--') {
        const [h, m] = prayerTimes.Fajr.split(':').map(Number);
        const fajrTomorrow = new Date();
        fajrTomorrow.setDate(fajrTomorrow.getDate() + 1); // Tomorrow
        fajrTomorrow.setHours(h, m, 0);
        
        const diff = fajrTomorrow - now;
        if (diff > 0) {
            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setNextPrayer({ name: 'الفجر (غداً)', timeLeft: `${hrs}:${mins < 10 ? '0'+mins : mins}:${secs < 10 ? '0'+secs : secs}` });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes]);

  // --- HANDLERS ---
  const handleCheck = (key) => {
    const status = !prayers[key];
    setPrayers(prev => ({ ...prev, [key]: status }));
    authService.togglePrayer(user.id, formattedDate, key.toLowerCase(), status);
  };

  const handleMood = (m) => {
    setMood(m);
    authService.updateMood(user.id, formattedDate, m);
  };

  const moods = [
    { label: 'سعيد', emoji: '😄' }, { label: 'مطمئن', emoji: '😌' },
    { label: 'قلق', emoji: '😨' }, { label: 'حزين', emoji: '😔' }, { label: 'غاضب', emoji: '😡' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans" dir="rtl">
      
      {/* HEADER */}
      <header className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold">صديقك في الصلاة</h1>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-teal-800 px-3 py-1 rounded-full text-yellow-300 font-bold text-sm shadow-inner">
               <span>{streak}</span>
               <span>🔥</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-xs bg-teal-600 px-3 py-1 rounded hover:bg-teal-500 transition">خروج</button>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6 max-w-md">
        
        {/* TIMER */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white text-center shadow-lg transition-all">
          <h2 className="text-sm opacity-80 mb-1">الصلاة القادمة</h2>
          <div className="text-4xl font-bold mb-2">{nextPrayer.name}</div>
          <div className="text-2xl font-mono bg-white/10 inline-block px-4 py-1 rounded-lg backdrop-blur-sm" dir="ltr">
            {nextPrayer.timeLeft}
          </div>
        </div>

        {/* MOODS */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-center text-gray-600 text-sm mb-4">كيف حال قلبك اليوم؟</h3>
          <div className="flex justify-between px-2">
            {moods.map((m) => (
              <button 
                key={m.label} 
                onClick={() => handleMood(m.label)}
                className={`flex flex-col items-center gap-1 transition-all duration-200 p-2 rounded-lg ${
                  mood === m.label ? 'bg-teal-50 scale-110 ring-2 ring-teal-200' : 'hover:scale-110'
                }`}
              >
                <span className="text-2xl filter drop-shadow-sm">{m.emoji}</span>
                <span className={`text-[10px] ${mood === m.label ? 'text-teal-700 font-bold' : 'text-gray-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PRAYERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">صلوات اليوم</h2>
             <span className="text-xs text-gray-400 dir-ltr">{formattedDate}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => (
              <div key={key} onClick={() => handleCheck(key)} className="flex items-center justify-between p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">{ARABIC_NAMES[key]}</span>
                  <span className="text-xs text-gray-400">{prayerTimes[key]}</span>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  prayers[key] ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-110' : 'bg-white border-gray-300 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ✅ BOTTOM NAVIGATION BAR */}
      <BottomTabs />

    </div>
  );
};

export default Dashboard;
