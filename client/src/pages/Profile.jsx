import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // <--- NEW IMPORT
import BottomTabs from '../components/BottomTabs';
import Badge from '../components/Badge';


const Profile = () => {
  const { user, logout } = useContext(AuthContext); // <--- ADDED logout
  const navigate = useNavigate(); // <--- NEW


  // Mock Badges (Logic to be added later)
  const badges = [
    { id: 1, title: 'البداية', icon: '🌱', desc: 'أتممت أول صلاة في التطبيق', unlocked: true },
    { id: 2, title: 'محارب الفجر', icon: '🛡️', desc: 'صليت الفجر 3 أيام متتالية', unlocked: false },
    { id: 3, title: 'أسبوع كامل', icon: '🔥', desc: 'حافظت على الصلاة لمدة 7 أيام', unlocked: false },
    { id: 4, title: 'صلاة الجماعة', icon: '🕌', desc: 'سجلت صلاة في المسجد', unlocked: false },
  ];

  // LOGOUT HANDLER
  const handleLogout = () => {
    logout(); // Clears localStorage
    navigate('/login'); // Redirects to login
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans" dir="rtl">
      
      {/* Header Profile Info */}
      <div className="bg-teal-700 dark:bg-teal-900 text-white pt-10 pb-16 px-6 rounded-b-3xl shadow-lg text-center relative">
        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full mx-auto mb-3 p-1 shadow-md">
            <div className="w-full h-full bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center text-4xl">
                👤
            </div>
        </div>
        <h1 className="text-2xl font-bold">{user?.name || 'ضيف'}</h1>
        <p className="opacity-80 text-sm">{user?.email}</p>


        {/* Floating Stat Card */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex justify-around border border-gray-100 dark:border-gray-700">
             <div className="text-center">
                 <div className="text-xl font-bold text-teal-600 dark:text-teal-400">1</div>
                 <div className="text-xs text-gray-400">الأوسمة</div>
             </div>
             <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
             <div className="text-center">
                 <div className="text-xl font-bold text-yellow-500">5</div>
                 <div className="text-xs text-gray-400">النقاط</div>
             </div>
        </div>
      </div>


      {/* Badges Grid */}
      <div className="container mx-auto p-6 pt-16 max-w-md">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-lg">إنجازاتي 🏆</h2>
        <div className="grid grid-cols-2 gap-4">
          {badges.map(b => (
            <Badge 
              key={b.id} 
              title={b.title} 
              icon={b.icon} 
              description={b.desc} 
              isUnlocked={b.unlocked} 
            />
          ))}
        </div>

        {/* LOGOUT BUTTON - NEW SECTION */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>

      </div>


      <BottomTabs />
    </div>
  );
};


export default Profile;
