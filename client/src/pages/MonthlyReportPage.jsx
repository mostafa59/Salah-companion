// client/src/pages/MonthlyReportPage.jsx
// CREATE THIS NEW FILE

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthlyReportPage() {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      authService.getMonthlyInsights(user.id, year, month)
        .then(data => {
          setReport(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load report:', err);
          setLoading(false);
        });
    }
  }, [user, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getDayOfWeek = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getDayOfWeek(currentDate);

  const getColor = (date) => {
    if (!report || !report.calendar) return 'bg-gray-100 dark:bg-gray-700';
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const status = report.calendar[dateStr];
    if (status === 'perfect') return 'bg-green-500 text-white';
    if (status === 'partial') return 'bg-amber-400 text-white';
    if (status === 'missed') return 'bg-red-400 text-white';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir="rtl">
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">📅 التقرير الشهري</h1>
        <p className="text-sm opacity-90 mt-1">تقويم شهرك والإحصائيات</p>
      </header>

      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['ح', 'ج', 'ث', 'أ', 'خ', 'ب', 'ن'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {Array(daysInMonth).fill(null).map((_, i) => (
              <div
                key={i + 1}
                className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm ${getColor(i + 1)}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {report && report.summary && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">أيام مثالية</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{report.summary.perfectDays}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">أيام جزئية</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{report.summary.partialDays}</p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-700">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">أيام مفقودة</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{report.summary.missedDays}</p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-700">
              <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">معدل الإكمال</p>
              <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">{report.summary.completionRate}%</p>
            </div>
          </div>
        )}

        {/* Insights */}
        {report && report.insights && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">الرؤى والتحليلات</h3>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">الصلاة الأكثر تأخرًا:</span> {report.insights.mostMissed}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">المكان المفضل:</span> {report.insights.favoriteLocation}
              </p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">الاتجاه:</span> {report.insights.trend === 'improving' ? '📈 تحسن' : '⚠️ بحاجة للتركيز'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
