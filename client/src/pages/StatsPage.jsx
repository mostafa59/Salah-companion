// client/src/pages/StatsPage.jsx
// CREATE THIS NEW FILE

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import WeeklyChart from '../components/WeeklyChart';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StatsPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      setLoading(true);
      authService.getWeeklyStats(user.id)
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load stats:', err);
          setLoading(false);
        });
    }
  }, [user]);

  const handlePrevWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir="rtl">
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">📊 إحصائيات الأسبوع</h1>
        <p className="text-sm opacity-90 mt-1">تابع تقدمك خلال الأسبوع</p>
      </header>

      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-gray-700 dark:text-gray-300">الأسبوع الحالي</span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <ChevronRight size={20} />
          </button>
        </div>

        {stats && <WeeklyChart data={stats} />}

        {stats && stats.dailyBreakdown && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">تفاصيل يومي</h3>
            <div className="space-y-3">
              {Object.entries(stats.dailyBreakdown).map(([date, prayers]) => {
                const completed = Object.values(prayers).filter(Boolean).length;
                return (
                  <div key={date} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{date}</span>
                    <div className="flex gap-2">
                      {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => (
                        <div
                          key={prayer}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            prayers[prayer]
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                          }`}
                        >
                          {prayer.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{completed}/5</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 p-4 rounded-xl border border-teal-200 dark:border-teal-700">
              <p className="text-xs text-teal-600 dark:text-teal-400 mb-2">نسبة الإنجاز</p>
              <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">{stats.summary.percentage}%</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">في الوقت</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.summary.onTimePercentage}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
