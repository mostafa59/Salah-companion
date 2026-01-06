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
      // We will add dashboard redirect later
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-[#218084]">
       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 text-right" dir="rtl">
          <h2 className="text-2xl font-bold mb-6 text-center text-[#218084]">تسجيل الدخول</h2>
          <input 
            className="w-full mb-4 p-2 border rounded"
            placeholder="البريد الإلكتروني"
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            className="w-full mb-6 p-2 border rounded"
            type="password" placeholder="كلمة المرور"
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="w-full bg-[#218084] text-white p-2 rounded hover:bg-opacity-90">
            دخول
          </button>
       </form>
    </div>
  );
}
