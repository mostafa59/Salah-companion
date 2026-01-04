import React from 'react';

const prayers = [
  { name: 'الفجر', time: '05:30', emoji: '🌅' },
  { name: 'الظهر', time: '12:15', emoji: '☀️' },
  { name: 'العصر', time: '15:45', emoji: '🌤️' },
  { name: 'المغرب', time: '17:50', emoji: '🌅' },
  { name: 'العشاء', time: '19:20', emoji: '🌙' }
];

export default function Dashboard({ user }) {
  const [prayerStatus, setPrayerStatus] = React.useState({});

  const logPrayer = (prayerName) => {
    setPrayerStatus(prev => ({
      ...prev,
      [prayerName]: true
    }));
    alert(`${prayerName} مسجّلة بنجاح! ✅`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-3xl p-10 shadow-2xl">
        <h1 className="text-4xl font-bold mb-4">
          السلام عليكم، {user?.fullName || 'المستخدم'}
        </h1>
        <p className="text-teal-100 text-xl">لنجعل صلاتك نور يومك 💚</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prayers.map(prayer => (
          <div 
            key={prayer.name}
            className={`text-center p-8 rounded-3xl shadow-lg border-4 transition-all duration-300 cursor-pointer ${
              prayerStatus[prayer.name] 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-2xl' 
                : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-xl'
            }`}
            onClick={() => !prayerStatus[prayer.name] && logPrayer(prayer.name)}
          >
            <div className="text-4xl mb-4">{prayer.emoji}</div>
            <h3 className="text-2xl font-bold mb-2">{prayer.name}</h3>
            <p className="text-lg text-gray-600 mb-6">{prayer.time}</p>
            <div className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all">
              {prayerStatus[prayer.name] ? 'مُسجّلة ✓' : 'تسجيل الصلاة'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-white rounded-2xl p-6 shadow-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-teal-600">5/5</div>
          <div className="text-sm text-gray-600">صلاة اليوم</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">28</div>
          <div className="text-sm text-gray-600">يوم متتالي</div>
        </div>
      </div>
    </div>
  );
}
