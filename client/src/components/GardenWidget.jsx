import React from 'react';

const GardenWidget = ({ prayers }) => {
  // 1. Count how many prayers are done today
  const count = Object.values(prayers).filter(Boolean).length;

    // ... inside GardenWidget

  // 2. Determine the "Growth Stage" based on Faith Metaphors
  let stageEmoji = '🌱'; 
  let stageTitle = '...';
  let stageMessage = '...';
  let progressColor = 'bg-yellow-200';

  if (count === 0) {
     stageEmoji = '🏜️'; // Desert/Arid
     stageTitle = 'أرض هامدة'; // Lifeless Earth
     stageMessage = '﴿اهتزت وربت﴾ - أحيِ قلبك بالصلاة';
     progressColor = 'bg-stone-300'; // Gray/Brown
  } else if (count >= 1 && count <= 2) {
     stageEmoji = '🌱'; 
     stageTitle = 'حبة أنبتت'; // A Grain Sprouted
     stageMessage = 'بداية الغيث قطرة.. استمر';
     progressColor = 'bg-lime-300';
  } else if (count >= 3 && count <= 4) {
     stageEmoji = '🌿'; 
     stageTitle = 'زرع مبهج'; // Delightful Growth
     stageMessage = 'اقتربت من الفلاح';
     progressColor = 'bg-green-500';
  } else if (count === 5) {
     stageEmoji = '🌴'; // Palm Tree (Strong believer metaphor)
     stageTitle = 'أصلها ثابت'; // "Its root is firm" (Surah Ibrahim)
     stageMessage = '﴿تؤتي أكلها كل حين﴾ - تقبل الله';
     progressColor = 'bg-emerald-600'; 
  }


  // Calculate width for a progress bar (0% to 100%)
  const progressPercent = (count / 5) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex items-center gap-4">
      
      {/* The Plant Icon */}
      <div className={`w-16 h-16 flex items-center justify-center text-4xl bg-gray-50 dark:bg-gray-700 rounded-full border-2 ${count === 5 ? 'border-yellow-400 animate-bounce' : 'border-gray-200'}`}>
        {stageEmoji}
      </div>

      {/* The Info */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{stageTitle}</h3>
            <span className="text-xs font-mono text-gray-500">{count}/5</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
            <div 
                className={`h-2.5 rounded-full transition-all duration-700 ${progressColor}`} 
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">{stageMessage}</p>
      </div>
    </div>
  );
};

export default GardenWidget;
