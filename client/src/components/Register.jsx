import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth(); // We use 'register' from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call the register function from our AuthContext
const result = await register({ name: fullName, email, password });
    
    if (result.success) {
      alert("Account Created Successfully!");
       navigate('/dashboard'); // Uncomment later
    } else {
      alert("Registration Failed: " + result.error);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-600 to-teal-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-2">حساب جديد</h1>
          <p className="text-gray-500 text-sm">انضم إلينا في رحلة الصلاة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">الاسم الكامل</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="محمد أحمد"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">البريد الإلكتروني</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-800 transition-colors shadow-lg"
          >
            إنشاء الحساب
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
