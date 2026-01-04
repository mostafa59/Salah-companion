import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-l from-teal-600 to-teal-500 bg-clip-text text-transparent">
          📿 رفيق الصلاة
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-teal-600 font-semibold hidden sm:block">
                مرحباً، {user.fullName}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition-colors">
                دخول
              </Link>
              <Link to="/signup" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
