import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomTabs from '../components/BottomTabs';
import ThemeToggle from '../components/ThemeToggle';
import GardenWidget from '../components/GardenWidget';
import LocationModal from '../components/LocationModal';
import confetti from 'canvas-confetti';

const ARABIC_NAMES = {
  Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء'
};

const QUOTES = [
  "أقرب ما يكون العبد من ربه وهو ساجد",
  "الصلاة نور للمؤمن",
  "أرحنا بها يا بلال",
  "إن الصلاة تنهى عن الفحشاء والمنكر",
  "من حافظ عليها كانت له نوراً وبرهاناً",
  "واسجد واقترب",
  "رب اجعلني مقيم الصلاة ومن ذريتي"
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentDate] = useState(new Date()); 
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--'
  });
  const [prayers, setPrayers] = useState({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
  const [mood, setMood] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '...', timeLeft: '--:--' });
  const [isLoading, setIsLoading] = useState(true);

  // Pick Daily Quote based on Day of Year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const dailyQuote = QUOTES[dayOfYear % QUOTES.length];
  
  // --- MODAL STATE ---
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsLoading(true);
      authService.getTodayPrayers(user.id, formattedDate)
        .then(data => {
            if (data && data.prayers) {
                // Map lowercase API keys to Capitalized State keys
                setPrayers({
                    Fajr: data.prayers.fajr, 
                    Dhuhr: data.prayers.dhuhr, 
                    Asr: data.prayers.asr,
                    Maghrib: data.prayers.maghrib, 
                    Isha: data.prayers.isha
                });
                setMood(data.mood || null);
            }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, formattedDate]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let found = false;
      
      for (const [key, time] of Object.entries(prayerTimes)) {
        if (!ARABIC_NAMES[key] || time === '--:--') continue;
        
        const [h, m] = time.split(':').map(Number);
        const pDate = new Date();
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
        fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
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

  // --- CELEBRATION HELPER ---
  const triggerCelebration = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#14b8a6', '#fcd34d']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#14b8a6', '#fcd34d']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // --- HANDLERS ---
  const handleCheck = (key) => {
    if (prayers[key]) {
      setPrayers(prev => ({ ...prev, [key]: false }));
      authService.togglePrayer(user.id, formattedDate, key.toLowerCase(), false, null);
      return;
    }
    setSelectedPrayer(key);
    setIsModalOpen(true);
  };

  const confirmPrayer = (location) => {
    if (!selectedPrayer) return;

    const key = selectedPrayer;
    
    // Update State Optimistically
    const updatedPrayers = { ...prayers, [key]: true };
    setPrayers(updatedPrayers);

    // Check for Celebration
    const count = Object.values(updatedPrayers).filter(Boolean).length;
    if (count === 5) {
       triggerCelebration();
    }

    // Save to API
    authService.togglePrayer(user.id, formattedDate, key.toLowerCase(), true, location);

    setIsModalOpen(false);
    setSelectedPrayer(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 pb-24 font-sans transition-colors duration-300" dir="rtl">
      
      {/* HEADER */}
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold">صديقك في الصلاة</h1>
             <ThemeToggle />
        </div>
        
        <div className="flex items-center gap-1 bg-teal-800 dark:bg-teal-950 px-3 py-1 rounded-full text-green-300 font-bold text-sm shadow-inner">
           <span>{Object.values(prayers).filter(Boolean).length}/5</span>
           <span>🌱</span>
        </div>
      </header>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="container mx-auto p-4 space-y-6 max-w-md animate-in fade-in duration-500">
            
            {/* TIMER */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 dark:from-teal-800 dark:to-teal-900 rounded-2xl p-6 text-white text-center shadow-lg transition-all hover:scale-[1.02]">
            <h2 className="text-sm opacity-80 mb-1">الصلاة القادمة</h2>
            <div className="text-4xl font-bold mb-2">{nextPrayer.name}</div>
            <div className="text-2xl font-mono bg-white/10 inline-block px-4 py-1 rounded-lg backdrop-blur-sm" dir="ltr">
                {nextPrayer.timeLeft}
            </div>
            </div>

            {/* GARDEN WIDGET */}
            <GardenWidget prayers={prayers} />

            {/* DAILY WISDOM */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-400 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 text-xs mb-1">حكمة اليوم</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{dailyQuote}"</p>
                </div>
            </div>

            {/* MOODS */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-center text-gray-600 dark:text-gray-300 text-sm mb-4">كيف حال قلبك اليوم؟</h3>
            <div className="flex justify-between px-2">
                {moods.map((m) => (
                <button 
                    key={m.label} 
                    onClick={() => handleMood(m.label)}
                    className={`flex flex-col items-center gap-1 transition-all duration-200 p-2 rounded-lg ${
                    mood === m.label ? 'bg-teal-50 dark:bg-teal-900/30 scale-110 ring-2 ring-teal-200 dark:ring-teal-700' : 'hover:scale-110'
                    }`}
                >
                    <span className="text-2xl filter drop-shadow-sm">{m.emoji}</span>
                    <span className={`text-[10px] ${mood === m.label ? 'text-teal-700 dark:text-teal-300 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {m.label}
                    </span>
                </button>
                ))}
            </div>
            </div>

            {/* PRAYERS LIST */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 dark:text-gray-200">صلوات اليوم</h2>
                <span className="text-xs text-gray-400 dir-ltr">{formattedDate}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => (
                <div key={key} onClick={() => handleCheck(key)} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="flex flex-col">
                    <span className="font-bold text-gray-700 dark:text-gray-200">{ARABIC_NAMES[key]}</span>
                    <span className="text-xs text-gray-400">{prayerTimes[key]}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    prayers[key] ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-110 rotate-0' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-transparent rotate-180'
                    }`}>
                    ✓
                    </div>
                </div>
                ))}
            </div>
            </div>

        </div>
      )}

      <BottomTabs />

      {/* LOCATION MODAL */}
      <LocationModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSelect={confirmPrayer} 
      />

    </div>
  );
};

export default Dashboard;
