import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
          📿 رفيق الصلاة
        </Link>
        
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-teal-600 font-semibold">
                مرحباً، {user.fullName}
              </span>
              <button 
                onClick={() => setUser(null)}
                className="btn-secondary"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">دخول</Link>
              <Link to="/signup" className="btn-primary">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
