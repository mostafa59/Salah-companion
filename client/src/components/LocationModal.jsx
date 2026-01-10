import React from 'react';

const LocationModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const locations = [
    { id: 'mosque', label: 'المسجد', icon: '🕌' },
    { id: 'home', label: 'المنزل', icon: '🏠' },
    { id: 'work', label: 'العمل', icon: '💼' },
    { id: 'other', label: 'مكان آخر', icon: '📍' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">أين صليت؟</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-200 border-2 border-transparent transition-all"
            >
              <span className="text-3xl">{loc.icon}</span>
              <span className="font-bold text-gray-600 dark:text-gray-300">{loc.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
