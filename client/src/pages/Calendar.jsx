import { useState, useEffect, useContext } from 'react';
import CalendarLib from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { AuthContext } from '../context/AuthContext';
import authService from '../services/api'; // Make sure this is imported
import BottomTabs from '../components/BottomTabs';
import { useNavigate } from 'react-router-dom';

const CalendarPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState({}); 
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- NEW: Fetch Real History ---
  useEffect(() => {
    if (user) {
        authService.getHistory(user.id)
            .then(data => {
                console.log("Calendar History Loaded:", data); // Debugging
                setHistory(data);
            })
            .catch(err => console.error("Failed to load history:", err));
    }
  }, [user]);

  // Function to decide tile color
  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
        // Format date to YYYY-MM-DD to match the keys in our 'history' object
        // NOTE: We need to be careful with timezones. 
        // This simple method usually works for local dates:
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset*60*1000));
        const dateStr = localDate.toISOString().split('T')[0];

        const status = history[dateStr]; 
        
        if (status === 'full') return 'bg-teal-100 text-teal-700 font-bold rounded-lg border-2 border-teal-200'; 
        if (status === 'partial') return 'bg-yellow-100 text-yellow-700 font-bold rounded-lg border-2 border-yellow-200';
        if (status === 'none') return 'bg-red-50 text-red-300 rounded-lg';
    }
    return null;
  };

  const handleDayClick = (value) => {
    // Optional: Navigate to dashboard for that specific date?
    console.log("Clicked:", value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans" dir="rtl">
      <header className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">سجل الالتزام</h1>
      </header>

      <div className="p-4 flex justify-center mt-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm w-full max-w-md">
            {/* Custom CSS wrapper for the calendar */}
            <style>{`
                .react-calendar { width: 100%; border: none; font-family: inherit; direction: ltr; } /* Force LTR for calendar alignment */
                .react-calendar__navigation button { font-weight: bold; font-size: 1.1em; }
                .react-calendar__tile { height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.9em; transition: all 0.2s; }
                .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #f0fdfa; }
                .react-calendar__tile--now { background: transparent; border: 2px solid #0f766e !important; border-radius: 8px; font-weight: bold; color: #0f766e; }
                .react-calendar__tile--active { background: #0f766e !important; color: white !important; border-radius: 8px; }
                
                /* Color Classes override */
                .bg-teal-100 { background-color: #ccfbf1 !important; color: #0f766e !important; }
                .bg-yellow-100 { background-color: #fef9c3 !important; color: #854d0e !important; }
                .bg-red-50 { background-color: #fef2f2 !important; color: #f87171 !important; }
            `}</style>
            
            <CalendarLib 
                onChange={setSelectedDate} 
                value={selectedDate}
                tileClassName={getTileClassName}
                onClickDay={handleDayClick}
            />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-gray-600 mt-6 bg-white p-4 mx-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-teal-100 border border-teal-200 rounded-md"></span> مكتمل</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded-md"></span> جزئي</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-teal-700 rounded-md"></span> اليوم</div>
      </div>

      <BottomTabs />
    </div>
  );
};

export default CalendarPage;
