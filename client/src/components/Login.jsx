import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      alert("Login Success!"); 
      // navigate('/dashboard'); // Uncomment when dashboard is ready
    } else {
      alert("Login Failed: " + result.error);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-600 to-teal-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all hover:scale-[1.01]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">صديقك في الصلاة</h1>
          <p className="text-gray-500 text-sm">مرحباً بعودتك! سجل الدخول للمتابعة</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">البريد الإلكتروني</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">كلمة المرور</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-800 transition-colors shadow-lg hover:shadow-xl active:scale-95 duration-200"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <a href="#" className="text-teal-600 font-bold hover:underline">إنشاء حساب جديد</a>
        </div>
      </div>
    </div>
  );
}
