// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';

// A simple placeholder for the Dashboard
const DashboardPlaceholder = () => (
  <div className="p-10 text-center">
    <h1 className="text-2xl font-bold text-[#218084]">Welcome to Dashboard</h1>
    <p>You are logged in!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route redirects to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
