import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import BottomTabs from '../components/BottomTabs';
import authService from '../services/api';

const PRAYERS = [
  { key: 'fajr', label: 'الفجر' },
  { key: 'dhuhr', label: 'الظهر' },
  { key: 'asr', label: 'العصر' },
  { key: 'maghrib', label: 'المغرب' },
  { key: 'isha', label: 'العشاء' },
];

const MissedPrayers = () => {
  const { user } = useContext(AuthContext);
  
  // State for tracking missed counts
  const [missedCounts, setMissedCounts] = useState({
    fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0
  });

  // Load data on mount (Mock for now, normally API)
  useEffect(() => {
    // Ideally: authService.getMissedPrayers(user.id).then(...)
    // For now, let's just use local state or mock
  }, []);

  const handleAdjust = (key, amount) => {
    setMissedCounts(prev => {
      const newVal = Math.max(0, prev[key] + amount);
      return { ...prev, [key]: newVal };
    });
    // authService.updateMissed(user.id, key, amount);
  };

  const totalMissed = Object.values(missedCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="bg-amber-600 dark:bg-amber-800 text-white p-6 rounded-b-3xl shadow-lg mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">الصلوات الفائتة</h1>
        <div className="text-5xl font-bold font-mono my-4">{totalMissed}</div>
        <p className="opacity-80 text-sm">صلاة في ذمتك</p>
      </header>

      <div className="container mx-auto p-4 max-w-md space-y-4">
        {PRAYERS.map((p) => (
          <div key={p.key} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
            
            <span className="font-bold text-lg text-gray-700 dark:text-gray-200">{p.label}</span>
            
            <div className="flex items-center gap-4">
              {/* Decrement Button (I prayed it!) */}
              <button 
                onClick={() => handleAdjust(p.key, -1)}
                className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl hover:bg-teal-200 transition"
              >
                -
              </button>

              <span className="w-8 text-center font-mono font-bold text-gray-800 dark:text-gray-100 text-xl">
                {missedCounts[p.key]}
              </span>

              {/* Increment Button (I missed another one) */}
              <button 
                onClick={() => handleAdjust(p.key, 1)}
                className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xl hover:bg-red-200 transition"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomTabs />
    </div>
  );
};

export default MissedPrayers;
