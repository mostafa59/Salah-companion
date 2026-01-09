import React, { useState } from 'react';

export default function MissedPrayers() {
  // Mock Data: Total missed prayers historically
  const [missedStats, setMissedStats] = useState({
    fajr: 12,
    dhuhr: 5,
    asr: 8,
    maghrib: 2,
    isha: 15
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState('fajr');

  const totalMissed = Object.values(missedStats).reduce((a, b) => a + b, 0);

  const handleQadaClick = () => {
    setShowModal(true);
  };

  const handleComplete = () => {
    if (missedStats[selectedPrayer] > 0) {
      setMissedStats({
        ...missedStats,
        [selectedPrayer]: missedStats[selectedPrayer] - 1
      });
      setShowModal(false);
      alert(`بارك الله فيك! تم تسجيل قضاء صلاة ${
        selectedPrayer === 'fajr' ? 'الفجر' :
        selectedPrayer === 'dhuhr' ? 'الظهر' :
        selectedPrayer === 'asr' ? 'العصر' :
        selectedPrayer === 'maghrib' ? 'المغرب' : 'العشاء'
      }`);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 border-t-4 border-red-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-gray-700 font-bold">الصلوات الفائتة (القضاء)</h2>
            <p className="text-xs text-gray-400">تابع ما عليك لتقضيه</p>
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
            {totalMissed} صلاة
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {Object.entries(missedStats).map(([name, count]) => (
            <div key={name} className="flex flex-col items-center">
              <div className="w-full bg-red-50 rounded-t-lg py-2 border-b-2 border-red-100">
                <span className="text-xs font-bold text-gray-600">
                  {name === 'fajr' && 'فجر'}
                  {name === 'dhuhr' && 'ظهر'}
                  {name === 'asr' && 'عصر'}
                  {name === 'maghrib' && 'مغرب'}
                  {name === 'isha' && 'عشاء'}
                </span>
              </div>
              <div className="w-full bg-gray-50 rounded-b-lg py-2">
                <span className="text-lg font-bold text-red-600">{count}</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleQadaClick}
          className="w-full mt-4 bg-red-50 text-red-600 py-3 rounded-lg text-sm font-bold hover:bg-red-100 transition active:scale-95"
        >
          قضاء صلاة الآن ⚡
        </button>
      </div>

      {/* Qada Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">قضاء صلاة فائتة</h2>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">اختر الصلاة:</label>
            <select 
              value={selectedPrayer}
              onChange={(e) => setSelectedPrayer(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 text-center text-lg font-bold"
            >
              {Object.entries(missedStats).map(([key, count]) => (
                <option key={key} value={key} disabled={count === 0}>
                  {key === 'fajr' ? 'الفجر' :
                   key === 'dhuhr' ? 'الظهر' :
                   key === 'asr' ? 'العصر' :
                   key === 'maghrib' ? 'المغرب' : 'العشاء'} ({count} متبقية)
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={handleComplete} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
                ✅ تم الأداء
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-3 text-gray-500 hover:text-gray-700 font-bold">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
