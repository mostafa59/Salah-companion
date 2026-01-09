import React, { useState } from 'react';

const moods = [
  { id: 'happy', emoji: '😊', label: 'سعيد', color: 'bg-green-100 border-green-400 text-green-800' },
  { id: 'calm', emoji: '😌', label: 'مطمئن', color: 'bg-blue-100 border-blue-400 text-blue-800' },
  { id: 'anxious', emoji: '😰', label: 'قلق', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
  { id: 'sad', emoji: '😔', label: 'حزين', color: 'bg-gray-100 border-gray-400 text-gray-800' },
  { id: 'angry', emoji: '😠', label: 'غاضب', color: 'bg-red-100 border-red-400 text-red-800' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-teal-500 mt-6">
      <h2 className="text-gray-600 font-bold mb-4 text-center">كيف حال قلبك اليوم؟</h2>
      
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(mood.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full
              ${selectedMood === mood.id 
                ? `${mood.color} scale-110 shadow-md border-2` 
                : 'bg-gray-50 hover:bg-gray-100 scale-100 border border-transparent'
              }
            `}
          >
            <span className="text-3xl mb-1 filter drop-shadow-sm">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* AI Coaching Stub (The "Response") */}
      {selectedMood && (
        <div className="mt-4 p-3 bg-teal-50 rounded-lg text-center animate-fade-in">
          <p className="text-teal-800 text-sm font-medium">
            {selectedMood === 'happy' && "الحمد لله! أدام الله سرورك."}
            {selectedMood === 'calm' && "ما شاء الله، السكينة نعمة."}
            {selectedMood === 'anxious' && "ألا بذكر الله تطمئن القلوب."}
            {selectedMood === 'sad' && "لا تحزن إن الله معنا."}
            {selectedMood === 'angry' && "استعذ بالله وتوضأ، يذهب الغضب."}
          </p>
        </div>
      )}
    </div>
  );
}
