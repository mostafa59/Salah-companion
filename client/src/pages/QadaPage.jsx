import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';

const ARABIC_NAMES = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

const EMPTY = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

const QadaPage = () => {
  const { user } = useContext(AuthContext);

  // outstanding counts only (what your UI needs)
  const [qada, setQada] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadQada();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadQada = async () => {
    try {
      setLoading(true);
      const data = await authService.getQada(user.id);

      // data could be either:
      // 1) { fajr: 1, ... }   (old style)
      // 2) { outstanding: { fajr: 1, ... }, totalOwed, completed } (new style)
      const outstanding = data?.outstanding ? data.outstanding : data;

      setQada({
        fajr: Number(outstanding?.fajr || 0),
        dhuhr: Number(outstanding?.dhuhr || 0),
        asr: Number(outstanding?.asr || 0),
        maghrib: Number(outstanding?.maghrib || 0),
        isha: Number(outstanding?.isha || 0)
      });
    } catch (err) {
      console.error('Failed to load qada:', err);
      setQada(EMPTY);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (prayer, amount) => {
    // optimistic UI
    setQada((prev) => ({
      ...prev,
      [prayer]: Math.max(0, Number(prev[prayer] || 0) + amount)
    }));

    try {
      await authService.updateQada(user.id, prayer, amount);
      // reload to stay 100% consistent with backend totals
      await loadQada();
    } catch (err) {
      console.error('Failed to update qada:', err);
      // revert by reloading
      await loadQada();
    }
  };

  const totalMissed = Object.values(qada).reduce((a, b) => a + Number(b || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans" dir="rtl">
      <header className="bg-red-700 dark:bg-red-900 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">🙌 الصلوات الفائتة</h1>
        <p className="text-center text-xs opacity-80 mt-1">سجل ما فاتك لتقضيه لاحقاً</p>
      </header>

      <div className="container mx-auto p-4 space-y-4 max-w-md">
        {Object.keys(ARABIC_NAMES).map((key) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center"
          >
            <div className="font-bold text-gray-700 dark:text-gray-200 text-lg w-20">
              {ARABIC_NAMES[key]}
            </div>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              {/* ✓ (complete) */}
              <button
                onClick={() => handleUpdate(key, -1)}
                className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center justify-center font-bold text-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition disabled:opacity-50"
                disabled={Number(qada[key] || 0) <= 0}
              >
                ✓
              </button>

              {/* COUNT */}
              <span
                className={`w-10 text-center font-mono font-bold text-xl ${
                  Number(qada[key] || 0) > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {Number(qada[key] || 0)}
              </span>

              {/* + (missed) */}
              <button
                onClick={() => handleUpdate(key, 1)}
                className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center justify-center font-bold text-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Total Summary */}
        <div className="mt-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">إجمالي الفوائت</div>
          <div className="text-4xl font-bold text-red-700 dark:text-red-400 mt-2">
            {totalMissed}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QadaPage;
