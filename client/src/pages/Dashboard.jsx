import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomTabs from '../components/BottomTabs';
import ThemeToggle from '../components/ThemeToggle';
import GardenWidget from '../components/GardenWidget';
import LocationModal from '../components/LocationModal';
import PrayerStatusModal from '../components/PrayerStatusModal';
import confetti from 'canvas-confetti';
import NotificationBanner from '../components/NotificationBanner';
import CitySelectorModal from '../components/CitySelectorModal';
import { getPrayerTimes, getNotificationTimes } from '../services/prayerTimes';
import { requestNotificationPermission, scheduleNotification } from '../utils/notifications';

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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentDate] = useState(new Date()); 
  const [prayerTimes, setPrayerTimes] = useState({
    Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--'
  });
  const [prayers, setPrayers] = useState({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
  const [mood, setMood] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '...', timeLeft: '--:--' });
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('prayerLocation');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { city: 'Cairo', country: 'Egypt' };
      }
    }
    return { city: 'Cairo', country: 'Egypt' };
  });

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const dailyQuote = QUOTES[dayOfYear % QUOTES.length];
  
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [prayerStatus, setPrayerStatus] = useState(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const formattedDate = currentDate.toLocaleDateString('en-CA'); 

  useEffect(() => {
    if (!location || !location.city || !location.country) return;

    const fetchTimes = async () => {
      try {
        const url = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${encodeURIComponent(
          location.city
        )}&country=${encodeURIComponent(location.country)}&method=5`;
        
        const res = await axios.get(url);
        const t = res.data.data.timings;

        setPrayerTimes({
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha
        });
      } catch (err) {
        console.error('Failed to load prayer times:', err);
      }
    };

    fetchTimes();
  }, [formattedDate, location]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      authService.getTodayPrayers(user.id, formattedDate)
        .then(data => {
            if (data && data.prayers) {
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

  useEffect(() => {
    if (!user || !location.city) return;

    const setupNotifications = async () => {
      try {
        const permission = await requestNotificationPermission();
        console.log(`📱 Notification permission: ${permission}`);

        if (permission !== 'granted') {
          console.log('⚠️ User denied notifications');
          return;
        }

        const url = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${encodeURIComponent(
          location.city
        )}&country=${encodeURIComponent(location.country)}&method=5`;

        const res = await axios.get(url);
        const timings = res.data.data.timings;

        const times = {
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha
        };

        console.log('✅ Prayer times loaded:', times);

        Object.keys(times).forEach((prayer) => {
          const notifs = getNotificationTimes(times[prayer]);

          scheduleNotification(prayer, notifs.prep, 'prep');
          scheduleNotification(prayer, notifs.adhan, 'adhan');
          scheduleNotification(prayer, notifs.urgent, 'urgent');
        });

        console.log('🔔 All notifications scheduled for today!');
      } catch (err) {
        console.error('❌ Notification setup error:', err);
      }
    };

    setupNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.city, formattedDate]);

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

  const isPrayerTimePassed = (prayerKey) => {
    const time = prayerTimes[prayerKey];
    if (time === '--:--') return false;
    
    const [h, m] = time.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(h, m, 0);
    
    const now = new Date();
    const diffMinutes = (now - prayerDate) / 1000 / 60;
    
    return diffMinutes > 30;
  };

  const handleChangeLocation = () => {
    setIsCityModalOpen(true);
  };

  const handleCitySelect = (newLoc) => {
    setLocation(newLoc);
    localStorage.setItem('prayerLocation', JSON.stringify(newLoc));
  };

  const handleCheck = (key) => {
    if (prayers[key]) {
      setPrayers(prev => ({ ...prev, [key]: false }));
      authService.togglePrayer(user.id, formattedDate, key.toLowerCase(), false, null);
      return;
    }
    
    setSelectedPrayer(key);
    
    if (isPrayerTimePassed(key)) {
      setIsStatusModalOpen(true);
    } else {
      setPrayerStatus({ onTime: true, kaffarah: 0 });
      setIsModalOpen(true);
    }
  };

  const handleStatusConfirm = (status) => {
    setPrayerStatus(status);
    setIsStatusModalOpen(false);
    setIsModalOpen(true);
    
    if (!status.onTime) {
      console.log('⏰ User delayed prayer. Kaffarah pledged:', status.kaffarah || 0);
    }
  };

  const confirmPrayer = (locationPlace) => {
    if (!selectedPrayer) return;

    const key = selectedPrayer;
    
    const updatedPrayers = { ...prayers, [key]: true };
    setPrayers(updatedPrayers);

    const count = Object.values(updatedPrayers).filter(Boolean).length;
    if (count === 5) {
       triggerCelebration();
    }

    authService.togglePrayer(
      user.id, 
      formattedDate, 
      key.toLowerCase(), 
      true, 
      locationPlace,
      prayerStatus
    );

    setIsModalOpen(false);
    setSelectedPrayer(null);
    setPrayerStatus(null);
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
      
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">صديقك في الصلاة</h1>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleChangeLocation}
            className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1 rounded-full shadow-sm"
          >
            📍 {location.city || 'Cairo'}
          </button>
          <div className="flex items-center gap-1 bg-teal-800 dark:bg-teal-950 px-3 py-1 rounded-full text-green-300 font-bold text-sm shadow-inner">
            <span>{Object.values(prayers).filter(Boolean).length}/5</span>
            <span>🌱</span>
          </div>
        </div>
      </header>

      <NotificationBanner />

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="container mx-auto p-4 space-y-6 max-w-md animate-in fade-in duration-500">
            
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 dark:from-teal-800 dark:to-teal-900 rounded-2xl p-6 text-white text-center shadow-lg transition-all hover:scale-[1.02]">
            <h2 className="text-sm opacity-80 mb-1">الصلاة القادمة</h2>
            <div className="text-4xl font-bold mb-2">{nextPrayer.name}</div>
            <div className="text-2xl font-mono bg-white/10 inline-block px-4 py-1 rounded-lg backdrop-blur-sm" dir="ltr">
                {nextPrayer.timeLeft}
            </div>
            </div>

            <GardenWidget prayers={prayers} />

            <div className="bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-400 p-4 rounded-lg flex items-center gap-3 shadow-sm">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 text-xs mb-1">حكمة اليوم</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{dailyQuote}"</p>
                </div>
            </div>

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

      <PrayerStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedPrayer(null);
        }}
        onConfirm={handleStatusConfirm}
        prayerName={selectedPrayer ? ARABIC_NAMES[selectedPrayer] : ''}
      />

      <LocationModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSelect={confirmPrayer} 
      />

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={handleCitySelect}
        currentLocation={location}
      />
    </div>
  );
};

export default Dashboard;
