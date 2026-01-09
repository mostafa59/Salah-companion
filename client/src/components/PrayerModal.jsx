import React, { useState } from 'react';

export default function PrayerModal({ prayer, onClose, onSave }) {
  const [status, setStatus] = useState(prayer.completed ? 'completed' : 'missed');
  const [location, setLocation] = useState(prayer.location || 'home'); 

  const handleSave = () => {
    onSave(prayer.id, { 
      completed: status === 'completed',
      location: status === 'completed' ? location : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-teal-700">صلاة {prayer.name}</h2>
          <p className="text-gray-500 text-sm">{prayer.time}</p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-sm font-bold text-gray-700">الحالة:</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setStatus('completed')} className={`p-3 rounded-lg border-2 transition ${status === 'completed' ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold' : 'border-gray-200'}`}>✅ أديتها</button>
            <button onClick={() => setStatus('missed')} className={`p-3 rounded-lg border-2 transition ${status === 'missed' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200'}`}>❌ فاتتني</button>
          </div>
        </div>

        {status === 'completed' && (
          <div className="space-y-3 mb-8">
            <label className="block text-sm font-bold text-gray-700">المكان:</label>
            <div className="flex justify-between gap-2">
              {['home', 'mosque', 'work'].map((loc) => (
                <button key={loc} onClick={() => setLocation(loc)} className={`flex-1 p-2 rounded-lg text-sm border transition ${location === loc ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 border-gray-200'}`}>
                  {loc === 'home' && '🏠 البيت'}
                  {loc === 'mosque' && '🕌 المسجد'}
                  {loc === 'work' && '💼 العمل'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700">حفظ</button>
          <button onClick={onClose} className="px-4 py-3 text-gray-500 hover:text-gray-700 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
