// client/src/pages/InsightsPage.jsx
// CREATE THIS NEW FILE

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';

export default function InsightsPage() {
  const { user } = useContext(AuthContext);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const now = new Date();
      authService.getMonthlyInsights(user.id, now.getFullYear(), now.getMonth())
        .then(data => {
          setInsights(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load insights:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const prayerNames = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  const getPrayerEmoji = (prayer) => {
    const emojis = { fajr: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌅', isha: '🌙' };
    return emojis[prayer] || '🕌';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir="rtl">
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">🎯 رؤى الصلاة</h1>
        <p className="text-sm opacity-90 mt-1">تحليل أنماط صلواتك</p>
      </header>

      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        {insights && insights.prayerPattern && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">نسبة إكمال كل صلاة</h3>

            {Object.entries(insights.prayerPattern).map(([prayer, count]) => {
              const total = insights.summary.daysInMonth || 1;
              const percentage = (count / total) * 100;

              return (
                <div key={prayer} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {getPrayerEmoji(prayer)} {prayerNames[prayer]}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count}/{total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage >= 80
                          ? 'bg-green-500'
                          : percentage >= 50
                          ? 'bg-amber-400'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {percentage.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {insights && insights.insights && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
              <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-200">📊 تحليلك</h3>
              <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
                أنت تصلي بانتظام وهذا رائع! استمر في الحفاظ على هذا المستوى العالي من الالتزام.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
              <h3 className="font-bold text-lg mb-3 text-purple-900 dark:text-purple-200">💡 التوصيات</h3>
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-300">
                <li>✅ حاول الصلاة في نفس الموقع لتقوية العادة</li>
                <li>✅ ركز على {insights.insights.mostMissed} فقد تحتاج لانتباه أكثر</li>
                <li>✅ استخدم التنبيهات لعدم نسيان المواقيت</li>
                <li>✅ احدِّد تحديات أسبوعية لتحفيز نفسك</li>
              </ul>
            </div>

            {insights.insights.favoriteLocation && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-6 rounded-xl border border-amber-200 dark:border-amber-700">
                <h3 className="font-bold text-lg mb-2 text-amber-900 dark:text-amber-200">📍 مكان صلاتك المفضل</h3>
                <p className="text-amber-800 dark:text-amber-300">
                  {insights.insights.favoriteLocation}
                </p>
              </div>
            )}
          </div>
        )}

        {insights && insights.summary && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">ملخص الشهر</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المصليات</p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {insights.summary.totalCompleted}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الأيام النشطة</p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {insights.summary.daysInMonth}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
