import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, BarChart3, Calendar, Zap, Gift, User } from 'lucide-react';

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'الرئيسية', path: '/', icon: Home, emoji: '🏠' },
    { name: 'الإحصائيات', path: '/stats', icon: BarChart3, emoji: '📊' },
    { name: 'التقرير', path: '/monthly', icon: Calendar, emoji: '📅' },
    { name: 'التحديات', path: '/challenges', icon: Zap, emoji: '🏆' },
    { name: 'الفوائت', path: '/qada', icon: Gift, emoji: '🤲' },
    { name: 'الملف الشخصي', path: '/profile', icon: User, emoji: '👤' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50">
      <div className="max-w-2xl mx-auto px-2">
        {/* Tabs */}
        <div className="flex justify-between items-center overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center text-xs font-bold transition border-t-4 ${
                location.pathname === tab.path
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
