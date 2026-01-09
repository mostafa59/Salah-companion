import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api';
import BottomTabs from '../components/BottomTabs';

const ARABIC_NAMES = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
};

const Missed = () => {
  const { user } = useContext(AuthContext);
  const [qada, setQada] = useState({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });

  useEffect(() => {
    if (user) {
      authService.getQada(user.id).then(setQada).catch(console.error);
    }
  }, [user]);

  const handleUpdate = (prayer, amount) => {
    // Optimistic Update (Update UI instantly)
    setQada(prev => ({ ...prev, [prayer]: Math.max(0, prev[prayer] + amount) }));
    
    authService.updateQada(user.id, prayer, amount).catch(err => {
       console.error(err);
       // Revert on error? For now, let's just log it.
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans" dir="rtl">
      <header className="bg-red-700 text-white p-4 shadow-md sticky top-0">
        <h1 className="text-xl font-bold text-center">الصلوات الفائتة</h1>
        <p className="text-center text-xs opacity-80 mt-1">سجل ما فاتك لتقضيه لاحقاً</p>
      </header>
      
      <div className="container mx-auto p-4 space-y-4 max-w-md">
        
        {Object.keys(ARABIC_NAMES).map((key) => (
          <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            
            <div className="font-bold text-gray-700 text-lg w-20">{ARABIC_NAMES[key]}</div>
            
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-1">
              {/* MINUS BUTTON (Paid Back) */}
              <button 
                onClick={() => handleUpdate(key, -1)}
                className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-xl hover:bg-green-200 transition"
                disabled={qada[key] <= 0}
              >
                ✓
              </button>

              {/* COUNT */}
              <span className={`w-8 text-center font-mono font-bold text-xl ${qada[key] > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {qada[key]}
              </span>

              {/* PLUS BUTTON (Missed Another) */}
              <button 
                onClick={() => handleUpdate(key, 1)}
                className="w-10 h-10 bg-red-100 text-red-700 rounded-lg flex items-center justify-center font-bold text-xl hover:bg-red-200 transition"
              >
                +
              </button>
            </div>

          </div>
        ))}

        {/* Total Summary */}
        <div className="mt-8 text-center">
             <div className="text-gray-500 text-sm">إجمالي الفوائت</div>
             <div className="text-4xl font-bold text-red-700 mt-2">
                {Object.values(qada).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0)}
             </div>
        </div>

      </div>

      <BottomTabs />
    </div>
  );
};

export default Missed;
