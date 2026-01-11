import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BottomTabs from './components/BottomTabs'; // ADD THIS IMPORT
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StatsPage from './pages/StatsPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import InsightsPage from './pages/InsightsPage';
import ChallengesPage from './pages/ChallengesPage';
import QadaPage from './pages/QadaPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route path="/profile" element={<Profile />} />

          
          {/* NEW PHASE 2 ROUTES */}
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/monthly" element={<MonthlyReportPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/qada" element={<QadaPage />} />
        </Routes>
        
        {/* BottomTabs appears on ALL pages (outside Routes) */}
        <BottomTabs />
      </AuthProvider>
    </Router>
  );
}

export default App;
