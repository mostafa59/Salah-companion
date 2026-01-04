import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [user, setUser] = useState(null);

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-teal-50" dir="rtl">
      <Navbar user={user} setUser={setUser} />
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><Dashboard user={user} /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
