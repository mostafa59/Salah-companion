// client/src/pages/ChallengesPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';

export default function ChallengesPage() {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChallenges = [
    {
      id: 1,
      title: 'صلِّ الخمس',
      description: 'صلِّ الخمس صلوات في يوم واحد',
      reward: '50 نقطة',
      icon: '🕌'
    },
    {
      id: 2,
      title: 'أسبوع متكامل',
      description: 'صلِّ الخمس صلوات كل يوم لمدة 7 أيام',
      reward: '200 نقطة',
      icon: '📅'
    },
    {
      id: 3,
      title: 'الفجر الباكر',
      description: 'صلِّ الفجر 7 مرات في الوقت',
      reward: '100 نقطة',
      icon: '🌅'
    },
    {
      id: 4,
      title: 'بدون تأخير',
      description: 'صلِّ 5 صلوات في الوقت المحدد',
      reward: '75 نقطة',
      icon: '⏰'
    }
  ];

  useEffect(() => {
    if (user) loadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await authService.getActiveChallenges(user.id);
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (title) => {
    if (isSubmitting) return;

    const alreadyExists = challenges.some(
      (c) => c.title === title && c.status === 'active'
    );
    if (alreadyExists) {
      alert('أنت بالفعل تشارك في هذا التحدي!');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authService.startChallenge(user.id, title);
      setChallenges((prev) => [...prev, result]);
    } catch (err) {
      console.error('Failed to start challenge:', err);
      alert('حدث خطأ أثناء بدء التحدي');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (challenge) => {
    const ok = window.confirm(`هل تريد حذف "${challenge.title}"؟`);
    if (!ok) return;

    try {
      await authService.deleteChallenge(user.id, challenge._id);
      await loadChallenges();
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      alert('حدث خطأ أثناء حذف التحدي');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const activeChallengeNames = challenges.map((c) => c.title);
  const availableChallenges = allChallenges.filter(
    (c) => !activeChallengeNames.includes(c.title)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24" dir="rtl">
      <header className="bg-teal-700 dark:bg-teal-900 text-white p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">🏆 التحديات الأسبوعية</h1>
        <p className="text-sm opacity-90 mt-1">حافز نفسك بتحديات ممتعة</p>
      </header>

      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        {/* ACTIVE CHALLENGES */}
        {challenges.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
              التحديات النشطة
            </h2>

            {challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 border-teal-500"
              >
                {/* Header Row + Delete Button (VISIBLE) */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {challenge.daysCompleted}/{challenge.targetDays} أيام
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteChallenge(challenge)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold"
                    title="حذف التحدي"
                  >
                    حذف
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all"
                    style={{ width: `${Math.min(challenge.progress || 0, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {Math.round(challenge.progress || 0)}%
                  </span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    +{challenge.reward?.points || 100} نقطة
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AVAILABLE CHALLENGES */}
        {availableChallenges.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
              {challenges.length > 0 ? 'التحديات المتاحة' : 'اختر تحديك!'}
            </h2>

            {availableChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  <span className="text-3xl ml-3">{challenge.icon}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold">
                    {challenge.reward}
                  </span>

                  <button
                    onClick={() => handleStartChallenge(challenge.title)}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {isSubmitting ? 'جاري...' : 'ابدأ الآن'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {challenges.length === 0 && availableChallenges.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              لا توجد تحديات متاحة الآن
            </p>
            <p className="text-sm text-gray-400">عد لاحقًا للمزيد من التحديات!</p>
          </div>
        )}
      </div>
    </div>
  );
}
