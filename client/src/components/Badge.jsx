import React from 'react';

const Badge = ({ title, icon, description, isUnlocked }) => {
  return (
    <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'bg-white dark:bg-gray-800 border-yellow-400 shadow-md scale-100' 
        : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60 grayscale scale-95'
    }`}>
      
      {/* Icon Circle */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${
        isUnlocked ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-200 dark:bg-gray-800'
      }`}>
        {icon}
      </div>

      {/* Lock Overlay */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 text-gray-400">
           🔒
        </div>
      )}

      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{title}</h3>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-tight">{description}</p>
    </div>
  );
};

export default Badge;
