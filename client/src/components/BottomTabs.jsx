import { useNavigate, useLocation } from 'react-router-dom';


const BottomTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const isActive = (path) => location.pathname === path;


  const navItems = [
    { path: '/dashboard', label: 'اليوم', icon: '🏠' },
    { path: '/calendar', label: 'التقويم', icon: '📅' },
    { path: '/social', label: 'الأصدقاء', icon: '👥' }, // <--- NEW TAB
    { path: '/missed', label: 'الفائتة', icon: '⚡' },
    { path: '/profile', label: 'حسابي', icon: '👤' },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-full ${
              isActive(item.path) 
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' 
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


export default BottomTabs;
